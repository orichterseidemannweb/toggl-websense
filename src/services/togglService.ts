interface TogglRequestParams {
  start_date: string;
  end_date: string;
  order_field?: string;
  order_desc?: boolean;
}

interface ReportData {
  [key: string]: string;
}

export class TogglService {
  private static readonly API_BASE_URL = 'https://api.track.toggl.com/reports/api/v3/shared';
  
  // Debug-Callback für UI-Integration
  private static debugCallback: ((category: string, data: any) => void) | null = null;
  
  public static setDebugCallback(callback: (category: string, data: any) => void) {
    this.debugCallback = callback;
  }
  
  public static clearDebugCallback() {
    this.debugCallback = null;
  }
  
  private static addDebugLog(category: string, data: any) {
    if (this.debugCallback) {
      this.debugCallback(category, data);
    }
    console.log(`${category}:`, data);
  }

  private static getBaseUrl(): string {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? '/toggl-api/reports/api/v3/shared'  // Entwicklung: Vite-Proxy
      : '/websense/api-proxy.php?endpoint=/reports/api/v3/shared';  // Produktion: PHP-Proxy
  }
  private static readonly SESSION_KEY = 'toggl_session_token'; // Key für sessionStorage
  private static readonly REPORT_ID_SESSION_KEY = 'toggl_report_id'; // Key für Report-ID
  private static apiToken: string = '';
  private static reportId: string = '';

  public static async initialize(): Promise<boolean> {
    console.log('TogglService initialisiert - prüfe gespeicherte Daten...');
    
    // Versuche Token und Report-ID aus sessionStorage zu laden
    const storedToken = this.loadTokenFromSession();
    const storedReportId = this.loadReportIdFromSession();
    
    if (storedToken && storedReportId) {
      console.log('Gespeicherte Daten gefunden - teste Verbindung...');
      this.apiToken = storedToken;
      this.reportId = storedReportId;
      const isValid = await this.testConnection();
      if (isValid) {
        console.log('Gespeicherte Daten sind gültig');
        return true;
      } else {
        console.log('Gespeicherte Daten sind ungültig - lösche sie');
        this.clearStoredData();
      }
    }
    
    console.log('Keine gültigen Daten gefunden - Benutzer muss sich anmelden');
    return false;
  }

  public static async setApiTokenAndReportId(token: string, reportId: string): Promise<{ success: boolean; errorType?: 'token' | 'reportId'; message?: string }> {
    console.log('API Token und Report-ID werden gesetzt und getestet...');
    this.apiToken = token;
    this.reportId = reportId;
    
    // Erst Token testen
    const isTokenValid = await this.testConnection();
    if (!isTokenValid) {
      console.log('Token ungültig');
      this.apiToken = '';
      this.reportId = '';
      return { 
        success: false, 
        errorType: 'token', 
        message: 'API Token ist ungültig. Bitte überprüfen Sie Ihren Token in den Toggl Profile Settings.' 
      };
    }
    
    // Dann Report-ID testen
    const isReportValid = await this.testReportAccess();
    if (!isReportValid) {
      console.log('Report-ID ungültig oder nicht zugänglich');
      this.apiToken = '';
      this.reportId = '';
      return { 
        success: false, 
        errorType: 'reportId', 
        message: 'Report-ID ist ungültig oder der Report ist nicht öffentlich zugänglich. Bitte überprüfen Sie die Report-ID und stellen Sie sicher, dass der Report auf "öffentlich" gestellt ist.' 
      };
    }
    
    // Nur bei gültigen Daten speichern
    this.saveTokenToSession(token);
    this.saveReportIdToSession(reportId);
    console.log('Token und Report-ID erfolgreich gespeichert');
    return { success: true };
  }

  public static getApiToken(): string {
    return this.apiToken;
  }

  public static getReportId(): string {
    return this.reportId;
  }

  // Token und Report-ID aus Memory und Storage löschen
  public static clearToken(): void {
    this.apiToken = '';
    this.reportId = '';
    this.clearStoredData();
    console.log('Alle Daten wurden vollständig gelöscht');
  }

  // Private Methoden für Token-Storage
  private static saveTokenToSession(token: string): void {
    try {
      const encodedToken = btoa(token);
      sessionStorage.setItem(this.SESSION_KEY, encodedToken);
    } catch (error) {
      console.error('Fehler beim Speichern des Tokens:', error);
    }
  }

