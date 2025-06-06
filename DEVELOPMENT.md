# Entwicklerdokumentation

Dieses Dokument enthält technische Details für Entwickler, die an der Toggl WebSense Anwendung arbeiten.

## 🏗 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React App)                     │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                           │
│  ├── ReportView (Hauptkomponente)                          │
│  ├── Filter Components (Client, Project, Date)             │
│  ├── ColumnVisibilityControl                               │
│  └── Authentication (Login, StatusBar)                     │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── TogglService (API Integration)                        │
│  └── PDFExportService (Report Generation)                  │
├─────────────────────────────────────────────────────────────┤
│  External APIs                                              │
│  └── Toggl Track API (v9)                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Entwicklungsumgebung Setup

### Voraussetzungen
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git
- VS Code (empfohlen)

### Empfohlene VS Code Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-jest",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Environment Setup
```bash
# Repository klonen
git clone https://github.com/orichterseidemannweb/toggl-websense.git
cd toggl-websense

# Dependencies installieren
npm install

# Environment File erstellen
cp .env.example .env

# Development Server starten
npm run dev
```

## 📁 Detaillierte Projektstruktur

```
toggl-websense/
├── public/                 # Statische Assets
│   ├── logo.png           # Firmenlogo (600x131px)
│   └── vite.svg           # Vite-Logo
├── src/
│   ├── assets/            # Build-Zeit Assets
│   │   ├── *.tsx          # Komponenten-Logik
│   │   └── *.module.css   # Komponenten-spezifische Styles
│   ├── services/          # Business Logic Services
│   │   ├── togglService.ts      # Toggl API Integration
│   │   └── pdfExportService.ts  # PDF-Generierung
│   ├── config/            # Konfigurationsdateien
│   ├── tests/             # Unit & Integration Tests
│   ├── types/             # TypeScript Type Definitions
│   ├── utils/             # Utility Functions
│   ├── hooks/             # Custom React Hooks
│   ├── App.tsx            # Haupt-App-Komponente
│   ├── main.tsx           # Entry Point
│   └── index.css          # Globale Styles
├── docs/                  # Dokumentation
├── .github/               # GitHub Actions & Templates
└── dist/                  # Build Output (generiert)
```

## 🔌 API Integration

### Toggl Track API v9

#### Authentifizierung
```typescript
// Basic Auth mit API Token
const headers = {
  'Authorization': `Basic ${btoa(apiToken + ':api_token')}`,
  'Content-Type': 'application/json'
}
```

#### Wichtige Endpoints
```typescript
// Workspace abrufen
GET /api/v9/me

// Time Entries abrufen
GET /api/v9/me/time_entries?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

// Projekte abrufen
GET /api/v9/workspaces/{workspace_id}/projects

// Clients abrufen
GET /api/v9/workspaces/{workspace_id}/clients
```

#### Error Handling
```typescript
try {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
} catch (error) {
  console.error('Toggl API Error:', error);
  throw new Error('Failed to fetch data from Toggl');
}
```

## 🎨 Styling-Konventionen

### CSS Modules
```typescript
// Component.module.css
.container { /* Komponenten-spezifische Styles */ }
.button { /* Lokale Button-Styles */ }

// Component.tsx
import styles from './Component.module.css';
<div className={styles.container}>
  <button className={styles.button}>Click me</button>
</div>
```

### Tailwind CSS
```typescript
// Utility-first für einfache Styles
<div className="flex items-center justify-between p-4 bg-white shadow-lg">
  <span className="text-lg font-semibold">Title</span>
</div>
```

### Design System
```css
:root {
  /* Primäre Farben */
  --color-primary: #3b82f6;      /* Blue-500 */
  --color-primary-dark: #1d4ed8; /* Blue-700 */
  
  /* Graustufen */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Status Farben */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Abstände */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Service Tests
```typescript
// togglService.test.ts
import { TogglService } from './togglService';

describe('TogglService', () => {
  beforeEach(() => {
    // Mock fetch or use MSW
    global.fetch = jest.fn();
  });
  
  it('should authenticate with valid token', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: 123 } })
    });
    
    const result = await TogglService.setApiToken('valid-token');
    expect(result).toBe(true);
  });
});
```

### Test Commands
```bash
# Alle Tests ausführen
npm test

