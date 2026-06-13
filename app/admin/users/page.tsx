"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getUsers, updateUser, getAllOrders } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { Search, ShieldAlert, UserCheck, Shield, ShoppingBag, Loader } from "lucide-react";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "customer";
  totalSpent?: number;
  blocked?: boolean;
  createdAt?: string;
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
      
      // Calculate order counts and expenditures dynamically from actual orders if not stored in user profile
      const counts: Record<string, number> = {};
      const spends: Record<string, number> = {};
      
      allOrders.forEach(order => {
        if (order.userId) {
          counts[order.userId] = (counts[order.userId] || 0) + 1;
          spends[order.userId] = (spends[order.userId] || 0) + order.total;
        }
      });
      
      setUserOrdersCount(counts);
  
      // Map users and ensure totalSpent is updated from orders if missing
      const mappedUsers = allUsers.map(u => ({
        ...u,
        totalSpent: u.totalSpent !== undefined ? u.totalSpent : (spends[u.uid] || 0)
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
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
    } catch (err) {
      console.error(err);
      alert("Failed to update user block status.");
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
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
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
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gold/15 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">Users & Customers</h1>
            <p className="text-sm text-cream/65 mt-1">Manage user roles, account restrictions, and view total customer spendings.</p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-full border border-gold/20 bg-charcoal/30 py-2.5 pl-11 pr-4 text-cream placeholder-cream/45 outline-none focus:border-gold/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <div className="rounded-[1.5rem] border border-gold/10 bg-white/[0.02] p-5">
            <span className="text-[10px] uppercase tracking-widest text-cream/50 block">Total Registered</span>
            <span className="text-3xl font-serif font-semibold text-gold mt-1 block">{totalRegistered}</span>
          </div>
          <div className="rounded-[1.5rem] border border-gold/10 bg-white/[0.02] p-5">
            <span className="text-[10px] uppercase tracking-widest text-cream/50 block">Administrators</span>
            <span className="text-3xl font-serif font-semibold text-emerald-400 mt-1 block">{totalAdmins}</span>
          </div>
          <div className="rounded-[1.5rem] border border-gold/10 bg-white/[0.02] p-5">
            <span className="text-[10px] uppercase tracking-widest text-cream/50 block">Restricted Accounts</span>
            <span className="text-3xl font-serif font-semibold text-rose mt-1 block">{totalBlocked}</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-[2rem] border border-gold/15 bg-white/[0.03]">
          {loading ? (
            <div className="p-12 text-center text-cream/60">Retrieving customer records...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-cream/60">No users found matching query.</div>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm text-cream/80">
              <thead className="bg-noir text-gold uppercase tracking-wider text-xs border-b border-gold/10">
                <tr>
                  <th className="p-5 font-semibold">User Info</th>
                  <th className="p-5 font-semibold">Joined At</th>
                  <th className="p-5 font-semibold">Account Role</th>
                  <th className="p-5 font-semibold text-center">Orders Count</th>
                  <th className="p-5 font-semibold text-right">Total Spent</th>
                  <th className="p-5 font-semibold text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {paginatedUsers.map((user) => {
                  const ordersCount = userOrdersCount[user.uid] || 0;
                  return (
                    <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Email */}
                      <td className="p-5">
                        <div className="font-semibold text-cream">{user.displayName || "Anonymous User"}</div>
                        <div className="text-xs text-cream/50 mt-0.5">{user.email}</div>
                      </td>

                      {/* Created At */}
                      <td className="p-5 text-cream/70">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                      </td>

                      {/* Account Role */}
                      <td className="p-5">
                        <button
                          disabled={roleLoadingId === user.uid || restrictLoadingId === user.uid}
                          onClick={() => handleRoleChange(user.uid, user.role)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border disabled:opacity-50 ${
                            user.role === "admin"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : "bg-charcoal text-cream/70 border-gold/15 hover:border-gold/45"
                          } transition-all`}
                        >
                          {roleLoadingId === user.uid ? (
                            <Loader className="animate-spin h-3 w-3" />
                          ) : (
                            <Shield size={12} />
                          )}
                          <span className="capitalize">{user.role}</span>
                        </button>
                      </td>

                      {/* Orders Count */}
                      <td className="p-5 text-center font-medium">
                        {ordersCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-gold">
                            <ShoppingBag size={12} /> {ordersCount}
                          </span>
                        ) : (
                          <span className="text-cream/40">0</span>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="p-5 text-right font-semibold text-cream">
                        {formatPrice(user.totalSpent || 0)}
                      </td>

                      {/* Status / Restrict Action */}
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={roleLoadingId === user.uid || restrictLoadingId === user.uid}
                            onClick={() => handleToggleBlock(user.uid, !!user.blocked)}
                            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
                              user.blocked
                                ? "bg-rose text-noir hover:bg-rose-light"
                                : "bg-rose/10 text-rose border border-rose/15 hover:bg-rose/25"
                            }`}
                          >
                            {restrictLoadingId === user.uid ? (
                              <Loader className="animate-spin h-3 w-3 text-noir" />
                            ) : user.blocked ? (
                              <>
                                <ShieldAlert size={12} /> Blocked
                              </>
                            ) : (
                              <>
                                <UserCheck size={12} /> Restrict
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredUsers.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-gold/15 pt-6 mt-6">
            <span className="text-xs text-cream/60">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-gold/20 bg-charcoal/30 px-4 py-2 text-xs font-semibold text-cream hover:border-gold/50 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button
                disabled={currentPage * ITEMS_PER_PAGE >= filteredUsers.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-full border border-gold/20 bg-charcoal/30 px-4 py-2 text-xs font-semibold text-cream hover:border-gold/50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </Protected>
  );
}
