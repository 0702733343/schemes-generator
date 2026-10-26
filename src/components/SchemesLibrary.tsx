import React, { useRef } from 'react';
import { SchemeOfWork } from '../types/scheme';
import {
  FileText,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  PlusCircle,
  School,
  User,
  Sparkles,
} from 'lucide-react';
import { exportSchemeToWord, exportSchemeToCsv } from '../utils/exportUtils';

interface SchemesLibraryProps {
  schemes: SchemeOfWork[];
  currentSchemeId: string | null;
  onSelectScheme: (scheme: SchemeOfWork) => void;
  onDeleteScheme: (id: string) => void;
  onDuplicateScheme: (scheme: SchemeOfWork) => void;
  onImportScheme: (imported: SchemeOfWork) => void;
  onOpenNewModal: () => void;
}

export const SchemesLibrary: React.FC<SchemesLibraryProps> = ({
  schemes,
  currentSchemeId,
  onSelectScheme,
  onDeleteScheme,
  onDuplicateScheme,
  onImportScheme,
  onOpenNewModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJson = (scheme: SchemeOfWork) => {
    const jsonStr = JSON.stringify(scheme, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheme.metadata.grade}_${scheme.metadata.subject}_${scheme.metadata.term}_Backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.metadata && parsed.lessons) {
          onImportScheme(parsed);
        } else {
          alert('Invalid scheme backup JSON file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            My Schemes of Work Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Saved CBC schemes stored in your browser with quick export and backup
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 min-h-[38px]"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs min-h-[38px]"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>New Scheme</span>
          </button>
        </div>
      </div>

      {/* Schemes Grid */}
      {schemes.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Schemes Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Select one of our official KICD curriculum presets (Integrated Science, Mathematics,
              Social Studies, Agriculture) or paste your own syllabus.
            </p>
          </div>
          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs min-h-[38px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Scheme of Work</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {schemes.map((scheme) => {
            const isCurrent = scheme.metadata.id === currentSchemeId;
            const updatedDate = new Date(
              scheme.metadata.updatedAt || scheme.metadata.createdAt
            ).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div
                key={scheme.metadata.id}
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <div className="p-4 space-y-2.5">
                  {/* Top tags */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {scheme.metadata.grade}
                    </span>
                    <span className="font-medium text-slate-600">
                      {scheme.metadata.term} · {scheme.metadata.year}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                      {scheme.metadata.subject}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{scheme.metadata.schoolName}</span>
                    </p>
                  </div>

                  {/* Details snippet */}
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center space-x-1 truncate max-w-[150px]">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{scheme.metadata.teacherName}</span>
                      </span>
                      <span className="font-bold text-slate-800 shrink-0">
                        {scheme.lessons.length} lsns ({scheme.metadata.totalWeeks} Wks)
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Updated: {updatedDate}</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectScheme(scheme)}
                    className="flex items-center space-x-1 font-semibold text-emerald-700 hover:text-emerald-800 py-1"
                  >
                    <span>Open Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => exportSchemeToWord(scheme)}
                      title="Download Editable MS Word (.docx)"
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-200 rounded transition-colors"
                      aria-label="Download Word"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateScheme(scheme)}
                      title="Duplicate Scheme"
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded transition-colors"
                      aria-label="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportJson(scheme)}
                      title="Export JSON Backup"
                      className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-slate-200 rounded transition-colors text-[10px] font-mono font-bold"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete scheme for ${scheme.metadata.subject}?`)) {
                          onDeleteScheme(scheme.metadata.id);
                        }
                      }}
                      title="Delete Scheme"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
