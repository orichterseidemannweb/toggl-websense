import { useState, useEffect } from 'react';
import styles from './ColumnVisibilityControl.module.css';

interface ColumnVisibilityProps {
  onVisibilityChange: (columnConfig: ColumnVisibilityState) => void;
}

export interface ColumnVisibilityState {
  teammitglieder: boolean;
  beschreibung: boolean;
  datum: boolean;
  kunde: boolean;
  projekt: boolean;
  taetigkeit: boolean;
  abrechenbar: boolean;
  dauer: boolean;
  gesamtstunden: boolean;
  abrechenbareStunden: boolean;
  tags: boolean;
}

const DEFAULT_VISIBILITY: ColumnVisibilityState = {
  teammitglieder: true,
  beschreibung: true,
  datum: true,
  kunde: true,
  projekt: true,
  taetigkeit: true,
  abrechenbar: false, // Weniger relevant da wir Zeiten separat anzeigen
  dauer: false, // Ersetzen durch spezifische Zeitwerte
  gesamtstunden: true,
  abrechenbareStunden: true,
  tags: true
};

const STORAGE_KEY = 'toggl-column-visibility';

export const ColumnVisibilityControl = ({ onVisibilityChange }: ColumnVisibilityProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibility, setVisibility] = useState<ColumnVisibilityState>(DEFAULT_VISIBILITY);

  // Lade gespeicherte Einstellungen beim Mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    const versionKey = 'toggl-column-version';
    const currentVersion = '1.2.0';
    const savedVersion = localStorage.getItem(versionKey);
    
    // Prüfe ob eine neue Version vorliegt und setze Defaults
    if (savedVersion !== currentVersion) {
      console.log('Neue Version erkannt, setze Spalten-Defaults zurück');
      localStorage.setItem(versionKey, currentVersion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VISIBILITY));
      setVisibility(DEFAULT_VISIBILITY);
      onVisibilityChange(DEFAULT_VISIBILITY);
      return;
    }
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setVisibility(parsed);
        onVisibilityChange(parsed);
      } catch (error) {
        console.warn('Fehler beim Laden der Spalten-Einstellungen:', error);
        setVisibility(DEFAULT_VISIBILITY);
        onVisibilityChange(DEFAULT_VISIBILITY);
      }
    } else {
      setVisibility(DEFAULT_VISIBILITY);
      onVisibilityChange(DEFAULT_VISIBILITY);
    }
  }, [onVisibilityChange]);

  const handleToggle = (column: keyof ColumnVisibilityState) => {
    const newVisibility = {
      ...visibility,
      [column]: !visibility[column]
    };
    
    setVisibility(newVisibility);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibility));
    onVisibilityChange(newVisibility);
  };

  const resetToDefaults = () => {
    setVisibility(DEFAULT_VISIBILITY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VISIBILITY));
    onVisibilityChange(DEFAULT_VISIBILITY);
  };

  const toggleOptions = [
    { key: 'teammitglieder' as const, label: 'Teammitglieder', icon: '👥' },
    { key: 'beschreibung' as const, label: 'Beschreibung', icon: '📝' },
    { key: 'datum' as const, label: 'Datum', icon: '📅' },
    { key: 'kunde' as const, label: 'Kunde', icon: '🏢' },
    { key: 'projekt' as const, label: 'Projekt', icon: '📋' },
    { key: 'taetigkeit' as const, label: 'Tätigkeit', icon: '⚡' },
    { key: 'abrechenbar' as const, label: 'Abrechenbar', icon: '💰' },
    { key: 'dauer' as const, label: 'Dauer', icon: '⏱️' },
    { key: 'gesamtstunden' as const, label: 'Gesamtzeit', icon: '📊' },
    { key: 'abrechenbareStunden' as const, label: 'Abrechenbar (Zeit)', icon: '💵' },
    { key: 'tags' as const, label: 'Tags', icon: '🏷️' }
  ];

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.toggleButton}
        >
          <div className={styles.headerContent}>
            <span className={styles.icon}>⚙️</span>
            <span className={styles.title}>Spalten anzeigen</span>
            <span className={styles.counter}>({visibleCount}/11)</span>
          </div>
          <svg 
            className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.grid}>
            {toggleOptions.map(({ key, label, icon }) => (
              <div key={key} className={styles.toggleItem}>
                <div className={styles.toggleLabel}>
                  <span className={styles.toggleIcon}>{icon}</span>
                  <span className={styles.toggleText}>{label}</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={visibility[key]}
                    onChange={() => handleToggle(key)}
                    className={styles.switchInput}
                  />
                  <span className={styles.slider}>
                    <span className={styles.sliderKnob}></span>
                  </span>
                </label>
              </div>
            ))}
          </div>
          
          <div className={styles.actions}>
            <button 
              onClick={resetToDefaults}
              className={styles.resetButton}
            >
              <span className={styles.resetIcon}>🔄</span>
              Alle anzeigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 