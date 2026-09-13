"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";

const STAFF_ROLES = ["admin", "sub_admin", "order_executive", "content_executive"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

type StaffUser = {
  _id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: StaffRole;
  state?: string;
};

const emptyForm = {
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  role: "sub_admin" as StaffRole,
};

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ role: StaffRole; state: string } | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      const response = await api.get("/user/staff");
      setStaff(response.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to load staff users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/user/staff", form);
      setForm(emptyForm);
      toast.success("Staff user created");
      await fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to create staff user");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (user: StaffUser) => {
    setEditingUserId(user._id);
    setDraft({ role: user.role, state: user.state || "Active" });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setDraft(null);
  };

  const updateStaff = async (user: StaffUser) => {
    if (!draft) return;

    setUpdatingUserId(user._id);
    try {
      await api.put(`/user/staff/${user._id}`, draft);
      setStaff((current) => current.map((item) => item._id === user._id ? { ...item, ...draft } : item));
      cancelEditing();
      toast.success("Staff user updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to update staff user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const deleteStaff = async (user: StaffUser) => {
    if (!window.confirm(`Delete ${user.email}?`)) return;
    try {
      await api.delete(`/user/staff/${user._id}`);
      setStaff((current) => current.filter((item) => item._id !== user._id));
      toast.success("Staff user deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to delete staff user");
    }
  };

  return (
    <section className="space-y-4 border-b pb-6">
      <div>
        <h2 className="text-xl font-semibold">Staff users</h2>
        <p className="text-sm text-muted-foreground">Create and manage admin team accounts.</p>
      </div>

      <form onSubmit={createStaff} className="grid gap-3 rounded-md border p-4 md:grid-cols-5">
        <input required type="text" placeholder="Full name" value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} className="rounded-md border bg-background p-2" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="rounded-md border bg-background p-2" />
        <input required minLength={6} type="password" placeholder="Temporary password" value={form.password} onChange={(event) => updateForm("password", event.target.value)} className="rounded-md border bg-background p-2" />
        <input type="tel" placeholder="Phone number" value={form.phoneNumber} onChange={(event) => updateForm("phoneNumber", event.target.value)} className="rounded-md border bg-background p-2" />
        <div className="flex gap-2">
          <select value={form.role} onChange={(event) => updateForm("role", event.target.value)} className="min-w-0 flex-1 rounded-md border bg-background p-2">
            {STAFF_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <Button type="submit" disabled={saving}>{saving ? "Saving" : "Add"}</Button>
        </div>
      </form>

      {loading ? <p className="text-sm text-muted-foreground">Loading staff users...</p> : staff.length === 0 ? <p className="text-sm text-muted-foreground">No staff users found.</p> : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>{staff.map((user) => {
              const isEditing = editingUserId === user._id;
              const isUpdating = updatingUserId === user._id;

              return <tr key={user._id} className="border-b last:border-0">
              <td className="p-3">{user.fullName || "N/A"}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3"><select value={isEditing && draft ? draft.role : user.role} disabled={!isEditing || isUpdating} onChange={(event) => setDraft((current) => current ? { ...current, role: event.target.value as StaffRole } : current)} className="rounded border bg-background p-1">{STAFF_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></td>
              <td className="p-3"><select value={isEditing && draft ? draft.state : user.state || "Active"} disabled={!isEditing || isUpdating} onChange={(event) => setDraft((current) => current ? { ...current, state: event.target.value } : current)} className="rounded border bg-background p-1"><option value="Active">Active</option><option value="Blocked">Blocked</option></select></td>
              <td className="flex gap-2 p-3">
                {isEditing ? <>
                  <Button type="button" size="sm" disabled={isUpdating} onClick={() => updateStaff(user)}>{isUpdating ? "Updating" : "Update"}</Button>
                  <Button type="button" variant="outline" size="sm" disabled={isUpdating} onClick={cancelEditing}>Cancel</Button>
                </> : <Button type="button" variant="outline" size="sm" disabled={editingUserId !== null} onClick={() => startEditing(user)}>Edit</Button>}
                <Button type="button" variant="destructive" size="sm" disabled={isUpdating} onClick={() => deleteStaff(user)}>Delete</Button>
              </td>
            </tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
