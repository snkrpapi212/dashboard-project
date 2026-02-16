import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { DashboardProvider as FilterProvider } from '../context/DashboardContext';
import { ThemeProvider } from '../theme';
import { SidebarProvider } from '../context/SidebarContext';
import { ToastProvider } from './feedback/ToastProvider';

/* ==========================================================================
   DashboardProvider
   Composes all context providers (Theme, Sidebar, Dashboard/Filters, Toast)
   into a single wrapper for the dashboard application.
   ========================================================================== */

export interface DashboardAppProviderProps {
  children: ReactNode;
  /** Whether auto-refresh is enabled by default */
  defaultAutoRefresh?: boolean;
  /** Default refresh interval in ms */
  defaultRefreshInterval?: number;
}

export function DashboardAppProvider({
  children,
  defaultAutoRefresh = true,
  defaultRefreshInterval = 30_000,
}: DashboardAppProviderProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <FilterProvider
          defaultAutoRefresh={defaultAutoRefresh}
          defaultRefreshInterval={defaultRefreshInterval}
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </FilterProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default DashboardAppProvider;
