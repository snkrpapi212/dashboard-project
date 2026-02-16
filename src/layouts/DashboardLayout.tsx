import React, { useState, useCallback, useEffect } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href: string;
  badge?: number;
  children?: NavItem[];
}

export interface DashboardLayoutProps {
  /** Content rendered inside the main area */
  children: React.ReactNode;
  /** Navigation items for the sidebar */
  navItems?: NavItem[];
  /** Content or component for the header right section */
  headerRight?: React.ReactNode;
  /** Dashboard title displayed in the header */
  title?: string;
  /** Currently active path for nav highlighting */
  activePath?: string;
  /** Callback when a nav item is clicked */
  onNavigate?: (href: string) => void;
  /** Control sidebar collapsed state externally */
  sidebarCollapsed?: boolean;
  /** Callback when sidebar collapsed state changes */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

/* --------------------------------------------------------------------------
   Breakpoints (matching token system)
   -------------------------------------------------------------------------- */

const BREAKPOINT_LG = '(min-width: 1024px)';
const BREAKPOINT_MD = '(min-width: 768px)';

/* --------------------------------------------------------------------------
   DashboardLayout Component
   -------------------------------------------------------------------------- */

export function DashboardLayout({
  children,
  navItems = [],
  headerRight,
  title = 'Sales Dashboard',
  activePath = '/',
  onNavigate,
  sidebarCollapsed: controlledCollapsed,
  onSidebarCollapsedChange,
}: DashboardLayoutProps) {
  const isDesktop = useMediaQuery(BREAKPOINT_LG);
  const isTablet = useMediaQuery(BREAKPOINT_MD);

  // Sidebar state
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Use controlled or internal state
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = useCallback(
    (collapsed: boolean) => {
      if (onSidebarCollapsedChange) {
        onSidebarCollapsedChange(collapsed);
      } else {
        setInternalCollapsed(collapsed);
      }
    },
    [onSidebarCollapsedChange],
  );

  // Auto-collapse on tablet, hide on mobile
  useEffect(() => {
    if (!isDesktop && isTablet) {
      setCollapsed(true);
    }
    if (!isTablet) {
      setMobileSidebarOpen(false);
    }
  }, [isDesktop, isTablet, setCollapsed]);

  // Close mobile sidebar on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

  // Toggle sidebar
  const handleToggleSidebar = useCallback(() => {
    if (!isTablet) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setCollapsed(!isCollapsed);
    }
  }, [isTablet, isCollapsed, setCollapsed]);

  // Toggle expanded group
  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle navigation
  const handleNavClick = useCallback(
    (item: NavItem, e: React.MouseEvent) => {
      if (item.children && item.children.length > 0) {
        e.preventDefault();
        toggleGroup(item.id);
        return;
      }
      if (onNavigate) {
        e.preventDefault();
        onNavigate(item.href);
      }
      // Close mobile sidebar after navigation
      if (!isTablet) {
        setMobileSidebarOpen(false);
      }
    },
    [onNavigate, toggleGroup, isTablet],
  );

  // Build sidebar class names
  const sidebarClasses = [
    'layout-sidebar',
    isCollapsed ? 'layout-sidebar--collapsed' : '',
    mobileSidebarOpen ? 'layout-sidebar--mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Build app shell class names
  const shellClasses = [
    'app-shell',
    isCollapsed ? 'app-shell--sidebar-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClasses}>
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#sidebar-nav" className="skip-link">
        Skip to navigation
      </a>

      {/* Header */}
      <header className="layout-header" role="banner">
        <div className="layout-header__left">
          <button
            className="sidebar-toggle"
            onClick={handleToggleSidebar}
            aria-label={
              mobileSidebarOpen || !isCollapsed
                ? 'Collapse sidebar'
                : 'Expand sidebar'
            }
            aria-expanded={mobileSidebarOpen || !isCollapsed}
          >
            <span className="sidebar-toggle__line" />
            <span className="sidebar-toggle__line" />
            <span className="sidebar-toggle__line" />
          </button>
          <h1 className="layout-header__title">{title}</h1>
        </div>
        <div className="layout-header__right">{headerRight}</div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileSidebarOpen ? 'mobile-overlay--visible' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
      >
        <nav className="sidebar-nav">
          <ul className="sidebar-nav__list" role="list">
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                activePath={activePath}
                isCollapsed={isCollapsed && isTablet}
                expandedGroups={expandedGroups}
                onNavClick={handleNavClick}
              />
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="layout-main" role="main">
        <div className="layout-main__content">{children}</div>
      </main>
    </div>
  );
}

/* --------------------------------------------------------------------------
   SidebarNavItem (internal subcomponent)
   -------------------------------------------------------------------------- */

interface SidebarNavItemProps {
  item: NavItem;
  activePath: string;
  isCollapsed: boolean;
  expandedGroups: Set<string>;
  onNavClick: (item: NavItem, e: React.MouseEvent) => void;
  depth?: number;
}

function SidebarNavItem({
  item,
  activePath,
  isCollapsed,
  expandedGroups,
  onNavClick,
  depth = 0,
}: SidebarNavItemProps) {
  const isActive = activePath === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedGroups.has(item.id);

  const itemClasses = [
    'sidebar-nav__item',
    isActive ? 'sidebar-nav__item--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li role="none">
      <a
        href={item.href}
        className={itemClasses}
        onClick={(e) => onNavClick(item, e)}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        title={isCollapsed ? item.label : undefined}
      >
        {item.icon && (
          <span className="sidebar-nav__item-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="sidebar-nav__item-label">{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <span
            className="sidebar-nav__item-badge"
            aria-label={`${item.badge} new`}
          >
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <span
            className={`sidebar-nav__item-chevron ${isExpanded ? 'sidebar-nav__item-chevron--expanded' : ''}`}
            aria-hidden="true"
          >
            &#8250;
          </span>
        )}
      </a>
      {hasChildren && isExpanded && (
        <ul className="sidebar-nav__submenu" role="group">
          {item.children!.map((child) => (
            <SidebarNavItem
              key={child.id}
              item={child}
              activePath={activePath}
              isCollapsed={isCollapsed}
              expandedGroups={expandedGroups}
              onNavClick={onNavClick}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
