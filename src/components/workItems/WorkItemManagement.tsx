import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Building2,
  User,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { MEPCategory, WorkItem } from '../../types';

export const WorkItemManagement: React.FC = () => {
  const { workItems, buildings, addWorkItem, updateWorkItem, deleteWorkItem, isManager, t } =
    useProject();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);

  const subcategoryPresets: Record<MEPCategory, string[]> = {
    ELECTRICAL: [
      'Cable Tray & Conduit',
      'Cable Pulling',
      'Lighting Installation',
      'Power Outlet',
      'Electrical Panel',
      'Grounding',
      'Lightning Protection',
      'Testing & Commissioning',
    ],
    MECHANICAL: [
      'HVAC',
      'Exhaust & Ventilation',
      'Mechanical Equipment',
      'Generator Set',
      'Solar Panel System',
    ],
    PLUMBING: [
      'Clean Water',
      'Hot Water',
      'Sanitary',
      'Waste Water',
      'Drainage',
      'STP',
      'SWRO',
      'Pump System',
    ],
    'ICT & ELV': [
      'Data Network',
      'Fiber Optic',
      'Wi-Fi',
      'CCTV',
      'Access Control',
      'Telephone',
      'Fire Alarm',
      'Audio System',
    ],
  };

  const [formData, setFormData] = useState({
    buildingId: buildings[0]?.id || 'vb-01',
    category: 'ELECTRICAL' as MEPCategory,
    subcategory: 'Cable Tray & Conduit',
    area: 'Interior',
    room: 'Master Suite',
    description: '',
    unit: 'meter',
    boqQuantity: 100,
    workWeight: 2.0,
    plannedStart: '2026-03-01',
    plannedFinish: '2026-04-15',
    contractor: 'PT. Mandiri Mega Elektrik',
    pic: 'Ir. Hendra Wijaya',
    status: 'In Progress' as WorkItem['status'],
  });

  const filteredItems = workItems.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchBld = selectedBuilding === 'ALL' || item.buildingId === selectedBuilding;
    const matchSearch =
      item.subcategory.toLowerCase().includes(search.toLowerCase()) ||
      item.buildingName.toLowerCase().includes(search.toLowerCase()) ||
      item.contractor.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchBld && matchSearch;
  });

  const handleOpenAdd = () => {
    if (!isManager) return alert(t('access_restricted'));
    setEditingItem(null);
    setFormData({
      buildingId: buildings[0]?.id || 'vb-01',
      category: 'ELECTRICAL',
      subcategory: subcategoryPresets.ELECTRICAL[0],
      area: 'Interior',
      room: 'Master Suite',
      description: '',
      unit: 'meter',
      boqQuantity: 100,
      workWeight: 2.0,
      plannedStart: '2026-03-01',
      plannedFinish: '2026-04-15',
      contractor: 'PT. Mandiri Mega Elektrik',
      pic: 'Ir. Hendra Wijaya',
      status: 'In Progress',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WorkItem) => {
    if (!isManager) return alert(t('access_restricted'));
    setEditingItem(item);
    setFormData({
      buildingId: item.buildingId,
      category: item.category,
      subcategory: item.subcategory,
      area: item.area,
      room: item.room,
      description: item.description,
      unit: item.unit,
      boqQuantity: item.boqQuantity,
      workWeight: item.workWeight,
      plannedStart: item.plannedStart,
      plannedFinish: item.plannedFinish,
      contractor: item.contractor,
      pic: item.pic,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isManager) return alert(t('access_restricted'));
    if (window.confirm(`Delete work item: ${name}?`)) {
      await deleteWorkItem(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === formData.buildingId);
    const buildingName = bld ? bld.name : 'Balak Facility';

    if (editingItem) {
      await updateWorkItem(editingItem.id, {
        buildingId: formData.buildingId,
        buildingName,
        category: formData.category,
        subcategory: formData.subcategory,
        area: formData.area,
        room: formData.room,
        description: formData.description,
        unit: formData.unit,
        boqQuantity: Number(formData.boqQuantity),
        workWeight: Number(formData.workWeight),
        plannedStart: formData.plannedStart,
        plannedFinish: formData.plannedFinish,
        contractor: formData.contractor,
        pic: formData.pic,
        status: formData.status,
      });
    } else {
      await addWorkItem({
        buildingId: formData.buildingId,
        buildingName,
        category: formData.category,
        subcategory: formData.subcategory,
        area: formData.area,
        room: formData.room,
        description: formData.description,
        unit: formData.unit,
        boqQuantity: Number(formData.boqQuantity),
        workWeight: Number(formData.workWeight),
        completedQuantity: 0,
        progressPercentage: 0,
        plannedStart: formData.plannedStart,
        plannedFinish: formData.plannedFinish,
        contractor: formData.contractor,
        pic: formData.pic,
        status: formData.status,
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
            <Cpu className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_work_items')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Bill of Quantities (BOQ), Assigned Weights & Master Work Item Repository
          </p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Item</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
          <input
            type="text"
            placeholder="Search subcategory, contractor, building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="PLUMBING">PLUMBING</option>
            <option value="ICT & ELV">ICT & ELV</option>
          </select>

          {/* Building Dropdown */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
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

      {/* Master Table */}
      <div className="rounded-2xl bg-[#142238] border border-[#1f3556] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101B2E] text-[#94A8C2] uppercase text-[10px] tracking-wider border-b border-[#1f3556]">
              <tr>
                <th className="py-3 px-4">Code / Category</th>
                <th className="py-3 px-4">Subcategory & Description</th>
                <th className="py-3 px-4">Building & Room</th>
                <th className="py-3 px-4 text-right">BOQ Qty</th>
                <th className="py-3 px-4 text-right">Weight</th>
                <th className="py-3 px-4 text-center">Progress %</th>
                <th className="py-3 px-4">Contractor / PIC</th>
                <th className="py-3 px-4">Status</th>
                {isManager && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f3556]/60">
              {filteredItems.map((item) => {
                const categoryColor =
                  item.category === 'ELECTRICAL'
                    ? 'text-[#00E5FF]'
                    : item.category === 'MECHANICAL'
                    ? 'text-[#2979FF]'
                    : item.category === 'PLUMBING'
                    ? 'text-[#00D8B4]'
                    : 'text-[#FFB74D]';

                return (
                  <tr key={item.id} className="hover:bg-[#101B2E]/50 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] text-[#94A8C2] block">
                        {item.id}
                      </span>
                      <span className={`font-bold text-[11px] ${categoryColor}`}>
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-[#F3F7FF] block">
                        {item.subcategory}
                      </span>
                      <span className="text-[11px] text-[#94A8C2] line-clamp-1">
                        {item.description}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#F3F7FF] block">
                        {item.buildingName}
                      </span>
                      <span className="text-[11px] text-[#94A8C2]">{item.room}</span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-[#F3F7FF]">
                      {item.completedQuantity} / {item.boqQuantity}{' '}
                      <span className="text-[10px] text-[#94A8C2]">{item.unit}</span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-[#00E5FF]">
                      {item.workWeight}%
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-[10px] font-bold text-[#F3F7FF] mb-1">
                          <span>{item.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-[#101B2E] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#00E5FF] to-[#00D8B4] h-full rounded-full"
                            style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-[#F3F7FF] block">
                        {item.contractor}
                      </span>
                      <span className="text-[10px] text-[#94A8C2]">{item.pic}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Completed'
                            ? 'bg-[#00D8B4]/20 text-[#00D8B4] border border-[#00D8B4]/40'
                            : item.status === 'In Progress'
                            ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                            : 'bg-[#FFB74D]/20 text-[#FFB74D] border border-[#FFB74D]/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {isManager && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded-lg text-[#94A8C2] hover:text-[#00E5FF] mr-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.subcategory)}
                          className="p-1 rounded-lg text-[#94A8C2] hover:text-[#FF526B]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
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
              {editingItem ? 'Edit Master MEP Work Item' : 'Add New MEP Work Item'}
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
                    MEP Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as MEPCategory;
                      setFormData({
                        ...formData,
                        category: newCat,
                        subcategory: subcategoryPresets[newCat][0],
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="MECHANICAL">MECHANICAL</option>
                    <option value="PLUMBING">PLUMBING</option>
                    <option value="ICT & ELV">ICT & ELV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Subcategory *
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                >
                  {subcategoryPresets[formData.category].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Area / Zone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Room
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    BOQ Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.boqQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, boqQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. meter, unit, set"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Work Weight (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.workWeight}
                    onChange={(e) =>
                      setFormData({ ...formData, workWeight: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
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
                    PIC Engineer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pic}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Planned Start
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.plannedStart}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedStart: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Planned Finish
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.plannedFinish}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedFinish: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Scope & Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                  {editingItem ? 'Update BOQ Item' : 'Add to Master BOQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
