import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/* ==========================================================================
   Application Entry Point
   CSS Import Order:
   1. globals.css - imports token layers (primitives, semantic, component tokens,
      light/dark themes, accessibility) and provides the CSS reset + base styles
   2. dashboard.css - dashboard component styles (KPI, charts, filters, grid)
   3. feedback.css - feedback component styles (toast, progress, empty state)
   4. DataTable.css - table component styles (imported by DataTable component)
   ========================================================================== */

// Global styles (tokens + reset + base typography) - MUST be first
import './theme/globals.css';

// Component stylesheets
import './styles/dashboard.css';
import './styles/feedback.css';

/* --------------------------------------------------------------------------
   Mount Application
   -------------------------------------------------------------------------- */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Ensure index.html contains <div id="root"></div>.',
  );
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
