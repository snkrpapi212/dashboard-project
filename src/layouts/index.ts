/**
 * Layout System - Public API
 *
 * Provides the dashboard shell layout (sidebar + header + main),
 * the dashboard content grid, and layout utilities.
 *
 * CSS: import '../styles/layout.css' in your app entry point.
 *
 * Usage:
 *   import { DashboardLayout, DashboardContent, SectionHeader } from './layouts';
 *   import { useSidebar, SidebarProvider } from './context/SidebarContext';
 */

export { DashboardLayout } from './DashboardLayout';
export type { DashboardLayoutProps, NavItem } from './DashboardLayout';

export { DashboardContent, SectionHeader } from './DashboardContent';
export type { DashboardContentProps, SectionHeaderProps } from './DashboardContent';
