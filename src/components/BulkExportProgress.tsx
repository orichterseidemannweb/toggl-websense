import React from 'react';
import styles from './BulkExportProgress.module.css';

interface BulkExportProgressProps {
  isVisible: boolean;
  current: number;
  total: number;
  clientName: string;
  projectName?: string;
  onCancel: () => void;
}

export const BulkExportProgress: React.FC<BulkExportProgressProps> = ({
  isVisible,
  current,
  total,
  clientName,
  projectName,
  onCancel
}) => {
  if (!isVisible) return null;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>📦 Bulk PDF Export</h3>
          <button 
            onClick={onCancel} 
            className={styles.cancelButton}
            title="Export abbrechen"
          >
            ✕
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              Generiere PDF {current} von {total}
            </span>
            <span className={styles.percentage}>{percentage}%</span>
          </div>
          
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className={styles.currentTask}>
            <div className={styles.clientName}>
              📋 {clientName}
            </div>
            {projectName && (
              <div className={styles.projectName}>
                🔹 {projectName}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 