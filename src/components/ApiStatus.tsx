import styles from '../App.module.css';

interface ApiStatusProps {
  isConnected: boolean;
}

function ApiStatus({ isConnected }: ApiStatusProps) {
  return (
    <div className={`${styles.card} ${isConnected ? styles.connected : styles.disconnected}`}>
      <span>Status: {isConnected ? 'Verbunden' : 'Nicht verbunden'}</span>
    </div>
  );
}

export default ApiStatus; 