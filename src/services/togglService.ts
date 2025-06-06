interface TogglRequestParams {
  start_date: string;
  end_date: string;
  workspace_id?: number;
  order_field?: string;
  order_desc?: boolean;
}

interface TogglTimeEntry {
  id: number;
  description: string;
  start: string;
  end: string;
  duration: number;
  project_id: number;
  project?: string;
  client?: string;
  user_id: number;
  user_name?: string;
  workspace_id: number;
}

export class TogglService {
  private static apiToken: string = '';
  private static baseUrl: string = '/toggl-api';
  private static workspaceId: number | null = null;

  static async initialize(): Promise<boolean> {
    try {
      // Versuche zuerst den Token aus der .env zu laden
      const envToken = import.meta.env.VITE_TOGGL_API_TOKEN;
      
      // Versuche dann den Token aus dem localStorage zu laden
      const storedToken = localStorage.getItem('toggl_api_token');
      
      const token = envToken || storedToken || 'ea22ae1867ff9cfb78b39899e359a3c1'; // Fallback zum festen Token

      console.log('Token-Initialisierung:', {
        envToken: envToken ? 'vorhanden' : 'nicht vorhanden',
        storedToken: storedToken ? 'vorhanden' : 'nicht vorhanden',
        finalToken: token ? token.substring(0, 5) + '...' : 'nicht vorhanden'
      });

      if (!token) {
        console.log('Kein Token gefunden - weder in .env noch im localStorage');
        return false;
      }

      this.apiToken = token;
      return this.testConnection();
    } catch (error) {
      console.error('Fehler bei der Initialisierung:', error);
      return false;
    }
  }

  static async setApiToken(token: string): Promise<boolean> {
    if (!token) return false;
    
    console.log('Setze neuen Token:', token.substring(0, 5) + '...');
    this.apiToken = token;
    const success = await this.testConnection();
    
    if (success) {
      console.log('Token erfolgreich validiert, speichere in localStorage');
      localStorage.setItem('toggl_api_token', token);
    } else {
      console.log('Token-Validierung fehlgeschlagen');
    }
    
    return success;
  }

  static getApiToken(): string {
    return this.apiToken;
  }

  static setWorkspaceId(id: number) {
    this.workspaceId = id;
  }

  static async fetchReportData(params: TogglRequestParams): Promise<TogglTimeEntry[]> {
    if (!this.apiToken) {
      throw new Error('API Token nicht gesetzt');
    }

    if (!this.workspaceId) {
      throw new Error('Workspace ID nicht gesetzt');
    }

    const headers = new Headers({
      'Authorization': `Basic ${btoa(`${this.apiToken}:api_token`)}`,
      'Content-Type': 'application/json',
    });

    try {
      // Zuerst die Projekte abrufen
      const projectsResponse = await fetch(`${this.baseUrl}/api/v9/workspaces/${this.workspaceId}/projects`, {
        method: 'GET',
        headers,
      });

      if (!projectsResponse.ok) {
        throw new Error(`Fehler beim Abrufen der Projekte: ${projectsResponse.status}`);
      }

      const projects = await projectsResponse.json();
      const projectMap = new Map(projects.map((p: any) => [p.id, { name: p.name, client: p.client_name }]));

      // Dann die Zeiteinträge abrufen
      const timeResponse = await fetch(`${this.baseUrl}/api/v9/me/time_entries`, {
        method: 'GET',
        headers,
      });

      if (!timeResponse.ok) {
        throw new Error(`Fehler beim Abrufen der Zeiteinträge: ${timeResponse.status}`);
      }

      const timeEntries = await timeResponse.json();
      
      // Filtern nach Datum und mit Projekt-Informationen anreichern
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);

      return timeEntries
        .filter((entry: any) => {
          const entryDate = new Date(entry.start);
          return entryDate >= startDate && entryDate <= endDate;
        })
        .map((entry: any) => {
          const projectInfo = entry.project_id ? projectMap.get(entry.project_id) : null;
          return {
            id: entry.id,
            description: entry.description || 'Keine Beschreibung',
            start: entry.start,
            end: entry.stop,
            duration: entry.duration > 0 ? entry.duration : 0,
            project_id: entry.project_id,
            project: projectInfo?.name || null,
            client: projectInfo?.client || null,
            user_id: entry.user_id,
            workspace_id: entry.workspace_id
          };
        })
        .sort((a: any, b: any) => {
          return params.order_desc ? 
            new Date(b.start).getTime() - new Date(a.start).getTime() :
            new Date(a.start).getTime() - new Date(b.start).getTime();
        });
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      if (error instanceof Error) {
        throw new Error(`Fehler beim Abrufen der Daten: ${error.message}`);
      }
      throw new Error('Unbekannter Fehler beim Abrufen der Daten');
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      if (!this.apiToken) {
        console.log('Kein API-Token vorhanden für Test');
        return false;
      }

      const authString = btoa(`${this.apiToken}:api_token`);
      console.log('Auth String (Base64):', authString);

      const headers = new Headers({
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      });

      console.log('Teste Verbindung mit Token:', this.apiToken);
      console.log('Request Headers:', Object.fromEntries(headers.entries()));

      const response = await fetch(`${this.baseUrl}/api/v9/me/workspaces`, {
        method: 'GET',
        headers,
      });

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        console.log('Verbindungstest fehlgeschlagen:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error Details:', errorText);
        return false;
      }

      const workspaces = await response.json();
      console.log('Workspaces:', workspaces);

      if (workspaces && workspaces.length > 0) {
        this.setWorkspaceId(workspaces[0].id);
        console.log('Verbindungstest erfolgreich, Workspace ID:', workspaces[0].id);
        return true;
      }

      console.log('Keine Workspaces gefunden');
      return false;
    } catch (error) {
      console.error('Fehler beim Verbindungstest:', error);
      return false;
    }
  }
} 