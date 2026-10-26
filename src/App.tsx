import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SchemeTable } from './components/SchemeTable';
import { SchemeGeneratorModal } from './components/SchemeGeneratorModal';
import { LessonPlanModal } from './components/LessonPlanModal';
import { RefineRowModal } from './components/RefineRowModal';
import { SchemesLibrary } from './components/SchemesLibrary';
import { CbcGuidelinesView } from './components/CbcGuidelinesView';
import { SchemeOfWork, SchemeLessonRow } from './types/scheme';
import { KENYAN_CURRICULUM_DESIGNS } from './data/kenyanCurriculumDesigns';
import { PlusCircle, Sparkles, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'mwalimu_cbc_schemes_v1';
const CURRENT_SCHEME_KEY = 'mwalimu_cbc_current_scheme_id';

// Initial Starter Scheme from Grade 7 Integrated Science Preset
function createInitialDefaultScheme(): SchemeOfWork {
  const preset = KENYAN_CURRICULUM_DESIGNS[0]; // G7 Int Sci
  const defaultLessons: SchemeLessonRow[] = [];

  let lessonCount = 1;
  let currentWeek = 1;
  const lessonsPerWeek = preset.defaultLessonsPerWeek;

  preset.strands.forEach((strand) => {
    strand.subStrands.forEach((sub) => {
      for (let i = 0; i < sub.suggestedLessons; i++) {
        defaultLessons.push({
          id: `initial-lsn-${currentWeek}-${lessonCount}`,
          week: currentWeek,
          lesson: ((lessonCount - 1) % lessonsPerWeek) + 1,
          strand: strand.strandName,
          subStrand: `${sub.subStrandName} (Part ${i + 1})`,
          learningOutcomes: sub.specificLearningOutcomes,
          keyInquiryQuestions: sub.keyInquiryQuestions,
          coreCompetencies: sub.coreCompetencies,
          values: sub.values,
          pcis: sub.pcis,
          learningExperiences: sub.suggestedLearningExperiences,
          learningResources: sub.suggestedResources,
          assessmentMethods: sub.suggestedAssessment,
          reflection: '',
        });

        lessonCount++;
        if (lessonCount % lessonsPerWeek === 1) {
          currentWeek++;
        }
      }
    });
  });

  // Inject Mid-term break at week 7
  defaultLessons.push({
    id: 'initial-midterm',
    week: 7,
    lesson: 1,
    strand: 'MID-TERM ASSESSMENT & HALF-TERM BREAK',
    subStrand: 'MID-TERM ASSESSMENT & HALF-TERM BREAK',
    learningOutcomes: ['Evaluate learner progress in strands covered in weeks 1-6'],
    keyInquiryQuestions: ['What concepts require revision and remedial attention?'],
    coreCompetencies: ['Learning to learn'],
    values: ['Integrity'],
    pcis: ['Health & safety during half-term'],
    learningExperiences: [
      'Administration of standardized mid-term assessment test',
      'Marking, item analysis, and compilation of mid-term progress reports',
      'Learners break for scheduled half-term recess',
    ],
    learningResources: ['Standardized printed assessment papers, marking schemes'],
    assessmentMethods: ['Written summative test, individual progress analysis'],
    reflection: 'Mid-term break successfully observed. Revision scheduled for Week 8.',
    isSpecialRow: true,
    specialRowType: 'midterm',
  });

  return {
    metadata: {
      id: 'default-g7-science-t1',
      title: 'Grade 7 Integrated Science Scheme of Work - Term 1 2026',
      schoolName: 'Kilimani Junior School',
      teacherName: 'Mwalimu J. Muturi',
      tscNumber: 'TSC/849201',
      grade: preset.grade,
      subject: preset.subject,
      term: preset.term,
      year: '2026',
      lessonsPerWeek: preset.defaultLessonsPerWeek,
      totalWeeks: 12,
      courseBook: preset.recommendedCourseBook,
      summary: preset.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    lessons: defaultLessons,
  };
}

export default function App() {
  const [schemes, setSchemes] = useState<SchemeOfWork[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved schemes:', e);
    }
    return [createInitialDefaultScheme()];
  });

  const [currentSchemeId, setCurrentSchemeId] = useState<string | null>(() => {
    const savedId = localStorage.getItem(CURRENT_SCHEME_KEY);
    if (savedId) return savedId;
    return 'default-g7-science-t1';
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'guide'>('editor');

  // Modals
  const [isNewSchemeModalOpen, setIsNewSchemeModalOpen] = useState(false);
  const [activeLessonPlanRow, setActiveLessonPlanRow] = useState<SchemeLessonRow | null>(null);
  const [activeRefineRow, setActiveRefineRow] = useState<SchemeLessonRow | null>(null);

  // Sync schemes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
    } catch (e) {
      console.error('Error saving schemes to localStorage:', e);
    }
  }, [schemes]);

  // Sync currentSchemeId to localStorage
  useEffect(() => {
    if (currentSchemeId) {
      localStorage.setItem(CURRENT_SCHEME_KEY, currentSchemeId);
    }
  }, [currentSchemeId]);

  const currentScheme = schemes.find((s) => s.metadata.id === currentSchemeId) || schemes[0] || null;

  const handleUpdateScheme = (updated: SchemeOfWork) => {
    setSchemes((prev) => prev.map((s) => (s.metadata.id === updated.metadata.id ? updated : s)));
  };

  const handleSchemeGenerated = (newScheme: SchemeOfWork) => {
    setSchemes((prev) => [newScheme, ...prev]);
    setCurrentSchemeId(newScheme.metadata.id);
    setActiveTab('editor');
  };

  const handleDeleteScheme = (id: string) => {
    setSchemes((prev) => {
      const filtered = prev.filter((s) => s.metadata.id !== id);
      if (currentSchemeId === id) {
        setCurrentSchemeId(filtered[0]?.metadata.id || null);
      }
      return filtered;
    });
  };

  const handleDuplicateScheme = (scheme: SchemeOfWork) => {
    const duplicated: SchemeOfWork = {
      ...scheme,
      metadata: {
        ...scheme.metadata,
        id: `scheme-dup-${Date.now()}`,
        title: `${scheme.metadata.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      lessons: scheme.lessons.map((l, i) => ({
        ...l,
        id: `dup-${l.id}-${i}-${Date.now().toString(36)}`,
      })),
    };

    setSchemes((prev) => [duplicated, ...prev]);
    setCurrentSchemeId(duplicated.metadata.id);
    setActiveTab('editor');
  };

  const handleImportScheme = (imported: SchemeOfWork) => {
    const newId = `imported-${Date.now()}`;
    const cleanScheme: SchemeOfWork = {
      ...imported,
      metadata: {
        ...imported.metadata,
        id: newId,
        updatedAt: new Date().toISOString(),
      },
    };
    setSchemes((prev) => [cleanScheme, ...prev]);
    setCurrentSchemeId(newId);
    setActiveTab('editor');
  };

  const handleRowRefined = (updatedRow: SchemeLessonRow) => {
    if (!currentScheme) return;
    const updatedLessons = currentScheme.lessons.map((r) =>
      r.id === updatedRow.id ? updatedRow : r
    );
    handleUpdateScheme({
      ...currentScheme,
      lessons: updatedLessons,
      metadata: { ...currentScheme.metadata, updatedAt: new Date().toISOString() },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewSchemeModal={() => setIsNewSchemeModalOpen(true)}
        currentScheme={currentScheme}
        onPrintScheme={handlePrint}
        schemesCount={schemes.length}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden">
        {activeTab === 'editor' && (
          <div>
            {currentScheme ? (
              <SchemeTable
                scheme={currentScheme}
                onUpdateScheme={handleUpdateScheme}
                onRequestLessonPlan={(row) => setActiveLessonPlanRow(row)}
                onRequestRefineRow={(row) => setActiveRefineRow(row)}
                onPrintScheme={handlePrint}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">No Active Scheme Selected</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create a new scheme from KICD curriculum presets or pick one from your library.
                </p>
                <button
                  onClick={() => setIsNewSchemeModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Scheme of Work</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <SchemesLibrary
            schemes={schemes}
            currentSchemeId={currentSchemeId}
            onSelectScheme={(scheme) => {
              setCurrentSchemeId(scheme.metadata.id);
              setActiveTab('editor');
            }}
            onDeleteScheme={handleDeleteScheme}
            onDuplicateScheme={handleDuplicateScheme}
            onImportScheme={handleImportScheme}
            onOpenNewModal={() => setIsNewSchemeModalOpen(true)}
          />
        )}

        {activeTab === 'guide' && <CbcGuidelinesView />}
      </main>

      {/* Footer (Hidden in Print, adjusted for mobile bottom bar) */}
      <footer className="no-print bg-white border-t border-slate-200 text-slate-500 text-[11px] sm:text-xs py-3 px-4 sm:px-6 text-center mb-14 md:mb-0">
        <p>
          MwalimuSchemes CBC · Built for Kenyan Primary, Junior School, and Senior Secondary Teachers
          aligned with KICD & TSC Regulations.
        </p>
      </footer>

      {/* Generator Modal */}
      <SchemeGeneratorModal
        isOpen={isNewSchemeModalOpen}
        onClose={() => setIsNewSchemeModalOpen(false)}
        onSchemeGenerated={handleSchemeGenerated}
      />

      {/* Lesson Plan Modal */}
      {currentScheme && (
        <LessonPlanModal
          isOpen={!!activeLessonPlanRow}
          onClose={() => setActiveLessonPlanRow(null)}
          lessonRow={activeLessonPlanRow}
          metadata={currentScheme.metadata}
        />
      )}

      {/* AI Refine Row Modal */}
      <RefineRowModal
        isOpen={!!activeRefineRow}
        onClose={() => setActiveRefineRow(null)}
        row={activeRefineRow}
        onRowRefined={handleRowRefined}
      />
    </div>
  );
}
