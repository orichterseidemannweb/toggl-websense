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
  private static readonly REPORT_ID = '58b3637913351d762d43a00ad7c88d85'; // Hardcoded, da nicht sensitiv
  private static readonly SESSION_KEY = 'toggl_session_token'; // Key für sessionStorage
  private static apiToken: string = '';

  public static async initialize(): Promise<boolean> {
    console.log('TogglService initialisiert - prüfe gespeicherten Token...');
    
    // Versuche Token aus sessionStorage zu laden
    const storedToken = this.loadTokenFromSession();
    if (storedToken) {
      console.log('Gespeicherter Token gefunden - teste Verbindung...');
      this.apiToken = storedToken;
      const isValid = await this.testConnection();
      if (isValid) {
        console.log('Gespeicherter Token ist gültig');
        return true;
      } else {
        console.log('Gespeicherter Token ist ungültig - lösche ihn');
        this.clearStoredToken();
      }
    }
    
    console.log('Kein gültiger Token gefunden - Benutzer muss sich anmelden');
    return false;
  }

  public static async setApiToken(token: string): Promise<boolean> {
    console.log('API Token wird gesetzt und getestet...');
    this.apiToken = token;
    const isValid = await this.testConnection();
    
    if (isValid) {
      // Nur bei gültigem Token speichern
      this.saveTokenToSession(token);
      console.log('Token erfolgreich gespeichert');
    } else {
      // Bei ungültigem Token nicht speichern
      this.apiToken = '';
      console.log('Token ungültig - nicht gespeichert');
    }
    
    return isValid;
  }

  public static getApiToken(): string {
    return this.apiToken;
  }

  // Token aus Memory und Storage löschen (für Logout-Funktionalität)
  public static clearToken(): void {
    this.apiToken = '';
    this.clearStoredToken();
    console.log('Token wurde vollständig gelöscht');
  }

  // Private Methoden für Token-Storage
  private static saveTokenToSession(token: string): void {
    try {
      // Einfache Base64-Kodierung für minimale Verschleierung (nicht Sicherheit!)
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
        // Base64-Dekodierung
        return atob(encodedToken);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Tokens:', error);
      // Bei Fehler Token löschen
      this.clearStoredToken();
    }
    return null;
  }

  private static clearStoredToken(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Fehler beim Löschen des gespeicherten Tokens:', error);
    }
  }

  public static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('/toggl-api/api/v9/me', {
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