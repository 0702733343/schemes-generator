import React, { useState } from 'react';
import { X, Sparkles, BookOpen, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { KENYAN_CURRICULUM_DESIGNS } from '../data/kenyanCurriculumDesigns';
import { SchemeOfWork } from '../types/scheme';

interface SchemeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchemeGenerated: (scheme: SchemeOfWork) => void;
}

export const SchemeGeneratorModal: React.FC<SchemeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSchemeGenerated,
}) => {
  const [sourceMode, setSourceMode] = useState<'preset' | 'paste' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(KENYAN_CURRICULUM_DESIGNS[0].id);

  // Form Fields
  const [schoolName, setSchoolName] = useState('Kilimani Junior School');
  const [teacherName, setTeacherName] = useState('Mwalimu J. Muturi');
  const [tscNumber, setTscNumber] = useState('TSC/849201');
  const [grade, setGrade] = useState('Grade 7');
  const [subject, setSubject] = useState('Integrated Science');
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState('2026');
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [lessonsPerWeek, setLessonsPerWeek] = useState(4);
  const [courseBook, setCourseBook] = useState('KLB Top Scholar & Oxford Mentor');
  const [includeMidTerm, setIncludeMidTerm] = useState(true);
  const [includeEndTermExam, setIncludeEndTermExam] = useState(true);

  // Paste / Custom text
  const [pastedCurriculumText, setPastedCurriculumText] = useState('');
  const [customStrandDescription, setCustomStrandDescription] = useState('');

  // Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = KENYAN_CURRICULUM_DESIGNS.find((p) => p.id === presetId);
    if (preset) {
      setGrade(preset.grade);
      setSubject(preset.subject);
      setTerm(preset.term);
      setCourseBook(preset.recommendedCourseBook);
      setLessonsPerWeek(preset.defaultLessonsPerWeek);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      let curriculumDesignContent = '';

      if (sourceMode === 'preset') {
        const preset = KENYAN_CURRICULUM_DESIGNS.find((p) => p.id === selectedPresetId);
        if (preset) {
          curriculumDesignContent =
            `Official KICD CBC Curriculum Design for ${preset.grade} ${preset.subject} (${preset.term}):\n` +
            JSON.stringify(preset.strands, null, 2);
        } else {
          curriculumDesignContent = `Official KICD CBC Curriculum Design for ${grade} ${subject} (${term}).`;
        }
      } else if (sourceMode === 'paste') {
        if (!pastedCurriculumText.trim()) {
          setErrorMsg('Please paste syllabus text into the box, click "Insert Sample Syllabus", or switch to "KICD Presets".');
          setIsGenerating(false);
          return;
        }
        curriculumDesignContent = pastedCurriculumText.trim();
      } else {
        // Custom mode: if provided, use custom outline; if empty, auto-generate standard KICD syllabus for the selected grade and subject
        if (customStrandDescription.trim()) {
          curriculumDesignContent = `Custom Curriculum Strands for ${grade} ${subject} (${term}):\n${customStrandDescription.trim()}`;
        } else {
          curriculumDesignContent = `Generate comprehensive official KICD CBC Curriculum Design strands, sub-strands, specific learning outcomes, and key inquiry questions for ${grade} ${subject} (${term}).`;
        }
      }

      const response = await fetch('/api/schemes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          teacherName,
          tscNumber,
          grade,
          subject,
          term,
          year,
          totalWeeks: Number(totalWeeks),
          lessonsPerWeek: Number(lessonsPerWeek),
          courseBook,
          includeMidTerm,
          includeEndTermExam,
          curriculumDesignContent,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate scheme of work.');
      }

      const generatedScheme: SchemeOfWork = {
        metadata: {
          id: `scheme-${Date.now()}`,
          title: result.data.title || `${grade} ${subject} Scheme of Work - ${term} ${year}`,
          schoolName: result.data.schoolName || schoolName,
          teacherName: result.data.teacherName || teacherName,
          tscNumber: result.data.tscNumber || tscNumber,
          grade: result.data.grade || grade,
          subject: result.data.subject || subject,
          term: result.data.term || term,
          year: result.data.year || year,
          lessonsPerWeek: result.data.lessonsPerWeek || Number(lessonsPerWeek),
          totalWeeks: result.data.totalWeeks || Number(totalWeeks),
          courseBook: result.data.courseBook || courseBook,
          summary: result.data.summary,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        lessons: result.data.lessons || [],
      };

      onSchemeGenerated(generatedScheme);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while generating the scheme.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold leading-tight truncate">
                Create Kenyan Scheme of Work
              </h2>
              <p className="text-[11px] text-slate-400 hidden xs:block truncate">
                Aligned with KICD CBC designs and standard TSC templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-md transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Curriculum Source Selection */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                1. Select Curriculum Design Source
              </label>
              <span className="text-[11px] text-slate-500">Pick preset, paste text, or custom</span>
            </div>

            {/* Source Mode Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setSourceMode('preset')}
                className={`py-2 px-1.5 sm:px-3 rounded-md transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                  sourceMode === 'preset'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">KICD Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceMode('paste')}
                className={`py-2 px-1.5 sm:px-3 rounded-md transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                  sourceMode === 'paste'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Paste Syllabus</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceMode('custom')}
                className={`py-2 px-1.5 sm:px-3 rounded-md transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                  sourceMode === 'custom'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Custom</span>
              </button>
            </div>

            {/* Presets Grid */}
            {sourceMode === 'preset' && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 sm:max-h-64 overflow-y-auto p-1 custom-scrollbar">
                {KENYAN_CURRICULUM_DESIGNS.map((item) => {
                  const isSelected = selectedPresetId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPreset(item.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                              {item.grade} {item.subject}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-500 shrink-0">
                              ({item.term})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="mt-1.5 text-[10px] text-slate-500 flex items-center space-x-1.5 truncate">
                        <span>{item.level}</span>
                        <span>·</span>
                        <span>{item.defaultLessonsPerWeek} lsn/wk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paste Content */}
            {sourceMode === 'paste' && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Paste Syllabus or Notes:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPastedCurriculumText(
                        `Strand 1.0: Mixtures, Elements and Compounds\n` +
                          `Sub-strand 1.1: Separation of Mixtures\n` +
                          `- Specific Learning Outcomes: By the end of the lesson, the learner should be able to: a) Identify methods of separating mixtures; b) Separate sand and water using filtration; c) Appreciate importance of clean water.\n` +
                          `- Key Inquiry Question: Why is it necessary to separate mixtures in everyday life?\n` +
                          `- Suggested Learning Experiences: Learners fold filter paper and filter dirty water.\n` +
                          `- Suggested Resources: Filter funnel, filter paper, conical flask, muddy water.`
                      )
                    }
                    className="text-emerald-700 hover:text-emerald-800 font-medium underline"
                  >
                    Insert Sample Syllabus Text
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={pastedCurriculumText}
                  onChange={(e) => setPastedCurriculumText(e.target.value)}
                  placeholder="Paste text from any KICD Curriculum Design booklet, syllabus PDF, or teacher notes here (Strands, Sub-strands, SLOs, Learning Experiences)..."
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: Copy directly from KICD curriculum design PDFs. The AI parses strands and learning outcomes.
                </p>
              </div>
            )}

            {/* Custom Topics */}
            {sourceMode === 'custom' && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Custom Outline (Optional):</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomStrandDescription(
                        `Strands for ${grade} ${subject} (${term}):\n` +
                          `1. Core Foundations and Key Concepts\n` +
                          `2. Practical Investigations and Group Applications\n` +
                          `3. Community Integration, Review and Summative Projects`
                      )
                    }
                    className="text-emerald-700 hover:text-emerald-800 font-medium underline"
                  >
                    Pre-fill Outline
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customStrandDescription}
                  onChange={(e) => setCustomStrandDescription(e.target.value)}
                  placeholder={`Optional: Enter specific topics or focus areas for ${grade} ${subject}.\nLeave blank to let Gemini auto-generate standard KICD CBC curriculum strands.`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500">
                  Leave blank to automatically generate the official KICD CBC syllabus for <b>{grade} {subject}</b>, or type your own custom topics above.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: School & Teacher Details */}
          <div>
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-2 block">
              2. School & Teacher Details (TSC Inspection Header)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Teacher's Name</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">TSC Number</label>
                <input
                  type="text"
                  required
                  value={tscNumber}
                  onChange={(e) => setTscNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Grade, Subject & Schedule */}
          <div>
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-2 block">
              3. Grade, Learning Area & Pacing
            </label>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Grade / Level</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <optgroup label="Junior School">
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </optgroup>
                  <optgroup label="Upper Primary">
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </optgroup>
                  <optgroup label="Lower Primary">
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                  </optgroup>
                  <optgroup label="Senior School">
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Learning Area</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Integrated Science"
                  className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Term & Year</label>
                <div className="flex space-x-1">
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-2/3 text-xs px-2 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-1/3 text-xs px-1 py-2 border border-slate-300 rounded-md text-center focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pacing Structure</label>
                <div className="flex space-x-1">
                  <select
                    value={totalWeeks}
                    onChange={(e) => setTotalWeeks(Number(e.target.value))}
                    className="w-1/2 text-xs px-1.5 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={10}>10 Wks</option>
                    <option value={11}>11 Wks</option>
                    <option value={12}>12 Wks</option>
                    <option value={13}>13 Wks</option>
                    <option value={14}>14 Wks</option>
                  </select>
                  <select
                    value={lessonsPerWeek}
                    onChange={(e) => setLessonsPerWeek(Number(e.target.value))}
                    className="w-1/2 text-xs px-1.5 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={3}>3 lsn/wk</option>
                    <option value={4}>4 lsn/wk</option>
                    <option value={5}>5 lsn/wk</option>
                    <option value={6}>6 lsn/wk</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Course Books */}
            <div className="mt-2.5">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Approved Course Books & Teacher's Guide
              </label>
              <input
                type="text"
                value={courseBook}
                onChange={(e) => setCourseBook(e.target.value)}
                placeholder="e.g. KLB Top Scholar Grade 7, Oxford Mentor, Spotlight CBC"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Term Checkboxes */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs text-slate-700">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMidTerm}
                  onChange={(e) => setIncludeMidTerm(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include Mid-Term Assessment & Break</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEndTermExam}
                  onChange={(e) => setIncludeEndTermExam(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include End-of-Term Assessment</span>
              </label>
            </div>
          </div>

          {/* Spacer for mobile keyboard/scrolling */}
          <div className="h-4 sm:h-0" />

          {/* Sticky Modal Footer */}
          <div className="sticky bottom-0 bg-white pt-3 border-t border-slate-200 flex items-center justify-between z-10 pb-safe">
            <span className="text-[11px] text-slate-500 hidden xs:inline">
              Pacing: <b>{totalWeeks * lessonsPerWeek} lessons</b>
            </span>

            <div className="flex items-center space-x-2 w-full xs:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-3 sm:px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[40px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center justify-center space-x-1.5 px-4 sm:px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 min-h-[40px] flex-1 xs:flex-initial"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Generate Scheme</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
