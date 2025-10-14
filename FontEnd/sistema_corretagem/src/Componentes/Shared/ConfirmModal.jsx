import React from "react";

export default function ConfirmModal({
  isOpen,
  title = "Confirmar",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="modal-content">
        {title && <h3 id="confirm-modal-title">{title}</h3>}
        {message && <p>{message}</p>}
        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}