export interface ColumnDefinition {
  field: string;
  header: string;
  visible?: boolean;
}

export const REPORT_COLUMNS: ColumnDefinition[] = [
  { field: 'User', header: 'Teammitglied', visible: true },
  { field: 'Client', header: 'Kunde', visible: true },
  { field: 'Project', header: 'Projekt', visible: true },
  { field: 'Task', header: 'Tätigkeit', visible: true },
  { field: 'Description', header: 'Beschreibung', visible: true },
  { field: 'Billable', header: 'Abrechenbar', visible: true },
  { field: 'Start date', header: 'Datum', visible: true },
  { field: 'Duration', header: 'Dauer', visible: true },
  { field: 'Tags', header: 'Tags', visible: true }
]; 