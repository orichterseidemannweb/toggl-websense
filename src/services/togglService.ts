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
  private static readonly BASE_URL = '/toggl-api/reports/api/v3/shared';
  private static readonly REPORT_ID = import.meta.env.VITE_TOGGL_REPORT_ID;
  private static readonly TOKEN = import.meta.env.VITE_TOGGL_TOKEN;
  private static apiToken: string = '';

  public static async initialize(): Promise<boolean> {
    console.log('Initialisiere TogglService');
    console.log('ENV Token:', this.TOKEN);
    console.log('ENV Report ID:', this.REPORT_ID);
    
    if (this.TOKEN) {
      console.log('Token gefunden, setze API Token');
      this.apiToken = this.TOKEN;
      return this.testConnection();
    }
    console.log('Kein Token gefunden');
    return false;
  }

  public static async setApiToken(token: string): Promise<boolean> {
    console.log('Setze neuen API Token:', token);
    this.apiToken = token;
    return this.testConnection();
  }

  public static getApiToken(): string {
    return this.apiToken;
  }

  public static async testConnection(): Promise<boolean> {
    try {
      console.log('Teste Verbindung mit Token:', this.apiToken);
      const authHeader = btoa(`${this.apiToken}:api_token`);
      console.log('Auth Header:', authHeader);
      
      const response = await fetch('/toggl-api/api/v9/me', {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Verbindungstest Antwort:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Fehler:', errorText);
      }
      return response.ok;
    } catch (error) {
      console.error('Fehler beim Testen der Verbindung:', error);
      return false;
    }
  }

  public static async fetchReportData(params: TogglRequestParams): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/${this.REPORT_ID}/csv`, {
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
  public static async parseCSVData(csvData: string): Promise<ReportData[]> {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        return [];
      }

      const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
      const data: ReportData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const row: ReportData = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
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
} 