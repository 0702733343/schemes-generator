export interface SchemeMetadata {
  id: string;
  title: string;
  schoolName: string;
  teacherName: string;
  tscNumber: string;
  grade: string;
  subject: string;
  term: string; // 'Term 1' | 'Term 2' | 'Term 3'
  year: string;
  lessonsPerWeek: number;
  totalWeeks: number;
  courseBook: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeLessonRow {
  id: string;
  week: number;
  lesson: number;
  strand: string;
  subStrand: string;
  learningOutcomes: string[];
  keyInquiryQuestions: string[];
  coreCompetencies?: string[];
  values?: string[];
  pcis?: string[];
  learningExperiences: string[];
  learningResources: string[];
  assessmentMethods: string[];
  reflection: string;
  isSpecialRow?: boolean;
  specialRowType?: 'midterm' | 'assessment' | 'csl' | 'regular' | 'holiday';
}

export interface SchemeOfWork {
  metadata: SchemeMetadata;
  lessons: SchemeLessonRow[];
}

export interface LessonPlanStage {
  stageName: string;
  timeAllocation: string;
  teacherFacilitation: string;
  learnerActivities: string;
  learningPoints?: string;
}

export interface AssessmentRubric {
  exceedingExpectations: string;
  meetingExpectations: string;
  approachingExpectations: string;
  belowExpectations: string;
}

export interface TSC5StepLessonPlan {
  administrativeDetails: {
    school: string;
    teacher: string;
    tscNo: string;
    grade: string;
    learningArea: string;
    date: string;
    time: string;
    roll: string;
    strand: string;
    subStrand: string;
  };
  learningOutcomes: string[];
  keyInquiryQuestion: string;
  coreCompetencies: string[];
  values: string[];
  pcis: string[];
  learningResources: string[];
  organizationOfLearning?: string;
  stages: LessonPlanStage[];
  assessmentRubric: AssessmentRubric;
  extendedLearningActivity?: string;
  teacherSelfReflection?: string;
}

export interface KICDCurriculumDesign {
  id: string;
  level: 'Junior School' | 'Upper Primary' | 'Lower Primary' | 'Senior School';
  grade: string;
  subject: string;
  term: string;
  recommendedCourseBook: string;
  defaultLessonsPerWeek: number;
  description: string;
  strands: {
    strandName: string;
    subStrands: {
      subStrandName: string;
      suggestedLessons: number;
      specificLearningOutcomes: string[];
      keyInquiryQuestions: string[];
      coreCompetencies: string[];
      values: string[];
      pcis: string[];
      suggestedLearningExperiences: string[];
      suggestedResources: string[];
      suggestedAssessment: string[];
    }[];
  }[];
}
