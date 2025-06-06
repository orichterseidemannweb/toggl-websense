import { useState } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onTokenChange: (token: string) => void;
}

const Login = ({ onTokenChange }: LoginProps) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTokenChange(token);
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Toggl API Token eingeben</h2>
      <p className={styles.info}>
        Bitte geben Sie Ihren Toggl API Token ein. Sie finden ihn in Ihren Toggl-Profileinstellungen.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="API Token eingeben"
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>
          Verbinden
        </button>
      </form>
    </div>
  );
};

export default Login; 