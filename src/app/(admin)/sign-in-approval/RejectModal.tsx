"use client";

interface RejectModalProps {
  isOpen: boolean;
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RejectModal({
  isOpen,
  userEmail,
  onConfirm,
  onCancel,
}: RejectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog">
      <div className="modal-content">
        <h2>Are you sure?</h2>
        <p>Do you want to reject {userEmail}?</p>

        <div className="modal-actions">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
