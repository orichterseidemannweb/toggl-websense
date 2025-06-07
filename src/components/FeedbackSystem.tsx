import { useState, useEffect } from 'react';
import styles from './FeedbackSystem.module.css';

export interface FeedbackItem {
  id: string;
  type: 'Feature-Request' | 'Bug';
  email: string;
  date: string;
  description: string;
  debugLog?: string;
  status: 'Neu' | 'In Bearbeitung' | 'Erledigt' | 'Abgelehnt';
  priority: 'Niedrig' | 'Mittel' | 'Hoch' | 'Kritisch';
  adminComment?: string;
  createdAt: number;
}

interface FeedbackSystemProps {
  currentEmail?: string;
  currentDebugLog?: string;
}

export const FeedbackSystem = ({ currentEmail, currentDebugLog }: FeedbackSystemProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [newFeedback, setNewFeedback] = useState({
    type: 'Feature-Request' as 'Feature-Request' | 'Bug',
    description: '',
    includeDebugLog: false,
    priority: 'Mittel' as 'Niedrig' | 'Mittel' | 'Hoch' | 'Kritisch'
  });
  const [filter, setFilter] = useState({
    type: 'Alle' as 'Alle' | 'Feature-Request' | 'Bug',
    status: 'Alle' as 'Alle' | 'Neu' | 'In Bearbeitung' | 'Erledigt' | 'Abgelehnt'
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // LocalStorage Management
  useEffect(() => {
    const stored = localStorage.getItem('feedbackItems');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setFeedbackItems(items);
        
        // Zähle neue Feedback-Einträge (letzter Admin-Besuch)
        const lastAdminVisit = localStorage.getItem('lastAdminVisit');
        const lastVisitTime = lastAdminVisit ? parseInt(lastAdminVisit) : 0;
        const newItems = items.filter((item: FeedbackItem) => 
          item.createdAt > lastVisitTime && item.status === 'Neu'
        );
        setUnreadCount(newItems.length);
      } catch (error) {
        console.error('Error loading feedback items:', error);
      }
    }
  }, []);

  const saveFeedbackItems = (items: FeedbackItem[]) => {
    localStorage.setItem('feedbackItems', JSON.stringify(items));
    setFeedbackItems(items);
  };

  const submitFeedback = () => {
    if (!newFeedback.description.trim()) {
      alert('Bitte geben Sie eine Beschreibung ein.');
      return;
    }

    const feedbackItem: FeedbackItem = {
      id: Date.now().toString(),
      type: newFeedback.type,
      email: currentEmail || 'Unbekannt',
      date: new Date().toLocaleDateString('de-DE'),
      description: newFeedback.description,
      debugLog: newFeedback.includeDebugLog ? currentDebugLog : undefined,
      status: 'Neu',
      priority: newFeedback.priority,
      createdAt: Date.now()
    };

    const updatedItems = [...feedbackItems, feedbackItem];
    saveFeedbackItems(updatedItems);
    
    // Reset form
    setNewFeedback({
      type: 'Feature-Request',
      description: '',
      includeDebugLog: false,
      priority: 'Mittel'
    });
    
    setShowModal(false);
    setUnreadCount(prev => prev + 1);
    
    alert('✅ Feedback erfolgreich übermittelt! Vielen Dank für Ihr Feedback.');
  };

  const updateFeedbackStatus = (id: string, status: FeedbackItem['status'], adminComment?: string) => {
    const updatedItems = feedbackItems.map(item => 
      item.id === id 
        ? { ...item, status, adminComment: adminComment || item.adminComment }
        : item
    );
    saveFeedbackItems(updatedItems);
  };

  const deleteFeedback = (id: string) => {
    if (confirm('Möchten Sie diesen Feedback-Eintrag wirklich löschen?')) {
      const updatedItems = feedbackItems.filter(item => item.id !== id);
      saveFeedbackItems(updatedItems);
    }
  };

  const exportFeedback = () => {
    const csvContent = [
      'ID,Typ,Email,Datum,Status,Priorität,Beschreibung,Admin-Kommentar',
      ...feedbackItems.map(item => 
        `"${item.id}","${item.type}","${item.email}","${item.date}","${item.status}","${item.priority}","${item.description.replace(/"/g, '""')}","${(item.adminComment || '').replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const markAsRead = () => {
    localStorage.setItem('lastAdminVisit', Date.now().toString());
    setUnreadCount(0);
  };

  const filteredItems = feedbackItems.filter(item => {
    const typeMatch = filter.type === 'Alle' || item.type === filter.type;
    const statusMatch = filter.status === 'Alle' || item.status === filter.status;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Neu': return '#6b7280';
      case 'In Bearbeitung': return '#f59e0b';
      case 'Erledigt': return '#10b981';
      case 'Abgelehnt': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Niedrig': return '#10b981';
      case 'Mittel': return '#f59e0b';
      case 'Hoch': return '#f97316';
      case 'Kritisch': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <>
      {/* Feedback Button im Footer */}
      <button 
        onClick={() => setShowModal(true)}
        className={styles.feedbackButton}
        title="Feedback geben - Feature-Requests und Bugs melden"
      >
        💡 Feedback geben
      </button>

      {/* Admin Button (nur wenn Feedback-Einträge vorhanden) */}
      {feedbackItems.length > 0 && (
        <button 
          onClick={() => {
            setShowAdmin(!showAdmin);
            if (!showAdmin) markAsRead();
          }}
          className={styles.adminButton}
          title="Feedback-Verwaltung"
        >
          📋 Feedback-Liste {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>
      )}

      {/* Feedback Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>💡 Feedback geben</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Typ:</label>
                <select 
                  value={newFeedback.type} 
                  onChange={(e) => setNewFeedback({...newFeedback, type: e.target.value as any})}
                >
                  <option value="Feature-Request">Feature-Request</option>
                  <option value="Bug">Bug</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Priorität:</label>
                <select 
                  value={newFeedback.priority} 
                  onChange={(e) => setNewFeedback({...newFeedback, priority: e.target.value as any})}
                >
                  <option value="Niedrig">Niedrig</option>
                  <option value="Mittel">Mittel</option>
                  <option value="Hoch">Hoch</option>
                  <option value="Kritisch">Kritisch</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Email:</label>
                <input 
                  type="text" 
                  value={currentEmail || ''} 
                  disabled 
                  className={styles.disabledInput}
                />
              </div>

              <div className={styles.field}>
                <label>Datum:</label>
                <input 
                  type="text" 
                  value={new Date().toLocaleDateString('de-DE')} 
                  disabled 
                  className={styles.disabledInput}
                />
              </div>

              <div className={styles.field}>
                <label>Beschreibung:</label>
                <textarea 
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                  placeholder="Beschreiben Sie Ihr Anliegen..."
                  rows={5}
                />
              </div>

              {currentDebugLog && (
                <div className={styles.field}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={newFeedback.includeDebugLog}
                      onChange={(e) => setNewFeedback({...newFeedback, includeDebugLog: e.target.checked})}
                    />
                    Debug-Log anhängen (hilfreich für Fehleranalyse)
                  </label>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <button onClick={submitFeedback} className={styles.submitButton}>
                📤 Feedback senden
              </button>
              <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <div className={styles.adminPanel}>
          <div className={styles.adminHeader}>
            <h3>📋 Feedback-Verwaltung ({feedbackItems.length} Einträge)</h3>
            <div className={styles.adminControls}>
              <button onClick={exportFeedback} className={styles.exportBtn}>
                📊 CSV Export
              </button>
              <button onClick={() => setShowAdmin(false)} className={styles.closeBtn}>
                ✕
              </button>
            </div>
          </div>

          <div className={styles.filters}>
            <select 
              value={filter.type} 
              onChange={(e) => setFilter({...filter, type: e.target.value as any})}
            >
              <option value="Alle">Alle Typen</option>
              <option value="Feature-Request">Feature-Request</option>
              <option value="Bug">Bug</option>
            </select>
            
            <select 
              value={filter.status} 
              onChange={(e) => setFilter({...filter, status: e.target.value as any})}
            >
              <option value="Alle">Alle Status</option>
              <option value="Neu">Neu</option>
              <option value="In Bearbeitung">In Bearbeitung</option>
              <option value="Erledigt">Erledigt</option>
              <option value="Abgelehnt">Abgelehnt</option>
            </select>
          </div>

          <div className={styles.feedbackList}>
            {filteredItems.length === 0 ? (
              <p>Keine Feedback-Einträge gefunden.</p>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className={styles.feedbackItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemType}>{item.type}</span>
                    <span 
                      className={styles.itemPriority}
                      style={{ backgroundColor: getPriorityColor(item.priority) }}
                    >
                      {item.priority}
                    </span>
                    <span 
                      className={styles.itemStatus}
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </span>
                    <span className={styles.itemDate}>{item.date}</span>
                    <button 
                      onClick={() => deleteFeedback(item.id)}
                      className={styles.deleteBtn}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className={styles.itemContent}>
                    <p><strong>Von:</strong> {item.email}</p>
                    <p><strong>Beschreibung:</strong> {item.description}</p>
                    {item.debugLog && (
                      <details className={styles.debugDetails}>
                        <summary>Debug-Log anzeigen</summary>
                        <pre className={styles.debugLog}>{item.debugLog}</pre>
                      </details>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    <select 
                      value={item.status}
                      onChange={(e) => updateFeedbackStatus(item.id, e.target.value as any)}
                    >
                      <option value="Neu">Neu</option>
                      <option value="In Bearbeitung">In Bearbeitung</option>
                      <option value="Erledigt">Erledigt</option>
                      <option value="Abgelehnt">Abgelehnt</option>
                    </select>
                    
                    <input 
                      type="text"
                      placeholder="Admin-Kommentar..."
                      value={item.adminComment || ''}
                      onChange={(e) => updateFeedbackStatus(item.id, item.status, e.target.value)}
                      className={styles.commentInput}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}; 