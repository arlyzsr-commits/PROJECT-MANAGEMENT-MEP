import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export const ReportCenter: React.FC = () => {
  const {
    project,
    buildings,
    workItems,
    dailyProgressLogs,
    photoDocuments,
    issues,
    t,
  } = useProject();
  const { currentUser } = useAuth();

  const [reportType, setReportType] = useState<
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'building'
    | 'category'
    | 'issues'
    | 'photos'
  >('daily');
  const [selectedBuildingId, setSelectedBuildingId] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExporting, setIsExporting] = useState(false);

  // Export to Excel XLSX
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      if (reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly') {
        const rows = dailyProgressLogs.map((dp) => ({
          'Report ID': dp.reportId,
          Date: dp.date,
          Building: dp.buildingName,
          Room: dp.room,
          Category: dp.category,
          'Work Subcategory': dp.subcategory,
          Contractor: dp.contractor,
          PIC: dp.pic,
          'Daily Completed': dp.dailyCompletedQuantity,
          'Cumulative Vol': dp.currentCumulativeQuantity,
          'Progress %': dp.progressPercentage,
          Weather: dp.weather,
          Manpower: dp.manpower,
          Status: dp.status,
          Description: dp.workDescription,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Progress');
      } else if (reportType === 'building' || reportType === 'category') {
        const rows = workItems.map((w) => ({
          'Item ID': w.id,
          Building: w.buildingName,
          Category: w.category,
          Subcategory: w.subcategory,
          'BOQ Qty': w.boqQuantity,
          Unit: w.unit,
          'Work Weight (%)': w.workWeight,
          'Completed Qty': w.completedQuantity,
          'Progress %': w.progressPercentage,
          Contractor: w.contractor,
          PIC: w.pic,
          Status: w.status,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'MEP Master BOQ');
      } else if (reportType === 'issues') {
        const rows = issues.map((i) => ({
          'Issue ID': i.id,
          Building: i.buildingName,
          Room: i.room,
          Priority: i.priority,
          Status: i.status,
          Contractor: i.contractor,
          PIC: i.responsiblePic,
          'Target Date': i.targetCompletion,
          Description: i.description,
          Remarks: i.remarks,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Outstanding Issues');
      } else if (reportType === 'photos') {
        const rows = photoDocuments.map((p) => ({
          'Photo ID': p.id,
          Building: p.buildingName,
          Room: p.room,
          Category: p.category,
          Photographer: p.photographer,
          Date: p.date,
          PIC: p.pic,
          Description: p.workDescription,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Photo Documentation');
      }

      XLSX.writeFile(
        wb,
        `BalakResort_MEP_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (err) {
      console.error('Excel Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF A4 Portrait or Landscape
  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Navy Header Banner
      doc.setFillColor(16, 27, 46); // #101B2E
      doc.rect(0, 0, pageWidth, 28, 'F');

      // Cyan accent line
      doc.setFillColor(0, 229, 255); // #00E5FF
      doc.rect(0, 28, pageWidth, 1.5, 'F');

      // Header Text
      doc.setTextColor(243, 247, 255); // #F3F7FF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('BALAK RESORT • MEP PROJECT CONTROL', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 168, 194); // #94A8C2
      doc.text(
        'PT. PANTAI BESOR REKREASI BAHARI • Pesawaran, Lampung, Indonesia',
        14,
        18
      );

      // Report Title & Date
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 229, 255);
      const titleStr = `${reportType.toUpperCase()} MEP PROGRESS REPORT`;
      doc.text(titleStr, 14, 25);

      const generatedStr = `Exported: ${new Date().toLocaleDateString()} | User: ${
        currentUser?.displayName || 'MEP Engineer'
      }`;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 168, 194);
      doc.text(generatedStr, pageWidth - 14, 25, { align: 'right' });

      let startY = 36;

      // Report Specific Content
      if (reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly') {
        const tableBody = dailyProgressLogs.map((l) => [
          l.reportId,
          l.date,
          `${l.buildingName}\n(${l.room})`,
          l.subcategory,
          `+${l.dailyCompletedQuantity}`,
          `${l.currentCumulativeQuantity}/${l.plannedQuantity}`,
          `${l.progressPercentage}%`,
          l.status,
        ]);

        autoTable(doc, {
          startY,
          head: [
            [
              'Report ID',
              'Date',
              'Location',
              'MEP Subcategory',
              'Daily Vol',
              'Cumul.',
              'Prog %',
              'Status',
            ],
          ],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [20, 34, 56],
            textColor: [0, 229, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
          alternateRowStyles: {
            fillColor: [245, 248, 255],
          },
        });
      } else if (reportType === 'building' || reportType === 'category') {
        const tableBody = workItems.map((w) => [
          w.category,
          w.buildingName,
          w.subcategory,
          `${w.boqQuantity} ${w.unit}`,
          `${w.workWeight}%`,
          `${w.completedQuantity} (${w.progressPercentage}%)`,
          w.contractor,
          w.status,
        ]);

        autoTable(doc, {
          startY,
          head: [
            [
              'Category',
              'Building',
              'Work Subcategory',
              'BOQ Qty',
              'Weight',
              'Completed',
              'Contractor',
              'Status',
            ],
          ],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [20, 34, 56],
            textColor: [0, 229, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
        });
      } else if (reportType === 'issues') {
        const tableBody = issues.map((i) => [
          i.priority,
          i.buildingName,
          i.description,
          i.contractor,
          i.targetCompletion,
          i.status,
        ]);

        autoTable(doc, {
          startY,
          head: [['Priority', 'Building', 'Constraint Description', 'Contractor', 'Due Date', 'Status']],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [20, 34, 56],
            textColor: [255, 82, 107],
            fontStyle: 'bold',
            fontSize: 9,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },
        });
      } else if (reportType === 'photos') {
        // Photo documentation report: up to 4 photos per page grid
        doc.setFontSize(10);
        doc.setTextColor(20, 34, 56);
        doc.text('SITE PHOTO EVIDENCE SUMMARY (4 per page)', 14, startY);
        startY += 6;

        const photosToRender = photoDocuments.slice(0, 4);
        const cardWidth = (pageWidth - 36) / 2;
        const cardHeight = 65;

        photosToRender.forEach((p, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = 14 + col * (cardWidth + 8);
          const y = startY + row * (cardHeight + 10);

          // Card boundary
          doc.setDrawColor(200, 215, 235);
          doc.rect(x, y, cardWidth, cardHeight);

          // Add image
          try {
            doc.addImage(p.photoUrl, 'JPEG', x + 2, y + 2, cardWidth - 4, 45);
          } catch (e) {
            doc.text('[Image Data]', x + 10, y + 20);
          }

          // Caption & Metadata
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 27, 46);
          doc.text(`${p.buildingName} - ${p.category}`, x + 3, y + 51);

          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 115, 130);
          doc.text(
            `${p.workDescription.substring(0, 36)}... | Date: ${p.date.split(' ')[0]}`,
            x + 3,
            y + 57
          );
        });
      }

      // Add Signature Block on final page
      const finalY = (doc as any).lastAutoTable?.finalY || startY + 140;
      const signatureY = Math.min(finalY + 15, pageHeight - 38);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 27, 46);

      const col1 = 14;
      const col2 = pageWidth / 2 - 30;
      const col3 = pageWidth - 60;

      doc.text('Prepared By:', col1, signatureY);
      doc.text('Checked By:', col2, signatureY);
      doc.text('Approved By:', col3, signatureY);

      doc.setFont('helvetica', 'normal');
      doc.text('______________________', col1, signatureY + 16);
      doc.text('______________________', col2, signatureY + 16);
      doc.text('______________________', col3, signatureY + 16);

      doc.text(currentUser?.displayName || 'Site MEP Supervisor', col1, signatureY + 20);
      doc.text('MEP Coordinator', col2, signatureY + 20);
      doc.text('Project Director / Manager', col3, signatureY + 20);

      // Save PDF
      doc.save(`BalakResort_MEP_${reportType}_${orientation}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_reports')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Automated Generation: PDF (A4 Portrait & Landscape) and Excel (.XLSX) Exports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00D8B4] text-[#080F1D] text-xs font-bold shadow-[0_0_12px_rgba(0,216,180,0.3)] hover:opacity-90 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.XLSX)</span>
          </button>

          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF ({orientation})</span>
          </button>
        </div>
      </div>

      {/* Report Configuration & Parameter Selection */}
      <div className="p-5 rounded-2xl bg-[#142238] border border-[#1f3556] shadow-md">
        <h3 className="text-sm font-bold text-[#F3F7FF] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00E5FF]" />
          Select Report Type & Layout Parameters
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
          {[
            { id: 'daily', label: 'Daily MEP Report', icon: Calendar },
            { id: 'weekly', label: 'Weekly Summary', icon: Calendar },
            { id: 'monthly', label: 'Monthly S-Curve', icon: Layers },
            { id: 'building', label: 'Building Progress', icon: Building2 },
            { id: 'category', label: 'Category BOQ', icon: CheckCircle2 },
            { id: 'issues', label: 'Outstanding Issues', icon: AlertTriangle },
            { id: 'photos', label: 'Photo Document (4/pg)', icon: Camera },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setReportType(item.id as any)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                reportType === item.id
                  ? 'bg-[#101B2E] border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#101B2E] border-[#1f3556] text-[#94A8C2] hover:text-[#F3F7FF]'
              }`}
            >
              <item.icon className="w-4 h-4 mb-1.5" />
              <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1f3556]">
          <div>
            <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
              Building Filter Scope
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="ALL">All Resort Buildings & Infrastructure</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
              Report Period / Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
              PDF Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`py-2 rounded-xl border text-xs font-semibold transition ${
                  orientation === 'portrait'
                    ? 'bg-[#00E5FF] text-[#080F1D] border-[#00E5FF]'
                    : 'bg-[#101B2E] text-[#94A8C2] border-[#1f3556]'
                }`}
              >
                A4 Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`py-2 rounded-xl border text-xs font-semibold transition ${
                  orientation === 'landscape'
                    ? 'bg-[#00E5FF] text-[#080F1D] border-[#00E5FF]'
                    : 'bg-[#101B2E] text-[#94A8C2] border-[#1f3556]'
                }`}
              >
                A4 Landscape
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Report Preview Sheet */}
      <div className="p-6 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div className="p-6 rounded-xl bg-[#080F1D] border border-[#1f3556] text-[#F3F7FF] space-y-6">
          {/* Header Branding */}
          <div className="border-b border-[#00E5FF]/40 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#F3F7FF] tracking-wider">
                BALAK RESORT • MEP PROJECT CONTROL
              </h2>
              <p className="text-xs text-[#94A8C2] mt-0.5">
                PT. PANTAI BESOR REKREASI BAHARI • Pesawaran, Lampung, Indonesia
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 uppercase">
                {reportType} MEP REPORT
              </span>
            </div>
            <div className="text-right text-xs text-[#94A8C2]">
              <p>Period: {selectedDate}</p>
              <p className="text-[10px] text-[#00D8B4] mt-1">Status: Official Generated</p>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101B2E] text-[#00E5FF] uppercase text-[10px] tracking-wider border-b border-[#1f3556]">
                <tr>
                  <th className="py-2.5 px-3">Item / Report</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Discipline</th>
                  <th className="py-2.5 px-3 text-right">Daily Vol</th>
                  <th className="py-2.5 px-3 text-right">Cumulative</th>
                  <th className="py-2.5 px-3 text-center">Progress %</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f3556]/50">
                {dailyProgressLogs.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 px-3 font-mono text-[#00E5FF]">{log.reportId}</td>
                    <td className="py-2 px-3 text-[#F3F7FF]">{log.buildingName}</td>
                    <td className="py-2 px-3 text-[#94A8C2]">{log.subcategory}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#00E5FF]">
                      +{log.dailyCompletedQuantity}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#F3F7FF]">
                      {log.currentCumulativeQuantity}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-[#00D8B4]">
                      {log.progressPercentage}%
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] text-[#00D8B4] font-semibold">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block Preview */}
          <div className="pt-8 border-t border-[#1f3556] grid grid-cols-3 gap-6 text-xs text-center">
            <div>
              <p className="text-[#94A8C2] mb-12">Prepared By:</p>
              <p className="font-bold text-[#F3F7FF]">
                {currentUser?.displayName || 'Site MEP Supervisor'}
              </p>
              <p className="text-[10px] text-[#94A8C2]">Site Engineer</p>
            </div>
            <div>
              <p className="text-[#94A8C2] mb-12">Checked By:</p>
              <p className="font-bold text-[#F3F7FF]">Ir. Hendra Wijaya</p>
              <p className="text-[10px] text-[#94A8C2]">MEP Coordinator</p>
            </div>
            <div>
              <p className="text-[#94A8C2] mb-12">Approved By:</p>
              <p className="font-bold text-[#F3F7FF]">PT. Pantai Besor PM</p>
              <p className="text-[10px] text-[#94A8C2]">Project Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
