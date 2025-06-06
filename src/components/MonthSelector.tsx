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

  // Berechne Vor- und Nächster Monat
  const previousMonth = new Date(currentYear, currentMonth - 1, 1);
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);
  
  // Prüfe, ob der nächste Monat in der Zukunft liegt
  const now = new Date();
  const currentRealMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const isNextMonthFuture = nextMonth > currentRealMonth;

  const goToPreviousMonth = () => {
    onDateChange(previousMonth);
  };

  const goToNextMonth = () => {
    if (!isNextMonthFuture) {
      onDateChange(nextMonth);
    }
  };

  // Generiere Button-Texte
  const previousButtonText = `Zum ${MONTH_NAMES[previousMonth.getMonth()]} ${previousMonth.getFullYear()}`;
  const nextButtonText = `Zum ${MONTH_NAMES[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
  
  const displayText = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Zeitraum</h3>
      <div className={styles.selector}>
        <button 
          onClick={goToPreviousMonth}
          className={styles.navButton}
          aria-label={previousButtonText}
        >
          {previousButtonText}
        </button>
        
        <span className={styles.display}>
          {displayText}
        </span>
        
        <button 
          onClick={goToNextMonth}
          className={`${styles.navButton} ${isNextMonthFuture ? styles.disabled : ''}`}
          aria-label={nextButtonText}
          disabled={isNextMonthFuture}
        >
          {nextButtonText}
        </button>
      </div>
    </div>
  );
}; 