  private static loadTokenFromSession(): string | null {
    try {
      const encodedToken = sessionStorage.getItem(this.SESSION_KEY);
      if (encodedToken) {
        return atob(encodedToken);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Tokens:', error);
      this.clearStoredData();
    }
    return null;
  }

  // Private Methoden für Report-ID Storage
  private static saveReportIdToSession(reportId: string): void {
    try {
      const encodedReportId = btoa(reportId);
      sessionStorage.setItem(this.REPORT_ID_SESSION_KEY, encodedReportId);
    } catch (error) {
      console.error('Fehler beim Speichern der Report-ID:', error);
    }
  }

  private static loadReportIdFromSession(): string | null {
    try {
      const encodedReportId = sessionStorage.getItem(this.REPORT_ID_SESSION_KEY);
      if (encodedReportId) {
        return atob(encodedReportId);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Report-ID:', error);
      this.clearStoredData();
    }
    return null;
  }

  private static clearStoredData(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.REPORT_ID_SESSION_KEY);
    } catch (error) {
      console.error('Fehler beim Löschen der gespeicherten Daten:', error);
    }
  }

  public static async testConnection(): Promise<boolean> {
    try {
      // Dynamische URL-Auswahl basierend auf Umgebung
      const isDevelopment = import.meta.env.DEV;
      const apiUrl = isDevelopment 
        ? '/toggl-api/api/v9/me'  // Entwicklung: Vite-Proxy
        : '/websense/api-proxy.php?endpoint=/api/v9/me';  // Produktion: PHP-Proxy
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.apiToken}:api_token`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Verbindungstest fehlgeschlagen:', response.status);
        return false;
      }
      
      console.log('Verbindung erfolgreich hergestellt');
      return true;
    } catch (error) {
      console.error('Fehler beim Testen der Verbindung:', error);
      return false;
    }
  }

  // Neue Methode: Report-Zugriff testen
  public static async testReportAccess(): Promise<boolean> {
    try {
      if (!this.reportId) {
        console.error('Keine Report-ID zum Testen vorhanden');
        return false;
      }

      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${this.reportId}/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.apiToken + ':api_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: '2024-01-01',
          end_date: '2024-01-02',
        }),
      });

      if (!response.ok) {
        console.error('Report-Zugriff fehlgeschlagen:', response.status);
        return false;
      }
      
      console.log('Report-Zugriff erfolgreich');
      return true;
    } catch (error) {
      console.error('Fehler beim Testen des Report-Zugriffs:', error);
      return false;
    }
  }

  public static async fetchReportData(params: TogglRequestParams): Promise<string> {
    try {
      if (!this.reportId) {
        throw new Error('Keine Report-ID konfiguriert');
      }

      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${this.reportId}/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.apiToken + ':api_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Fehler:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvData = await response.text();
      return csvData;
    } catch (error) {
      console.error('Fehler beim Abrufen der Toggl-Daten:', error);
      throw new Error('Fehler beim Abrufen der Daten von Toggl');
    }
  }

  // Alias für fetchReportData zur Kompatibilität
  public static async fetchCSVReport(params: TogglRequestParams): Promise<string> {
    return this.fetchReportData(params);
  }

  // CSV-Parser-Funktion
  public static async parseCSVData(csvData: string, dateFilter?: { start: string, end: string }): Promise<ReportData[]> {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        return [];
      }

      const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
      const data: ReportData[] = [];

      // Statistik-Zähler für Datenfilterung
      let clientTotal = 0;
      let clientFiltered = 0;
      let clientKept = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const row: ReportData = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });

          // Filter "Intern Web" Kunden und interne Projekte komplett heraus
          const clientName = row['Client'] || row['Kunde'] || '';
          const projectName = row['Project'] || row['Projekt'] || '';
          
          const isInternalClient = clientName.toLowerCase().includes('intern');
          const isInternalProject = projectName.toLowerCase().includes('intern');
          
          if (isInternalClient || isInternalProject) {
            continue; // Überspringe interne Einträge
          }

          // Zähle Client-Einträge für Statistik
          const isTargetClient = clientName.toLowerCase().includes('schocke');
          if (isTargetClient) {
            clientTotal++;
          }

          // Datumsfilterung anwenden
          if (dateFilter) {
            const entryDateStr = row['Start date'];
            const entryDate = new Date(entryDateStr);
            const startDate = new Date(dateFilter.start);
            const endDate = new Date(dateFilter.end);
            
            // Optionales Debug-Logging für Datumsfilterung
            
            // Berücksichtige nur Einträge innerhalb des angeforderten Zeitraums
            // Filtere Einträge außerhalb des Zeitraums
            if (entryDate < startDate || entryDate > endDate) {
              if (isTargetClient) {
                clientFiltered++;
              }
              continue; // Überspringe Einträge außerhalb des Zeitraums
            }
          }

          // Zähle behaltene Client-Einträge
          if (isTargetClient) {
            clientKept++;
          }

          data.push(row);
        }
      }

      // Filterstatistik ausgeben falls relevant
      if (clientTotal > 0) {
        this.addDebugLog(`📊 DATUMSFILTER-STATISTIK`, {
          'Gesamt gefunden': clientTotal,
          'Herausgefiltert': clientFiltered,
          'Behalten': clientKept
        });
      }
      
      return data;
    } catch (error) {
      console.error('Fehler beim Parsen der CSV-Daten:', error);
      throw new Error('Fehler beim Verarbeiten der CSV-Daten');
    }
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  // Neue Methode: Verfügbare Reports abrufen
  public static async fetchAvailableReports(): Promise<any[]> {
    try {
      // Workspace ID aus den User-Daten holen
      const workspaceId = await this.getWorkspaceId();
      console.log('Gefundene Workspace ID:', workspaceId);

      if (!workspaceId) {
        throw new Error('Keine Workspace ID gefunden');
      }

      // Verschiedene API-Endpoints probieren (mit Workspace ID)
      const endpoints = [
        // Shared Reports für spezifische Workspace
        this.getWorkspaceSharedReportsUrl(workspaceId),
        // Saved Reports API
        this.getWorkspaceSavedReportsUrl(workspaceId),
        // Workspace Projects (zum Vergleich)
        this.getWorkspaceProjectsUrl(workspaceId),
        // Fallback: Shared Reports allgemein
        this.getBaseUrl()
      ];

      console.log('Versuche verschiedene Report API-Endpoints...');
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Versuche Endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${btoa(this.apiToken + ':api_token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Erfolg mit Endpoint ${endpoint}:`, data);
            return Array.isArray(data) ? data : [data];
          } else {
            console.log(`Endpoint ${endpoint} failed with status:`, response.status);
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} error:`, endpointError);
        }
      }

      throw new Error('Alle API-Endpoints fehlgeschlagen');
    } catch (error) {
      console.error('Fehler beim Abrufen der verfügbaren Reports:', error);
      throw error;
    }
  }

  // Hilfsmethode um Workspace ID zu bekommen
  private static async getWorkspaceId(): Promise<number | null> {
    try {
      // Zuerst versuchen, Workspace ID dynamisch zu ermitteln
      const workspaces = await this.getUserWorkspaces();
      if (workspaces && workspaces.length > 0) {
        return workspaces[0].id; // Erste (und vermutlich einzige) Workspace
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Workspace ID dynamisch, verwende Fallback:', error);
    }
    
    // Kein Fallback - Anwendung erfordert gültige Workspace-Discovery
    console.warn('Keine Workspace ID gefunden - Anwendung erfordert gültigen API-Token');
    return null;
  }

  // Hilfsmethode um User Workspaces zu bekommen
  private static async getUserWorkspaces(): Promise<any[]> {
    const url = this.getUserWorkspacesUrl();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(this.apiToken + ':api_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Fehler beim Abrufen der Workspaces');
  }

  private static getWorkspaceReportsUrl(): string {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? '/toggl-api/api/v9/me/workspaces'
      : '/websense/api-proxy.php?endpoint=/api/v9/me/workspaces';
  }

  private static getUserWorkspacesUrl(): string {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? '/toggl-api/api/v9/me'
      : '/websense/api-proxy.php?endpoint=/api/v9/me';
  }

  private static getWorkspaceSharedReportsUrl(workspaceId: number): string {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? `/toggl-api/reports/api/v3/workspace/${workspaceId}/shared`
      : `/websense/api-proxy.php?endpoint=/reports/api/v3/workspace/${workspaceId}/shared`;
  }

  private static getWorkspaceSavedReportsUrl(workspaceId: number): string {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? `/toggl-api/api/v9/workspaces/${workspaceId}/saved_reports`
      : `/websense/api-proxy.php?endpoint=/api/v9/workspaces/${workspaceId}/saved_reports`;
  }

  private static getWorkspaceProjectsUrl(workspaceId: number): string {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment 
      ? `/toggl-api/api/v9/workspaces/${workspaceId}/projects`
      : `/websense/api-proxy.php?endpoint=/api/v9/workspaces/${workspaceId}/projects`;
  }
} 