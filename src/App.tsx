import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Login from './components/Login'
import { StatusBar } from './components/StatusBar'
import { TogglService } from './services/togglService'

import { ReportView } from './components/ReportView'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldClearInputs, setShouldClearInputs] = useState<{ token?: boolean; reportId?: boolean }>({});

  useEffect(() => {
    initializeToggl();
  }, []);

  const initializeToggl = async () => {
    try {
      const success = await TogglService.initialize();
      setIsAuthenticated(success);
      
      // Nur Fehlermeldung anzeigen wenn ein gespeicherter Token ungültig war
      // Beim ersten Besuch (kein Token vorhanden) keine Fehlermeldung
      if (!success) {
        // Prüfe ob überhaupt ein Token im Storage war
        const hadStoredToken = sessionStorage.getItem('toggl_session_token');
        if (hadStoredToken) {
          setError('Gespeicherter API-Token ist ungültig - bitte neu anmelden');
          setShouldClearInputs({ token: true, reportId: true });
        }
        // Beim ersten Besuch: keine Fehlermeldung, nur Login-Form anzeigen
      }
    } catch (err) {
      console.error('Fehler bei der Toggl-Initialisierung:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setIsAuthenticated(false);
      setShouldClearInputs({ token: true, reportId: true });
    }
  };

  const handleTokenAndReportIdChange = async (token: string, reportId: string) => {
    try {
      const result = await TogglService.setApiTokenAndReportId(token, reportId);
      setIsAuthenticated(result.success);
      
      if (!result.success) {
        // Spezifische Fehlermeldung je nach Fehlertyp
        setError(result.message || 'Verbindung fehlgeschlagen');
        
        if (result.errorType === 'token') {
          // Token ungültig → beide Felder leeren (da der Token falsch ist)
          setShouldClearInputs({ token: true, reportId: true });
        } else if (result.errorType === 'reportId') {
          // Report-ID ungültig, aber Token korrekt → nur Report-ID leeren
          setShouldClearInputs({ reportId: true });
        } else {
          // Unbekannter Fehler → beide Felder leeren
          setShouldClearInputs({ token: true, reportId: true });
        }
      } else {
        setError(null);
        setShouldClearInputs({});
      }
    } catch (err) {
      console.error('Fehler beim Token/Report-ID setzen:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Verbindung');
      setIsAuthenticated(false);
      setShouldClearInputs({ token: true, reportId: true });
    }
  };

  const handleLogout = () => {
    TogglService.clearToken(); // Token und Report-ID aus Memory und Storage löschen
    
    // Lösche auch die gespeicherten Auswahlen der ReportView
    sessionStorage.removeItem('toggl_selected_client');
    sessionStorage.removeItem('toggl_selected_project');
    sessionStorage.removeItem('toggl_selected_date');
    
    setIsAuthenticated(false);
    setError(null);
    setShouldClearInputs({});
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
              <Login 
                onTokenAndReportIdChange={handleTokenAndReportIdChange} 
                shouldClearInputs={shouldClearInputs}
              />
            </>
          ) : (
            <ReportView />
          )}
        </main>
      </div>

    </div>
  )
}

export default App; 