import { useState } from 'react';

interface FilterOptionsProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  showAssignee: boolean;
  showDate: boolean;
  showDescription: boolean;
  client?: string;
  project?: string;
}

export const FilterOptions = ({ onFilterChange }: FilterOptionsProps) => {
  const [filters, setFilters] = useState<FilterState>({
    showAssignee: true,
    showDate: true,
    showDescription: true,
  });

  // Beispiel-Daten (später durch API-Daten ersetzen)
  const clients = ['Kunde A', 'Kunde B', 'Kunde C'];
  const projects = ['Projekt 1', 'Projekt 2', 'Projekt 3'];

  const handleCheckboxChange = (field: keyof FilterState) => {
    const newFilters = {
      ...filters,
      [field]: !filters[field as keyof typeof filters],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectChange = (field: 'client' | 'project', value: string) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
          <div className="relative">
            <select
              className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filters.client}
              onChange={(e) => handleSelectChange('client', e.target.value)}
            >
              <option value="">Alle Kunden</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
          <div className="relative">
            <select
              className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filters.project}
              onChange={(e) => handleSelectChange('project', e.target.value)}
            >
              <option value="">Alle Projekte</option>
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Anzeigeoptionen</label>
        <div className="space-y-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.showAssignee}
              onChange={() => handleCheckboxChange('showAssignee')}
            />
            <span className="ml-2 text-sm text-gray-700">Bearbeiter anzeigen</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.showDate}
              onChange={() => handleCheckboxChange('showDate')}
            />
            <span className="ml-2 text-sm text-gray-700">Datum anzeigen</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.showDescription}
              onChange={() => handleCheckboxChange('showDescription')}
            />
            <span className="ml-2 text-sm text-gray-700">Beschreibung anzeigen</span>
          </label>
        </div>
      </div>
    </div>
  );
}; 