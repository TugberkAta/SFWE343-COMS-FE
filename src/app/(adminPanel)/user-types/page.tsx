"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import useFetchData from "@/hooks/use-fetch-data";
import getUserRoles from "@/services/users/get-user-roles";
import createUserRole from "@/services/users/post-user-role";
import updateUserRole from "@/services/users/put-user-role";
import deleteUserRole from "@/services/users/delete-user-role";
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import type { UserRoleDetailed } from "@/types/user-role-detailed";

export default function UserTypesPage() {
  const [loading, errored, data, refetch] = useFetchData(getUserRoles, []);

  const roles: UserRoleDetailed[] = data || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRoleDetailed | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const openCreate = () => {
    setEditingRole(null);
    setName("");
    setSelected([]);
    setDialogOpen(true);
  };

  const openEdit = (role: UserRoleDetailed) => {
    setEditingRole(role);
    setName(role.userRole || "");
    setSelected(role.permissions_json || []);
    setDialogOpen(true);
  };

  const togglePermission = (perm: string) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { userRole: name, permissions_json: selected };
      if (editingRole && editingRole.userRoleId) {
        await updateUserRole(editingRole.userRoleId, payload);
      } else {
        await createUserRole(payload);
      }
      await refetch();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this role?")) return;
    try {
      await deleteUserRole(id);
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const permissionGroups = useMemo(() => Object.entries(ENDPOINT_PERMISSIONS), []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">User Types</h1>
          <p className="text-sm text-muted-foreground">Manage role-based permission groups</p>
        </div>

        <div>
          <Button onClick={openCreate}>Create type</Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Permissions</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.userRoleId} className="border-t">
                    <td className="px-4 py-3">{r.userRole}</td>
                    <td className="px-4 py-3">
                      <span className="bg-muted px-2 py-1 rounded-full text-xs">
                        {Array.isArray(r.permissions_json) ? r.permissions_json.length : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openEdit(r)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(r.userRoleId)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit type" : "Create type"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-2">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Permissions</label>
              <div className="grid gap-4 mt-2">
                {permissionGroups.map(([groupName, group]) => (
                  <div key={groupName} className="border rounded p-3">
                    <div className="font-semibold mb-2">{groupName}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(group as Record<string, string>).map(([key, perm]) => (
                        <label key={perm} className="flex items-center gap-2">
                          <Checkbox
                            checked={selected.includes(perm)}
                            onCheckedChange={(v) => togglePermission(perm)}
                          />
                          <span className="text-sm">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
