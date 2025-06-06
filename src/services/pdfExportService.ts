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

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const LOGO_URL = 'https://seidemann.com/_Resources/Persistent/c/a/b/c/cabcf66af29f711fffa1d97769c64ec502d38896/Logo%20Seidemann%20Web-2560x560.jpg';

export class PDFExportService {
  static async generateActivityReport(options: ExportOptions): Promise<void> {
    const { data, columns, selectedClient, selectedProject, selectedDate, summaryStats } = options;
    
    // Erstelle PDF-Dokument
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Lade und füge Logo hinzu
    try {
      const logoImg = await this.loadImage(LOGO_URL);
      // Logo rechts positionieren (185mm von links, 15mm von oben, 20mm breit)
      doc.addImage(logoImg, 'JPEG', pageWidth - 35, 15, 30, 15);
    } catch (error) {
      console.warn('Logo konnte nicht geladen werden:', error);
    }
    
    // Header-Informationen
    const monthYear = `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    const clientName = selectedClient === 'Alle Kunden' ? 'Alle Kunden' : selectedClient;
    const projectName = selectedProject === 'Alle Projekte' ? 'Alle Projekte' : selectedProject;
    
    // Titel (links, große Schrift)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tätigkeitsnachweis für ${monthYear}`, 20, 25);
    
    // Kunden- und Projektinformationen
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kunde: ${clientName}`, 20, 35);
    doc.text(`Projekt: ${projectName}`, 20, 42);
    
    // Tabellen-Header und -Daten vorbereiten
    const tableColumns = columns.map(col => col.header);
    const tableData = data.map(row => 
      columns.map(col => row[col.field] || '')
    );
    
    // Summary-Zeile hinzufügen
    const summaryRow = columns.map(col => {
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
      startY: 55,
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
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
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