# Tests im Watch-Modus
npm test -- --watch

# Coverage Report
npm run test:coverage

# Specific Test File
npm test -- Component.test.tsx
```

## 🔄 State Management

### Local Component State
```typescript
// Für einfache Komponenten-spezifische States
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState<DataType[]>([]);
```

### Local Storage
```typescript
// Für persistente Benutzereinstellungen
const saveUserPreferences = (preferences: UserPreferences) => {
  localStorage.setItem('toggl-preferences', JSON.stringify(preferences));
};

const loadUserPreferences = (): UserPreferences => {
  const saved = localStorage.getItem('toggl-preferences');
  return saved ? JSON.parse(saved) : defaultPreferences;
};
```

## 📦 Build & Deployment

### Build Process
```bash
# Development Build
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview

# Type Check
npm run type-check

# Lint
npm run lint

# Lint Fix
npm run lint:fix
```

### Environment Variables
```env
# .env.local
VITE_TOGGL_API_BASE_URL=https://api.track.toggl.com/api/v9
VITE_APP_VERSION=1.2.3
VITE_DEBUG_MODE=false
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['jspdf', 'jspdf-autotable']
        }
      }
    }
  }
});
```

## 🚀 Deployment

### Vercel Deployment
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 Performance Optimierung

### Code Splitting
```typescript
// Lazy Loading für große Komponenten
const ReportView = lazy(() => import('./components/ReportView'));
const PDFExport = lazy(() => import('./components/PDFExport'));

// Verwendung mit Suspense
<Suspense fallback={<div>Loading...</div>}>
  <ReportView />
</Suspense>
```

### Memoization
```typescript
// React.memo für Component Re-renders
const ExpensiveComponent = memo(({ data, filters }) => {
  return <div>{/* Render logic */}</div>;
});

// useMemo für teure Berechnungen
const filteredData = useMemo(() => {
  return data.filter(item => filters.includes(item.category));
}, [data, filters]);

// useCallback für Event Handlers
const handleClick = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

### Bundle Analysis
```bash
# Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

## 🔒 Sicherheit

### API Token Handling
```typescript
// Sichere Token-Speicherung
const STORAGE_KEY = 'toggl_api_token';

class SecureStorage {
  static setToken(token: string): void {
    // In Produktion: Verwende sichere Storage-Mechanismen
    localStorage.setItem(STORAGE_KEY, btoa(token));
  }
  
  static getToken(): string | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? atob(stored) : null;
  }
  
  static clearToken(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
```

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://api.track.toggl.com;">
```

## 📝 Code Style Guide

### TypeScript Konventionen
```typescript
// Interfaces mit PascalCase
interface UserData {
  readonly id: string;
  name: string;
  email: string;
}

// Enums mit PascalCase
enum LoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

// Funktionen mit camelCase
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
```

### React Best Practices
```typescript
// Props Interface definieren
interface ComponentProps {
  data: DataType[];
  onUpdate: (item: DataType) => void;
  isLoading?: boolean;
}

// Component mit TypeScript
const Component: React.FC<ComponentProps> = ({ 
  data, 
  onUpdate, 
  isLoading = false 
}) => {
  // Hooks an der Spitze
  const [localState, setLocalState] = useState<string>('');
  
  // Event Handlers
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    // Handle logic
  }, []);
  
  // Early returns für Error/Loading States
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Main render
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
};
```

## 🐛 Debugging

### Development Tools
```typescript
// Debug-Konfiguration
const DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Toggl WebSense] ${message}`, data);
  }
};

// Performance Monitoring
const withPerformanceLogging = (fn: Function, name: string) => {
  return (...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    debugLog(`${name} took ${end - start} milliseconds`);
    return result;
  };
};
```

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}
```

## 📚 Nützliche Ressourcen

### Dokumentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Toggl API Documentation](https://developers.track.toggl.com/docs/)

### Tools & Libraries
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Testing Library](https://testing-library.com/)
- [Storybook](https://storybook.js.org/)

---

**Letzte Aktualisierung**: Dezember 2024  
**Version**: 1.2.3 