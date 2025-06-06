import { useState, useEffect, useMemo } from 'react';
import { TogglService } from '../services/togglService';
import { REPORT_COLUMNS } from '../config/columns';
import { ClientFilter } from './ClientFilter';
import { ProjectFilter } from './ProjectFilter';
import styles from './ReportView.module.css';

interface ReportData {
  [key: string]: string;
}

export const ReportView = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('Alle Kunden');
  const [selectedProject, setSelectedProject] = useState<string>('Alle Projekte');

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

  // Extrahiere einzigartige Kunden aus den Daten
  const availableClients = useMemo(() => {
    const clients = [...new Set(reportData.map(row => row['Client']).filter(Boolean))];
    return clients.sort();
  }, [reportData]);

  // Extrahiere verfügbare Projekte für den ausgewählten Kunden
  const availableProjects = useMemo(() => {
    if (selectedClient === 'Alle Kunden') {
      return [];
    }
    const clientData = reportData.filter(row => row['Client'] === selectedClient);
    const projects = [...new Set(clientData.map(row => row['Project']).filter(Boolean))];
    return projects.sort();
  }, [reportData, selectedClient]);

  // Zeige Projektfilter nur wenn ein spezifischer Kunde ausgewählt ist und mehr als ein Projekt existiert
  const shouldShowProjectFilter = selectedClient !== 'Alle Kunden' && availableProjects.length > 1;

  // Filtere die Daten basierend auf dem ausgewählten Kunden und Projekt
  const filteredData = useMemo(() => {
    let filtered = reportData;
    
    if (selectedClient !== 'Alle Kunden') {
      filtered = filtered.filter(row => row['Client'] === selectedClient);
    }
    
    if (selectedProject !== 'Alle Projekte' && shouldShowProjectFilter) {
      filtered = filtered.filter(row => row['Project'] === selectedProject);
    }
    
    return filtered;
  }, [reportData, selectedClient, selectedProject, shouldShowProjectFilter]);

  // Reset Projekt-Auswahl wenn ein neuer Kunde ausgewählt wird
  useEffect(() => {
    setSelectedProject('Alle Projekte');
  }, [selectedClient]);

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

  // Filtere nur die sichtbaren Spalten
  const visibleColumns = REPORT_COLUMNS.filter(col => col.visible);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Zeiterfassungsbericht</h2>
        <button onClick={loadReport} className={styles.refreshButton}>
          Aktualisieren
        </button>
      </div>

      {availableClients.length > 0 && (
        <ClientFilter
          clients={availableClients}
          selectedClient={selectedClient}
          onFilterChange={setSelectedClient}
        />
      )}

      {shouldShowProjectFilter && (
        <ProjectFilter
          projects={availableProjects}
          selectedProject={selectedProject}
          onFilterChange={setSelectedProject}
          clientName={selectedClient}
        />
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map(column => (
                <th key={column.field}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {visibleColumns.map(column => (
                  <td key={column.field}>{row[column.field]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.filterSummary}>
        Zeige {filteredData.length} von {reportData.length} Einträgen
        {selectedClient !== 'Alle Kunden' && (
          <span className={styles.filterIndicator}>
            • Kunde: {selectedClient}
          </span>
        )}
        {selectedProject !== 'Alle Projekte' && shouldShowProjectFilter && (
          <span className={styles.filterIndicator}>
            • Projekt: {selectedProject}
          </span>
        )}
      </div>
    </div>
  );
}; 