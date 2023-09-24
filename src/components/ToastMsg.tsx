import React from 'react';

interface ToastProps {
  message: string | null | undefined;
  extraMessage: string | null | undefined;
  onClose: () => void;
}

const ToastMsg: React.FC<ToastProps> = ({ message, extraMessage, onClose }) => {
  return (
    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header">
        <strong className="me-auto">{extraMessage}</strong>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="toast"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
      <div className="toast-body">{message}</div>
    </div>
  );
};
  
  export default ToastMsg;