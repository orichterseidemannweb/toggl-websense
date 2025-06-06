export interface ColumnDefinition {
  field: string;
  header: string;
  visible?: boolean;
}

export const REPORT_COLUMNS: ColumnDefinition[] = [
  { field: 'User', header: 'Teammitglied', visible: false },  // Default: versteckt
  { field: 'Client', header: 'Kunde', visible: true },
  { field: 'Project', header: 'Projekt', visible: true },
  { field: 'Task', header: 'Tätigkeit', visible: true },
  { field: 'Description', header: 'Beschreibung', visible: false },  // Default: versteckt für Gruppierung
  { field: 'Billable', header: 'Abrechenbar', visible: false },  // Default: versteckt
  { field: 'Start date', header: 'Datum', visible: false },  // Default: versteckt
  { field: 'Duration', header: 'Dauer', visible: false },  // Default: versteckt (durch TotalHours ersetzt)
  { field: 'TotalHours', header: 'Gesamtzeit', visible: true },
  { field: 'BillableHours', header: 'Abrechenbar', visible: true },
  { field: 'Tags', header: 'Tags', visible: false }  // Default: versteckt
]; 