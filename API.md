# API Dokumentation

Dokumentation aller APIs und Services der Toggl WebSense Anwendung.

## 📡 Toggl Track API Integration

### Base Configuration
```typescript
const TOGGL_API_BASE = 'https://api.track.toggl.com/api/v9';
const headers = {
  'Authorization': `Basic ${btoa(apiToken + ':api_token')}`,
  'Content-Type': 'application/json'
};
```

### Authentication

#### `POST /authenticate`
Validiert einen API-Token gegen die Toggl API.

**Request:**
```typescript
{
  token: string
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: {
    id: number;
    email: string;
    fullname: string;
    default_workspace_id: number;
  };
  error?: string;
}
```

**Usage:**
```typescript
const isValid = await TogglService.setApiToken('your-api-token');
```

---

## 🏢 User & Workspace API

### `GET /api/v9/me`
Ruft Benutzerinformationen und Standard-Workspace ab.

**Response:**
```typescript
interface UserResponse {
  id: number;
  email: string;
  fullname: string;
  default_workspace_id: number;
  timezone: string;
  beginning_of_week: number;
  image_url?: string;
}
```

**Implementation:**
```typescript
const user = await TogglService.getCurrentUser();
```

---

## ⏱️ Time Entries API

### `GET /api/v9/me/time_entries`
Ruft Zeiteinträge für den authentifizierten Benutzer ab.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string | Yes | ISO date (YYYY-MM-DD) |
| end_date | string | Yes | ISO date (YYYY-MM-DD) |

**Response:**
```typescript
interface TimeEntry {
  id: number;
  workspace_id: number;
  project_id?: number;
  task_id?: number;
  billable: boolean;
  start: string; // ISO datetime
  stop?: string; // ISO datetime
  duration: number; // seconds
  description?: string;
  tags?: string[];
  tag_ids?: number[];
  duronly: boolean;
  at: string; // ISO datetime
  server_deleted_at?: string;
  user_id: number;
  uid: number;
  wid: number;
  pid?: number;
}
```

**Usage:**
```typescript
const entries = await TogglService.getTimeEntries(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

---

## 👥 Clients API

### `GET /api/v9/workspaces/{workspace_id}/clients`
Ruft alle Kunden für einen Workspace ab.

**Response:**
```typescript
interface Client {
  id: number;
  name: string;
  archived: boolean;
  at: string;
  creator_id: number;
  wid: number;
  notes?: string;
}
```

**Usage:**
```typescript
const clients = await TogglService.getClients();
```

---

## 📁 Projects API

### `GET /api/v9/workspaces/{workspace_id}/projects`
Ruft alle Projekte für einen Workspace ab.

**Response:**
```typescript
interface Project {
  id: number;
  workspace_id: number;
  client_id?: number;
  name: string;
  is_private: boolean;
  active: boolean;
  at: string;
  created_at: string;
  server_deleted_at?: string;
  color: string;
  billable?: boolean;
  template?: boolean;
  auto_estimates?: boolean;
  estimated_hours?: number;
  rate?: number;
  rate_last_updated?: string;
  currency?: string;
  recurring?: boolean;
  recurring_parameters?: any;
  current_period?: any;
  fixed_fee?: number;
  actual_hours?: number;
  wid: number;
  cid?: number;
}
```

**Usage:**
```typescript
const projects = await TogglService.getProjects();
```

---

## 🔧 Local Services API

### TogglService

#### `initialize(): Promise<boolean>`
Initialisiert den Service und prüft gespeicherte Tokens.

```typescript
const success = await TogglService.initialize();
```

#### `setApiToken(token: string): Promise<boolean>`
Setzt und validiert einen neuen API-Token.

```typescript
const isValid = await TogglService.setApiToken('your-token');
```

#### `getFilteredData(filters: FilterOptions): Promise<ProcessedTimeEntry[]>`
Ruft gefilterte Zeitdaten ab.

**Parameters:**
```typescript
interface FilterOptions {
  selectedDate: Date;
  selectedClient: string;
  selectedProject: string;
}
```

**Response:**
```typescript
interface ProcessedTimeEntry {
  id: number;
  date: string; // DD.MM.YYYY
  day: string; // Wochentag
  client: string;
  project: string;
  task: string;
  duration: string; // HH:MM
  billable: boolean;
  description: string;
}
```

#### `getAvailableClients(): Promise<string[]>`
Gibt alle verfügbaren Kundennamen zurück.

#### `getAvailableProjects(clientName?: string): Promise<string[]>`
Gibt verfügbare Projekte zurück (optional gefiltert nach Kunde).

---

### PDFExportService

#### `generateActivityReport(options: ExportOptions): Promise<void>`
Generiert und lädt einen PDF-Tätigkeitsnachweis herunter.

**Parameters:**
```typescript
interface ExportOptions {
  data: ReportData[];
  columns: Column[];
  selectedClient: string;
  selectedProject: string;
  selectedDate: Date;
  summaryStats: {
    totalHours: string;
    billableHours: string;
    totalEntries: number;
    allBillable: boolean;
  };
}

interface ReportData {
  [key: string]: string;
}

