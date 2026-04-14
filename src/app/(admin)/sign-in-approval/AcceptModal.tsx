"use client";

import { useState } from "react";

interface AcceptModalProps {
  isOpen: boolean;
  userEmail: string;
  onConfirm: (role: string) => void;
  onCancel: () => void;
}

export default function AcceptModal({
  isOpen,
  userEmail,
  onConfirm,
  onCancel,
}: AcceptModalProps) {
  const [selectedRole, setSelectedRole] = useState("user");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  return (
    <div className="modal-overlay" role="dialog">
      <div className="modal-content">
        <h2>Select Role</h2>
        <p>Approve {userEmail} with role:</p>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          role="combobox"
          aria-label="role"
          className="role-selector"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>

        <div className="modal-actions">
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
