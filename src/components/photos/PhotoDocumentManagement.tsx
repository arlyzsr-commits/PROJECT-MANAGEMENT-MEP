import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  RotateCw,
  MapPin,
  Calendar,
  User,
  Building2,
  Trash2,
  Maximize2,
  Download,
  Filter,
  X,
  Check,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { MEPCategory, PhotoDocument } from '../../types';

interface PhotoDocumentManagementProps {
  initialSelectedPhotoUrl?: string | null;
  onClearSelectedPhoto?: () => void;
}

export const PhotoDocumentManagement: React.FC<PhotoDocumentManagementProps> = ({
  initialSelectedPhotoUrl,
  onClearSelectedPhoto,
}) => {
  const {
    photoDocuments,
    buildings,
    workItems,
    addPhotoDocument,
    deletePhotoDocument,
    isManager,
    isSupervisor,
    t,
  } = useProject();
  const { currentUser } = useAuth();

  // Filters
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterContractor, setFilterContractor] = useState('ALL');
  const [search, setSearch] = useState('');

  // Camera & Upload Modal
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  // Lightbox Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<PhotoDocument | null>(null);

  // Sync initial photo if opened from dashboard
  useEffect(() => {
    if (initialSelectedPhotoUrl) {
      const match = photoDocuments.find((p) => p.photoUrl === initialSelectedPhotoUrl);
      if (match) setPreviewPhoto(match);
      else {
        setPreviewPhoto({
          id: 'temp',
          projectId: 'balak-resort-mep',
          buildingId: 'vb-01',
          buildingName: 'Balak Resort Villa',
          room: 'Site Area',
          category: 'ELECTRICAL',
          photoUrl: initialSelectedPhotoUrl,
          date: new Date().toLocaleString(),
          photographer: 'Field Supervisor',
          workDescription: 'Field Progress Inspection Photo',
          pic: 'Ir. Hendra Wijaya',
          contractor: 'PT. Mandiri Mega Elektrik',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [initialSelectedPhotoUrl]);

  // Form Fields
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id || 'vb-01');
  const [room, setRoom] = useState('Master Suite & Living');
  const [category, setCategory] = useState<MEPCategory>('ELECTRICAL');
  const [workDescription, setWorkDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [progressPct, setProgressPct] = useState<number>(85);
  const [contractor, setContractor] = useState('PT. Mandiri Mega Elektrik');
  const [pic, setPic] = useState('Ir. Hendra Wijaya');
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [gpsCoords, setGpsCoords] = useState<string>('');
  const [compressQuality, setCompressQuality] = useState<number>(0.75); // Controlled auto compression

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user') => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera access denied or device not supported. You can still upload photos from gallery.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleOpenCapture = () => {
    if (!isManager && !isSupervisor) return alert(t('access_restricted'));
    setIsCameraOpen(true);
    setCapturedDataUrl(null);
    startCamera(cameraFacing);

    // Optional GPS Coordinate request
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        () => console.log('Location permission omitted.')
      );
    }
  };

  const handleCloseCapture = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCapturedDataUrl(null);
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture frame from video and stamp watermark on canvas
  const capturePhotoWithWatermark = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Constrain resolution for storage performance
    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw camera image
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Watermark if enabled
    if (watermarkEnabled) {
      const bld = buildings.find((b) => b.id === selectedBuildingId);
      const bldName = bld ? bld.name : 'Balak Resort Villa';
      const nowStr = new Date().toLocaleString();

      // Semi-transparent dark banner at bottom
      const bannerHeight = 84;
      ctx.fillStyle = 'rgba(8, 15, 29, 0.85)';
      ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

      // Cyan accent line
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 3);

      // Text stamping
      ctx.fillStyle = '#F3F7FF';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(`BALAK RESORT • MEP PROJECT CONTROL`, 18, canvas.height - bannerHeight + 24);

      ctx.font = '13px Inter, sans-serif';
      ctx.fillStyle = '#00E5FF';
      ctx.fillText(`${bldName} [${room}] — ${category}`, 18, canvas.height - bannerHeight + 46);

      ctx.fillStyle = '#94A8C2';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(
        `Date: ${nowStr} | PIC: ${pic} ${gpsCoords ? `| GPS: ${gpsCoords}` : ''}`,
        18,
        canvas.height - bannerHeight + 68
      );
    }

    const dataUrl = canvas.toDataURL('image/jpeg', compressQuality);
    setCapturedDataUrl(dataUrl);
    stopCamera();
  };

  // Handle local gallery file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;

      if (isImage) {
        // Run through canvas for auto-compression and watermark
        const img = new Image();
        img.onload = () => {
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const maxWidth = 1200;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            if (watermarkEnabled) {
              const bld = buildings.find((b) => b.id === selectedBuildingId);
              const bldName = bld ? bld.name : 'Balak Resort Villa';
              const bannerHeight = 80;
              ctx.fillStyle = 'rgba(8, 15, 29, 0.85)';
              ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);
              ctx.fillStyle = '#00E5FF';
              ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 3);
              ctx.fillStyle = '#F3F7FF';
              ctx.font = 'bold 15px Inter, sans-serif';
              ctx.fillText(`BALAK RESORT • MEP PROJECT CONTROL`, 16, canvas.height - bannerHeight + 22);
              ctx.fillStyle = '#00E5FF';
              ctx.font = '12px Inter, sans-serif';
              ctx.fillText(`${bldName} [${room}] — ${category}`, 16, canvas.height - bannerHeight + 44);
              ctx.fillStyle = '#94A8C2';
              ctx.font = '11px Inter, sans-serif';
              ctx.fillText(`Date: ${new Date().toLocaleString()} | PIC: ${pic}`, 16, canvas.height - bannerHeight + 64);
            }
            setCapturedDataUrl(canvas.toDataURL('image/jpeg', compressQuality));
          }
        };
        img.src = rawUrl;
      } else {
        // Document (PDF/XLSX/DOCX)
        setCapturedDataUrl(rawUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhotoDocument = async () => {
    if (!capturedDataUrl) return;
    const bld = buildings.find((b) => b.id === selectedBuildingId);
    const bldName = bld ? bld.name : 'Balak Resort Villa';

    await addPhotoDocument({
      buildingId: selectedBuildingId,
      buildingName: bldName,
      room,
      category,
      photoUrl: capturedDataUrl,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      photographer: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'MEP Engineer',
      workDescription: workDescription || `${category} site inspection & verification`,
      progress: progressPct,
      remarks,
      pic,
      contractor,
      gpsCoordinates: gpsCoords || undefined,
      watermarkEnabled,
      createdAt: new Date().toISOString(),
    });

    handleCloseCapture();
  };

  const handleDeletePhoto = async (id: string) => {
    if (!isManager) return alert(t('access_restricted'));
    if (window.confirm('Delete this photo record permanently?')) {
      await deletePhotoDocument(id);
      if (previewPhoto?.id === id) setPreviewPhoto(null);
    }
  };

  // Filtered Photos
  const filteredPhotos = photoDocuments.filter((p) => {
    const matchBld = filterBuilding === 'ALL' || p.buildingId === filterBuilding;
    const matchCat = filterCategory === 'ALL' || p.category === filterCategory;
    const matchCont = filterContractor === 'ALL' || p.contractor === filterContractor;
    const matchSearch =
      p.workDescription.toLowerCase().includes(search.toLowerCase()) ||
      p.photographer.toLowerCase().includes(search.toLowerCase()) ||
      p.buildingName.toLowerCase().includes(search.toLowerCase());
    return matchBld && matchCat && matchCont && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_photos')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Real-time Camera Capture, Auto-Watermark Stamping, Gallery & Technical Drawings
          </p>
        </div>

        {(isManager || isSupervisor) && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCapture}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Capture / Upload Evidence</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Filter className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
          <input
            type="text"
            placeholder="Search description, photographer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="PLUMBING">PLUMBING</option>
            <option value="ICT & ELV">ICT & ELV</option>
          </select>

          <select
            value={filterContractor}
            onChange={(e) => setFilterContractor(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Contractors</option>
            <option value="PT. Mandiri Mega Elektrik">PT. Mandiri Mega Elektrik</option>
            <option value="PT. Nusa Cipta Pendingin">PT. Nusa Cipta Pendingin</option>
            <option value="PT. Tirta Surya Teknik">PT. Tirta Surya Teknik</option>
            <option value="PT. Telematika Samudera">PT. Telematika Samudera</option>
          </select>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group rounded-2xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/60 transition overflow-hidden shadow-md flex flex-col"
          >
            {/* Image Preview Container */}
            <div
              onClick={() => setPreviewPhoto(photo)}
              className="relative aspect-video w-full bg-[#080F1D] overflow-hidden cursor-pointer"
            >
              <img
                src={photo.photoUrl}
                alt={photo.workDescription}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080F1D] via-transparent to-transparent opacity-60" />

              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#080F1D]/80 text-[#00E5FF] border border-[#00E5FF]/30 backdrop-blur-sm">
                {photo.category}
              </span>

              {photo.progress !== undefined && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D8B4] text-[#080F1D]">
                  {photo.progress}%
                </span>
              )}

              <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#00E5FF] block truncate">
                  {photo.buildingName} • {photo.room}
                </span>
                <h4 className="text-xs font-semibold text-[#F3F7FF] line-clamp-2 mt-0.5 leading-snug">
                  {photo.workDescription}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1f3556] flex items-center justify-between text-[10px] text-[#94A8C2]">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#00E5FF]" />
                  <span className="truncate max-w-[80px]">{photo.photographer}</span>
                </div>
                <span>{photo.date.split(' ')[0]}</span>
              </div>
            </div>

            {/* Manager Actions */}
            {isManager && (
              <div className="px-3 pb-2.5 pt-1 bg-[#142238] flex items-center justify-end gap-1">
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-1 text-[#94A8C2] hover:text-[#FF526B] rounded"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Capture & Upload Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#142238] border border-[#00E5FF]/40 p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={handleCloseCapture}
              className="absolute top-4 right-4 text-[#94A8C2] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#F3F7FF] mb-1">
              Capture or Upload Field MEP Evidence
            </h3>
            <p className="text-xs text-[#94A8C2] mb-4">
              Real camera live feed with instant orientation switch & automated technical watermark
            </p>

            <div className="space-y-4">
              {/* Camera Preview or Captured Image */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#1f3556] flex items-center justify-center">
                {capturedDataUrl ? (
                  <img
                    src={capturedDataUrl}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Camera Control overlay */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={switchCameraFacing}
                        className="p-2.5 rounded-full bg-[#101B2E]/80 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#101B2E] transition"
                        title="Switch Front/Back Camera"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={capturePhotoWithWatermark}
                        className="px-6 py-2 rounded-full bg-[#00E5FF] text-[#080F1D] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_#00E5FF] hover:bg-[#00D8B4] transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {capturedDataUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#00D8B4] flex items-center gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Evidence Ready for Stamping & Save
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedDataUrl(null);
                      startCamera(cameraFacing);
                    }}
                    className="text-xs text-[#00E5FF] hover:underline"
                  >
                    Retake Photo
                  </button>
                </div>
              )}

              {/* Or Select from Local Device */}
              {!capturedDataUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#101B2E] border border-[#1f3556]">
                  <span className="text-xs text-[#94A8C2]">
                    Prefer uploading from phone gallery or files (PDF/XLSX)?
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142238] border border-[#00E5FF]/40 text-xs font-semibold text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#080F1D] transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.xlsx,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Metadata Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Building
                  </label>
                  <select
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MEPCategory)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="MECHANICAL">MECHANICAL</option>
                    <option value="PLUMBING">PLUMBING</option>
                    <option value="ICT & ELV">ICT & ELV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Room / Zone
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Contractor
                  </label>
                  <input
                    type="text"
                    value={contractor}
                    onChange={(e) => setContractor(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Work Description & Inspection Notes *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Conduit bending and fixing saddles inspection..."
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Progress Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPct}
                    onChange={(e) => setProgressPct(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A8C2] uppercase mb-1">
                    Supervising PIC
                  </label>
                  <input
                    type="text"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Watermark toggle */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#101B2E] border border-[#1f3556]">
                <input
                  type="checkbox"
                  id="watermarkCheck"
                  checked={watermarkEnabled}
                  onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  className="rounded text-[#00E5FF] focus:ring-0"
                />
                <label
                  htmlFor="watermarkCheck"
                  className="text-xs text-[#F3F7FF] cursor-pointer"
                >
                  Stamp official Balak Resort technical watermark on photo (Project, Building, Room, Date & Time, PIC)
                </label>
              </div>

              <div className="pt-3 border-t border-[#1f3556] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCapture}
                  className="px-4 py-2 rounded-xl bg-[#101B2E] text-xs font-semibold text-[#94A8C2] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!capturedDataUrl}
                  onClick={handleSavePhotoDocument}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                >
                  Save Photo Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-[#142238] border border-[#00E5FF]/40 overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh]">
            <button
              onClick={() => {
                setPreviewPhoto(null);
                if (onClearSelectedPhoto) onClearSelectedPhoto();
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View */}
            <div className="flex-1 bg-black overflow-hidden flex items-center justify-center max-h-[65vh]">
              <img
                src={previewPhoto.photoUrl}
                alt={previewPhoto.workDescription}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            {/* Metadata Bar */}
            <div className="p-5 bg-[#101B2E] border-t border-[#1f3556] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/20 text-[#00E5FF]">
                    {previewPhoto.category}
                  </span>
                  <span className="text-xs font-bold text-[#F3F7FF]">
                    {previewPhoto.buildingName} - {previewPhoto.room}
                  </span>
                </div>
                <p className="text-xs text-[#94A8C2]">{previewPhoto.workDescription}</p>
                <div className="flex items-center gap-3 text-[11px] text-[#94A8C2] mt-2">
                  <span>Photo By: {previewPhoto.photographer}</span>
                  <span>•</span>
                  <span>PIC: {previewPhoto.pic}</span>
                  <span>•</span>
                  <span>Date: {previewPhoto.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={previewPhoto.photoUrl}
                  download={`BalakResort_${previewPhoto.buildingName}_${previewPhoto.category}.jpg`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142238] border border-[#00E5FF]/30 text-xs font-semibold text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#080F1D] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                {isManager && (
                  <button
                    onClick={() => handleDeletePhoto(previewPhoto.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 text-[#FF526B] hover:bg-red-500 hover:text-white transition"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
