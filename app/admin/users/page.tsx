"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getUsers, updateUser, getAllOrders } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { Search, ShieldAlert, UserCheck, Shield, Users } from "lucide-react";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { toast } from "sonner";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "customer";
  totalSpent?: number;
  blocked?: boolean;
  createdAt?: string;
  phone?: string;
  loginMethod?: string;
  lastLoginAt?: string;
  photoURL?: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userOrdersCount, setUserOrdersCount] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Per-item loading states
  const [restrictLoadingId, setRestrictLoadingId] = useState<string | null>(null);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function loadData() {
    setLoading(true);
    try {
      const allUsers = await getUsers();
      const allOrders = await getAllOrders();
      
      const counts: Record<string, number> = {};
      const spends: Record<string, number> = {};
      
      allOrders.forEach(order => {
        if (order.userId) {
          counts[order.userId] = (counts[order.userId] || 0) + 1;
          spends[order.userId] = (spends[order.userId] || 0) + order.total;
        }
      });
      
      setUserOrdersCount(counts);
  
      const mappedUsers = allUsers.map(u => ({
        ...u,
        totalSpent: u.totalSpent !== undefined ? u.totalSpent : (spends[u.uid] || 0)
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBlock(uid: string, currentBlocked: boolean) {
    const nextBlocked = !currentBlocked;
    const msg = nextBlocked 
      ? "Are you sure you want to block this user? They will lose access to login functions."
      : "Are you sure you want to unblock this user?";
    if (!confirm(msg)) return;

    setRestrictLoadingId(uid);
    try {
      await updateUser(uid, { blocked: nextBlocked });
      setUsers(users.map(u => u.uid === uid ? { ...u, blocked: nextBlocked } : u));
      toast.success(nextBlocked ? "User blocked." : "User unblocked.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user block status.");
    } finally {
      setRestrictLoadingId(null);
    }
  }

  async function handleRoleChange(uid: string, currentRole: "admin" | "customer") {
    const nextRole = currentRole === "admin" ? "customer" : "admin";
    const msg = `Are you sure you want to change this user's role to ${nextRole}?`;
    if (!confirm(msg)) return;

    setRoleLoadingId(uid);
    try {
      await updateUser(uid, { role: nextRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: nextRole } : u));
      toast.success(`Role changed to ${nextRole}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role.");
    } finally {
      setRoleLoadingId(null);
    }
  }

  const filteredUsers = users.filter(u => {
    const name = u.displayName || "";
    const email = u.email || "";
    const query = search.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalRegistered = users.length;
  const totalAdmins = users.filter(u => u.role === "admin").length;
  const totalBlocked = users.filter(u => u.blocked).length;

  return (
    <Protected adminOnly>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Users & Customers</h1>
            <p className="text-muted-foreground mt-1">Manage user roles and view customer spendings</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 w-full sm:w-64 bg-card/60 rounded-full text-xs"
            />
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card p-4 rounded-2xl border border-border/60 bg-card/40 shadow-sm flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Total Registered</span>
            <span className="text-3xl font-display font-semibold text-foreground mt-1">{totalRegistered}</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-border/60 bg-card/40 shadow-sm flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Administrators</span>
            <span className="text-3xl font-display font-semibold text-primary mt-1">{totalAdmins}</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-border/60 bg-card/40 shadow-sm flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Restricted Accounts</span>
            <span className="text-3xl font-display font-semibold text-dustyRose mt-1">{totalBlocked}</span>
          </div>
        </div>

        <AdminCard>
          {loading ? (
            <div className="p-12 flex justify-center items-center text-muted-foreground">
              <HeartLoader text="Retrieving customer records..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-secondary/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display text-foreground">No users found</h3>
              <p className="text-muted-foreground text-sm mt-1">No customers match your search query.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <tr className="text-left border-b border-border/40">
                      <th className="px-4 py-3 pb-4">Customer</th>
                      <th className="px-4 py-3 pb-4">Joined</th>
                      <th className="px-4 py-3 pb-4">Last Login</th>
                      <th className="px-4 py-3 pb-4">Role</th>
                      <th className="px-4 py-3 pb-4 text-center">Orders</th>
                      <th className="px-4 py-3 pb-4 text-right">Spent</th>
                      <th className="px-4 py-3 pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {paginatedUsers.map((user) => {
                      const ordersCount = userOrdersCount[user.uid] || 0;
                      return (
                        <tr key={user.uid} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="h-9 w-9 rounded-full object-cover border border-border" />
                              ) : (
                                <div className="h-9 w-9 rounded-full grid place-items-center text-white text-xs font-semibold" style={{ background: "var(--gradient-gold)" }}>
                                  {(user.displayName || "A")[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-foreground">{user.displayName || "Anonymous User"}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                                {user.phone && <div className="text-xs text-muted-foreground mt-0.5">{user.phone}</div>}
                                <div className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider">Method: {user.loginMethod || "Email"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-4 text-xs text-muted-foreground">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              disabled={roleLoadingId === user.uid || restrictLoadingId === user.uid}
                              onClick={() => handleRoleChange(user.uid, user.role)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors ${
                                user.role === "admin"
                                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {roleLoadingId === user.uid ? (
                                <HeartLoader size="sm" text="" />
                              ) : (
                                <Shield size={12} />
                              )}
                              <span>{user.role}</span>
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-foreground">
                            {ordersCount}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums font-semibold text-foreground">
                            {formatPrice(user.totalSpent || 0)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              disabled={roleLoadingId === user.uid || restrictLoadingId === user.uid}
                              onClick={() => handleToggleBlock(user.uid, !!user.blocked)}
                              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors w-24 ${
                                user.blocked
                                  ? "bg-dustyRose/10 text-dustyRose hover:bg-dustyRose/20"
                                  : "bg-secondary hover:bg-secondary/80 text-foreground"
                              }`}
                            >
                              {restrictLoadingId === user.uid ? (
                                <HeartLoader size="sm" text="" />
                              ) : user.blocked ? (
                                <>
                                  <ShieldAlert size={14} /> Blocked
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} /> Restrict
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {filteredUsers.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2 px-2">
                  <span className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="h-8 text-xs rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage * ITEMS_PER_PAGE >= filteredUsers.length}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="h-8 text-xs rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </AdminCard>
      </div>
    </Protected>
  );
}
