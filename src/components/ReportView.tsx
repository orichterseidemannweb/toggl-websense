import { useState, useEffect, useMemo } from 'react';
import { TogglService } from '../services/togglService';
import { REPORT_COLUMNS } from '../config/columns';
import { ClientFilter } from './ClientFilter';
import { ProjectFilter } from './ProjectFilter';
import { ColumnVisibilityControl, ColumnVisibilityState } from './ColumnVisibilityControl';
import { MonthSelector } from './MonthSelector';
import { PDFExportService } from '../services/pdfExportService';
import styles from './ReportView.module.css';

interface ReportData {
  [key: string]: string;
}

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

export const ReportView = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('Kunde auswählen');
  const [selectedProject, setSelectedProject] = useState<string>('Projekt auswählen');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Standard: aktueller Monat
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({
    teammitglieder: false, // Standardmäßig deaktiviert
    beschreibung: false,   // Standardmäßig deaktiviert
    datum: false,          // Standardmäßig deaktiviert
    kunde: true,
    projekt: true,
    taetigkeit: true,
    abrechenbar: false, // Weniger relevant da wir Zeiten separat anzeigen
    dauer: false, // Ersetzen durch spezifische Zeitwerte
    gesamtstunden: true,
    abrechenbareStunden: true,
    tags: false // Standardmäßig deaktiviert
  });

  // Bulk Export State (vereinfacht - nur Abbruch-Flag)
  const [bulkExportCancelled, setBulkExportCancelled] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hole Daten für den ausgewählten Monat
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

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
  const shouldShowProjectFilter = selectedClient !== 'Kunde auswählen' && availableProjects.length > 1;

  // Filtere und gruppiere die Daten basierend auf dem ausgewählten Kunden und Projekt
  const filteredData = useMemo(() => {
    let filtered = reportData;
    
    if (selectedClient !== 'Kunde auswählen') {
      filtered = filtered.filter(row => row['Client'] === selectedClient);
    }
    
    if (selectedProject !== 'Projekt auswählen' && shouldShowProjectFilter) {
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
          
          // Summiere die Gesamtdauer
          const existingTotalMinutes = parseTimeToMinutes(existing['Duration']);
          const currentTotalMinutes = parseTimeToMinutes(row['Duration']);
          const totalMinutes = existingTotalMinutes + currentTotalMinutes;
          
          // Summiere die abrechenbare Zeit
          const existingBillableMinutes = parseTimeToMinutes(existing['BillableTime'] || '0:00:00');
          const currentBillableMinutes = (row['Billable'] === 'Yes' || row['Billable'] === 'Ja') 
            ? parseTimeToMinutes(row['Duration']) 
            : 0;
          const billableMinutes = existingBillableMinutes + currentBillableMinutes;
          
          // Aktualisiere die Zeiten
          existing['Duration'] = formatMinutesToTime(totalMinutes);
          existing['BillableTime'] = formatMinutesToTime(billableMinutes);
          
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
          
          // Berechne abrechenbare Zeit für diese Zeile
          const isBillable = row['Billable'] === 'Yes' || row['Billable'] === 'Ja';
          newRow['BillableTime'] = isBillable ? row['Duration'] : '0:00:00';
          
          groupedData.set(groupKey, newRow);
        }
      });
      
      return Array.from(groupedData.values());
    }
    
    // Für nicht-gruppierte Daten: Berechne abrechenbare Zeit für jede Zeile
    return filtered.map(row => {
      const isBillable = row['Billable'] === 'Yes' || row['Billable'] === 'Ja';
      return {
        ...row,
        'BillableTime': isBillable ? row['Duration'] : '0:00:00'
      };
    });
  }, [reportData, selectedClient, selectedProject, shouldShowProjectFilter, columnVisibility.beschreibung]);

  // Berechne Zusammenfassungsstatistiken ZUERST
  const summaryStats = useMemo(() => {
    let totalMinutes = 0;
    let billableMinutes = 0;

    filteredData.forEach(row => {
      const duration = parseTimeToMinutes(row['Duration'] || '');
      totalMinutes += duration;
      
      if (row['Billable'] === 'Yes' || row['Billable'] === 'Ja') {
        billableMinutes += duration;
      }
    });

    return {
      totalHours: formatMinutesToTime(totalMinutes),
      billableHours: formatMinutesToTime(billableMinutes),
      totalEntries: filteredData.length,
      totalMinutes,
      billableMinutes,
      allBillable: totalMinutes === billableMinutes && totalMinutes > 0
    };
  }, [filteredData]);

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
    gesamtstunden: 'TotalHours',
    abrechenbareStunden: 'BillableHours',
    tags: 'Tags'
  };

  // Filtere die sichtbaren Spalten basierend auf der Benutzerauswahl und intelligenter Logik
  const visibleColumns = useMemo(() => REPORT_COLUMNS.filter(col => {
    const germanKey = Object.keys(columnMapping).find(
      key => columnMapping[key as keyof typeof columnMapping] === col.field
    ) as keyof ColumnVisibilityState;
    
    // Intelligente Spalten-Logik: Wenn alle Zeiten abrechenbar sind, zeige nur "Abrechenbar"
    if (summaryStats.allBillable) {
      // Verstecke "Gesamtzeit" wenn alle Zeiten abrechenbar sind
      if (col.field === 'TotalHours') {
        return false;
      }
      // Ändere Header für "Abrechenbare Zeit" zu "Arbeitszeit" wenn alle abrechenbar sind
      if (col.field === 'BillableHours') {
        col.header = 'Arbeitszeit';
      }
    } else {
      // Zeige beide Spalten wenn es Unterschiede gibt
      if (col.field === 'BillableHours') {
        col.header = 'Abrechenbar';
      }
    }

    // Intelligente Projekt-Spalten-Logik: Verstecke Projekt-Spalte wenn Kunde nur ein Projekt hat
    if (col.field === 'Project') {
      // Nur ausblenden wenn ein spezifischer Kunde ausgewählt ist und er nur ein Projekt hat
      if (selectedClient !== 'Kunde auswählen' && availableProjects.length <= 1) {
        return false;
      }
    }
    
    return germanKey ? columnVisibility[germanKey] : col.visible;
  }), [columnVisibility, summaryStats.allBillable, selectedClient, availableProjects.length]);

  // Erstelle Datenzeilen mit virtuellen Spalten für die Zusammenfassung
  const dataWithVirtualColumns = useMemo(() => {
    return filteredData.map(row => ({
      ...row,
      'TotalHours': row['Duration'],  // Gesamtzeit = Dauer
      'BillableHours': row['BillableTime'] || '0:00:00' // Abrechenbare Zeit
    }));
  }, [filteredData]);

  // Erstelle die Zusammenfassungszeile
  const summaryRow = useMemo(() => {
    const row: ReportData = {};
    
    // Für alle sichtbaren Spalten
    visibleColumns.forEach(column => {
      switch (column.field) {
        case 'Task':
          row[column.field] = 'ZUSAMMENFASSUNG';
          break;
        case 'Duration':
          row[column.field] = summaryStats.totalHours;
          break;
        case 'TotalHours':
          row[column.field] = summaryStats.totalHours;
          break;
        case 'BillableHours':
          // Wenn alle Zeiten abrechenbar sind, zeige Gesamtzeit in "Arbeitszeit"-Spalte
          row[column.field] = summaryStats.allBillable ? summaryStats.totalHours : summaryStats.billableHours;
          break;
        default:
          row[column.field] = '';
      }
    });
    
    return row;
  }, [visibleColumns, summaryStats]);

  // Reset Projekt-Auswahl wenn ein neuer Kunde ausgewählt wird
  useEffect(() => {
    setSelectedProject('Projekt auswählen');
  }, [selectedClient]);

  // Auto-load Report nur wenn API-Token vorhanden ist
  useEffect(() => {
    const apiToken = TogglService.getApiToken();
    if (apiToken && apiToken.length > 0) {
      loadReport();
    }
  }, [selectedDate]);

  // Initial Load beim ersten Rendern - nur wenn API-Token vorhanden
  useEffect(() => {
    // Kleiner Delay um sicherzustellen dass TogglService bereit ist
    const timer = setTimeout(() => {
      const apiToken = TogglService.getApiToken();
      if (apiToken && apiToken.length > 0 && reportData.length === 0 && !loading && !error) {
        loadReport();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const exportToPDF = async () => {
    try {
      await PDFExportService.generateActivityReport({
        data: dataWithVirtualColumns,
        columns: visibleColumns,
        selectedClient,
        selectedProject,
        selectedDate,
        summaryStats
      });
    } catch (error) {
      console.error('PDF-Export fehlgeschlagen:', error);
      alert('Fehler beim Erstellen des PDF-Exports. Bitte versuchen Sie es erneut.');
    }
  };

  // Bulk Export Funktionalität (Vereinfacht ohne Overlay)
  const exportAllToPDF = async () => {
    if (availableClients.length === 0) {
      alert('Keine Kunden für Export verfügbar.');
      return;
    }

    setBulkExportCancelled(false);

    try {
      const results = await PDFExportService.generateBulkExport({
        allData: reportData,
        columns: visibleColumns,
        selectedDate,
        availableClients,
        onProgress: (current, total, clientName, projectName) => {
          if (bulkExportCancelled) {
            throw new Error('Export wurde abgebrochen');
          }
          // Fortschritt nur in der Konsole loggen
          console.log(`📄 Generiere PDF ${current}/${total}: ${clientName}${projectName ? ` - ${projectName}` : ''}`);
        }
      });

      if (!bulkExportCancelled && results.length > 0) {
        await PDFExportService.downloadBulkAsZip(results, selectedDate);
        
        // Erfolgsmeldung
        alert(`🎉 Bulk-Export erfolgreich!\n\n${results.length} PDFs wurden generiert und heruntergeladen.`);
      }
    } catch (error) {
      console.error('Bulk-Export fehlgeschlagen:', error);
      if (!bulkExportCancelled) {
        alert('Fehler beim Bulk-Export. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const cancelBulkExport = () => {
    setBulkExportCancelled(true);
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Zeiterfassungsbericht</h2>
        <div className={styles.headerButtons}>
          <button onClick={exportToPDF} className={styles.exportButton}>
            📄 PDF Export
          </button>
          <button 
            onClick={exportAllToPDF} 
            className={`${styles.exportButton} ${styles.bulkExportButton}`}
            title="Generiert automatisch PDFs für alle Kunden und Projekte"
          >
            📦 Alle PDFs
          </button>
        </div>
      </div>

      <ColumnVisibilityControl
        onVisibilityChange={setColumnVisibility}
      />

      <MonthSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
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
            {dataWithVirtualColumns.map((row, index) => (
              <tr key={index}>
                {visibleColumns.map(column => (
                  <td key={column.field}>{row[column.field]}</td>
                ))}
              </tr>
            ))}
            {/* Zusammenfassungszeile */}
            {filteredData.length > 0 && (
              <tr className={styles.summaryRow}>
                {visibleColumns.map(column => (
                  <td key={`summary-${column.field}`} className={styles.summaryCell}>
                    {summaryRow[column.field]}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.filterSummary}>
        Zeige {filteredData.length} von {reportData.length} Einträgen
        <span className={styles.filterIndicator}>
          • Zeitraum: {['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </span>
        {selectedClient !== 'Kunde auswählen' && (
          <span className={styles.filterIndicator}>
            • Kunde: {selectedClient}
          </span>
        )}
        {selectedProject !== 'Projekt auswählen' && shouldShowProjectFilter && (
          <span className={styles.filterIndicator}>
            • Projekt: {selectedProject}
          </span>
        )}
        {selectedClient !== 'Kunde auswählen' && availableProjects.length <= 1 && columnVisibility.projekt && (
          <span className={styles.filterIndicator}>
            • 📋 Projekt-Spalte automatisch ausgeblendet (nur ein Projekt)
          </span>
        )}
        {!columnVisibility.beschreibung && reportData.length > 0 && (
          <span className={styles.groupingIndicator}>
            • 📊 Tätigkeiten gruppiert (Zeiten summiert)
          </span>
        )}
        {summaryStats.allBillable && summaryStats.totalMinutes > 0 && (
          <span className={styles.billingIndicator}>
            • ✅ Alle Zeiten abrechenbar
          </span>
        )}
        {!summaryStats.allBillable && summaryStats.totalMinutes > 0 && (
          <span className={styles.billingIndicator}>
            • ⚠️ Gemischte Zeiten (abrechenbar/nicht-abrechenbar)
          </span>
        )}
      </div>


    </div>
  );
}; 