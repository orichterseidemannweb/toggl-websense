import { useState, useEffect } from 'react';
import { TogglService } from '../services/togglService';
import { config } from '../config';

export const ApiStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // API Token setzen
        TogglService.setApiToken(config.togglApiToken);
        
        // Verbindung testen
        const isConnected = await TogglService.testConnection();
        
        if (isConnected) {
          setStatus('connected');
          setErrorMessage('');
        } else {
          throw new Error('API nicht erreichbar');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler');
      }
    };

    checkApiConnection();
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'checking'
            ? 'bg-yellow-400'
            : status === 'connected'
            ? 'bg-green-500'
            : 'bg-red-500'
        }`}
      />
      <span className="text-sm font-medium">
        {status === 'checking'
          ? 'Prüfe API-Verbindung...'
          : status === 'connected'
          ? 'API verbunden'
          : 'API-Fehler'}
      </span>
      {status === 'error' && errorMessage && (
        <span className="text-sm text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}; 