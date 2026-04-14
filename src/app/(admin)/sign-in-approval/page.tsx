"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import userApprovalService, { PendingUser } from "@/services/admin/userApproval";
import AcceptModal from "./AcceptModal";
import RejectModal from "./RejectModal";

export default function SignInApprovalPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [acceptModal, setAcceptModal] = useState<{
    isOpen: boolean;
    user: PendingUser | null;
  }>({ isOpen: false, user: null });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    user: PendingUser | null;
  }>({ isOpen: false, user: null });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApprovalService.fetchPendingUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = (user: PendingUser) => {
    setAcceptModal({ isOpen: true, user });
  };

  const handleRejectClick = (user: PendingUser) => {
    setRejectModal({ isOpen: true, user });
  };

  const handleAcceptConfirm = async (role: string) => {
    if (!acceptModal.user) return;

    try {
      await userApprovalService.approveUser(acceptModal.user.id, role);
      setUsers(users.filter((u) => u.id !== acceptModal.user!.id));
      toast.success("Check your email for a sign-in link.");
      setAcceptModal({ isOpen: false, user: null });
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.user) return;

    try {
      await userApprovalService.rejectUser(rejectModal.user.id);
      setUsers(users.filter((u) => u.id !== rejectModal.user!.id));
      toast.success("Check your email for a sign-in link.");
      setRejectModal({ isOpen: false, user: null });
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Sign In Approval</h1>
      {users.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.surname}</td>
                <td>
                  <button onClick={() => handleAcceptClick(user)}>Accept</button>
                  <button onClick={() => handleRejectClick(user)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AcceptModal
        isOpen={acceptModal.isOpen}
        userEmail={acceptModal.user?.email || ""}
        onConfirm={handleAcceptConfirm}
        onCancel={() => setAcceptModal({ isOpen: false, user: null })}
      />

      <RejectModal
        isOpen={rejectModal.isOpen}
        userEmail={rejectModal.user?.email || ""}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectModal({ isOpen: false, user: null })}
      />
    </div>
  );
}
