import { useState } from 'react';
import styles from './ApiTokenHelp.module.css';

export const ApiTokenHelp = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.helpContainer}>
      <button 
        className={styles.helpToggle}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <span className={styles.helpIcon}>❓</span>
        <span>Wo finde ich meinen API Token?</span>
        <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      {isExpanded && (
        <div className={styles.helpContent}>
          <h3>📍 So finden Sie Ihren Toggl API Token:</h3>
          
          <div className={styles.stepList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Toggl Track öffnen:</strong>
                <span>Gehen Sie zu <a href="https://track.toggl.com" target="_blank" rel="noopener noreferrer">track.toggl.com</a> und melden Sie sich an</span>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>My Profile aufrufen:</strong>
                <span>Klicken Sie unten links auf "My Profile"</span>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Profile Settings:</strong>
                <span>Wählen Sie "Profile Settings" aus dem Menü</span>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>API Token Bereich:</strong>
                <span>Scrollen Sie komplett nach unten bis zum Bereich "API Token"</span>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Token anzeigen und kopieren:</strong>
                <span>Klicken Sie auf "Click to reveal", kopieren Sie den API Token und fügen Sie ihn hier ein</span>
              </div>
            </div>
          </div>
          
          <div className={styles.securityNote}>
            <span className={styles.securityIcon}>🔒</span>
            <div>
              <strong>Sicherheitshinweis:</strong>
              <p>Ihr API Token ist wie ein Passwort. Teilen Sie ihn niemals mit anderen und verwenden Sie ihn nur auf vertrauenswürdigen Seiten.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 