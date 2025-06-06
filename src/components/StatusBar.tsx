import { useState, useEffect } from 'react';
import { TogglService } from '../services/togglService';
import styles from './StatusBar.module.css';

interface UserInfo {
  fullname: string;
  email: string;
}

interface StatusBarProps {
  onLogout?: () => void;
}

export const StatusBar = ({ onLogout }: StatusBarProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // Dynamische URL-Auswahl basierend auf Umgebung
      const isDevelopment = import.meta.env.DEV;
      const apiUrl = isDevelopment 
        ? '/toggl-api/api/v9/me'  // Entwicklung: Vite-Proxy
        : '/websense/api-proxy.php?endpoint=/api/v9/me';  // Produktion: PHP-Proxy
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Basic ${btoa(`${TogglService.getApiToken()}:api_token`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          fullname: data.fullname,
          email: data.email
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    TogglService.clearToken();
    onLogout?.();
  };

  if (loading) {
    return <div className={styles.statusBar}>Lade Benutzerinformationen...</div>;
  }

  if (!userInfo) {
    return <div className={styles.statusBar}>Nicht verbunden</div>;
  }

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusIcon} title="Verbunden">✓</div>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{userInfo.fullname}</span>
        <span className={styles.userEmail}>{userInfo.email}</span>
      </div>
      <button 
        className={styles.logoutButton} 
        onClick={handleLogout}
        title="Abmelden"
      >
        ⏻
      </button>
    </div>
  );
}; 