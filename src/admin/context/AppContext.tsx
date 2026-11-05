import { createContext, useContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { currentUser as seedUser } from '../data/khb';
import type { CurrentUser } from '../data/khb';

interface AppState {
  user: CurrentUser;
  setUser: Dispatch<SetStateAction<CurrentUser>>;
}

const AppCtx = createContext<AppState | null>(null);

export const useApp = (): AppState => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider');
  return ctx;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(seedUser);

  return <AppCtx.Provider value={{ user, setUser }}>{children}</AppCtx.Provider>;
}
