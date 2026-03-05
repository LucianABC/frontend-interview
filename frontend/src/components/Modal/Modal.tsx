import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.scss';
import Times from '../../assets/times.svg?react'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitEnabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, onSubmit, submitEnabled = false, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <Times height={24} />
          </button>
        </header>

        <section className={styles.content}>
          {children}
        </section>

        <footer className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submitBtn} onClick={onSubmit} disabled={!submitEnabled}>
            Save
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default Modal;