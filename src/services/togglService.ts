interface TogglRequestParams {
  start_date: string;
  end_date: string;
  order_field?: string;
  order_desc?: boolean;
}

export class TogglService {
  private static readonly BASE_URL = 'https://api.track.toggl.com/reports/api/v3/shared';
  private static readonly REPORT_ID = import.meta.env.VITE_TOGGL_REPORT_ID;
  private static readonly TOKEN = import.meta.env.VITE_TOGGL_TOKEN;

  private static getAuthHeader(): string {
    return `Basic ${btoa(this.TOKEN + ':api_token')}`;
  }

  public static async fetchReportData(params: TogglRequestParams): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/${this.REPORT_ID}/csv`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvData = await response.text();
      return csvData;
    } catch (error) {
      console.error('Fehler beim Abrufen der Toggl-Daten:', error);
      throw new Error('Fehler beim Abrufen der Daten von Toggl');
    }
  }
} 