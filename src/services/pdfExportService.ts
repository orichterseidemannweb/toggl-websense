import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  [key: string]: string;
}

interface Column {
  field: string;
  header: string;
  visible: boolean;
}

interface ExportOptions {
  data: ReportData[];
  columns: Column[];
  selectedClient: string;
  selectedProject: string;
  selectedDate: Date;
  summaryStats: {
    totalHours: string;
    billableHours: string;
    totalEntries: number;
    allBillable: boolean;
  };
}

interface BulkExportOptions {
  allData: ReportData[];
  columns: Column[];
  selectedDate: Date;
  availableClients: string[];
  onProgress?: (current: number, total: number, clientName: string, projectName?: string) => void;
}

interface BulkExportResult {
  fileName: string;
  clientName: string;
  projectName?: string;
  blob: Blob;
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const LOGO_URL = '/websense/logo.png';

export class PDFExportService {
  static async generateActivityReport(options: ExportOptions): Promise<void> {
    const { data, columns, selectedClient, selectedProject, selectedDate, summaryStats } = options;
    
    // Erstelle PDF-Dokument
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Lade und füge Logo hinzu
    try {
      const logoImg = await this.loadImage(LOGO_URL);
      // Logo rechts positionieren - korrektes Seitenverhältnis 600x131px (≈4.6:1)
      const logoWidth = 40; // mm
      const logoHeight = logoWidth / 4.58; // Korrektes Seitenverhältnis
      // Logo rechtsbündig mit der Tabelle (20mm rechter Rand)
      doc.addImage(logoImg, 'PNG', pageWidth - logoWidth - 20, 15, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Logo konnte nicht geladen werden:', error);
    }
    
    // Prüfe, ob nur ein Projekt in den Daten vorkommt
    const uniqueProjects = new Set(data.map(row => row.project || row.Project || '').filter(p => p));
    const hasOnlyOneProject = uniqueProjects.size <= 1;
    
    // Header-Informationen
    const monthYear = `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    const clientName = selectedClient === 'Alle Kunden' ? 'Alle Kunden' : selectedClient;
    const projectName = selectedProject === 'Alle Projekte' ? 'Alle Projekte' : selectedProject;
    
    // Titel (links, große Schrift)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tätigkeitsnachweis für ${monthYear}`, 20, 25);
    
    // Kunden-Informationen
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kunde: ${clientName}`, 20, 35);
    
    // Projekt-Information nur bei mehreren Projekten
    let headerHeight = 42;
    if (!hasOnlyOneProject) {
      doc.text(`Projekt: ${projectName}`, 20, 42);
      headerHeight = 49;
    }
    
    // Spalten filtern - Kunde und Projekt-Spalte intelligent entfernen
    const filteredColumns = columns.filter(col => {
      // Kundenspalte immer entfernen (steht im Header)
      if (col.field === 'client' || col.field === 'Client') {
        return false;
      }
      // Projekt-Spalte nur entfernen wenn nur ein Projekt
      if ((col.field === 'project' || col.field === 'Project') && hasOnlyOneProject) {
        return false;
      }
      return true;
    });
    
    // Tabellen-Header und -Daten vorbereiten
    const tableColumns = filteredColumns.map(col => col.header);
    const tableData = data.map(row => 
      filteredColumns.map(col => row[col.field] || '')
    );
    
    // Summary-Zeile hinzufügen
    const summaryRow = filteredColumns.map(col => {
      switch (col.field) {
        case 'task':
        case 'Task':
          return 'ZUSAMMENFASSUNG';
        case 'duration':
        case 'Duration':
        case 'TotalHours':
          return summaryStats.totalHours;
        case 'BillableHours':
          return summaryStats.allBillable ? summaryStats.totalHours : summaryStats.billableHours;
        default:
          return '';
      }
    });
    tableData.push(summaryRow);
    
    // Tabelle erstellen
    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      startY: headerHeight + 6,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blau passend zum Design
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      // Summary-Zeile hervorheben
      didParseCell: function(data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [229, 231, 235];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });
    
    // Fußzeile mit Datum
    const today = new Date().toLocaleDateString('de-DE');
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Erstellt am ${today}`, 20, doc.internal.pageSize.getHeight() - 10);
    
