"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getAuditLogs , logActivity } from "@/lib/firestore";
import { AuditLog } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { AdminCard } from "@/components/admin/Bits";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { toast } from "sonner";
import { Activity, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AuditLogsPage() {
  const { userRole } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isDevAdmin = userRole === "developer_admin";

  useEffect(() => {
    loadData();
  }, [userRole]);

  async function loadData() {
    setLoading(true);
    try {
      // If dev admin, fetch all logs. Otherwise, fetch only staff logs.
      const fetchedLogs = await getAuditLogs(isDevAdmin ? undefined : "staff");
      setLogs(fetchedLogs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => 
    log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[color:var(--color-espresso)] font-bold mb-2">Activity Logs</h1>
            <p className="text-[color:var(--color-muted-text)]">
              {isDevAdmin ? "View all admin and staff activity across the system." : "View staff activity."}
            </p>
          </div>
        </div>

        <AdminCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[color:var(--color-border)] bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-[color:var(--color-espresso)] flex items-center gap-2">
              <Activity className="h-4 w-4" /> System Audit Trail
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[color:var(--color-muted-text)]" />
              <Input
                type="text"
                placeholder="Search logs..."
                className="pl-9 h-9 w-64 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-[color:var(--color-border)] text-[color:var(--color-muted-text)] font-medium">
                <tr>
                  <th className="px-6 py-4 w-48">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-[color:var(--color-muted-text)]">
                      {log.createdAt && typeof log.createdAt === 'object' && 'toDate' in log.createdAt 
                        ? log.createdAt.toDate().toLocaleString()
                        : new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[color:var(--color-espresso)]">{log.actorName}</div>
                      <div className="text-xs text-[color:var(--color-muted-text)]">{log.actorEmail} ({log.actorRole})</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[color:var(--color-espresso)]">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-champagne/20 px-2.5 py-0.5 text-xs font-semibold text-charcoalBrown">
                        {log.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[color:var(--color-muted-text)]">
                      {log.documentChanged}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[color:var(--color-muted-text)]">
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </Protected>
  );
}