interface Column {
  field: string;
  header: string;
  visible: boolean;
}
```

**Usage:**
```typescript
await PDFExportService.generateActivityReport({
  data: timeEntries,
  columns: visibleColumns,
  selectedClient: 'Client Name',
  selectedProject: 'Project Name',
  selectedDate: new Date(),
  summaryStats: {
    totalHours: '40:00',
    billableHours: '35:00',
    totalEntries: 20,
    allBillable: false
  }
});
```

---

## 📊 Data Processing API

### Time Entry Processing

#### `formatDuration(seconds: number): string`
Formatiert Sekunden zu HH:MM Format.

```typescript
const formatted = formatDuration(3600); // "01:00"
```

#### `parseTogglDate(isoString: string): string`
Konvertiert ISO-Datum zu deutschem Format.

```typescript
const germanDate = parseTogglDate('2024-01-15T10:00:00Z'); // "15.01.2024"
```

#### `getWeekday(date: Date): string`
Gibt deutschen Wochentag zurück.

```typescript
const weekday = getWeekday(new Date('2024-01-15')); // "Montag"
```

### Summary Calculations

#### `calculateSummaryStats(entries: TimeEntry[]): SummaryStats`
Berechnet Zusammenfassungsstatistiken.

```typescript
interface SummaryStats {
  totalHours: string;
  billableHours: string;
  totalEntries: number;
  allBillable: boolean;
}
```

---

## 🔄 Error Handling

### Standard Error Response
```typescript
interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `AUTH_FAILED` | API-Token ungültig | Token überprüfen |
| `NETWORK_ERROR` | Netzwerkfehler | Verbindung prüfen |
| `RATE_LIMIT` | API-Rate-Limit erreicht | Warten und wiederholen |
| `NO_WORKSPACE` | Kein Workspace gefunden | Workspace-Zugriff prüfen |
| `INVALID_DATE` | Ungültiger Datumsbereich | Datum korrigieren |

### Error Handling Pattern
```typescript
try {
  const data = await TogglService.getTimeEntries(startDate, endDate);
  return data;
} catch (error) {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'AUTH_FAILED':
        // Token erneuern
        break;
      case 'RATE_LIMIT':
        // Retry nach Delay
        break;
      default:
        // Allgemeine Fehlerbehandlung
    }
  }
  throw error;
}
```

---

## 🎯 Performance Considerations

### Caching Strategy
```typescript
// Client-seitiges Caching für statische Daten
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

class CacheService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  static set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

### Rate Limiting
```typescript
// Toggl API Rate Limits beachten
const RATE_LIMIT = {
  requests: 1000,
  window: 3600000, // 1 Stunde in ms
  delay: 100 // ms zwischen Requests
};

class RateLimiter {
  private requests: number[] = [];
  
  async throttle(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT.window);
    
    if (this.requests.length >= RATE_LIMIT.requests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = RATE_LIMIT.window - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.delay));
  }
}
```

### Data Pagination
```typescript
// Für große Datensätze
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const getPaginatedData = async <T>(
  fetchFn: (page: number, limit: number) => Promise<T[]>,
  limit: number = 50
): Promise<T[]> => {
  const allData: T[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const pageData = await fetchFn(page, limit);
    allData.push(...pageData);
    hasMore = pageData.length === limit;
    page++;
  }
  
  return allData;
};
```

---

## 🔐 Security Guidelines

### API Token Security
```typescript
// Nie Tokens in Plain Text speichern
class SecureTokenStorage {
  private static readonly KEY = 'toggl_token';
  
  static store(token: string): void {
    // Base64 ist nicht sicher, aber besser als Plain Text
    // In Produktion: Verwende Web Crypto API oder ähnliches
    const encoded = btoa(token);
    localStorage.setItem(this.KEY, encoded);
  }
  
  static retrieve(): string | null {
    const encoded = localStorage.getItem(this.KEY);
    return encoded ? atob(encoded) : null;
  }
  
  static clear(): void {
    localStorage.removeItem(this.KEY);
  }
}
```

### Request Validation
```typescript
// Input-Validierung
const validateDateRange = (start: Date, end: Date): void => {
  if (start > end) {
    throw new Error('Start date must be before end date');
  }
  
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    throw new Error('Date range cannot exceed 365 days');
  }
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

---

## 📝 Usage Examples

### Complete Workflow Example
```typescript
// Vollständiger Workflow
const workflowExample = async () => {
  try {
    // 1. Authentifizierung
    const authSuccess = await TogglService.setApiToken('your-token');
    if (!authSuccess) {
      throw new Error('Authentication failed');
    }
    
    // 2. Daten laden
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const data = await TogglService.getFilteredData({
      selectedDate: startDate,
      selectedClient: 'Alle Kunden',
      selectedProject: 'Alle Projekte'
    });
    
    // 3. PDF exportieren
    const columns = [
      { field: 'date', header: 'Datum', visible: true },
      { field: 'client', header: 'Kunde', visible: true },
      { field: 'project', header: 'Projekt', visible: true },
      { field: 'task', header: 'Aufgabe', visible: true },
      { field: 'duration', header: 'Dauer', visible: true }
    ];
    
    const summaryStats = calculateSummaryStats(data);
    
    await PDFExportService.generateActivityReport({
      data,
      columns,
      selectedClient: 'Alle Kunden',
      selectedProject: 'Alle Projekte',
      selectedDate: startDate,
      summaryStats
    });
    
    console.log('Workflow completed successfully');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
};
```

---

**Version**: 1.2.3  
**Letzte Aktualisierung**: Dezember 2024 