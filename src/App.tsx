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
      
      // Nur Fehlermeldung anzeigen wenn ein gespeicherter Token ungültig war
      // Beim ersten Besuch (kein Token vorhanden) keine Fehlermeldung
      if (!success) {
        // Prüfe ob überhaupt ein Token im Storage war
        const hadStoredToken = sessionStorage.getItem('toggl_session_token');
        if (hadStoredToken) {
          setError('Gespeicherter API-Token ist ungültig - bitte neu anmelden');
        }
        // Beim ersten Besuch: keine Fehlermeldung, nur Login-Form anzeigen
      }
    } catch (err) {
      console.error('Fehler bei der Toggl-Initialisierung:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setIsAuthenticated(false);
    }
  };

  const handleTokenAndReportIdChange = async (token: string, reportId: string) => {
    try {
      // console.log('Versuche Token und Report-ID zu setzen');
      const success = await TogglService.setApiTokenAndReportId(token, reportId);
      // console.log('Token und Report-ID setzen Ergebnis:', success);
      setIsAuthenticated(success);
      if (!success) {
        setError('Verbindung mit Token/Report-ID fehlgeschlagen. Bitte prüfen Sie Ihre Eingaben.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Fehler beim Token/Report-ID setzen:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Verbindung');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    TogglService.clearToken(); // Token und Report-ID aus Memory und Storage löschen
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Toggl WebSense</h1>
            {isAuthenticated && <StatusBar onLogout={handleLogout} />}
          </div>
        </header>
        <main className={styles.main}>
          {!isAuthenticated ? (
            <>
              {error && <div className={styles.error}>{error}</div>}
              <Login onTokenAndReportIdChange={handleTokenAndReportIdChange} />
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