import React, { forwardRef } from 'react';
import styles from './InputWithButton.module.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  onAction: () => void;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary'; // Las dos opciones
  buttonLabel?: string;
}

const InputWithButton = forwardRef<HTMLInputElement, Props>(
  ({ onAction, icon, variant = 'primary', buttonLabel, ...inputProps }, ref) => {
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onAction();
      if (inputProps.onKeyDown) inputProps.onKeyDown(e);
    };

    // Combinamos las clases dinámicamente
    const containerClass = `${styles.container} ${styles[variant]}`;

    return (
      <div className={containerClass}>
        <input
          ref={ref}
          className={styles.input}
          onKeyDown={handleKeyDown}
          {...inputProps}
        />
        <button 
          type="button"
          className={styles.button} 
          onClick={onAction}
          aria-label={buttonLabel}
        >
          <div className={styles.iconWrapper}>
            {icon}
          </div>
        </button>
      </div>
    );
  }
);

InputWithButton.displayName = 'InputWithButton';

export default InputWithButton;