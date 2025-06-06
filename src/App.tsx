import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Login from './components/Login'
import { StatusBar } from './components/StatusBar'
import { TogglService } from './services/togglService'
// import { DebugInfo } from './components/DebugInfo'
import { ReportView } from './components/ReportView'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // console.log('App gestartet, initialisiere Toggl');
    initializeToggl();
  }, []);

  const initializeToggl = async () => {
    try {
      // console.log('Starte Toggl-Initialisierung');
      const success = await TogglService.initialize();
      // console.log('Toggl-Initialisierung Ergebnis:', success);
      setIsAuthenticated(success);
      if (!success) {
        setError('API-Token nicht gefunden oder ungültig');
      }
    } catch (err) {
      console.error('Fehler bei der Toggl-Initialisierung:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setIsAuthenticated(false);
    }
  };

  const handleTokenChange = async (token: string) => {
    try {
      // console.log('Versuche Token zu setzen');
      const success = await TogglService.setApiToken(token);
      // console.log('Token setzen Ergebnis:', success);
      setIsAuthenticated(success);
      if (!success) {
        setError('Verbindung mit dem Token fehlgeschlagen');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Fehler beim Token setzen:', err);
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
      {/* <DebugInfo /> */}
    </div>
  )
}

export default App; 