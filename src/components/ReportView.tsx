import { useState, useEffect, useMemo } from 'react';
import { TogglService } from '../services/togglService';
import { REPORT_COLUMNS } from '../config/columns';
import { ClientFilter } from './ClientFilter';
import { ProjectFilter } from './ProjectFilter';
import { ColumnVisibilityControl, ColumnVisibilityState } from './ColumnVisibilityControl';
import { MonthSelector } from './MonthSelector';
import { PDFExportService } from '../services/pdfExportService';
import { FeedbackSystem } from './FeedbackSystem';
import styles from './ReportView.module.css';

interface ReportData {
  [key: string]: string;
}

// 🆕 Panel-Typ für zentrale Verwaltung
type PanelType = 'debug' | 'feedback' | 'feedbackList' | 'changelog' | null;

// Hilfsfunktion zum Konvertieren von Zeitdauer-Strings (HH:MM:SS) zu Minuten
const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr || timeStr === '-') return 0;
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);  
    const seconds = parseInt(parts[2]);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    
    return totalMinutes;
  }
  console.warn(`⚠️ Ungültiges Zeitformat: "${timeStr}"`);
  return 0;
};

// 🆕 15-Minuten-Aufrundungsfunktion für Rechnungsstellung
const roundToQuarterHour = (minutes: number): number => {
  if (minutes === 0) return 0;
  return Math.ceil(minutes / 15) * 15;
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
  
  // 🆕 ZENTRALE PANEL-VERWALTUNG: Nur ein Panel kann gleichzeitig geöffnet sein
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  
  // 🆕 DEBUG STATE: Sammle alle Debug-Informationen
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [copyButtonState, setCopyButtonState] = useState<'default' | 'copied'>('default');
  
  // 🆕 USER EMAIL STATE für Feedback-System
  const [userEmail, setUserEmail] = useState<string>('');
  
  // 🆕 PANEL-VERWALTUNGSFUNKTIONEN
  const openPanel = (panelType: PanelType) => {
    setActivePanel(panelType);
  };
  
  const closePanel = () => {
    setActivePanel(null);
  };
  
  // Abgeleitete Zustände für Rückwärtskompatibilität
  const showDebugPanel = activePanel === 'debug';
  const showChangelogPanel = activePanel === 'changelog';
  
  // 🆕 DEBUG HELPER: Funktion zum Hinzufügen von Debug-Logs
  const addDebugLog = (category: string, data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${category}: ${JSON.stringify(data, null, 2)}`;
    setDebugInfo(prev => [...prev, logEntry]);
    console.log(`${category}:`, data); // Behalte auch Console-Log
  };
  
  // Lade gespeicherte Auswahlen nur für die aktuelle Session
  const [selectedClient, setSelectedClient] = useState<string>(() => {
    const saved = sessionStorage.getItem('toggl_selected_client');
    return saved || 'Kunde auswählen';
  });
  
  const [selectedProject, setSelectedProject] = useState<string>(() => {
    const saved = sessionStorage.getItem('toggl_selected_project');
    return saved || 'Projekt auswählen';
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const saved = sessionStorage.getItem('toggl_selected_date');
    if (saved) {
      return new Date(saved);
    }
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

  // Hilfsfunktionen für das Speichern der Auswahlen (nur für Session)
  const handleClientChange = (client: string) => {
    setSelectedClient(client);
    sessionStorage.setItem('toggl_selected_client', client);
    
    // Reset Projekt-Auswahl wenn Kunde geändert wird
    setSelectedProject('Projekt auswählen');
    sessionStorage.setItem('toggl_selected_project', 'Projekt auswählen');
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    sessionStorage.setItem('toggl_selected_project', project);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    sessionStorage.setItem('toggl_selected_date', date.toISOString());
  };

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo([]); // 🆕 Reset Debug-Logs bei neuem Report-Load
    
    try {
      // 🔧 ULTIMATIVE LÖSUNG: Direkte String-Konstruktion ohne Date-Objekte
      // Vermeide alle Zeitzone-Probleme durch direkte ISO-String-Erstellung
      
      // Extrahiere Jahr und Monat aus dem angezeigten Monatsnamen
      const monthNameMatch = selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }).match(/(\w+)\s+(\d+)/);
      let targetYear = selectedDate.getFullYear();
      let targetMonth = selectedDate.getMonth(); // 0-basiert
      
      if (monthNameMatch) {
        const [, monthName, yearStr] = monthNameMatch;
        const monthIndex = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'].indexOf(monthName);
        if (monthIndex !== -1) {
          targetMonth = monthIndex;
          targetYear = parseInt(yearStr);
        }
      }
      
      // Konstruiere Datum-Strings direkt ohne Date-Objekte (keine Zeitzone-Probleme!)
      const targetMonthPadded = String(targetMonth + 1).padStart(2, '0'); // +1 da 0-basiert zu 1-basiert
      const startDateStr = `${targetYear}-${targetMonthPadded}-01`;
      
      // Berechne den letzten Tag des Monats
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const endDateStr = `${targetYear}-${targetMonthPadded}-${String(daysInMonth).padStart(2, '0')}`;
      
      // Erstelle Date-Objekte nur für die API-Aufrufe (aber verwende String-Werte für Debugging)
      const startDate = new Date(startDateStr + 'T00:00:00.000Z');
      const endDate = new Date(endDateStr + 'T23:59:59.999Z');

      // 🔍 DEBUG: Zeige alle relevanten Datumswerte
      addDebugLog('🔍 MONATSAUSWAHL DEBUG', {
        'selectedDate Raw': selectedDate.toISOString(),
        'selectedDate String': selectedDate.toISOString().split('T')[0],
        'selectedMonth Name': selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
        'selectedMonth Number (getMonth)': selectedDate.getMonth(),
        'selectedMonth Number (angezeigt)': selectedDate.getMonth() + 1,
        'selectedYear (getFullYear)': selectedDate.getFullYear(),
        'KORRIGIERT - targetYear': targetYear,
        'KORRIGIERT - targetMonth (0-basiert)': targetMonth,
        'KORRIGIERT - targetMonth (angezeigt)': targetMonth + 1,
        'KONSTRUIERTE STRINGS - Start': startDateStr,
        'KONSTRUIERTE STRINGS - Ende': endDateStr,
        'KONSTRUIERTE STRINGS - Tage im Monat': daysInMonth,
        'berechneter Start (Date-Objekt)': startDate.toISOString().split('T')[0],
        'berechnetes Ende (Date-Objekt)': endDate.toISOString().split('T')[0]
      });

      const csvData = await TogglService.fetchCSVReport({
        start_date: startDateStr,
        end_date: endDateStr,
        order_field: 'date',
        order_desc: true
      });

      // ✅ KORREKTE DATUMSFILTERUNG: Verwende die direkten String-Werte
      const parsedData = await TogglService.parseCSVData(csvData, {
        start: startDateStr,
        end: endDateStr
      });
      
      // 📊 KOMPAKTE BESTÄTIGUNG nur für Schockemöhle
      if (selectedClient === 'Paul Schockemöhle Pferdehaltung GmbH') {
        const schockemohleEntries = parsedData.filter(row => 
          row['Client'] === 'Paul Schockemöhle Pferdehaltung GmbH'
        );
        
        let totalMinutes = 0;
        let billableMinutes = 0;
        
        schockemohleEntries.forEach(entry => {
          const duration = parseTimeToMinutes(entry['Duration'] || '');
          const isBillable = entry['Billable'] === 'Yes' || entry['Billable'] === 'Ja';
          totalMinutes += duration;
          if (isBillable) billableMinutes += duration;
        });
        
        addDebugLog(`✅ FINAL SCHOCKEMÖHLE (${startDateStr} bis ${endDateStr})`, {
          'Total': formatMinutesToTime(totalMinutes),
          'Billable': formatMinutesToTime(billableMinutes),
          'Einträge': schockemohleEntries.length,
          'Erste 3 Einträge': schockemohleEntries.slice(0, 3).map(entry => ({
            Date: entry['Start date'],
            Duration: entry['Duration'],
            Billable: entry['Billable'],
            Description: entry['Description']?.substring(0, 50) + '...'
          }))
        });
      }
      
      setReportData(parsedData);
      addDebugLog('📋 REPORT DATA LOADED', {
        'Total Entries': parsedData.length,
        'Selected Client': selectedClient,
        'Selected Project': selectedProject
      });
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Fehler beim Laden des Reports';
      addDebugLog('❌ ERROR', { error: errorMsg });
      setError(errorMsg);
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
    // ✅ CLIENT SELECTION REQUIREMENT: Zeige keine Daten wenn kein Kunde ausgewählt
    if (selectedClient === 'Kunde auswählen') {
      return [];
    }
    
    let filtered = reportData.filter(row => row['Client'] === selectedClient);
    
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
          
          // 🔧 KORREKTUR: Billable-Status basierend auf tatsächlichen abrechenbaren Minuten
          if (billableMinutes > 0) {
            if (billableMinutes === totalMinutes) {
              existing['Billable'] = 'Yes'; // Alles abrechenbar
            } else {
              existing['Billable'] = 'Teilweise'; // Teilweise abrechenbar (war vorher "Gemischt")
            }
          } else {
            existing['Billable'] = 'No'; // Nichts abrechenbar
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
      const isBillable = row['Billable'] === 'Yes' || row['Billable'] === 'Ja' || row['Billable'] === 'Teilweise' || row['Billable'] === 'Gemischt';
      // 🔧 KORREKTUR: Für "Teilweise"/"Gemischt" sollte die ganze Duration als abrechenbar gelten
      // da die Gruppierung bereits die korrekte Teilsumme berechnet hat
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
    
    filteredData.forEach((row, index) => {
      const duration = parseTimeToMinutes(row['Duration'] || '');
      
      // 🔧 KORREKTUR: Verwende die bereits berechnete BillableTime statt den Billable-Status
      let billableDuration = parseTimeToMinutes(row['BillableTime'] || '0:00:00');
      
      // 🚨 NOTFALL-KORREKTUR: Für "Gemischt"/"Teilweise" mit BillableTime = 0, verwende Duration
      if ((row['Billable'] === 'Gemischt' || row['Billable'] === 'Teilweise') && billableDuration === 0) {
        billableDuration = duration; // Verwende die gesamte Dauer als abrechenbar
      }
      
      totalMinutes += duration;
      billableMinutes += billableDuration;
    });
    
    // ✅ KOMPAKTE BESTÄTIGUNG für Schockemöhle
    if (selectedClient === 'Paul Schockemöhle Pferdehaltung GmbH') {
      console.log(`📊 SCHOCKEMÖHLE FINAL:`, {
        'Total': formatMinutesToTime(totalMinutes),
        'Billable': formatMinutesToTime(billableMinutes),
        'Einträge': filteredData.length
      });
    }

    return {
      totalHours: formatMinutesToTime(totalMinutes),
      billableHours: formatMinutesToTime(billableMinutes),
      totalEntries: filteredData.length,
      totalMinutes,
      billableMinutes,
      allBillable: totalMinutes === billableMinutes && totalMinutes > 0
    };
  }, [filteredData, selectedClient]);

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

  // 🆕 DEBUG CALLBACK SETUP: Registriere Debug-Callback beim TogglService
  useEffect(() => {
    TogglService.setDebugCallback(addDebugLog);
    
    return () => {
      TogglService.clearDebugCallback();
    };
  }, []);

  // 🆕 USER EMAIL FETCH: Hole User-Email für Feedback-System
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const isDevelopment = import.meta.env.DEV;
        const apiUrl = isDevelopment 
          ? '/toggl-api/api/v9/me'
          : '/websense/api-proxy.php?endpoint=/api/v9/me';
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Basic ${btoa(`${TogglService.getApiToken()}:api_token`)}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || '');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der User-Email:', error);
      }
    };

    const apiToken = TogglService.getApiToken();
    if (apiToken && apiToken.length > 0) {
      fetchUserEmail();
    }
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
        onDateChange={handleDateChange}
      />

      {availableClients.length > 0 && (
        <ClientFilter
          clients={availableClients}
          selectedClient={selectedClient}
          onFilterChange={handleClientChange}
        />
      )}

      {shouldShowProjectFilter && (
        <ProjectFilter
          projects={availableProjects}
          selectedProject={selectedProject}
          onFilterChange={handleProjectChange}
          clientName={selectedClient}
        />
      )}

      {/* ✅ CLIENT SELECTION REQUIREMENT: Zeige Nachricht oder Tabelle */}
      {selectedClient === 'Kunde auswählen' ? (
        <div className={styles.noClientSelectedContainer}>
          <div className={styles.noClientSelectedCard}>
            <div className={styles.noClientSelectedIcon}>
              👤
            </div>
            <h3 className={styles.noClientSelectedTitle}>
              Kunde auswählen
            </h3>
            <p className={styles.noClientSelectedText}>
              Bitte wählen Sie zunächst einen Kunden aus der Liste oben aus, 
              um die entsprechenden Zeiterfassungsdaten anzuzeigen.
            </p>
            <div className={styles.noClientSelectedHint}>
              💡 Nach der Kundenauswahl werden alle relevanten Projekte und Zeiten für den ausgewählten Zeitraum geladen.
            </div>
          </div>
        </div>
      ) : filteredData.length > 0 ? (
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
      ) : (
        <div className={styles.empty}>
          Keine Daten für den ausgewählten Kunden und Zeitraum verfügbar.
        </div>
      )}

      <div className={styles.reportFooter}>
        {!columnVisibility.beschreibung && reportData.length > 0 && (
          <span className={`${styles.infoBubble} ${styles.infoBubbleGreen}`}>
            📊 Tätigkeiten gruppiert
          </span>
        )}
        {summaryStats.allBillable && summaryStats.totalMinutes > 0 && (
          <span className={`${styles.infoBubble} ${styles.infoBubbleSuccess}`}>
            ✅ Alle Zeiten abrechenbar
          </span>
        )}
        {!summaryStats.allBillable && summaryStats.totalMinutes > 0 && (
          <span className={`${styles.infoBubble} ${styles.infoBubbleWarning}`}>
            ⚠️ Gemischte Zeiten
          </span>
        )}
        
        {/* 🆕 FEEDBACK BUTTONS - JETZT INLINE IM FOOTER - 1. Feedback geben */}
        <button 
          onClick={() => openPanel('feedback')}
          className={styles.infoBubble}
          title="Feedback geben - Feature-Requests und Bugs melden"
        >
          💡 Feedback geben
        </button>

        {/* 🆕 FEEDBACK-LISTE BUTTON - NUR WENN ENTRIES VORHANDEN - 2. Feedback-Liste */}
        {/* TODO: Feedback Count Logic hier implementieren */}
        <button 
          onClick={() => openPanel('feedbackList')}
          className={styles.infoBubble}
          title="Feedback-Verwaltung"
        >
          📋 Feedback-Liste
        </button>

        {/* 🆕 DEBUG PANEL TOGGLE - IMMER SICHTBAR - 3. Debug-Info */}
        <button 
          onClick={() => openPanel('debug')} 
          className={styles.infoBubble}
          style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }} // DEBUG: Roter Hintergrund
        >
          🔧 Debug-Info ({debugInfo.length})
        </button>

        {/* 🆕 CHANGELOG PANEL TOGGLE - IMMER SICHTBAR - 4. Changelog */}
        <button 
          onClick={() => openPanel('changelog')} 
          className={styles.infoBubble}
          title="Changelog anzeigen - Alle neuen Features und Verbesserungen"
          style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }} // DEBUG: Grüner Hintergrund
        >
          📋 Changelog
        </button>
      </div>

      {/* 🆕 VERSION DISPLAY */}
      <div className={styles.versionContainer}>
        <span className={styles.versionNumber}>v1.6.6</span>
      </div>

      {/* 🆕 FEEDBACK SYSTEM PANELS - NUR PANELS, KEINE BUTTONS */}
      <FeedbackSystem 
        currentEmail={userEmail}
        currentDebugLog={debugInfo.join('\n\n')}
        activePanel={activePanel}
        onOpenPanel={openPanel}
        onClosePanel={closePanel}
      />

      {/* 🆕 DEBUG PANEL */}
      {showDebugPanel && (
        <div className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <h3>🔧 Debug-Informationen</h3>
            <button 
              onClick={closePanel} 
              className={styles.closeBtn}
            >
              ✕
            </button>
          </div>
          
          <div className={styles.debugContent}>
            <p>Alle Debug-Logs für einfaches Kopieren und Teilen:</p>
            
            <div className={styles.debugControls}>
              <button 
                onClick={async () => {
                  const debugText = debugInfo.join('\n\n');
                  await navigator.clipboard.writeText(debugText);
                  setCopyButtonState('copied');
                  setTimeout(() => setCopyButtonState('default'), 2000);
                }}
                className={styles.exportButton}
                style={{
                  background: copyButtonState === 'copied' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  borderColor: copyButtonState === 'copied' 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : 'rgba(5, 150, 105, 0.3)',
                  color: copyButtonState === 'copied' ? 'white' : '#374151',
                  transition: 'all 0.3s ease'
                }}
              >
                {copyButtonState === 'copied' ? '✅ Kopiert!' : '📋 In Zwischenablage kopieren'}
              </button>
              
              <button 
                onClick={() => setDebugInfo([])}
                className={styles.exportButton}
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                🗑️ Logs löschen
              </button>
            </div>
            
            <textarea
              value={debugInfo.join('\n\n')}
              readOnly
              placeholder="Debug-Informationen werden hier angezeigt..."
            />
          </div>
        </div>
      )}

      {/* 🆕 CHANGELOG PANEL */}
      {showChangelogPanel && (
        <div className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <h3>📋 Changelog - Versionshistorie</h3>
            <button 
              onClick={closePanel} 
              className={styles.closeBtn}
            >
              ✕
            </button>
          </div>
          
          <div className={styles.debugContent}>
            <p>Alle neuen Features, Verbesserungen und Bugfixes:</p>
            
            <div className={styles.changelogContent}>
              <div className={styles.changelogSection}>
                <h4>🚀 Version 1.6.6 - Aktuell (2025-01-06)</h4>
                <ul>
                  <li><strong>🔧 KRITISCHER BUGFIX</strong> - Debug-Info & Changelog Buttons verschwinden nicht mehr beim Feedback-Panel öffnen</li>
                  <li><strong>🏗️ Footer-Container-Fix</strong> - Alle Buttons sind jetzt im gleichen Container und immer sichtbar</li>
                  <li><strong>🎯 Verbesserte UX</strong> - Debugging während Feedback-Nutzung wieder möglich</li>
                  <li><strong>✅ Container-Konsistenz</strong> - FeedbackSystem-Buttons inline im Footer für permanente Sichtbarkeit</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🚀 Version 1.6.4 - Panel-Management (2025-01-06)</h4>
                <ul>
                  <li><strong>🎯 Exklusives Panel-Management</strong> - Nur ein Panel gleichzeitig geöffnet</li>
                  <li><strong>📋 Changelog-Panel</strong> - Vollständige Versionshistorie in der App</li>
                  <li><strong>🔄 Optimierte Button-Reihenfolge</strong> - Feedback geben → Feedback-Liste → Debug-Info → Changelog</li>
                  <li><strong>📍 Versionsnummer-Anzeige</strong> - Aktuelle Version elegant angezeigt</li>
                  <li><strong>🎨 Zentrale Panel-Verwaltung</strong> - Automatisches Schließen bei Panel-Wechsel</li>
                  <li><strong>✨ Konsistente Close-Buttons</strong> - Einheitliches X-Button Design</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🚀 Version 1.6.3 - Feedback-System (2025-06-07)</h4>
                <ul>
                  <li><strong>💡 Vollständiges Feedback-System</strong> - Feature-Requests und Bug-Reports direkt in der App</li>
                  <li><strong>🎯 Admin-Panel</strong> - Professionelle Feedback-Verwaltung mit Status-Tracking</li>
                  <li><strong>📧 Auto-Email-Erkennung</strong> - Automatische User-Email-Integration</li>
                  <li><strong>🔧 Debug-Log-Anhang</strong> - Debug-Informationen direkt mit Feedback teilen</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🎯 Version 1.6.0 - Kritischer Bugfix (2025-06-07)</h4>
                <ul>
                  <li><strong>🐛 HAUPTPROBLEM GELÖST</strong> - Zeitzone-bedingte Zeitberechnungsfehler komplett behoben</li>
                  <li><strong>⏰ 100% Toggl-Übereinstimmung</strong> - App-Zeiten stimmen exakt mit Toggl Interface überein</li>
                  <li><strong>✅ Billing-Ready</strong> - Absolut verlässlich für professionelle Abrechnungen</li>
                  <li><strong>🔍 Debug-System permanent</strong> - Elegantes Debug-Panel dauerhaft verfügbar</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🔒 Version 1.5.1 - Sicherheit & Portabilität (2025-01-07)</h4>
                <ul>
                  <li><strong>🔐 Report-ID Hardcoding entfernt</strong> - Keine sensiblen Daten mehr im Code</li>
                  <li><strong>🌍 Universelle Portabilität</strong> - Funktioniert mit beliebigen öffentlichen Toggl-Reports</li>
                  <li><strong>🎨 Login-Interface Redesign</strong> - Kompakter, cleaner Login</li>
                  <li><strong>🛡️ Multi-Team-Fähigkeit</strong> - Jedes Team kann eigene Report-IDs verwenden</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>✨ Version 1.5.0 - Major UI Redesign (2025-06-06)</h4>
                <ul>
                  <li><strong>🎨 Glasmorphism-Design</strong> - Einheitliches Bubble-Design-System</li>
                  <li><strong>🔧 Alle Komponenten redesigned</strong> - StatusBar, Buttons, Login komplett überarbeitet</li>
                  <li><strong>📱 Mobile Responsivität</strong> - Optimiert für alle Bildschirmgrößen</li>
                  <li><strong>🎯 Moderne Design-Philosophie</strong> - Minimalismus meets Eleganz</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🚀 Version 1.4.0 - Revolutionary Bulk Export (2025-06-06)</h4>
                <ul>
                  <li><strong>📦 Ein-Klick-Export</strong> - Alle Kunden-PDFs mit einem Klick</li>
                  <li><strong>🧠 Intelligente Logik</strong> - Automatische Kunden- und Projekt-Erkennung</li>
                  <li><strong>🗜️ ZIP-Download</strong> - Alle PDFs organisiert in einer ZIP-Datei</li>
                  <li><strong>📊 Progress-Tracking</strong> - Fortschrittsbalken mit Abbruch-Option</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>📄 Version 1.2.0+ - PDF-Export & Features (2025-06-06)</h4>
                <ul>
                  <li><strong>📋 Vollständige PDF-Export-Funktionalität</strong> - Professionelle Tätigkeitsnachweise</li>
                  <li><strong>🎨 Corporate Design</strong> - Firmenlogo und professionelles Layout</li>
                  <li><strong>👁️ Spalten-Sichtbarkeits-Kontrolle</strong> - Tabellenspalten ein-/ausblenden</li>
                  <li><strong>📅 MonthSelector</strong> - Einfache Monatsauswahl</li>
                </ul>
              </div>

              <div className={styles.changelogSection}>
                <h4>🎉 Version 1.0.0 - Erstes Release (2025-06-06)</h4>
                <ul>
                  <li><strong>🏗️ Grundlagen</strong> - React + TypeScript + Vite Setup</li>
                  <li><strong>🔗 Toggl API Integration</strong> - Vollständige Datenanbindung</li>
                  <li><strong>📊 Report-Visualisierung</strong> - Elegante Tabellendarstellung</li>
                  <li><strong>🔐 Authentifizierung</strong> - Sichere API-Token-Verwaltung</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
  
      </div>
  );
}; 