import { useEffect, useState } from 'react';
import { TogglService } from '../services/togglService';

export const DebugInfo = () => {
  const [envVars, setEnvVars] = useState({
    VITE_TOGGL_TOKEN: import.meta.env.VITE_TOGGL_TOKEN || 'nicht gesetzt',
    VITE_TOGGL_REPORT_ID: import.meta.env.VITE_TOGGL_REPORT_ID || 'nicht gesetzt'
  });

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '16px', 
      right: '16px', 
      background: 'rgba(255, 255, 255, 0.95)', 
      padding: '16px', 
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: '400',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      color: '#374151',
      minWidth: '280px'
    }}>
      <h4 style={{ 
        margin: '0 0 8px 0', 
        fontWeight: '600', 
        fontSize: '14px',
        color: '#1f2937',
        letterSpacing: '-0.01em'
      }}>
        Debug Info
      </h4>
      <pre style={{ 
        margin: 0, 
        fontFamily: 'Inter, monospace',
        fontSize: '11px',
        lineHeight: '1.4',
        color: '#6b7280'
      }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  );
}; 