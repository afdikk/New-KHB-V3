import { prisma } from '../config/prisma';
import { notFound } from './errors/app-error';

/** Slug workspace KHB — satu deployment melayani satu komunitas. */
export const DEFAULT_WORKSPACE_SLUG = 'khb-bandung';

export interface WorkspaceWithSettings {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  tagline: string | null;
  settings: {
    assistantName: string;
    greeting: string;
    language: string;
    tone: string;
    fallbackMode: string;
    showSources: boolean;
    autoEscalate: boolean;
    requestContact: boolean;
    allowGeneralKnowledge: boolean;
    generalDisclaimer: boolean;
    model: string | null;
    temperature: number;
  };
}

/**
 * Ambil workspace + pengaturan asisten. Workspace dipilih dari header
 * `X-Workspace-Slug` (opsional) atau default `khb-bandung`.
 */
export async function getWorkspace(slug = DEFAULT_WORKSPACE_SLUG): Promise<WorkspaceWithSettings> {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { settings: true },
  });

  if (!workspace) throw notFound(`Workspace "${slug}" tidak ditemukan. Jalankan npm run db:seed.`);

  const settings = workspace.settings;
  if (!settings) throw notFound(`Pengaturan asisten untuk "${slug}" belum dibuat.`);

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    city: workspace.city,
    tagline: workspace.tagline,
    settings: {
      assistantName: settings.assistantName,
      greeting: settings.greeting,
      language: settings.language,
      tone: settings.tone,
      fallbackMode: settings.fallbackMode,
      showSources: settings.showSources,
      autoEscalate: settings.autoEscalate,
      requestContact: settings.requestContact,
      allowGeneralKnowledge: settings.allowGeneralKnowledge,
      generalDisclaimer: settings.generalDisclaimer,
      model: settings.model,
      temperature: settings.temperature,
    },
  };
}

/** Slug workspace dari request (header → default). */
export function resolveSlug(raw: unknown): string {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : DEFAULT_WORKSPACE_SLUG;
}
