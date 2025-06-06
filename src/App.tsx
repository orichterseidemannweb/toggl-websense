import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Login from './components/Login'
import { ReportView } from './components/ReportView'
import { StatusBar } from './components/StatusBar'
import { TogglService } from './services/togglService'

interface FilterState {
  startDate: Date;
  endDate: Date;
  projectId?: number;
  clientId?: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeToggl();
  }, []);

  const initializeToggl = async () => {
    try {
      const success = await TogglService.initialize();
      setIsAuthenticated(success);
      if (!success) {
        setError('API-Token nicht gefunden oder ungültig');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setIsAuthenticated(false);
    }
  };

  const handleTokenChange = async (token: string) => {
    try {
      const success = await TogglService.setApiToken(token);
      setIsAuthenticated(success);
      if (!success) {
        setError('Verbindung mit dem Token fehlgeschlagen');
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Verbindung');
      setIsAuthenticated(false);
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Toggl WebSense</h1>
            {isAuthenticated && <StatusBar />}
          </div>
        </header>
        <main className={styles.main}>
          {!isAuthenticated ? (
            <>
              {error && <div className={styles.error}>{error}</div>}
              <Login onTokenChange={handleTokenChange} />
            </>
          ) : (
            <ReportView />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
