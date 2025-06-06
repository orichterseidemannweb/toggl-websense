import { useState, useEffect } from 'react';
import { TogglService } from '../services/togglService';
import styles from './StatusBar.module.css';

interface UserInfo {
  fullname: string;
  email: string;
}

export const StatusBar = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/toggl-api/api/v9/me', {
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
    </div>
  );
}; 