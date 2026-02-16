import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface SidebarContextType {
  /** Whether the sidebar is collapsed (icon-only mode) */
  isCollapsed: boolean;
  /** Toggle between collapsed and expanded */
  toggleCollapsed: () => void;
  /** Explicitly set collapsed state */
  setCollapsed: (collapsed: boolean) => void;
  /** Whether the mobile sidebar overlay is open */
  isMobileOpen: boolean;
  /** Toggle mobile overlay sidebar */
  toggleMobileOpen: () => void;
  /** Explicitly set mobile open state */
  setMobileOpen: (open: boolean) => void;
}

/* --------------------------------------------------------------------------
   Context
   -------------------------------------------------------------------------- */

const SidebarContext = createContext<SidebarContextType | null>(null);

/* --------------------------------------------------------------------------
   Provider
   -------------------------------------------------------------------------- */

export interface SidebarProviderProps {
  children: ReactNode;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleMobileOpen = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        setCollapsed,
        isMobileOpen,
        toggleMobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

/* --------------------------------------------------------------------------
   Hook
   -------------------------------------------------------------------------- */

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
