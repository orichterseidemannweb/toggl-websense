import { useState } from 'react';
import { TogglService } from '../services/togglService';

export const TokenTester = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testToken = async () => {
    setIsLoading(true);
    setTestResult('Teste Token...');

    try {
      const token = 'ea22ae1867ff9cfb78b39899e359a3c1';
      
      // Test über TogglService
      await TogglService.setApiToken(token);
      const serviceTest = await TogglService.testConnection();
      setTestResult(prev => prev + '\nTogglService Test: ' + (serviceTest ? 'Erfolgreich' : 'Fehlgeschlagen'));

      if (serviceTest) {
        // Hole Workspace-Daten
        const response = await fetch('https://api.track.toggl.com/api/v9/me/workspaces', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(`${token}:api_token`)}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const workspaces = await response.json();
        setTestResult(prev => prev + '\nWorkspaces gefunden: ' + JSON.stringify(workspaces, null, 2));
      }

    } catch (error) {
      setTestResult(prev => prev + '\nFehler: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Token Test</h2>
      <button 
        onClick={testToken}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Teste...' : 'Token testen'}
      </button>
      <pre style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {testResult || 'Noch keine Testergebnisse'}
      </pre>
    </div>
  );
}; 