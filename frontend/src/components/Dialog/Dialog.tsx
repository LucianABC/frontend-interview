import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Dialog.module.scss';

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Dialog = ({ isOpen, title, message, onConfirm, onCancel }: DialogProps) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.dialogBox}>
        <header className={styles.header}>
          <h3>{title}</h3>
        </header>
        
        <div className={styles.body}>
          <p>{message}</p>
        </div>

        <footer className={styles.footer}>
          <button className={styles.noBtn} onClick={onCancel}>
            No
          </button>
          <button className={styles.yesBtn} onClick={onConfirm}>
           Yes
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;