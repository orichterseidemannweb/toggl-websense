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
  private static baseUrl: string = 'https://api.track.toggl.com/reports/api/v3';
  private static workspaceId: number | null = null;

  static setApiToken(token: string) {
    this.apiToken = token;
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
      // Report API v3 Endpoint für detaillierte Zeiteinträge
      const response = await fetch(`${this.baseUrl}/workspace/${this.workspaceId}/search/time_entries`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          start_date: params.start_date,
          end_date: params.end_date,
          order_field: params.order_field || 'start_date',
          order_desc: params.order_desc || true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as TogglTimeEntry[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fehler beim Abrufen der Daten: ${error.message}`);
      }
      throw new Error('Unbekannter Fehler beim Abrufen der Daten');
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      if (!this.apiToken) {
        return false;
      }

      const headers = new Headers({
        'Authorization': `Basic ${btoa(`${this.apiToken}:api_token`)}`,
        'Content-Type': 'application/json',
      });

      // Workspace Information abrufen
      const response = await fetch('https://api.track.toggl.com/api/v9/me/workspaces', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return false;
      }

      const workspaces = await response.json();
      if (workspaces && workspaces.length > 0) {
        // Erste verfügbare Workspace ID setzen
        this.setWorkspaceId(workspaces[0].id);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
} 