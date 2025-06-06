import { useState, useEffect, useMemo } from 'react';
import { TogglService } from '../services/togglService';
import { REPORT_COLUMNS } from '../config/columns';
import { ClientFilter } from './ClientFilter';
import { ProjectFilter } from './ProjectFilter';
import { ColumnVisibilityControl, ColumnVisibilityState } from './ColumnVisibilityControl';
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
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({
    teammitglieder: true,
    beschreibung: true,
    datum: true,
    kunde: true,
    projekt: true,
    taetigkeit: true,
    abrechenbar: true,
    dauer: true,
    tags: true
  });

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

  // Hilfsfunktion zum Konvertieren von Zeitdauer-Strings (HH:MM:SS) zu Minuten
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr || timeStr === '-') return 0;
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
    }
    return 0;
  };

  // Hilfsfunktion zum Konvertieren von Minuten zurück zu HH:MM:SS Format
  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtere und gruppiere die Daten basierend auf dem ausgewählten Kunden und Projekt
  const filteredData = useMemo(() => {
    let filtered = reportData;
    
    if (selectedClient !== 'Alle Kunden') {
      filtered = filtered.filter(row => row['Client'] === selectedClient);
    }
    
    if (selectedProject !== 'Alle Projekte' && shouldShowProjectFilter) {
      filtered = filtered.filter(row => row['Project'] === selectedProject);
    }

    // Gruppiere gleiche Tätigkeiten nur wenn Beschreibung ausgeblendet ist
    if (!columnVisibility.beschreibung && filtered.length > 0) {
      const groupedData = new Map<string, ReportData>();
      
      filtered.forEach(row => {
        const task = row['Task'] || '';
        const client = row['Client'] || '';
        const project = row['Project'] || '';
        
        // Erstelle einen eindeutigen Schlüssel für die Gruppierung
        const groupKey = `${client}|${project}|${task}`;
        
        if (groupedData.has(groupKey)) {
          const existing = groupedData.get(groupKey)!;
          
          // Summiere die Dauer
          const existingMinutes = parseTimeToMinutes(existing['Duration']);
          const currentMinutes = parseTimeToMinutes(row['Duration']);
          const totalMinutes = existingMinutes + currentMinutes;
          
          // Aktualisiere die Dauer
          existing['Duration'] = formatMinutesToTime(totalMinutes);
          
          // Für andere Felder: zeige "Verschiedene" wenn unterschiedlich
          if (existing['User'] !== row['User']) {
            existing['User'] = 'Verschiedene Teammitglieder';
          }
          if (existing['Billable'] !== row['Billable']) {
            existing['Billable'] = 'Gemischt';
          }
          if (existing['Start date'] !== row['Start date']) {
            existing['Start date'] = 'Verschiedene Daten';
          }
          if (existing['Tags'] !== row['Tags']) {
            existing['Tags'] = existing['Tags'] ? `${existing['Tags']}, ${row['Tags']}` : row['Tags'];
          }
          
          // Beschreibung bleibt leer da ausgeblendet
          existing['Description'] = '';
          
        } else {
          // Erste Zeile für diese Tätigkeit
          const newRow = { ...row };
          newRow['Description'] = ''; // Beschreibung leer lassen
          groupedData.set(groupKey, newRow);
        }
      });
      
      return Array.from(groupedData.values());
    }
    
    return filtered;
  }, [reportData, selectedClient, selectedProject, shouldShowProjectFilter, columnVisibility.beschreibung]);

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

  // Erstelle Mapping zwischen deutschen Namen und Feldnamen
  const columnMapping = {
    teammitglieder: 'User',
    kunde: 'Client', 
    projekt: 'Project',
    taetigkeit: 'Task',
    beschreibung: 'Description',
    abrechenbar: 'Billable',
    datum: 'Start date',
    dauer: 'Duration',
    tags: 'Tags'
  };

  // Filtere die sichtbaren Spalten basierend auf der Benutzerauswahl
  const visibleColumns = REPORT_COLUMNS.filter(col => {
    const germanKey = Object.keys(columnMapping).find(
      key => columnMapping[key as keyof typeof columnMapping] === col.field
    ) as keyof ColumnVisibilityState;
    
    return germanKey ? columnVisibility[germanKey] : col.visible;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Zeiterfassungsbericht</h2>
        <button onClick={loadReport} className={styles.refreshButton}>
          Aktualisieren
        </button>
      </div>

      <ColumnVisibilityControl
        onVisibilityChange={setColumnVisibility}
      />

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
        {!columnVisibility.beschreibung && reportData.length > 0 && (
          <span className={styles.groupingIndicator}>
            • 📊 Tätigkeiten gruppiert (Zeiten summiert)
          </span>
        )}
      </div>
    </div>
  );
}; 