export interface PendingUser {
  id: string;
  email: string;
  name: string;
  surname: string;
}

const userApprovalService = {
  async fetchPendingUsers(): Promise<PendingUser[]> {
    const response = await fetch("/api/admin/pending-users");
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async approveUser(userId: string, role: string): Promise<void> {
    const response = await fetch(`/api/admin/approve/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error("Failed to approve user");
  },

  async rejectUser(userId: string): Promise<void> {
    const response = await fetch(`/api/admin/reject/${userId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to reject user");
  },
};

export default userApprovalService;
