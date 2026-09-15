'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  History,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  User,
  Globe,
  Tag,
  Clock,
  Layers,
  FileCode2,
  Package
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function AdminAuditLogsPage() {
  const { isRtl } = useStore();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = safeLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user?.name && log.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user?.email && log.user.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);

    return matchesSearch && matchesEntity && matchesAction;
  });

  const uniqueEntities = Array.from(new Set(safeLogs.map((l) => l.entityType))).filter(Boolean);
  const uniqueActions = Array.from(new Set(safeLogs.map((l) => l.action))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-purple-400" />
            <span>Immutable System Audit & Activity Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-resistant audit trail logging all product creation, category assignments, and inventory deltas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, user email, or entity ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Entities ({uniqueEntities.length})</option>
            {uniqueEntities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Creates</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletions</option>
            <option value="INVENTORY">Inventory Deltas</option>
            <option value="BULK">Bulk Operations</option>
          </select>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12"></th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity Type & ID</th>
                <th className="py-3.5 px-4">Admin Operator</th>
                <th className="py-3.5 px-4">Network IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  let parsedDetails = null;
                  if (log.details) {
                    try {
                      parsedDetails = JSON.parse(log.details);
                    } catch {
                      parsedDetails = log.details;
                    }
                  }

                  const isDanger =
                    log.action.includes('DELETE') || log.action.includes('ARCHIVE');
                  const isSuccess =
                    log.action.includes('CREATE') || log.action.includes('ACTIVATE');
                  const isWarning = log.action.includes('INVENTORY');

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-500">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              isDanger
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : isSuccess
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isWarning
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{log.entityType}</div>
                          {log.entityId && (
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                              id: {log.entityId}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200">
                            {log.user?.name || 'System Admin'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {log.user?.email || 'admin@hubcloud.eg'}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {log.ipAddress || 'internal'}
                        </td>
                      </tr>

                      {/* Expanded JSON Details Payload */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={6} className="p-4 border-y border-slate-800">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                                <span>Audit Payload Data:</span>
                              </div>
                              <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64">
                                {typeof parsedDetails === 'object'
                                  ? JSON.stringify(parsedDetails, null, 2)
                                  : parsedDetails || 'No additional payload logged.'}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
