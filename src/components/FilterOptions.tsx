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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kunde</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Projekt</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
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
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Anzeigeoptionen</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.showAssignee}
              onChange={() => handleCheckboxChange('showAssignee')}
            />
            <span className="ml-2">Bearbeiter anzeigen</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.showDate}
              onChange={() => handleCheckboxChange('showDate')}
            />
            <span className="ml-2">Datum anzeigen</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.showDescription}
              onChange={() => handleCheckboxChange('showDescription')}
            />
            <span className="ml-2">Beschreibung anzeigen</span>
          </label>
        </div>
      </div>
    </div>
  );
}; 