    // Dateiname generieren
    const fileName = this.generateFileName(clientName, projectName, selectedDate);
    
    // PDF speichern
    doc.save(fileName);
  }

  // Neue Bulk-Export-Funktionalität
  static async generateBulkExport(options: BulkExportOptions): Promise<BulkExportResult[]> {
    const { allData, columns, selectedDate, availableClients, onProgress } = options;
    const results: BulkExportResult[] = [];
    let currentIndex = 0;
    
    // Daten sind bereits im TogglService gefiltert (keine internen Projekte)
    const billableData = allData;
    
    // Berechne Gesamtzahl der zu generierenden PDFs
    let totalExports = 0;
    for (const client of availableClients) {
      const clientData = billableData.filter(row => row['Client'] === client);
      if (clientData.length === 0) continue; // Skip clients with no data
      
      const clientProjects = [...new Set(clientData.map(row => row['Project']).filter(Boolean))];
      totalExports += clientProjects.length <= 1 ? 1 : clientProjects.length;
    }

    for (const client of availableClients) {
      // Filtere Daten für diesen Kunden
      const clientData = billableData.filter(row => row['Client'] === client);
      
      if (clientData.length === 0) continue;
      
      // Extrahiere verfügbare Projekte für diesen Kunden
      const clientProjects = [...new Set(clientData.map(row => row['Project']).filter(Boolean))];
      
              if (clientProjects.length <= 1) {
          // Ein PDF für den ganzen Kunden (ein oder kein Projekt)
          currentIndex++;
          onProgress?.(currentIndex, totalExports, client);
          
          // Gruppiere die Daten wie in ReportView (wichtig für saubere PDFs!)
          const groupedData = this.groupTaskData(clientData, columns);
          const summaryStats = this.calculateSummaryStats(groupedData);
          
          const pdfBlob = await this.generatePDFBlob({
            data: groupedData,
            columns,
            selectedClient: client,
            selectedProject: 'Alle Projekte',
            selectedDate,
            summaryStats
          });
          
          results.push({
            fileName: this.generateFileName(client, 'Alle Projekte', selectedDate),
            clientName: client,
            blob: pdfBlob
          });
          
          // Kurze Pause zwischen PDF-Generierungen für bessere UX
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } else {
          // Ein PDF pro Projekt
          for (const project of clientProjects) {
            currentIndex++;
            onProgress?.(currentIndex, totalExports, client, project);
            
            const projectData = clientData.filter(row => row['Project'] === project);
            
            // Gruppiere die Daten wie in ReportView (wichtig für saubere PDFs!)
            const groupedData = this.groupTaskData(projectData, columns);
            const summaryStats = this.calculateSummaryStats(groupedData);
            
            const pdfBlob = await this.generatePDFBlob({
              data: groupedData,
              columns,
              selectedClient: client,
              selectedProject: project,
              selectedDate,
              summaryStats
            });
            
            results.push({
              fileName: this.generateFileName(client, project, selectedDate),
              clientName: client,
              projectName: project,
              blob: pdfBlob
            });
            
            // Kurze Pause zwischen PDF-Generierungen
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
    }
    
    return results;
  }

  // Hilfsmethode: PDF als Blob generieren (ohne direkten Download)
  private static async generatePDFBlob(options: ExportOptions): Promise<Blob> {
    const { data, columns, selectedClient, selectedProject, selectedDate, summaryStats } = options;
    
    // Erstelle PDF-Dokument
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Lade und füge Logo hinzu
    try {
      const logoImg = await this.loadImage(LOGO_URL);
      const logoWidth = 40;
      const logoHeight = logoWidth / 4.58;
      doc.addImage(logoImg, 'PNG', pageWidth - logoWidth - 20, 15, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Logo konnte nicht geladen werden:', error);
    }
    
    // Prüfe, ob nur ein Projekt in den Daten vorkommt
    const uniqueProjects = new Set(data.map(row => row.project || row.Project || '').filter(p => p));
    const hasOnlyOneProject = uniqueProjects.size <= 1;
    
    // Header-Informationen
    const monthYear = `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    const clientName = selectedClient;
    const projectName = selectedProject;
    
    // Titel
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tätigkeitsnachweis für ${monthYear}`, 20, 25);
    
    // Kunden-Informationen
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kunde: ${clientName}`, 20, 35);
    
    // Projekt-Information anzeigen wenn spezifisches Projekt (nicht "Alle Projekte")
    let headerHeight = 42;
    if (projectName !== 'Alle Projekte' && projectName.trim() !== '') {
      doc.text(`Projekt: ${projectName}`, 20, 42);
      headerHeight = 49;
    }
    
    // Spalten filtern
    const filteredColumns = columns.filter(col => {
      if (col.field === 'client' || col.field === 'Client') {
        return false;
      }
      if ((col.field === 'project' || col.field === 'Project') && hasOnlyOneProject) {
        return false;
      }
      return true;
    });
    
    // Tabellen-Daten vorbereiten
    const tableColumns = filteredColumns.map(col => col.header);
    const tableData = data.map(row => 
      filteredColumns.map(col => row[col.field] || '')
    );
    
    // Summary-Zeile hinzufügen
    const summaryRow = filteredColumns.map(col => {
      switch (col.field) {
        case 'task':
        case 'Task':
          return 'ZUSAMMENFASSUNG';
        case 'duration':
        case 'Duration':
        case 'TotalHours':
          return summaryStats.totalHours;
        case 'BillableHours':
          return summaryStats.allBillable ? summaryStats.totalHours : summaryStats.billableHours;
        default:
          return '';
      }
    });
    tableData.push(summaryRow);
    
    // Tabelle erstellen
    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      startY: headerHeight + 6,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: function(data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [229, 231, 235];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });
    
    // Fußzeile mit Datum
    const today = new Date().toLocaleDateString('de-DE');
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Erstellt am ${today}`, 20, doc.internal.pageSize.getHeight() - 10);
    
    // PDF als Blob zurückgeben
    return doc.output('blob');
  }

  // Hilfsmethode: Gruppiere Tasks EXAKT wie in ReportView.tsx
  private static groupTaskData(data: ReportData[], columns: Column[]): ReportData[] {
    if (data.length === 0) return data;
    
    // Prüfe ob Beschreibung sichtbar ist - wenn ja, nicht gruppieren (exakt wie ReportView)
    const beschreibungVisible = columns.some(col => 
      (col.field === 'Description' || col.field === 'description') && col.visible
    );
    
    if (beschreibungVisible) {
      // Nicht gruppieren, aber BillableTime und virtuelle Spalten berechnen
      return data.map(row => {
        const isBillable = row['Billable'] === 'Yes' || row['Billable'] === 'Ja';
        const billableTime = isBillable ? row['Duration'] : '0:00:00';
        return {
          ...row,
          'BillableTime': billableTime,
          'TotalHours': row['Duration'],  // Virtuelle Spalte: Gesamtzeit = Dauer
          'BillableHours': billableTime   // Virtuelle Spalte: Abrechenbare Zeit
        };
      });
    }
    
    // Gruppiere Tasks zusammen - EXAKT die gleiche Logik wie in ReportView.tsx
    const groupedData = new Map<string, ReportData>();
    
    data.forEach(row => {
      const task = row['Task'] || '';
      const client = row['Client'] || '';
      const project = row['Project'] || '';
      
      // Erstelle einen eindeutigen Schlüssel für die Gruppierung (exakt wie ReportView)
      const groupKey = `${client}|${project}|${task}`;
      
      if (groupedData.has(groupKey)) {
        const existing = groupedData.get(groupKey)!;
        
        // Summiere die Gesamtdauer (exakt wie ReportView)
        const existingTotalMinutes = this.parseTimeToMinutes(existing['Duration']);
        const currentTotalMinutes = this.parseTimeToMinutes(row['Duration']);
        const totalMinutes = existingTotalMinutes + currentTotalMinutes;
        
        // Summiere die abrechenbare Zeit (exakt wie ReportView)
        const existingBillableMinutes = this.parseTimeToMinutes(existing['BillableTime'] || '0:00:00');
        const currentBillableMinutes = (row['Billable'] === 'Yes' || row['Billable'] === 'Ja') 
          ? this.parseTimeToMinutes(row['Duration']) 
          : 0;
        const billableMinutes = existingBillableMinutes + currentBillableMinutes;
        
        // Aktualisiere die Zeiten (exakt wie ReportView)
        existing['Duration'] = this.formatMinutesToTime(totalMinutes);
        existing['BillableTime'] = this.formatMinutesToTime(billableMinutes);
        
        // Aktualisiere virtuelle Spalten (wie in ReportView.tsx)
        existing['TotalHours'] = existing['Duration'];  // Gesamtzeit = Dauer
        existing['BillableHours'] = existing['BillableTime']; // Abrechenbare Zeit
        
        // Für andere Felder: zeige "Verschiedene" wenn unterschiedlich (exakt wie ReportView)
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
        
        // Beschreibung bleibt leer da sie bei gruppierter Ansicht nicht verwendet wird
        existing['Description'] = '';
        
      } else {
        // Erste Zeile für diese Tätigkeit - erstelle neue gruppierte Zeile
        const newRow = { ...row };
        newRow['Description'] = ''; // Beschreibung leer lassen bei Gruppierung
        
        // Berechne abrechenbare Zeit für diese Zeile
        const isBillable = row['Billable'] === 'Yes' || row['Billable'] === 'Ja';
        newRow['BillableTime'] = isBillable ? row['Duration'] : '0:00:00';
        
        // Füge virtuelle Spalten hinzu (wie in ReportView.tsx)
        newRow['TotalHours'] = row['Duration'];  // Gesamtzeit = Dauer
        newRow['BillableHours'] = newRow['BillableTime']; // Abrechenbare Zeit
        
        groupedData.set(groupKey, newRow);
      }
    });
    
    return Array.from(groupedData.values());
  }

  // Hilfsmethode: Summary-Statistiken berechnen
  private static calculateSummaryStats(data: ReportData[]) {
    let totalMinutes = 0;
    let billableMinutes = 0;
    
    data.forEach(row => {
      const duration = this.parseTimeToMinutes(row['Duration'] || '');
      totalMinutes += duration;
      
      if (row['Billable'] === 'Yes' || row['Billable'] === 'Ja') {
        billableMinutes += duration;
      }
    });
    
    return {
      totalHours: this.formatMinutesToTime(totalMinutes),
      billableHours: this.formatMinutesToTime(billableMinutes),
      totalEntries: data.length,
      allBillable: billableMinutes === totalMinutes && totalMinutes > 0
    };
  }

  private static formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private static parseTimeToMinutes(timeStr: string): number {
    if (!timeStr || timeStr === '-') return 0;
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
    }
    return 0;
  }

  // Bulk-Download als ZIP-Datei
  static async downloadBulkAsZip(results: BulkExportResult[], selectedDate: Date): Promise<void> {
    // Dynamischer Import für JSZip (nur wenn benötigt)
    const JSZip = (await import('jszip')).default;
    
    const zip = new JSZip();
    const monthYear = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Füge alle PDFs zur ZIP hinzu
    results.forEach(result => {
      zip.file(result.fileName, result.blob);
    });
    
    // Generiere ZIP-Datei
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download starten
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tätigkeitsnachweise_Alle_${monthYear}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  private static async loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }
  
  private static generateFileName(client: string, project: string, date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Dateiname-sichere Strings erstellen
    const safeClient = client.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_');
    const safeProject = project !== 'Alle Projekte' ? 
      `_${project.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}` : '';
    
    return `Tätigkeitsnachweis_${safeClient}${safeProject}_${year}-${month}.pdf`;
  }
} 