"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getStaffUsers, updateStaffRole , logActivity } from "@/lib/firestore";
import { UserProfile, UserRole, UserStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { toast } from "sonner";
import { Shield, Mail, Trash2, Ban, CheckCircle, RefreshCcw } from "lucide-react";

export default function StaffManagementPage() {
  const { userRole, user } = useAuth();
  const [staffUsers, setStaffUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Staff State
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Users who can manage other staff (but not self)
  const canManage = userRole === "owner_admin" || userRole === "developer_admin" || userRole === "partner_admin";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const usersData = await getStaffUsers();
      setStaffUsers(usersData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      toast.error("Name, email, and password are required.");
      return;
    }
    
    if (staffPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!canManage) {
      toast.error("You do not have permission to add staff.");
      return;
    }

    setIsAdding(true);
    try {
      const token = await user?.getIdToken();
      
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          phone: staffPhone,
          password: staffPassword,
          permissions: [], // For now, empty array. Expand later if needed.
          status: "active"
        }),
      });

      let data; try { data = await res.json(); } catch { throw new Error("Server error " + res.status); }
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff.");
      }

      toast.success("Staff account created successfully.");
      setStaffName("");
      setStaffEmail("");
      setStaffPhone("");
      setStaffPassword("");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create staff.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdateStatus(uid: string, currentStatus: string | undefined, newStatus: UserStatus) {
    if (!canManage) return;
    if (uid === user?.uid) {
      toast.error("You cannot change your own status.");
      return;
    }
    const msg = `Are you sure you want to change this user's status to ${newStatus}?`;
    if (!confirm(msg)) return;

    try {
      const targetUser = staffUsers.find(u => u.uid === uid);
      if (!targetUser) return;
      await updateStaffRole(uid, targetUser.role || "staff", newStatus);
      toast.success(`User status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  }

  async function handleUpdateRole(uid: string, currentRole: string | undefined, newRole: UserRole) {
    if (!canManage) return;
    if (uid === user?.uid) {
      toast.error("You cannot change your own role.");
      return;
    }
    const msg = `Are you sure you want to change this user's role to ${newRole}?`;
    if (!confirm(msg)) return;

    try {
      const targetUser = staffUsers.find(u => u.uid === uid);
      if (!targetUser) return;
      await updateStaffRole(uid, newRole, targetUser.status || "active");
      toast.success(`User role updated to ${newRole}.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role.");
    }
  }

  if (loading) {
    return (
      <Protected allowedRoles={["owner_admin", "partner_admin", "developer_admin"]}>
        <div className="flex h-[50vh] items-center justify-center">
          <HeartLoader />
        </div>
      </Protected>
    );
  }

  return (
    <Protected allowedRoles={["owner_admin", "partner_admin", "developer_admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-adminSidebar tracking-tight mb-2">Staff Management</h1>
          <p className="text-adminMuted">Manage admin and staff accounts, roles, and access.</p>
        </div>

        {canManage && (
          <AdminCard className="p-6 bg-white border-adminBorder shadow-sm">
            <h2 className="text-lg font-serif font-semibold text-adminSidebar mb-4">Add New Staff</h2>
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold mb-1 block">
                  Name *
                </label>
                <Input 
                  value={staffName} 
                  onChange={(e) => setStaffName(e.target.value)} 
                  placeholder="Full Name"
                  required
                  className="rounded-xl border-adminBorder bg-white text-adminSidebar"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold mb-1 block">
                  Email Address *
                </label>
                <Input 
                  type="email" 
                  value={staffEmail} 
                  onChange={(e) => setStaffEmail(e.target.value)} 
                  placeholder="staff@example.com"
                  required
                  className="rounded-xl border-adminBorder bg-white text-adminSidebar"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold mb-1 block">
                  Phone (Optional)
                </label>
                <Input 
                  type="tel" 
                  value={staffPhone} 
                  onChange={(e) => setStaffPhone(e.target.value)} 
                  placeholder="+1234567890"
                  className="rounded-xl border-adminBorder bg-white text-adminSidebar"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold mb-1 block">
                  Temporary Password *
                </label>
                <Input 
                  type="text" 
                  value={staffPassword} 
                  onChange={(e) => setStaffPassword(e.target.value)} 
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  className="rounded-xl border-adminBorder bg-white text-adminSidebar"
                />
              </div>
              
              <div className="md:col-span-2 pt-2">
                <Button type="submit" disabled={isAdding} className="w-full md:w-auto bg-adminRose text-white hover:bg-adminRose/90 border-none rounded-full shadow-md">
                  {isAdding ? "Creating Account..." : "Create Staff Account"}
                </Button>
              </div>
            </form>
            <p className="text-xs text-adminMuted mt-4 bg-adminBg p-3 rounded-xl border border-adminBorder">
              <strong className="text-adminSidebar">Security Note:</strong> This creates a <code>staff</code> role account directly. The user can log in immediately with the email and temporary password provided above.
            </p>
          </AdminCard>
        )}

        <AdminCard className="p-0 overflow-hidden bg-white border-adminBorder shadow-sm">
          <div className="p-4 border-b border-adminBorder bg-adminBg flex items-center justify-between">
            <h2 className="font-serif font-semibold text-adminSidebar flex items-center gap-2">
              <Shield className="h-4 w-4 text-adminGold" /> Active Staff & Admins ({staffUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-adminBg border-b border-adminBorder text-[11px] uppercase tracking-wider text-adminMuted font-semibold">
                <tr>
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adminBorder">
                {staffUsers.map(staff => (
                  <tr key={staff.uid} className="hover:bg-adminBg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-adminSidebar">{staff.name || "Unknown"}</div>
                      <div className="text-xs text-adminMuted">{staff.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {canManage && staff.uid !== user?.uid && userRole === "developer_admin" ? (
                        <select 
                          className="text-xs border border-adminBorder rounded-lg px-2 py-1 bg-white text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                          value={staff.role}
                          onChange={(e) => handleUpdateRole(staff.uid, staff.role, e.target.value as UserRole)}
                        >
                          <option value="staff">Staff</option>
                          <option value="partner_admin">Partner Admin</option>
                          <option value="owner_admin">Owner Admin</option>
                          <option value="developer_admin">Dev Admin</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-adminBg border border-adminBorder px-2.5 py-0.5 text-xs font-semibold text-adminSidebar">
                          {staff.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        (staff.status || 'active') === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        staff.status === 'suspended' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {(staff.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-adminMuted">
                      {staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canManage && staff.uid !== user?.uid && (
                        <>
                          {(staff.status || 'active') === 'active' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(staff.uid, staff.status, "suspended")} title="Suspend" className="text-yellow-600 hover:bg-yellow-50">
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(staff.uid, staff.status, "active")} title="Reactivate" className="text-green-600 hover:bg-green-50">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(staff.uid, staff.status, "banned")} title="Ban" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </Protected>
  );
}
