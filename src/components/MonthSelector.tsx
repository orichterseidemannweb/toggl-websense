import styles from './MonthSelector.module.css';

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
];

export const MonthSelector = ({ selectedDate, onDateChange }: MonthSelectorProps) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const now = new Date();

  // Berechne Vor- und Nächster Monat
  const previousMonth = new Date(currentYear, currentMonth - 1, 1);
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);
  
  // Prüfe, ob der nächste Monat in der Zukunft liegt
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

  // Schnellauswahl-Funktionen
  const goToLastMonth = () => {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    onDateChange(lastMonth);
  };

  const goToThisMonth = () => {
    onDateChange(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Prüfe ob es der aktuelle Monat ist
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const isLastMonth = currentMonth === (now.getMonth() - 1) && currentYear === now.getFullYear();

  const displayText = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Zeitraum</h3>
        <div className={styles.quickActions}>
          {!isLastMonth && (
            <button 
              onClick={goToLastMonth}
              className={styles.quickButton}
              title="Zum letzten Monat springen"
            >
              Letzter Monat
            </button>
          )}
          {!isCurrentMonth && (
            <button 
              onClick={goToThisMonth}
              className={styles.quickButton}
              title="Zu diesem Monat springen"
            >
              Dieser Monat
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.selector}>
        <button 
          onClick={goToPreviousMonth}
          className={styles.navButton}
          aria-label={`Vorheriger Monat`}
          title={`${SHORT_MONTH_NAMES[previousMonth.getMonth()]} ${previousMonth.getFullYear()}`}
        >
          ←
        </button>
        
        <span className={styles.display}>
          {displayText}
        </span>
        
        <button 
          onClick={goToNextMonth}
          className={`${styles.navButton} ${isNextMonthFuture ? styles.disabled : ''}`}
          aria-label={`Nächster Monat`}
          title={isNextMonthFuture ? 'Zukünftige Monate nicht verfügbar' : `${SHORT_MONTH_NAMES[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`}
          disabled={isNextMonthFuture}
        >
          →
        </button>
      </div>
    </div>
  );
}; 