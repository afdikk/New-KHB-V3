import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, type FlowEdgeRow, type FlowNodeRow } from '../services/api';
import { useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

/**
 * Flow Builder — kanvas interaktif seperti omnicare.
 *
 * Interaksi:
 * - Tarik kartu untuk memindahkan (posisi disimpan ke database).
 * - Tarik dari titik di sisi kanan kartu ke kartu lain untuk membuat garis.
 * - Tarik area kosong untuk menggeser kanvas; Ctrl+gulir (atau gulir) untuk zoom.
 * - Klik dua kali kanvas untuk menambah kartu di titik tersebut.
 */

const NODE_W = 236;
const NODE_H = 116;
const MIN_SCALE = 0.45;
const MAX_SCALE = 1.8;

const KIND_LABEL: Record<FlowNodeRow['kind'], string> = {
  greeting: 'Sapaan',
  question: 'Pertanyaan',
  answer: 'Jawaban AI',
  escalation: 'Eskalasi',
};

const KIND_TONE: Record<FlowNodeRow['kind'], string> = {
  greeting: 'green',
  question: 'navy',
  answer: 'teal',
  escalation: 'amber',
};

interface Position {
  x: number;
  y: number;
}

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

type DragState =
  | { mode: 'node'; id: string; startWorld: Position; origin: Position; moved: boolean }
  | { mode: 'pan'; startClient: Position; origin: Viewport }
  | { mode: 'connect'; sourceId: string; cursor: Position }
  | null;

/** Posisi awal bila node belum pernah dipindahkan (semua di 0,0). */
function defaultPositions(nodes: FlowNodeRow[]): Record<string, Position> {
  const map: Record<string, Position> = {};
  nodes.forEach((node, index) => {
    const placed = node.positionX !== 0 || node.positionY !== 0;
    map[node.id] = placed
      ? { x: node.positionX, y: node.positionY }
      : { x: 48 + (index % 3) * 280, y: 48 + Math.floor(index / 3) * 168 };
  });
  return map;
}

function edgePath(from: Position, to: Position): string {
  const dx = Math.abs(to.x - from.x);
  const curve = Math.max(46, Math.min(150, dx * 0.55));
  return `M ${from.x} ${from.y} C ${from.x + curve} ${from.y}, ${to.x - curve} ${to.y}, ${to.x} ${to.y}`;
}

export default function KnowledgeBuilderPage() {
  const notify = useToast();
  const { data, loading, error, reload } = useResource(
    async () => {
      const [nodes, edges] = await Promise.all([api.flows.list(), api.flows.edges.list()]);
      return { nodes, edges };
    },
    [],
  );

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);

  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [view, setView] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', kind: 'question' as FlowNodeRow['kind'] });
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState<{ sourceId: string; cursor: Position } | null>(null);

  // Sinkronkan posisi lokal saat data datang / berubah.
  useEffect(() => {
    if (nodes.length === 0) return;

    const layout = defaultPositions(nodes);
    const unplaced = nodes.filter((node) => node.positionX === 0 && node.positionY === 0);

    setPositions((prev) => {
      const next = { ...prev };
      nodes.forEach((node) => {
        if (unplaced.some((item) => item.id === node.id)) {
          next[node.id] = layout[node.id] ?? { x: node.positionX, y: node.positionY };
        } else if (!next[node.id]) {
          next[node.id] = { x: node.positionX, y: node.positionY };
        }
      });
      return next;
    });

    // Simpan tata letak awal agar stabil antar sesi.
    if (unplaced.length > 0) {
      void Promise.all(
        unplaced.map((node) =>
          api.flows
            .update(node.id, {
              positionX: Math.round(layout[node.id]?.x ?? 0),
              positionY: Math.round(layout[node.id]?.y ?? 0),
            })
            .catch(() => null),
        ),
      );
    }
  }, [nodes, reload]);

  const selected = nodes.find((node) => node.id === selectedId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  useEffect(() => {
    if (selected) {
      setForm({ title: selected.title, description: selected.description, kind: selected.kind });
    }
  }, [selectedId, selected]);

  /** Konversi koordinat layar → koordinat kanvas (world). */
  const toWorld = useCallback(
    (clientX: number, clientY: number): Position => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return { x: (clientX - rect.left - view.x) / view.scale, y: (clientY - rect.top - view.y) / view.scale };
    },
    [view],
  );

  // ── Interaksi pointer ─────────────────────────────────────────
  const startNodeDrag = (event: React.PointerEvent, node: FlowNodeRow) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    setSelectedId(node.id);
    setSelectedEdgeId(null);
    const origin = positions[node.id] ?? { x: node.positionX, y: node.positionY };
    dragRef.current = { mode: 'node', id: node.id, startWorld: toWorld(event.clientX, event.clientY), origin, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const startConnect = (event: React.PointerEvent, node: FlowNodeRow) => {
    event.stopPropagation();
    event.preventDefault();
    const cursor = toWorld(event.clientX, event.clientY);
    dragRef.current = { mode: 'connect', sourceId: node.id, cursor };
    setConnecting({ sourceId: node.id, cursor });
  };

  const startPan = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    dragRef.current = { mode: 'pan', startClient: { x: event.clientX, y: event.clientY }, origin: view };
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.mode === 'node') {
        const world = toWorld(event.clientX, event.clientY);
        const dx = world.x - drag.startWorld.x;
        const dy = world.y - drag.startWorld.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.moved = true;
        setPositions((prev) => ({ ...prev, [drag.id]: { x: drag.origin.x + dx, y: drag.origin.y + dy } }));
      } else if (drag.mode === 'pan') {
        setView({
          ...drag.origin,
          x: drag.origin.x + (event.clientX - drag.startClient.x),
          y: drag.origin.y + (event.clientY - drag.startClient.y),
        });
      } else if (drag.mode === 'connect') {
        const cursor = toWorld(event.clientX, event.clientY);
        drag.cursor = cursor;
        setConnecting({ sourceId: drag.sourceId, cursor });
      }
    };

    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;

      if (drag?.mode === 'node' && drag.moved) {
        const position = positionsRef.current[drag.id];
        if (position) {
          void api.flows
            .update(drag.id, { positionX: Math.round(position.x), positionY: Math.round(position.y) })
            .catch(() => notify('Posisi kartu gagal disimpan'));
        }
      }

      if (drag?.mode === 'connect') {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-node-id]');
        const targetId = target?.getAttribute('data-node-id') ?? null;
        setConnecting(null);
        if (targetId && targetId !== drag.sourceId) {
          void api.flows.edges
            .create({ sourceId: drag.sourceId, targetId })
            .then(() => reload())
            .catch((err) => notify(err instanceof Error ? err.message : 'Gagal menghubungkan kartu'));
        }
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [notify, reload, toWorld]);

  // Ref posisi terbaru agar handler pointerup membaca nilai terkini.
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const onWheel = (event: React.WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * (event.deltaY < 0 ? 1.08 : 0.92)));
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    setView({
      scale: nextScale,
      x: px - ((px - view.x) * nextScale) / view.scale,
      y: py - ((py - view.y) * nextScale) / view.scale,
    });
  };

  // ── CRUD ──────────────────────────────────────────────────────
  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.flows.update(selected.id, form);
      notify('Kartu alur disimpan');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menyimpan kartu');
    } finally {
      setSaving(false);
    }
  };

  const addNode = async (at?: Position) => {
    setSaving(true);
    try {
      const position = at ?? { x: 60 - view.x / view.scale, y: 60 - view.y / view.scale };
      const created = await api.flows.create({
        kind: 'question',
        title: 'Pertanyaan baru',
        description: 'Tulis pertanyaan pemulai di sini.',
        sortOrder: nodes.length,
        positionX: Math.round(position.x),
        positionY: Math.round(position.y),
      });
      notify('Kartu ditambahkan');
      await reload();
      setSelectedId(created.id);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menambah kartu');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!window.confirm(`Hapus kartu "${selected.title}"?`)) return;
    try {
      await api.flows.remove(selected.id);
      notify('Kartu dihapus');
      setSelectedId(null);
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menghapus kartu');
    }
  };

  const removeEdge = async () => {
    if (!selectedEdge) return;
    try {
      await api.flows.edges.remove(selectedEdge.id);
      notify('Garis dihapus');
      setSelectedEdgeId(null);
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menghapus garis');
    }
  };

  const edgeGeometry = useMemo(
    () =>
      edges
        .map((edge: FlowEdgeRow) => {
          const from = positions[edge.sourceId];
          const to = positions[edge.targetId];
          if (!from || !to) return null;
          const start = { x: from.x + NODE_W, y: from.y + NODE_H / 2 };
          const end = { x: to.x, y: to.y + NODE_H / 2 };
          return { edge, d: edgePath(start, end), mid: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 } };
        })
        .filter((item): item is { edge: FlowEdgeRow; d: string; mid: Position } => item !== null),
    [edges, positions],
  );

  const ghostPath = useMemo(() => {
    if (!connecting) return null;
    const from = positions[connecting.sourceId];
    if (!from) return null;
    return edgePath({ x: from.x + NODE_W, y: from.y + NODE_H / 2 }, connecting.cursor);
  }, [connecting, positions]);

  return (
    <section className="view active" id="view-knowledge-builder">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> PENGELOLAAN DATA AI</div>
          <h1>Flow Builder</h1>
          <p className="subheading">
            Tarik kartu untuk menata, tarik titik di sisi kanan kartu ke kartu lain untuk membuat garis.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => void addNode()} disabled={saving}>Tambah Kartu</button>
          <button className="btn btn-primary" onClick={() => void save()} disabled={!selected || saving}>
            {saving ? 'Menyimpan…' : 'Simpan Kartu'}
          </button>
        </div>
      </div>

      <div className="stack">
        <div className="panel fb-panel">
          <div className="fb-toolbar">
            <div className="fb-toolbar-info">
              <strong>{nodes.length} kartu</strong>
              <span>{edges.length} garis</span>
            </div>
            <div className="fb-zoom">
              <button type="button" onClick={() => setView((v) => ({ ...v, scale: Math.max(MIN_SCALE, v.scale - 0.1) }))} aria-label="Perkecil">−</button>
              <span>{Math.round(view.scale * 100)}%</span>
              <button type="button" onClick={() => setView((v) => ({ ...v, scale: Math.min(MAX_SCALE, v.scale + 0.1) }))} aria-label="Perbesar">+</button>
              <button type="button" className="fb-reset" onClick={() => setView({ x: 0, y: 0, scale: 1 })}>Reset</button>
            </div>
          </div>

          {loading ? <p className="knowledge-note">Memuat alur…</p> : null}
          {error ? <p className="knowledge-note" style={{ color: '#b91c1c' }}>{error}</p> : null}

          <div
            ref={canvasRef}
            className={`fb-canvas${dragRef.current?.mode === 'pan' ? ' is-panning' : ''}`}
            onPointerDown={startPan}
            onWheel={onWheel}
            onDoubleClick={(event) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const world = toWorld(event.clientX, event.clientY);
              if ((event.target as HTMLElement).closest('[data-node-id]')) return;
              void addNode(world);
            }}
          >
            <div
              className="fb-world"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
            >
              <svg className="fb-edge-layer" width="6000" height="4000" aria-hidden="true">
                {edgeGeometry.map(({ edge, d, mid }) => (
                  <g key={edge.id}>
                    <path
                      d={d}
                      className="fb-edge-hit"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedEdgeId(edge.id);
                        setSelectedId(null);
                      }}
                    />
                    <path d={d} className={`fb-edge${selectedEdgeId === edge.id ? ' is-active' : ''}`} />
                    {selectedEdgeId === edge.id ? (
                      <circle cx={mid.x} cy={mid.y} r={5} className="fb-edge-dot" />
                    ) : null}
                  </g>
                ))}
                {ghostPath ? <path d={ghostPath} className="fb-ghost" /> : null}
              </svg>

              {nodes.map((node) => {
                const pos = positions[node.id] ?? { x: node.positionX, y: node.positionY };
                return (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className={`fb-node${selectedId === node.id ? ' is-selected' : ''}`}
                    style={{ left: pos.x, top: pos.y, width: NODE_W, height: NODE_H }}
                    onPointerDown={(event) => startNodeDrag(event, node)}
                  >
                    <div className="fb-node-head">
                      <span className={`fb-kind ${KIND_TONE[node.kind]}`}>{KIND_LABEL[node.kind]}</span>
                      {!node.isActive ? <span className="fb-off">nonaktif</span> : null}
                    </div>
                    <strong className="fb-node-title">{node.title}</strong>
                    <span className="fb-node-desc">{node.description || '—'}</span>

                    <button
                      type="button"
                      className="fb-port"
                      aria-label={`Hubungkan dari ${node.title}`}
                      onPointerDown={(event) => startConnect(event, node)}
                    />
                  </div>
                );
              })}
            </div>

            {!loading && nodes.length === 0 ? (
              <div className="fb-empty">Belum ada kartu. Klik dua kali kanvas atau tombol “Tambah Kartu”.</div>
            ) : null}
          </div>

          <p className="fb-hint">Tarik kartu · Tarik titik kanan ke kartu lain untuk garis · Tarik kanvas kosong untuk menggeser · Ctrl + gulir untuk zoom</p>
        </div>

        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>{selectedEdge ? 'Garis alur' : 'Editor kartu'}</h2>
              <p>{selectedEdge ? 'Menghubungkan dua kartu' : selected ? KIND_LABEL[selected.kind] : 'Pilih kartu di kanvas'}</p>
            </div>
          </div>

          {selectedEdge ? (
            <>
              <div className="settings-field">
                <label>Dari</label>
                <p className="fb-edge-text">{nodes.find((node) => node.id === selectedEdge.sourceId)?.title ?? '—'}</p>
              </div>
              <div className="settings-field">
                <label>Ke</label>
                <p className="fb-edge-text">{nodes.find((node) => node.id === selectedEdge.targetId)?.title ?? '—'}</p>
              </div>
              <div className="settings-actions">
                <button className="btn btn-danger-outline" onClick={() => void removeEdge()}>Hapus garis</button>
              </div>
            </>
          ) : selected ? (
            <>
              <div className="settings-field">
                <label htmlFor="node-title">Judul kartu</label>
                <input
                  id="node-title"
                  className="settings-input"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="node-kind">Tipe kartu</label>
                <select
                  id="node-kind"
                  className="settings-select"
                  value={form.kind}
                  onChange={(event) => setForm({ ...form, kind: event.target.value as FlowNodeRow['kind'] })}
                >
                  {(Object.keys(KIND_LABEL) as Array<FlowNodeRow['kind']>).map((key) => (
                    <option key={key} value={key}>{KIND_LABEL[key]}</option>
                  ))}
                </select>
              </div>
              <div className="settings-field">
                <label htmlFor="node-desc">Deskripsi</label>
                <textarea
                  id="node-desc"
                  className="settings-textarea"
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
              <div className="settings-actions">
                <button className="btn btn-danger-outline" onClick={() => void remove()}>Hapus</button>
                <button className="btn btn-primary" onClick={() => void save()} disabled={saving}>Simpan</button>
              </div>
            </>
          ) : (
            <p className="knowledge-note">Kartu bertipe “Pertanyaan” otomatis muncul sebagai tombol topik di widget publik.</p>
          )}
        </div>
      </div>
    </section>
  );
}
