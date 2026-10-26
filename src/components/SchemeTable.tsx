import React, { useState, useEffect } from 'react';
import {
  SchemeOfWork,
  SchemeLessonRow,
} from '../types/scheme';
import {
  Printer,
  Download,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  FileCheck,
  Edit3,
  Check,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { exportSchemeToWord, exportSchemeToCsv } from '../utils/exportUtils';

interface SchemeTableProps {
  scheme: SchemeOfWork;
  onUpdateScheme: (updated: SchemeOfWork) => void;
  onRequestLessonPlan: (row: SchemeLessonRow) => void;
  onRequestRefineRow: (row: SchemeLessonRow) => void;
  onPrintScheme: () => void;
}

export const SchemeTable: React.FC<SchemeTableProps> = ({
  scheme,
  onUpdateScheme,
  onRequestLessonPlan,
  onRequestRefineRow,
  onPrintScheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'all'>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Mobile-first responsive view mode: default to cards on mobile screen, table on larger screens
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Detect screen size on initial load to set default viewMode
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setViewMode('table');
    }
  }, []);

  const { metadata, lessons } = scheme;

  // Filter lessons based on search and selected week
  const filteredLessons = lessons.filter((row) => {
    const matchesWeek = selectedWeekFilter === 'all' || row.week === selectedWeekFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      row.strand.toLowerCase().includes(term) ||
      row.subStrand.toLowerCase().includes(term) ||
      row.learningOutcomes.some((o) => o.toLowerCase().includes(term)) ||
      row.keyInquiryQuestions.some((q) => q.toLowerCase().includes(term));
    return matchesWeek && matchesSearch;
  });

  // Unique weeks in this scheme for dropdown
  const uniqueWeeks = Array.from(new Set(lessons.map((l) => l.week))).sort((a, b) => a - b);

  // Row update helper
  const handleUpdateRow = (rowId: string, updatedFields: Partial<SchemeLessonRow>) => {
    const updatedLessons = lessons.map((row) => {
      if (row.id === rowId) {
        return { ...row, ...updatedFields };
      }
      return row;
    });
    onUpdateScheme({
      ...scheme,
      lessons: updatedLessons,
      metadata: { ...metadata, updatedAt: new Date().toISOString() },
    });
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    if (confirm('Are you sure you want to remove this lesson row from the scheme?')) {
      const updatedLessons = lessons.filter((row) => row.id !== rowId);
      onUpdateScheme({
        ...scheme,
        lessons: updatedLessons,
        metadata: { ...metadata, updatedAt: new Date().toISOString() },
      });
    }
  };

  // Move row up or down
  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const temp = newLessons[index];
    newLessons[index] = newLessons[newIndex];
    newLessons[newIndex] = temp;

    onUpdateScheme({
      ...scheme,
      lessons: newLessons,
      metadata: { ...metadata, updatedAt: new Date().toISOString() },
    });
  };

  // Add new row after given index
  const handleAddRow = (afterIndex: number) => {
    const prevRow = lessons[afterIndex] || lessons[lessons.length - 1];
    const newLessonNumber = (prevRow ? prevRow.lesson : 0) + 1;
    const currentWeek = prevRow ? prevRow.week : 1;

    const newRow: SchemeLessonRow = {
      id: `lesson-custom-${Date.now()}`,
      week: currentWeek,
      lesson: newLessonNumber,
      strand: prevRow ? prevRow.strand : 'General Strand',
      subStrand: 'New Sub-Strand Topic',
      learningOutcomes: [
        'State the key concept of the lesson',
        'Demonstrate practical mastery through guided activities',
      ],
      keyInquiryQuestions: ['How does this concept apply in real life?'],
      coreCompetencies: ['Critical thinking', 'Communication & collaboration'],
      values: ['Responsibility', 'Integrity'],
      pcis: ['Environmental education'],
      learningExperiences: [
        'Learners work in pairs to discuss concept notes',
        'Learners present findings to the class',
      ],
      learningResources: [`${metadata.courseBook} Pg 10-14`, 'Charts, realia'],
      assessmentMethods: ['Observation', 'Oral questions', 'Written exercise'],
      reflection: '',
    };

    const newLessons = [...lessons];
    newLessons.splice(afterIndex + 1, 0, newRow);

    onUpdateScheme({
      ...scheme,
      lessons: newLessons,
      metadata: { ...metadata, updatedAt: new Date().toISOString() },
    });
    setEditingRowId(newRow.id);
  };

  // Copy HTML table to clipboard
  const handleCopyTable = () => {
    const tableEl = document.getElementById('tsc-scheme-table-container');
    if (!tableEl) return;

    const html = tableEl.innerHTML;
    const blobHtml = new Blob([html], { type: 'text/html' });
    const blobText = new Blob([tableEl.innerText], { type: 'text/plain' });

    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ])
      .then(() => {
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 3000);
      })
      .catch((err) => {
        console.error('Clipboard copy error:', err);
      });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Responsive Filter & Control Toolbar */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Top search & view switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search box - full width on mobile */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search strands, outcomes, questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Week Selector & View Mode Switcher */}
          <div className="flex items-center space-x-2">
            {/* Week Selector */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedWeekFilter}
                onChange={(e) =>
                  setSelectedWeekFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="w-full sm:w-auto py-1 px-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Weeks ({lessons.length})</option>
                {uniqueWeeks.map((wk) => (
                  <option key={wk} value={wk}>
                    Week {wk}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Lesson Cards View (Mobile Friendly)"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="11-Column Table View"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Table</span>
              </button>
            </div>

            {/* Quick Edit Toggle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-1.5 sm:px-3 sm:py-1 text-xs font-medium rounded-lg transition-colors border shrink-0 ${
                isEditMode
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 sm:mr-1 inline-block" />
              <span className="hidden sm:inline">{isEditMode ? 'Exit Edit' : 'Quick Edit'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500 text-[11px]">
            Showing <b>{filteredLessons.length}</b> of <b>{lessons.length}</b> lessons
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAddRow(lessons.length - 1)}
              className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-semibold text-xs py-1 px-2 rounded hover:bg-emerald-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lesson</span>
            </button>

            <button
              onClick={handleCopyTable}
              className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-xs py-1 px-2 rounded hover:bg-slate-100"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Copy Table</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Scheme Content (Printable Container) */}
      <div
        id="tsc-scheme-table-container"
        className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-6 overflow-hidden print:p-0 print:border-none print:shadow-none"
      >
        {/* TSC Official Header */}
        <div className="text-center pb-3 sm:pb-4 mb-3 sm:mb-4 border-b-2 border-slate-900">
          <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded mb-1.5 print:bg-black">
            Republic of Kenya · Teachers Service Commission
          </div>
          <h1 className="text-base sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
            {metadata.schoolName}
          </h1>
          <h2 className="text-xs sm:text-lg font-bold text-blue-900 tracking-wide mt-0.5 sm:mt-1">
            CBC SCHEME OF WORK · {metadata.grade.toUpperCase()} {metadata.subject.toUpperCase()}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5 font-medium">
            Standard Professional Teaching Record Aligned to KICD Curriculum Designs
          </p>

          {/* Metadata Grid (Responsive: 2-col on mobile, 4-col on tablet/desktop) */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[11px] sm:text-xs border border-slate-300 rounded-lg overflow-hidden text-left bg-slate-50/50">
            <div className="p-1.5 sm:p-2 border-r border-b border-slate-300">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                Learning Area:
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                {metadata.subject}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 border-b border-slate-300 sm:border-r">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                Grade / Class:
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                {metadata.grade}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 border-r border-b border-slate-300">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                Term & Year:
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                {metadata.term}, {metadata.year}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 border-b border-slate-300">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                Pacing:
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                {metadata.lessonsPerWeek} lsn/wk ({metadata.totalWeeks} Wks)
              </span>
            </div>

            <div className="p-1.5 sm:p-2 border-r border-slate-300">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                Teacher's Name:
              </span>
              <span className="font-semibold text-slate-900 truncate block">
                {metadata.teacherName}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 border-slate-300 sm:border-r">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                TSC Number:
              </span>
              <span className="font-semibold text-slate-900 truncate block">
                {metadata.tscNumber}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 border-t sm:border-t-0 col-span-2">
              <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-bold">
                Course Books:
              </span>
              <span className="font-medium text-slate-800 line-clamp-1 block">
                {metadata.courseBook}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode 1: Mobile-First Lesson Cards View */}
        {viewMode === 'cards' && (
          <div className="space-y-3 no-print">
            {filteredLessons.map((row, index) => {
              const originalIndex = lessons.findIndex((l) => l.id === row.id);
              const isEditing = editingRowId === row.id || isEditMode;

              if (row.isSpecialRow) {
                return (
                  <div
                    key={row.id}
                    className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-center space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
                      <span>Week {row.week}</span>
                      <span>Lesson {row.lesson}</span>
                    </div>
                    <h3 className="font-black text-amber-950 text-sm tracking-wide uppercase">
                      {row.subStrand}
                    </h3>
                    <p className="text-xs text-amber-900 font-normal">
                      {row.learningExperiences?.join('; ')}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={row.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          Wk {row.week} · Lsn {row.lesson}
                        </span>
                        <span className="font-semibold text-emerald-800 text-xs">{row.strand}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{row.subStrand}</h3>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleMoveRow(originalIndex, 'up')}
                        disabled={originalIndex === 0}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveRow(originalIndex, 'down')}
                        disabled={originalIndex === lessons.length - 1}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingRowId(isEditing ? null : row.id)}
                        title="Edit Row"
                        className={`p-1 rounded ${
                          isEditing ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        title="Delete Row"
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 space-y-3 text-xs">
                    {/* Specific Learning Outcomes */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Specific Learning Outcomes (SLOs)
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={row.learningOutcomes.join('\n')}
                          onChange={(e) =>
                            handleUpdateRow(row.id, {
                              learningOutcomes: e.target.value.split('\n').filter(Boolean),
                            })
                          }
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {row.learningOutcomes.map((slo, idx) => (
                            <li key={idx} className="leading-snug">
                              {slo}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Key Inquiry Questions */}
                    <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-blue-900 block mb-0.5">
                        Key Inquiry Question
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={row.keyInquiryQuestions.join('\n')}
                          onChange={(e) =>
                            handleUpdateRow(row.id, {
                              keyInquiryQuestions: e.target.value.split('\n').filter(Boolean),
                            })
                          }
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-blue-900 text-xs">
                          {row.keyInquiryQuestions.join('; ')}
                        </p>
                      )}
                    </div>

                    {/* Competencies, Values & PCIs */}
                    <div className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {row.coreCompetencies && row.coreCompetencies.length > 0 && (
                        <div>
                          <b className="text-slate-900">Competencies: </b>
                          <span>{row.coreCompetencies.join(', ')}</span>
                        </div>
                      )}
                      {row.values && row.values.length > 0 && (
                        <div>
                          <b className="text-slate-900">Values: </b>
                          <span>{row.values.join(', ')}</span>
                        </div>
                      )}
                      {row.pcis && row.pcis.length > 0 && (
                        <div>
                          <b className="text-slate-900">PCIs: </b>
                          <span>{row.pcis.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Learning Experiences & Resources */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="border border-slate-200 p-2 rounded">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Learning Experiences
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={row.learningExperiences.join('\n')}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                learningExperiences: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-xs"
                          />
                        ) : (
                          <ul className="list-disc pl-3.5 space-y-0.5 text-slate-700">
                            {row.learningExperiences.map((exp, idx) => (
                              <li key={idx}>{exp}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="border border-slate-200 p-2 rounded">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Resources & Assessment
                        </span>
                        <div className="space-y-1">
                          <div>
                            <span className="font-semibold text-slate-800">Resources: </span>
                            <span className="text-slate-600">{row.learningResources.join('; ')}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">Assessment: </span>
                            <span className="text-slate-600">{row.assessmentMethods.join('; ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reflection */}
                    <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded">
                      <span className="font-semibold not-italic text-slate-700">Remarks: </span>
                      {row.reflection || 'To be completed by teacher post-lesson.'}
                    </div>

                    {/* Primary Lesson Plan CTA */}
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onRequestLessonPlan(row)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                      >
                        <FileCheck className="w-4 h-4 shrink-0" />
                        <span>Generate Lesson Plan</span>
                      </button>

                      <button
                        onClick={() => onRequestRefineRow(row)}
                        className="flex items-center justify-center space-x-1 py-2 px-3 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>AI Refine</span>
                      </button>

                      <button
                        onClick={() => handleAddRow(originalIndex)}
                        title="Add row below"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 2: 11-Column Table (Always shown for Print, or when table view selected) */}
        <div className={`${viewMode === 'cards' ? 'hidden print:block' : 'block'}`}>
          <div className="no-print text-[11px] text-slate-500 mb-2 flex items-center justify-between">
            <span>Scroll horizontally to view all 11 TSC inspection columns:</span>
            <span className="text-emerald-700 font-medium">← Swipe horizontally →</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px] leading-relaxed min-w-[980px]">
              <thead>
                <tr className="bg-slate-900 text-white font-bold divide-x divide-slate-700 print:bg-black">
                  <th className="p-2 w-10 text-center font-bold">Wk</th>
                  <th className="p-2 w-10 text-center font-bold">Lsn</th>
                  <th className="p-2 w-28 font-bold">Strand</th>
                  <th className="p-2 w-32 font-bold">Sub-strand</th>
                  <th className="p-2 w-64 font-bold">Specific Learning Outcomes</th>
                  <th className="p-2 w-36 font-bold">Key Inquiry Questions</th>
                  <th className="p-2 w-40 font-bold">Core Competencies & Values</th>
                  <th className="p-2 w-52 font-bold">Learning Experiences</th>
                  <th className="p-2 w-36 font-bold">Learning Resources</th>
                  <th className="p-2 w-32 font-bold">Assessment</th>
                  <th className="p-2 w-32 font-bold">Reflection</th>
                  <th className="no-print p-2 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLessons.map((row, index) => {
                  const originalIndex = lessons.findIndex((l) => l.id === row.id);
                  const isEditing = editingRowId === row.id || isEditMode;

                  if (row.isSpecialRow) {
                    return (
                      <tr
                        key={row.id}
                        className="bg-amber-50/80 font-medium text-amber-950 border-y-2 border-amber-300"
                      >
                        <td className="p-2.5 text-center font-bold border-r border-amber-200">
                          {row.week}
                        </td>
                        <td className="p-2.5 text-center font-bold border-r border-amber-200">
                          {row.lesson}
                        </td>
                        <td colSpan={9} className="p-3 text-center border-r border-amber-200">
                          <div className="font-bold text-sm tracking-wide uppercase text-amber-900">
                            {row.subStrand}
                          </div>
                          <div className="text-xs text-amber-800 font-normal mt-0.5">
                            {row.learningExperiences?.join('; ')}
                          </div>
                        </td>
                        <td className="no-print p-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            title="Delete row"
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors divide-x divide-slate-200 ${
                        index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      {/* Week */}
                      <td className="p-2 text-center font-bold text-slate-900 align-top">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.week}
                            onChange={(e) =>
                              handleUpdateRow(row.id, { week: Number(e.target.value) })
                            }
                            className="w-8 text-center py-0.5 border border-slate-300 rounded font-bold"
                          />
                        ) : (
                          row.week
                        )}
                      </td>

                      {/* Lesson */}
                      <td className="p-2 text-center font-bold text-slate-700 align-top">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.lesson}
                            onChange={(e) =>
                              handleUpdateRow(row.id, { lesson: Number(e.target.value) })
                            }
                            className="w-8 text-center py-0.5 border border-slate-300 rounded font-bold"
                          />
                        ) : (
                          row.lesson
                        )}
                      </td>

                      {/* Strand */}
                      <td className="p-2 font-bold text-slate-900 align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.strand}
                            onChange={(e) => handleUpdateRow(row.id, { strand: e.target.value })}
                            className="w-full py-0.5 px-1 border border-slate-300 rounded text-xs"
                          />
                        ) : (
                          row.strand
                        )}
                      </td>

                      {/* Sub-strand */}
                      <td className="p-2 font-medium text-slate-800 align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.subStrand}
                            onChange={(e) => handleUpdateRow(row.id, { subStrand: e.target.value })}
                            className="w-full py-0.5 px-1 border border-slate-300 rounded text-xs"
                          />
                        ) : (
                          row.subStrand
                        )}
                      </td>

                      {/* Specific Learning Outcomes */}
                      <td className="p-2 align-top text-slate-800">
                        <div className="font-semibold text-[10px] text-slate-600 mb-1">
                          By the end of the lesson, the learner should be able to:
                        </div>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={row.learningOutcomes.join('\n')}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                learningOutcomes: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-[11px]"
                          />
                        ) : (
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {row.learningOutcomes.map((slo, idx) => (
                              <li key={idx}>{slo}</li>
                            ))}
                          </ul>
                        )}
                      </td>

                      {/* Key Inquiry Questions */}
                      <td className="p-2 align-top text-slate-800">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={row.keyInquiryQuestions.join('\n')}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                keyInquiryQuestions: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-[11px]"
                          />
                        ) : (
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {row.keyInquiryQuestions.map((kiq, idx) => (
                              <li key={idx}>{kiq}</li>
                            ))}
                          </ul>
                        )}
                      </td>

                      {/* Core Competencies & Values */}
                      <td className="p-2 align-top text-[10px] text-slate-700">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Competencies"
                              value={row.coreCompetencies?.join(', ') || ''}
                              onChange={(e) =>
                                handleUpdateRow(row.id, {
                                  coreCompetencies: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full p-1 border border-slate-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Values"
                              value={row.values?.join(', ') || ''}
                              onChange={(e) =>
                                handleUpdateRow(row.id, {
                                  values: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full p-1 border border-slate-300 rounded"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {row.coreCompetencies && row.coreCompetencies.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-900">Competencies: </span>
                                <span>{row.coreCompetencies.join(', ')}</span>
                              </div>
                            )}
                            {row.values && row.values.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-900">Values: </span>
                                <span>{row.values.join(', ')}</span>
                              </div>
                            )}
                            {row.pcis && row.pcis.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-900">PCIs: </span>
                                <span>{row.pcis.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Learning Experiences */}
                      <td className="p-2 align-top text-slate-800">
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={row.learningExperiences.join('\n')}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                learningExperiences: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-[11px]"
                          />
                        ) : (
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {row.learningExperiences.map((exp, idx) => (
                              <li key={idx}>{exp}</li>
                            ))}
                          </ul>
                        )}
                      </td>

                      {/* Learning Resources */}
                      <td className="p-2 align-top text-[10px] text-slate-700">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={row.learningResources.join('\n')}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                learningResources: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-[11px]"
                          />
                        ) : (
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {row.learningResources.map((res, idx) => (
                              <li key={idx}>{res}</li>
                            ))}
                          </ul>
                        )}
                      </td>

                      {/* Assessment Methods */}
                      <td className="p-2 align-top text-[10px] text-slate-700">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={row.assessmentMethods.join('\n')}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                assessmentMethods: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-[11px]"
                          />
                        ) : (
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {row.assessmentMethods.map((ass, idx) => (
                              <li key={idx}>{ass}</li>
                            ))}
                          </ul>
                        )}
                      </td>

                      {/* Reflection / Remarks */}
                      <td className="p-2 align-top text-[10px] text-slate-600 italic">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.reflection || ''}
                            placeholder="Teacher notes..."
                            onChange={(e) =>
                              handleUpdateRow(row.id, { reflection: e.target.value })
                            }
                            className="w-full p-1 border border-slate-300 rounded text-[11px]"
                          />
                        ) : (
                          row.reflection || 'To be completed by teacher post-lesson.'
                        )}
                      </td>

                      {/* Action Column (No Print) */}
                      <td className="no-print p-2 text-center align-top space-y-1">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => onRequestLessonPlan(row)}
                            title="Generate official 40-min TSC Lesson Plan"
                            className="w-full flex items-center justify-center space-x-1 px-1.5 py-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded border border-emerald-300 transition-colors"
                          >
                            <FileCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>Plan</span>
                          </button>

                          <button
                            onClick={() => onRequestRefineRow(row)}
                            title="Refine with Gemini AI"
                            className="w-full flex items-center justify-center space-x-1 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                            <span>Refine</span>
                          </button>

                          <div className="flex items-center space-x-1 mt-1">
                            <button
                              onClick={() => handleMoveRow(originalIndex, 'up')}
                              disabled={originalIndex === 0}
                              title="Move Up"
                              className="p-0.5 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveRow(originalIndex, 'down')}
                              disabled={originalIndex === lessons.length - 1}
                              title="Move Down"
                              className="p-0.5 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleAddRow(originalIndex)}
                              title="Insert Lesson Below"
                              className="p-0.5 text-emerald-600 hover:text-emerald-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row.id)}
                              title="Delete Lesson"
                              className="p-0.5 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official TSC Signatures & Approval Footer */}
        <div className="mt-6 sm:mt-8 pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-xs text-slate-800">
          <div className="border border-slate-300 rounded p-2.5 sm:p-3 bg-slate-50">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1 mb-1.5 uppercase text-[11px]">
              1. Prepared by Subject Teacher
            </span>
            <div className="space-y-1 text-[11px]">
              <div>
                Name: <b>{metadata.teacherName}</b>
              </div>
              <div>
                TSC Number: <b>{metadata.tscNumber}</b>
              </div>
              <div className="pt-2">Signature: ______________________</div>
              <div>Date: __________________________</div>
            </div>
          </div>

          <div className="border border-slate-300 rounded p-2.5 sm:p-3 bg-slate-50">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1 mb-1.5 uppercase text-[11px]">
              2. Verified by HOD
            </span>
            <div className="space-y-1 text-[11px]">
              <div>Name: __________________________</div>
              <div>Remarks: _______________________</div>
              <div className="pt-2">Signature: ______________________</div>
              <div>Date: __________________________</div>
            </div>
          </div>

          <div className="border border-slate-300 rounded p-2.5 sm:p-3 bg-slate-50">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1 mb-1.5 uppercase text-[11px]">
              3. Approved by Principal / Head
            </span>
            <div className="space-y-1 text-[11px]">
              <div>Name: __________________________</div>
              <div>Official Stamp: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</div>
              <div className="pt-1">Signature: ______________________</div>
              <div>Date: __________________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
