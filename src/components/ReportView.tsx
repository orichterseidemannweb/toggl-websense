import { useState, useEffect } from 'react';
import { TogglService } from '../services/togglService';
import styles from './ReportView.module.css';

interface ReportData {
  [key: string]: string;
}

export const ReportView = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hole Daten für den aktuellen Monat
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const csvData = await TogglService.fetchCSVReport({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        order_field: 'date',
        order_desc: true
      });

      const parsedData = await TogglService.parseCSVData(csvData);
      setReportData(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        Lade Report-Daten...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Fehler beim Laden des Reports:</p>
        <p>{error}</p>
        <button onClick={loadReport} className={styles.retryButton}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!reportData.length) {
    return (
      <div className={styles.empty}>
        Keine Daten für den ausgewählten Zeitraum verfügbar.
      </div>
    );
  }

  // Bestimme die Spalten aus den Daten
  const columns = Object.keys(reportData[0]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Zeiterfassungsbericht</h2>
        <button onClick={loadReport} className={styles.refreshButton}>
          Aktualisieren
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 