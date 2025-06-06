import { useState, useEffect } from 'react';
import styles from './ProjectFilter.module.css';

interface ProjectFilterProps {
  projects: string[];
  selectedProject: string;
  onFilterChange: (selectedProject: string) => void;
  clientName: string;
}

export const ProjectFilter = ({ projects, selectedProject, onFilterChange, clientName }: ProjectFilterProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allProjects = ['Alle Projekte', ...projects];
  
  const filteredProjects = allProjects.filter(project => 
    project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectSelect = (project: string) => {
    onFilterChange(project);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.project-filter')) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${styles.projectFilter} project-filter`}>
      <div className={styles.filterHeader}>
        <span className={styles.filterLabel}>
          Projekt auswählen
          <span className={styles.clientContext}>für {clientName}</span>
        </span>
      </div>

      <div className={styles.dropdownContainer}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={styles.dropdownButton}
        >
          <span className={styles.dropdownText}>
            {selectedProject || 'Alle Projekte'}
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
                placeholder="Projekte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.projectList}>
              {filteredProjects.map(project => (
                <button
                  key={project}
                  onClick={() => handleProjectSelect(project)}
                  className={`${styles.projectItem} ${
                    (selectedProject || 'Alle Projekte') === project ? styles.selected : ''
                  }`}
                >
                  <span className={styles.projectName}>{project}</span>
                  {(selectedProject || 'Alle Projekte') === project && (
                    <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
              {filteredProjects.length === 0 && (
                <div className={styles.noResults}>
                  Keine Projekte gefunden
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 