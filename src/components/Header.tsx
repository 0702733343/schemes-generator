import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Library,
  HelpCircle,
  PlusCircle,
  Printer,
  Download,
  MoreVertical,
  Check,
} from 'lucide-react';
import { SchemeOfWork } from '../types/scheme';
import { exportSchemeToWord, exportSchemeToCsv } from '../utils/exportUtils';

interface HeaderProps {
  activeTab: 'editor' | 'library' | 'guide';
  setActiveTab: (tab: 'editor' | 'library' | 'guide') => void;
  onOpenNewSchemeModal: () => void;
  currentScheme: SchemeOfWork | null;
  onPrintScheme: () => void;
  schemesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSchemeModal,
  currentScheme,
  onPrintScheme,
  schemesCount = 1,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <header className="no-print bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base sm:text-lg text-white tracking-tight truncate">
                    MwalimuSchemes
                  </span>
                  <span className="hidden xs:inline-block text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-300 font-medium px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    CBC Kenya
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                  KICD Designs to TSC Schemes of Work & Lesson Plans
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Hidden on mobile - moved to bottom tab bar) */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Scheme Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'library'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Library className="w-4 h-4" />
                <span>My Schemes ({schemesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'guide'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>CBC Guidelines</span>
              </button>
            </nav>

            {/* Actions: Desktop full buttons, Mobile compact menu */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {currentScheme && (
                <>
                  {/* Desktop Quick Export Buttons */}
                  <div className="hidden lg:flex items-center space-x-1.5">
                    <button
                      onClick={onPrintScheme}
                      title="Print Landscape A4 Scheme"
                      className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print A4</span>
                    </button>

                    <button
                      onClick={() => exportSchemeToWord(currentScheme)}
                      title="Export official editable Word (.docx) table"
                      className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-blue-300 hover:text-blue-100 bg-blue-950/60 hover:bg-blue-900/60 rounded-md transition-colors border border-blue-800/60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word (.docx)</span>
                    </button>

                    <button
                      onClick={() => exportSchemeToCsv(currentScheme)}
                      title="Export CSV for Excel"
                      className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-900/60 rounded-md transition-colors border border-emerald-800/60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>

                  {/* Mobile & Tablet Export Dropdown Trigger */}
                  <div className="relative lg:hidden">
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[38px] min-h-[38px]"
                      aria-label="Export options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {mobileMenuOpen && (
                      <div className="absolute right-0 mt-1 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1.5 z-50 text-xs">
                        <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700/60">
                          Export Active Scheme
                        </div>
                        <button
                          onClick={() => {
                            onPrintScheme();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center space-x-2 text-slate-200 hover:bg-slate-700"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                          <span>Print Landscape A4</span>
                        </button>
                        <button
                          onClick={() => {
                            exportSchemeToWord(currentScheme);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center space-x-2 text-blue-300 hover:bg-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>Download Word (.docx)</span>
                        </button>
                        <button
                          onClick={() => {
                            exportSchemeToCsv(currentScheme);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center space-x-2 text-emerald-300 hover:bg-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Download CSV (Excel)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Primary "New Scheme" button */}
              <button
                onClick={onOpenNewSchemeModal}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs shrink-0 min-h-[36px]"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="hidden xs:inline">New Scheme</span>
                <span className="xs:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for phone screens) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-around h-14 pb-safe shadow-lg">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            activeTab === 'editor' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Scheme</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative ${
            activeTab === 'library' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Library className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">My Schemes</span>
          {schemesCount > 0 && (
            <span className="absolute top-1 right-[28%] bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {schemesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            activeTab === 'guide' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Guidelines</span>
        </button>
      </nav>
    </>
  );
};
