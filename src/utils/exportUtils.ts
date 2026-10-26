import { SchemeOfWork, TSC5StepLessonPlan } from '../types/scheme';
import { generateSchemeDocx, generateLessonPlanDocx } from './docxExport';

/**
 * Exports Scheme of Work to native, fully editable Microsoft Word (.docx) format.
 * Generates OpenXML compliant document with landscape tables, repeat headers, and cell formatting.
 */
export async function exportSchemeToWord(scheme: SchemeOfWork): Promise<void> {
  const { metadata } = scheme;

  try {
    const blob = await generateSchemeDocx(scheme);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanGrade = metadata.grade.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanSubj = metadata.subject.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanTerm = metadata.term.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${cleanGrade}_${cleanSubj}_${cleanTerm}_Scheme_of_Work.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating .docx file:', err);
    // Fallback if needed
    exportSchemeToHtmlWordFallback(scheme);
  }
}

/**
 * Exports single Lesson Plan to native, fully editable Microsoft Word (.docx) document.
 */
export async function exportLessonPlanToWord(plan: TSC5StepLessonPlan): Promise<void> {
  const admin = plan.administrativeDetails;

  try {
    const blob = await generateLessonPlanDocx(plan);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanGrade = admin.grade.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanSub = admin.subStrand.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    a.download = `Lesson_Plan_${cleanGrade}_${cleanSub}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating lesson plan .docx file:', err);
    exportLessonPlanToHtmlFallback(plan);
  }
}

/**
 * Exports Scheme of Work to clean CSV format.
 */
export function exportSchemeToCsv(scheme: SchemeOfWork): void {
  const { metadata, lessons } = scheme;

  const headers = [
    'Week',
    'Lesson',
    'Strand',
    'Sub-Strand',
    'Specific Learning Outcomes',
    'Key Inquiry Questions',
    'Core Competencies',
    'Values',
    'PCIs',
    'Learning Experiences',
    'Learning Resources',
    'Assessment Methods',
    'Reflection',
  ];

  const escapeCsv = (val: string) => {
    if (!val) return '""';
    const clean = val.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = lessons.map((r) => [
    r.week,
    r.lesson,
    escapeCsv(r.strand),
    escapeCsv(r.subStrand),
    escapeCsv(r.learningOutcomes.join('; ')),
    escapeCsv(r.keyInquiryQuestions.join('; ')),
    escapeCsv(r.coreCompetencies?.join('; ') || ''),
    escapeCsv(r.values?.join('; ') || ''),
    escapeCsv(r.pcis?.join('; ') || ''),
    escapeCsv(r.learningExperiences.join('; ')),
    escapeCsv(r.learningResources.join('; ')),
    escapeCsv(r.assessmentMethods.join('; ')),
    escapeCsv(r.reflection || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${metadata.grade}_${metadata.subject}_Scheme.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fallbacks
function exportSchemeToHtmlWordFallback(scheme: SchemeOfWork): void {
  const { metadata, lessons } = scheme;
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${metadata.schoolName} Scheme</title></head>
<body><h1>${metadata.schoolName}</h1><h2>${metadata.grade} ${metadata.subject}</h2>
<table border="1">${lessons.map(l => `<tr><td>${l.week}</td><td>${l.lesson}</td><td>${l.strand}</td><td>${l.subStrand}</td><td>${l.learningOutcomes.join('<br>')}</td></tr>`).join('')}</table>
</body></html>`;
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${metadata.grade}_${metadata.subject}_Scheme.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportLessonPlanToHtmlFallback(plan: TSC5StepLessonPlan): void {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset='utf-8'><title>Lesson Plan</title></head>
<body><h1>${plan.administrativeDetails.school}</h1><h2>Lesson Plan: ${plan.administrativeDetails.subStrand}</h2></body></html>`;
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lesson_Plan_${plan.administrativeDetails.grade}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
