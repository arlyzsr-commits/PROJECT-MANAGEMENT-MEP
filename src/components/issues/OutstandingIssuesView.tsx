import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  Building2,
  Calendar,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Issue, IssuePriority, IssueStatus } from '../../types';

export const OutstandingIssuesView: React.FC = () => {
  const { issues, buildings, workItems, addIssue, updateIssue, deleteIssue, isManager, isSupervisor, t } =
    useProject();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBuilding, setFilterBuilding] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    buildingId: buildings[0]?.id || 'vb-01',
    room: 'Master Suite & Living Pavilion',
    workItemId: workItems[0]?.id || '',
    description: '',
    priority: 'High' as IssuePriority,
    responsiblePic: 'Ir. Hendra Wijaya',
    contractor: 'PT. Mandiri Mega Elektrik',
    targetCompletion: todayStr,
    actualCompletion: '',
    status: 'Open' as IssueStatus,
    remarks: '',
  });

  const filteredIssues = issues.filter((iss) => {
    const matchSearch =
      iss.description.toLowerCase().includes(search.toLowerCase()) ||
      iss.buildingName.toLowerCase().includes(search.toLowerCase()) ||
      iss.responsiblePic.toLowerCase().includes(search.toLowerCase()) ||
      iss.contractor.toLowerCase().includes(search.toLowerCase());
    const matchPrio = filterPriority === 'ALL' || iss.priority === filterPriority;
    const matchStatus = filterStatus === 'ALL' || iss.status === filterStatus;
    const matchBld = filterBuilding === 'ALL' || iss.buildingId === filterBuilding;
    return matchSearch && matchPrio && matchStatus && matchBld;
  });

  // Calculate overdue count
  const overdueCount = issues.filter((iss) => {
    if (iss.status === 'Resolved' || iss.status === 'Closed') return false;
    return iss.targetCompletion < todayStr;
  }).length;

  const handleOpenAdd = () => {
    if (!isManager && !isSupervisor) return alert(t('access_restricted'));
    setEditingIssue(null);
    setFormData({
      buildingId: buildings[0]?.id || 'vb-01',
      room: 'Master Suite & Living Pavilion',
      workItemId: workItems[0]?.id || '',
      description: '',
      priority: 'High',
      responsiblePic: 'Ir. Hendra Wijaya',
      contractor: 'PT. Mandiri Mega Elektrik',
      targetCompletion: todayStr,
      actualCompletion: '',
      status: 'Open',
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (iss: Issue) => {
    if (!isManager && !isSupervisor) return alert(t('access_restricted'));
    setEditingIssue(iss);
    setFormData({
      buildingId: iss.buildingId,
      room: iss.room,
      workItemId: iss.workItemId || '',
      description: iss.description,
      priority: iss.priority,
      responsiblePic: iss.responsiblePic,
      contractor: iss.contractor,
      targetCompletion: iss.targetCompletion,
      actualCompletion: iss.actualCompletion || '',
      status: iss.status,
      remarks: iss.remarks,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isManager) return alert(t('access_restricted'));
    if (window.confirm('Delete this issue record?')) {
      await deleteIssue(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === formData.buildingId);
    const buildingName = bld ? bld.name : 'Balak Resort Villa';

    if (editingIssue) {
      await updateIssue(editingIssue.id, {
        buildingId: formData.buildingId,
        buildingName,
        room: formData.room,
        workItemId: formData.workItemId,
        description: formData.description,
        priority: formData.priority,
        responsiblePic: formData.responsiblePic,
        contractor: formData.contractor,
        targetCompletion: formData.targetCompletion,
        actualCompletion: formData.actualCompletion || undefined,
        status: formData.status,
        remarks: formData.remarks,
      });
    } else {
      await addIssue({
        buildingId: formData.buildingId,
        buildingName,
        room: formData.room,
        workItemId: formData.workItemId,
        description: formData.description,
        priority: formData.priority,
        responsiblePic: formData.responsiblePic,
        contractor: formData.contractor,
        targetCompletion: formData.targetCompletion,
        actualCompletion: formData.actualCompletion || undefined,
        status: formData.status,
        remarks: formData.remarks,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FF526B]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_issues')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Site Constraints, Clash Clearances, Material Delays & Outstanding MEP Items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF526B]/20 border border-[#FF526B]/40 text-xs font-bold text-[#FF526B]">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{overdueCount} Overdue Items</span>
            </div>
          )}

          {(isManager || isSupervisor) && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF526B] to-[#FFB74D] text-[#080F1D] text-xs font-bold shadow-[0_0_15px_rgba(255,82,107,0.3)] hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Outstanding Issue</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
          <input
            type="text"
            placeholder="Search issue description, building, PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none max-w-[180px]"
          >
            <option value="ALL">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="rounded-2xl bg-[#142238] border border-[#1f3556] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101B2E] text-[#94A8C2] uppercase text-[10px] tracking-wider border-b border-[#1f3556]">
              <tr>
                <th className="py-3 px-4">Priority & ID</th>
                <th className="py-3 px-4">Building & Room</th>
                <th className="py-3 px-4">Constraint Description</th>
                <th className="py-3 px-4">Assigned Contractor & PIC</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Corrective Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f3556]/60">
              {filteredIssues.map((issue) => {
                const isOverdue =
                  (issue.status === 'Open' || issue.status === 'In Progress') &&
                  issue.targetCompletion < todayStr;

                return (
                  <tr key={issue.id} className="hover:bg-[#101B2E]/50 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.priority === 'Critical'
                            ? 'bg-[#FF526B]/20 text-[#FF526B] border border-[#FF526B]/50'
                            : issue.priority === 'High'
                            ? 'bg-[#FFB74D]/20 text-[#FFB74D] border border-[#FFB74D]/50'
                            : issue.priority === 'Medium'
                            ? 'bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/50'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {issue.priority}
                      </span>
                      <span className="font-mono text-[10px] text-[#94A8C2] block mt-1">
                        {issue.id}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#F3F7FF] block">
                        {issue.buildingName}
                      </span>
                      <span className="text-[10px] text-[#94A8C2]">{issue.room}</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-xs font-semibold text-[#F3F7FF] leading-snug">
                        {issue.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-[#F3F7FF] block">
                        {issue.contractor}
                      </span>
                      <span className="text-[10px] text-[#94A8C2] flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-[#00E5FF]" /> {issue.responsiblePic}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          isOverdue ? 'text-[#FF526B] font-bold' : 'text-[#94A8C2]'
                        }`}
                      >
                        {issue.targetCompletion}
                      </span>
                      {isOverdue && (
                        <span className="block text-[9px] text-[#FF526B] font-bold uppercase">
                          Overdue
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.status === 'Resolved' || issue.status === 'Closed'
                            ? 'bg-[#00D8B4]/20 text-[#00D8B4] border border-[#00D8B4]/40'
                            : issue.status === 'In Progress'
                            ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                            : 'bg-[#FF526B]/20 text-[#FF526B] border border-[#FF526B]/40'
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs text-[11px] text-[#94A8C2]">
                      <p className="line-clamp-2">{issue.remarks || 'Under coordination'}</p>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {(isManager || isSupervisor) && (
                        <button
                          onClick={() => handleOpenEdit(issue)}
                          className="p-1 text-[#94A8C2] hover:text-[#00E5FF] mr-1"
                          title="Edit Issue"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isManager && (
                        <button
                          onClick={() => handleDelete(issue.id)}
                          className="p-1 text-[#94A8C2] hover:text-[#FF526B]"
                          title="Delete Issue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#142238] border border-[#00E5FF]/40 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A8C2] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#F3F7FF] mb-4">
              {editingIssue ? 'Update Outstanding Site Issue' : 'Log New Outstanding MEP Issue'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Building *
                  </label>
                  <select
                    value={formData.buildingId}
                    onChange={(e) =>
                      setFormData({ ...formData, buildingId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Room / Zone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Constraint Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the clash, material shortage, or technical roadblock..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as IssuePriority,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as IssueStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Contractor
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contractor}
                    onChange={(e) =>
                      setFormData({ ...formData, contractor: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Responsible PIC
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsiblePic}
                    onChange={(e) =>
                      setFormData({ ...formData, responsiblePic: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetCompletion}
                    onChange={(e) =>
                      setFormData({ ...formData, targetCompletion: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Actual Completion Date (If closed)
                  </label>
                  <input
                    type="date"
                    value={formData.actualCompletion}
                    onChange={(e) =>
                      setFormData({ ...formData, actualCompletion: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Corrective Actions & Follow-up Plan
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#1f3556] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#101B2E] text-xs font-semibold text-[#94A8C2] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
                >
                  {editingIssue ? 'Update Issue' : 'Record Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
