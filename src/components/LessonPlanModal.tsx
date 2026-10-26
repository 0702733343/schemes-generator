import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Loader2,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { SchemeLessonRow, TSC5StepLessonPlan, SchemeMetadata } from '../types/scheme';
import { exportLessonPlanToWord } from '../utils/exportUtils';

interface LessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonRow: SchemeLessonRow | null;
  metadata: SchemeMetadata;
}

export const LessonPlanModal: React.FC<LessonPlanModalProps> = ({
  isOpen,
  onClose,
  lessonRow,
  metadata,
}) => {
  const [lessonPlan, setLessonPlan] = useState<TSC5StepLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && lessonRow) {
      generatePlan();
    } else {
      setLessonPlan(null);
    }
  }, [isOpen, lessonRow?.id]);

  if (!isOpen || !lessonRow) return null;

  const generatePlan = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/schemes/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonData: lessonRow,
          schoolName: metadata.schoolName,
          teacherName: metadata.teacherName,
          tscNumber: metadata.tscNumber,
          grade: metadata.grade,
          subject: metadata.subject,
          duration: '40 minutes',
          roll: '45 learners (23 boys, 22 girls)',
          date: new Date().toLocaleDateString('en-KE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }),
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || 'Failed to generate lesson plan.');
      }
      setLessonPlan(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error creating lesson plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!lessonPlan) return;
    const text = `
KENYA TEACHERS SERVICE COMMISSION (TSC) CBC LESSON PLAN
School: ${lessonPlan.administrativeDetails.school}
Grade: ${lessonPlan.administrativeDetails.grade} | Subject: ${lessonPlan.administrativeDetails.learningArea}
Date: ${lessonPlan.administrativeDetails.date} | Time: ${lessonPlan.administrativeDetails.time}
Strand: ${lessonPlan.administrativeDetails.strand}
Sub-strand: ${lessonPlan.administrativeDetails.subStrand}

SPECIFIC LEARNING OUTCOMES:
${lessonPlan.learningOutcomes.map((o) => '- ' + o).join('\n')}

KEY INQUIRY QUESTION:
${lessonPlan.keyInquiryQuestion}

COMPETENCIES & VALUES:
Core Competencies: ${lessonPlan.coreCompetencies.join(', ')}
Values: ${lessonPlan.values.join(', ')}
PCIs: ${lessonPlan.pcis.join(', ')}

LESSON STAGES (40 MINUTES):
${lessonPlan.stages
  .map(
    (s) =>
      `[${s.stageName} (${s.timeAllocation})]\nTeacher: ${s.teacherFacilitation}\nLearner: ${s.learnerActivities}\n`
  )
  .join('\n')}

ASSESSMENT RUBRIC:
Exceeding: ${lessonPlan.assessmentRubric.exceedingExpectations}
Meeting: ${lessonPlan.assessmentRubric.meetingExpectations}
Approaching: ${lessonPlan.assessmentRubric.approachingExpectations}
Below: ${lessonPlan.assessmentRubric.belowExpectations}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="no-print px-4 sm:px-6 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1.5 bg-emerald-600 rounded-md shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-semibold truncate">
                TSC CBC 5-Step Lesson Plan
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Wk {lessonRow.week}, Lsn {lessonRow.lesson} · {lessonRow.subStrand}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {lessonPlan && (
              <>
                <button
                  onClick={handlePrint}
                  title="Print Lesson Plan"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded min-w-[34px] min-h-[34px] flex items-center justify-center"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportLessonPlanToWord(lessonPlan)}
                  title="Export to editable MS Word (.docx)"
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded min-h-[34px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Word (.docx)</span>
                </button>
                <button
                  onClick={handleCopyText}
                  title="Copy Plain Text"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded min-w-[34px] min-h-[34px] flex items-center justify-center"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-600 text-center px-4">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium">
                Drafting standard 5-step TSC lesson plan with Gemini AI...
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Formatting Bloom's taxonomy outcomes, timed stages, and rubric levels
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Generation Failed</p>
                <p>{errorMsg}</p>
                <button
                  onClick={generatePlan}
                  className="mt-2 px-3 py-1 bg-rose-600 text-white font-medium rounded hover:bg-rose-500"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {lessonPlan && !isLoading && (
            <div className="space-y-4 sm:space-y-6 text-slate-900 text-xs">
              {/* Document Header */}
              <div className="text-center border-b pb-3">
                <h1 className="text-base sm:text-xl font-black uppercase tracking-tight">
                  {lessonPlan.administrativeDetails.school}
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-blue-900 mt-0.5">
                  TEACHERS SERVICE COMMISSION (TSC) CBC LESSON PLAN
                </h2>
                <div className="text-[10px] sm:text-[11px] text-slate-500">
                  Standard 40-Minute Competency-Based Lesson Matrix
                </div>
              </div>

              {/* Administrative Details (Responsive) */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50/50">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 divide-y xs:divide-y-0 sm:divide-x divide-slate-200 text-[11px]">
                  <div className="p-2">
                    <span className="text-slate-500 block uppercase text-[9px] font-bold">Teacher</span>
                    <span className="font-semibold">{lessonPlan.administrativeDetails.teacher}</span>
                    <span className="block text-[10px] text-slate-500">
                      TSC: {lessonPlan.administrativeDetails.tscNo}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block uppercase text-[9px] font-bold">Date & Time</span>
                    <span className="font-semibold">{lessonPlan.administrativeDetails.date}</span>
                    <span className="block text-[10px] text-slate-500">
                      {lessonPlan.administrativeDetails.time}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block uppercase text-[9px] font-bold">Grade & Roll</span>
                    <span className="font-semibold">{lessonPlan.administrativeDetails.grade}</span>
                    <span className="block text-[10px] text-slate-500">
                      {lessonPlan.administrativeDetails.roll}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block uppercase text-[9px] font-bold">Learning Area</span>
                    <span className="font-bold text-emerald-800">
                      {lessonPlan.administrativeDetails.learningArea}
                    </span>
                    <span className="block text-[10px] text-slate-700 truncate">
                      {lessonPlan.administrativeDetails.subStrand}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specific Learning Outcomes */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-3.5 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>1. Specific Learning Outcomes</span>
                </h3>
                <p className="text-slate-600 mb-1 italic font-medium">
                  By the end of the lesson, the learner should be able to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-800">
                  {lessonPlan.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="leading-snug">
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Inquiry Question */}
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/60">
                <h3 className="font-bold text-blue-950 uppercase tracking-wide text-[10px] sm:text-[11px] mb-0.5">
                  2. Key Inquiry Question (KIQ)
                </h3>
                <p className="font-semibold text-blue-900 text-xs sm:text-sm">
                  {lessonPlan.keyInquiryQuestion}
                </p>
              </div>

              {/* Competencies, Values & PCIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="border border-slate-200 rounded p-2.5 bg-white">
                  <h4 className="font-bold text-slate-900 text-[11px] mb-0.5">Core Competencies</h4>
                  <p className="text-slate-700 text-[11px]">{lessonPlan.coreCompetencies.join(', ')}</p>
                </div>
                <div className="border border-slate-200 rounded p-2.5 bg-white">
                  <h4 className="font-bold text-slate-900 text-[11px] mb-0.5">Values</h4>
                  <p className="text-slate-700 text-[11px]">{lessonPlan.values.join(', ')}</p>
                </div>
                <div className="border border-slate-200 rounded p-2.5 bg-white">
                  <h4 className="font-bold text-slate-900 text-[11px] mb-0.5">PCIs</h4>
                  <p className="text-slate-700 text-[11px]">{lessonPlan.pcis.join(', ')}</p>
                </div>
              </div>

              {/* Resources */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <h4 className="font-bold text-slate-900 text-[11px] mb-1 uppercase tracking-wide">
                  Learning Resources & Setup
                </h4>
                <p className="text-slate-700 text-xs">{lessonPlan.learningResources.join('; ')}</p>
                {lessonPlan.organizationOfLearning && (
                  <p className="mt-1 text-slate-600 text-[11px]">
                    <b>Organization:</b> {lessonPlan.organizationOfLearning}
                  </p>
                )}
              </div>

              {/* 5-Step Lesson Development */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-2 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5-Stage Lesson Development (40 Minutes)</span>
                </h3>

                {/* Mobile Cards for Stages (< sm) */}
                <div className="space-y-2.5 sm:hidden">
                  {lessonPlan.stages.map((stage, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-900">{stage.stageName}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {stage.timeAllocation}
                        </span>
                      </div>
                      <div>
                        <b className="text-slate-700 block text-[10px] uppercase">Teacher Facilitation:</b>
                        <p className="text-slate-800 text-[11px] leading-relaxed mt-0.5">
                          {stage.teacherFacilitation}
                        </p>
                      </div>
                      <div>
                        <b className="text-slate-700 block text-[10px] uppercase">Learner Activities:</b>
                        <p className="text-slate-800 text-[11px] leading-relaxed mt-0.5">
                          {stage.learnerActivities}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table for Stages (sm and above) */}
                <div className="hidden sm:block border border-slate-300 rounded overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold divide-x divide-slate-700">
                        <th className="p-2 w-28 text-left">Stage / Time</th>
                        <th className="p-2 w-1/2 text-left">Teacher Facilitation</th>
                        <th className="p-2 w-1/2 text-left">Learner Activities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {lessonPlan.stages.map((stage, idx) => (
                        <tr
                          key={idx}
                          className={`divide-x divide-slate-200 ${
                            idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                          }`}
                        >
                          <td className="p-2.5 font-bold align-top">
                            <div className="text-slate-900">{stage.stageName}</div>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {stage.timeAllocation}
                            </span>
                          </td>
                          <td className="p-2.5 align-top text-slate-800 leading-relaxed">
                            {stage.teacherFacilitation}
                          </td>
                          <td className="p-2.5 align-top text-slate-800 leading-relaxed">
                            {stage.learnerActivities}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assessment Rubric */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-2 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assessment Rubric (TSC CBC Scale)</span>
                </h3>

                {/* Mobile Rubric List */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:hidden">
                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded">
                    <span className="font-bold text-emerald-900 block text-[10px]">Level 4 · Exceeding</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      {lessonPlan.assessmentRubric.exceedingExpectations}
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded">
                    <span className="font-bold text-blue-900 block text-[10px]">Level 3 · Meeting</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      {lessonPlan.assessmentRubric.meetingExpectations}
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded">
                    <span className="font-bold text-amber-900 block text-[10px]">Level 2 · Approaching</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      {lessonPlan.assessmentRubric.approachingExpectations}
                    </p>
                  </div>
                  <div className="p-2.5 bg-rose-50/50 border border-rose-200 rounded">
                    <span className="font-bold text-rose-900 block text-[10px]">Level 1 · Below</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      {lessonPlan.assessmentRubric.belowExpectations}
                    </p>
                  </div>
                </div>

                {/* Desktop Rubric Table */}
                <div className="hidden sm:block border border-slate-300 rounded overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold divide-x divide-slate-300 border-b border-slate-300">
                        <th className="p-2 w-1/4 text-left">Exceeding (Level 4)</th>
                        <th className="p-2 w-1/4 text-left">Meeting (Level 3)</th>
                        <th className="p-2 w-1/4 text-left">Approaching (Level 2)</th>
                        <th className="p-2 w-1/4 text-left">Below (Level 1)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-x divide-slate-300">
                      <tr className="bg-white">
                        <td className="p-2 align-top text-slate-700">
                          {lessonPlan.assessmentRubric.exceedingExpectations}
                        </td>
                        <td className="p-2 align-top text-slate-700">
                          {lessonPlan.assessmentRubric.meetingExpectations}
                        </td>
                        <td className="p-2 align-top text-slate-700">
                          {lessonPlan.assessmentRubric.approachingExpectations}
                        </td>
                        <td className="p-2 align-top text-slate-700">
                          {lessonPlan.assessmentRubric.belowExpectations}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Extended Learning */}
              {lessonPlan.extendedLearningActivity && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
                  <h4 className="font-bold text-amber-950 text-[11px] uppercase tracking-wide mb-1">
                    Extended Learning / Community Activity
                  </h4>
                  <p className="text-amber-900 text-xs">{lessonPlan.extendedLearningActivity}</p>
                </div>
              )}

              {/* Reflection */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wide mb-1">
                  Teacher's Self-Evaluation / Reflection Box
                </h4>
                <p className="text-slate-600 italic text-xs">
                  {lessonPlan.teacherSelfReflection ||
                    'Lesson successfully delivered. Concepts grasped by 85% of learners. Remedial support planned for struggling learners during prep time.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
