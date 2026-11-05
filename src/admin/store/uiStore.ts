import { useState } from 'react';
// Tiny UI store — sidebar open + toast text. ponytail: ganti zustand bila state global tumbuh.
export function useSidebar() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((v) => !v), close: () => setOpen(false) };
}
