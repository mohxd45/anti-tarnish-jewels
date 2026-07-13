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
            <h1 className="font-serif text-3xl text-adminSidebar tracking-tight font-semibold mb-2">Activity Logs</h1>
            <p className="text-adminMuted">
              {isDevAdmin ? "View all admin and staff activity across the system." : "View staff activity."}
            </p>
          </div>
        </div>

        <AdminCard className="p-0 overflow-hidden bg-white border-adminBorder shadow-sm">
          <div className="p-4 border-b border-adminBorder bg-adminBg/50 flex items-center justify-between">
            <h2 className="font-semibold text-adminSidebar flex items-center gap-2 font-serif text-lg">
              <Activity className="h-4 w-4" /> System Audit Trail
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-adminMuted" />
              <Input
                type="text"
                placeholder="Search logs..."
                className="pl-9 h-9 w-64 text-sm bg-white border-adminBorder text-adminSidebar rounded-full focus:ring-1 focus:ring-adminGold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-adminBg/80 border-b border-adminBorder text-adminMuted font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-48">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adminBorder">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-adminBg/40 transition-colors">
                    <td className="px-6 py-4 text-xs text-adminMuted">
                      {log.createdAt && typeof log.createdAt === 'object' && 'toDate' in log.createdAt 
                        ? log.createdAt.toDate().toLocaleString()
                        : new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-adminSidebar">{log.actorName}</div>
                      <div className="text-xs text-adminMuted mt-0.5">{log.actorEmail} ({log.actorRole})</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-adminSidebar">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-adminGold/10 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-adminGold border border-adminGold/20">
                        {log.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-adminMuted">
                      {log.documentChanged}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-adminMuted">
                      <div className="flex flex-col items-center justify-center">
                        <Activity className="h-8 w-8 text-adminMuted/50 mb-3" />
                        <p>No activity logs found.</p>
                      </div>
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
