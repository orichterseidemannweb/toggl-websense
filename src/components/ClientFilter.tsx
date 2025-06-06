import { useState, useEffect } from 'react';
import styles from './ClientFilter.module.css';

interface ClientFilterProps {
  clients: string[];
  selectedClient: string;
  onFilterChange: (selectedClient: string) => void;
}

export const ClientFilter = ({ clients, selectedClient, onFilterChange }: ClientFilterProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allClients = ['Kunde auswählen', ...clients];
  
  const filteredClients = allClients.filter(client => 
    client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (client: string) => {
    onFilterChange(client);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.client-filter')) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${styles.clientFilter} client-filter`}>
      <div className={styles.dropdownContainer}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={styles.dropdownButton}
        >
          <span className={styles.dropdownText}>
            {selectedClient === 'Alle Kunden' ? 'Kunde auswählen' : selectedClient || 'Kunde auswählen'}
          </span>
          <svg 
            className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.rotated : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdown}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Kunden suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.clientList}>
              {filteredClients.map(client => (
                <button
                  key={client}
                  onClick={() => handleClientSelect(client)}
                  className={`${styles.clientItem} ${
                    (selectedClient === 'Alle Kunden' ? 'Kunde auswählen' : selectedClient || 'Kunde auswählen') === client ? styles.selected : ''
                  }`}
                >
                  <span className={styles.clientName}>{client}</span>
                  {(selectedClient === 'Alle Kunden' ? 'Kunde auswählen' : selectedClient || 'Kunde auswählen') === client && (
                    <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
              {filteredClients.length === 0 && (
                <div className={styles.noResults}>
                  Keine Kunden gefunden
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 