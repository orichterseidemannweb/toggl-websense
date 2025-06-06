import styles from './MonthSelector.module.css';

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export const MonthSelector = ({ selectedDate, onDateChange }: MonthSelectorProps) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onDateChange(newDate);
  };

  const displayText = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Zeitraum</h3>
      <div className={styles.selector}>
        <button 
          onClick={goToPreviousMonth}
          className={styles.navButton}
          aria-label="Vorheriger Monat"
        >
          &lt;&lt; Monat
        </button>
        
        <span className={styles.display}>
          {displayText}
        </span>
        
        <button 
          onClick={goToNextMonth}
          className={styles.navButton}
          aria-label="Nächster Monat"
        >
          Monat &gt;&gt;
        </button>
      </div>
    </div>
  );
}; 