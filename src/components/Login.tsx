import { useState, useEffect } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onTokenAndReportIdChange: (token: string, reportId: string) => void;
  shouldClearInputs?: {
    token?: boolean;
    reportId?: boolean;
  };
}

const Login = ({ onTokenAndReportIdChange, shouldClearInputs }: LoginProps) => {
  const [token, setToken] = useState('');
  const [reportId, setReportId] = useState('');

  useEffect(() => {
    if (shouldClearInputs?.token) {
      setToken('');
    }
    if (shouldClearInputs?.reportId) {
      setReportId('');
    }
  }, [shouldClearInputs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTokenAndReportIdChange(token, reportId);
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Toggl Verbindung einrichten</h2>
      <p className={styles.info}>
        Bitte geben Sie Ihren Toggl API Token und die Report-ID ein, um Ihre Zeiterfassungsdaten zu laden.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="API Token hier einfügen"
            className={styles.input}
            required
          />
          <p className={styles.helpText}>
            Den API Token finden Sie in Ihrem Toggl-Profil unter "Profile Settings".
          </p>
        </div>

        <div className={styles.inputGroup}>
          <input
            id="reportId"
            type="text"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="Report-ID hier einfügen"
            className={styles.input}
            required
          />
          <p className={styles.helpText}>
            Die Report-ID finden Sie in der URL Ihres gespeicherten Toggl-Reports. 
            Der Report muss auf "öffentlich" gestellt sein.
          </p>
        </div>

        <button 
          type="submit" 
          className={styles.button}
          disabled={!token || !reportId}
        >
          Verbinden
        </button>
      </form>
    </div>
  );
};

export default Login; 