import { describe, it, expect, vi } from 'vitest';
import { TogglService } from '../services/togglService';

// Mock der Umgebungsvariablen
vi.mock('import.meta', () => ({
  env: {
    VITE_TOGGL_TOKEN: 'test-token',
    VITE_TOGGL_REPORT_ID: 'test-report-id'
  }
}));

describe('TogglService', () => {
  it('sollte CSV-Daten erfolgreich abrufen', async () => {
    // Mock der fetch-Funktion
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('test,data\n1,2')
    });

    const params = {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    };

    const result = await TogglService.fetchReportData(params);
    
    expect(result).toBe('test,data\n1,2');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-report-id/csv'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.any(String),
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('sollte Fehler bei fehlgeschlagener Anfrage werfen', async () => {
    // Mock der fetch-Funktion für Fehlerfall
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    const params = {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    };

    await expect(TogglService.fetchReportData(params))
      .rejects
      .toThrow('Fehler beim Abrufen der Daten von Toggl');
  });
}); 