"use client";

import { useEffect, useState, useMemo } from "react";
import { Protected } from "@/components/Protected";
import { getUsers, updateUser, getAllOrders , logActivity } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { Search, ShieldAlert, UserCheck, Shield, Users, ExternalLink } from "lucide-react";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { toast } from "sonner";
import Link from "next/link";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  totalSpent?: number;
  blocked?: boolean;
  createdAt?: string;
  phone?: string;
  loginMethod?: string;
  lastLoginAt?: string;
  photoURL?: string;
  lastOrderDate?: string;
  ordersCount?: number;
  isGuest?: boolean;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Per-item loading states
  const [restrictLoadingId, setRestrictLoadingId] = useState<string | null>(null);

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
      const lastOrders: Record<string, string> = {};
      
      const guestCustomersMap: Record<string, UserProfile> = {};

      allOrders.forEach(order => {
        let identifier = order.userId;
        const email = order.customerEmail?.toLowerCase();
        const phone = order.customerPhone;

        // If the order has a userId, we map it directly
        if (identifier) {
          counts[identifier] = (counts[identifier] || 0) + 1;
          spends[identifier] = (spends[identifier] || 0) + order.total;
          
          if (!lastOrders[identifier] || new Date(order.createdAt) > new Date(lastOrders[identifier])) {
            lastOrders[identifier] = order.createdAt;
          }
        } else if (email || phone) {
          // It's a guest order
          identifier = email || phone || "";
          if (identifier) {
            counts[identifier] = (counts[identifier] || 0) + 1;
            spends[identifier] = (spends[identifier] || 0) + order.total;
            
            if (!lastOrders[identifier] || new Date(order.createdAt) > new Date(lastOrders[identifier])) {
              lastOrders[identifier] = order.createdAt;
            }

            if (!guestCustomersMap[identifier]) {
              guestCustomersMap[identifier] = {
                uid: `guest_${identifier}`,
                email: email || "",
                phone: phone || "",
                displayName: order.customerName || "Guest Customer",
                role: "customer",
                isGuest: true,
                createdAt: order.createdAt
              };
            }
          }
        }
      });
  
      const registeredEmails = new Set(allUsers.map((u: any) => u.email?.toLowerCase()));

      const mappedUsers: UserProfile[] = allUsers.map((u: any) => ({
        ...u,
        totalSpent: u.totalSpent !== undefined ? u.totalSpent : (spends[u.uid] || spends[u.email?.toLowerCase()] || 0),
        ordersCount: counts[u.uid] || counts[u.email?.toLowerCase()] || 0,
        lastOrderDate: lastOrders[u.uid] || lastOrders[u.email?.toLowerCase()]
      }));

      // Add guest customers that are not registered
      Object.values(guestCustomersMap).forEach(guest => {
        if (!registeredEmails.has(guest.email.toLowerCase())) {
          mappedUsers.push({
            ...guest,
            totalSpent: spends[guest.email] || spends[guest.phone || ""] || 0,
            ordersCount: counts[guest.email] || counts[guest.phone || ""] || 0,
            lastOrderDate: lastOrders[guest.email] || lastOrders[guest.phone || ""]
          });
        }
      });

      // Sort by latest order or created date
      mappedUsers.sort((a, b) => {
        const dateA = new Date(a.lastOrderDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.lastOrderDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

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

  const filteredUsers = users.filter(u => {
    const name = u.displayName || "";
    const email = u.email || "";
    const phone = u.phone || "";
    const query = search.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || phone.toLowerCase().includes(query);
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalRegistered = users.filter(u => !u.isGuest).length;
  const totalGuests = users.filter(u => u.isGuest).length;
  const totalAdmins = users.filter(u => u.role !== "customer").length;

  return (
    <Protected adminOnly>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-adminSidebar tracking-tight">Users & Customers</h1>
            <p className="text-adminMuted mt-1">Manage users, view customer spendings, and track guest checkouts.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-adminMuted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="pl-9 w-full sm:w-64 bg-white border-adminBorder text-adminSidebar rounded-full text-xs"
            />
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-2xl border border-adminBorder bg-white shadow-sm flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-adminMuted font-semibold">Total Registered</span>
            <span className="text-3xl font-serif font-semibold text-adminSidebar mt-1">{totalRegistered}</span>
          </div>
          <div className="p-4 rounded-2xl border border-adminBorder bg-white shadow-sm flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-adminMuted font-semibold">Guest Customers</span>
            <span className="text-3xl font-serif font-semibold text-adminSidebar mt-1">{totalGuests}</span>
          </div>
          <div className="p-4 rounded-2xl border border-adminBorder bg-white shadow-sm flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-adminMuted font-semibold">Staff & Admins</span>
            <span className="text-3xl font-serif font-semibold text-adminGold mt-1">{totalAdmins}</span>
          </div>
        </div>

        <AdminCard className="p-0 overflow-hidden border border-adminBorder shadow-sm bg-white">
          {loading ? (
            <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
              <HeartLoader text="Retrieving customer records..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-adminBg w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-adminMuted" />
              </div>
              <h3 className="text-lg font-serif text-adminSidebar">No users found</h3>
              <p className="text-adminMuted text-sm mt-1">No customers match your search query.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold bg-adminBg">
                    <tr className="text-left border-b border-adminBorder">
                      <th className="px-4 py-3 pb-4">Customer</th>
                      <th className="px-4 py-3 pb-4">Role / Type</th>
                      <th className="px-4 py-3 pb-4">Last Order</th>
                      <th className="px-4 py-3 pb-4 text-center">Orders</th>
                      <th className="px-4 py-3 pb-4 text-right">Total Spent</th>
                      <th className="px-4 py-3 pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-adminBorder">
                    {paginatedUsers.map((user) => {
                      const isStaffOrAdmin = user.role !== "customer";
                      return (
                        <tr key={user.uid} className="hover:bg-adminBg/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="h-9 w-9 rounded-full object-cover border border-adminBorder" />
                              ) : (
                                <div className="h-9 w-9 rounded-full grid place-items-center text-white text-xs font-semibold bg-adminGold">
                                  {(user.displayName || "A")[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-adminSidebar">{user.displayName || "Anonymous User"}</div>
                                {user.email && <div className="text-xs text-adminMuted mt-0.5">{user.email}</div>}
                                {user.phone && <div className="text-xs text-adminMuted mt-0.5">{user.phone}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              isStaffOrAdmin
                                ? "bg-adminRose text-white"
                                : user.isGuest 
                                ? "bg-orange-50 text-orange-600 border border-orange-200"
                                : "bg-adminBg text-adminSidebar border border-adminBorder"
                            }`}>
                              {isStaffOrAdmin ? <Shield size={12} /> : null}
                              <span>{isStaffOrAdmin ? user.role.replace("_", " ") : (user.isGuest ? "Guest" : "Registered")}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-adminMuted">
                            {user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : "No orders"}
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-adminSidebar font-medium">
                            {user.ordersCount || 0}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums font-semibold text-adminSidebar">
                            {formatPrice(user.totalSpent || 0)}
                          </td>
                          <td className="px-4 py-4 text-right space-x-2">
                            {user.email && (
                              <Link href={`/admin/orders?search=${encodeURIComponent(user.email)}`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-adminMuted hover:text-adminSidebar hover:bg-adminBg">
                                  <ExternalLink size={14} className="mr-1.5" /> Orders
                                </Button>
                              </Link>
                            )}
                            
                            {!user.isGuest && !isStaffOrAdmin && (
                              <button
                                disabled={restrictLoadingId === user.uid}
                                onClick={() => handleToggleBlock(user.uid, !!user.blocked)}
                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors ${
                                  user.blocked
                                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    : "bg-adminBg hover:bg-adminBg/80 text-adminSidebar border border-adminBorder"
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
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {filteredUsers.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between border-t border-adminBorder pt-4 mt-2 px-2">
                  <span className="text-xs text-adminMuted">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="h-8 text-xs rounded-xl border-adminBorder text-adminSidebar hover:bg-adminBg"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage * ITEMS_PER_PAGE >= filteredUsers.length}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="h-8 text-xs rounded-xl border-adminBorder text-adminSidebar hover:bg-adminBg"
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
