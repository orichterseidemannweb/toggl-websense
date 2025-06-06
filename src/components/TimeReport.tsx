import { useState } from 'react';
import { TogglService } from '../services/togglService';
import styles from './TimeReport.module.css';

interface TimeEntry {
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

export const TimeReport = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hole Daten für die letzten 30 Tage
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const data = await TogglService.fetchReportData({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        order_field: 'start_date',
        order_desc: true
      });

      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  // Formatiere Dauer in lesbare Zeit (HH:MM:SS)
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatiere Datum
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Zeiterfassung der letzten 30 Tage</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Lade...' : 'Daten aktualisieren'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {entries.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Beschreibung</th>
                <th>Start</th>
                <th>Ende</th>
                <th>Dauer</th>
                <th>Projekt</th>
                <th>Kunde</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.description}</td>
                  <td>{formatDate(entry.start)}</td>
                  <td>{formatDate(entry.end)}</td>
                  <td>{formatDuration(entry.duration)}</td>
                  <td>{entry.project || '-'}</td>
                  <td>{entry.client || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading && (
        <div className={styles.emptyState}>
          Keine Einträge gefunden. Klicken Sie auf "Daten aktualisieren", um die Zeiterfassung zu laden.
        </div>
      )}
    </div>
  );
}; 