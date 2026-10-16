import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  MapPin,
  Calendar,
  User,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Building } from '../../types';

export const LocationManagement: React.FC = () => {
  const { buildings, workItems, addBuilding, updateBuilding, deleteBuilding, isManager, t } =
    useProject();
  const { role } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    buildingType: 'Hillside Luxury Villa',
    zone: 'Zone 1 - Hill Crest',
    floorCount: 2,
    rooms: 'Master Suite, Living Pavilion, Pool Deck, Utility Shaft',
    description: '',
    pic: 'Ir. Hendra Wijaya',
    targetStartDate: '2026-02-01',
    targetFinishDate: '2026-11-30',
    status: 'Active' as Building['status'],
  });

  const zones = [
    'ALL',
    'Zone 1 - Hill Crest',
    'Zone 2 - Lagoon & Reef',
    'Zone 3 - Coastal Strip',
    'Zone 4 - Utility Center',
    'Zone 5 - Arrival',
  ];

  const filteredBuildings = buildings.filter((b) => {
    const matchZone = selectedZone === 'ALL' || b.zone === selectedZone;
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.buildingType.toLowerCase().includes(search.toLowerCase()) ||
      b.pic.toLowerCase().includes(search.toLowerCase());
    return matchZone && matchSearch;
  });

  const handleOpenAdd = () => {
    if (!isManager) {
      alert(t('access_restricted'));
      return;
    }
    setEditingBuilding(null);
    setFormData({
      name: '',
      buildingType: 'Hillside Luxury Villa',
      zone: 'Zone 1 - Hill Crest',
      floorCount: 2,
      rooms: 'Master Suite, Living Pavilion, Pool Deck, Utility Shaft',
      description: '',
      pic: 'Ir. Hendra Wijaya',
      targetStartDate: '2026-02-01',
      targetFinishDate: '2026-11-30',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Building) => {
    if (!isManager) {
      alert(t('access_restricted'));
      return;
    }
    setEditingBuilding(b);
    setFormData({
      name: b.name,
      buildingType: b.buildingType,
      zone: b.zone,
      floorCount: b.floorCount,
      rooms: b.rooms?.join(', ') || '',
      description: b.description,
      pic: b.pic,
      targetStartDate: b.targetStartDate,
      targetFinishDate: b.targetFinishDate,
      status: b.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isManager) return alert(t('access_restricted'));
    if (window.confirm(`Are you sure you want to deactivate or remove ${name}?`)) {
      await deleteBuilding(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomsList = formData.rooms
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    if (editingBuilding) {
      await updateBuilding(editingBuilding.id, {
        name: formData.name,
        buildingType: formData.buildingType,
        zone: formData.zone,
        floorCount: Number(formData.floorCount),
        rooms: roomsList,
        description: formData.description,
        pic: formData.pic,
        targetStartDate: formData.targetStartDate,
        targetFinishDate: formData.targetFinishDate,
        status: formData.status,
      });
    } else {
      await addBuilding({
        name: formData.name,
        buildingType: formData.buildingType,
        zone: formData.zone,
        floorCount: Number(formData.floorCount),
        rooms: roomsList,
        description: formData.description,
        pic: formData.pic,
        targetStartDate: formData.targetStartDate,
        targetFinishDate: formData.targetFinishDate,
        status: formData.status,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_locations')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Hierarchy: Project (Balak Resort) → Building → Zone / Floor → Rooms → MEP Systems
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isManager && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Zone Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#142238] border border-[#1f3556]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
          <input
            type="text"
            placeholder="Search buildings, villas, or PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        {/* Zone Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                selectedZone === z
                  ? 'bg-[#00E5FF] text-[#080F1D] border-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                  : 'bg-[#101B2E] text-[#94A8C2] border-[#1f3556] hover:text-white'
              }`}
            >
              {z === 'ALL' ? 'All Zones' : z.replace('Zone ', 'Z')}
            </button>
          ))}
        </div>
      </div>

      {/* Buildings List & Tree View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuildings.map((building) => {
          const isExpanded = expandedBuildingId === building.id;
          const buildingWorkItems = workItems.filter((w) => w.buildingId === building.id);
          const totalBOQ = buildingWorkItems.length;
          const completedBOQ = buildingWorkItems.filter((w) => w.status === 'Completed').length;
          const progressPct =
            totalBOQ > 0 ? Math.round((completedBOQ / totalBOQ) * 100) : 0;

          return (
            <div
              key={building.id}
              className="rounded-2xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/40 transition overflow-hidden shadow-md flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#1f3556]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider block">
                      {building.zone}
                    </span>
                    <h3 className="text-sm font-bold text-[#F3F7FF] mt-0.5">
                      {building.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      building.status === 'Active'
                        ? 'bg-[#00D8B4]/20 text-[#00D8B4] border border-[#00D8B4]/40'
                        : building.status === 'Completed'
                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                        : 'bg-[#FFB74D]/20 text-[#FFB74D] border border-[#FFB74D]/40'
                    }`}
                  >
                    {building.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#94A8C2] mt-2 line-clamp-2">
                  {building.description || building.buildingType}
                </p>
              </div>

              {/* Specs & Progress Bar */}
              <div className="p-4 space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A8C2]">MEP Execution</span>
                  <span className="font-bold text-[#00E5FF]">
                    {completedBOQ} / {totalBOQ} Completed ({progressPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#101B2E] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00E5FF] to-[#00D8B4] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-[#94A8C2]">
                    <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>{building.floorCount} Floor(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#94A8C2]">
                    <User className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="truncate">{building.pic}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#94A8C2] col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>
                      {building.targetStartDate} → {building.targetFinishDate}
                    </span>
                  </div>
                </div>

                {/* Rooms tree expander */}
                {building.rooms && building.rooms.length > 0 && (
                  <div className="pt-2 border-t border-[#1f3556]">
                    <button
                      onClick={() =>
                        setExpandedBuildingId(isExpanded ? null : building.id)
                      }
                      className="w-full flex items-center justify-between text-[11px] font-semibold text-[#00E5FF] hover:underline"
                    >
                      <span>
                        Assigned Rooms & Areas ({building.rooms.length})
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-1.5 pl-2 border-l border-[#00E5FF]/30">
                        {building.rooms.map((room, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-[#F3F7FF] flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00D8B4]" />
                            <span>{room}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-[#101B2E] border-t border-[#1f3556] flex items-center justify-end gap-2">
                {isManager ? (
                  <>
                    <button
                      onClick={() => handleOpenEdit(building)}
                      className="p-1.5 rounded-lg text-[#94A8C2] hover:text-[#00E5FF] hover:bg-[#142238] transition"
                      title="Edit Building"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(building.id, building.name)}
                      className="p-1.5 rounded-lg text-[#94A8C2] hover:text-[#FF526B] hover:bg-[#142238] transition"
                      title="Deactivate Building"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-[#94A8C2] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#00E5FF]" /> Read-Only
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#142238] border border-[#00E5FF]/40 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A8C2] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#F3F7FF] mb-4">
              {editingBuilding ? 'Edit Facility Structure' : 'Add New Resort Facility'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Building / Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Villa Bukit 16 or Marine Sports Annex"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Facility Type
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.buildingType}
                    onChange={(e) =>
                      setFormData({ ...formData, buildingType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Resort Zone
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="Zone 1 - Hill Crest">Zone 1 - Hill Crest</option>
                    <option value="Zone 2 - Lagoon & Reef">Zone 2 - Lagoon & Reef</option>
                    <option value="Zone 3 - Coastal Strip">Zone 3 - Coastal Strip</option>
                    <option value="Zone 4 - Utility Center">Zone 4 - Utility Center</option>
                    <option value="Zone 5 - Arrival">Zone 5 - Arrival</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Floor Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.floorCount}
                    onChange={(e) =>
                      setFormData({ ...formData, floorCount: Number(e.target.value) })
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

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Rooms / Areas (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom, Bath, Plant Room"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Target Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetStartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Target Finish Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetFinishDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetFinishDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Building['status'] })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Description & Specifications
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingBuilding ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
