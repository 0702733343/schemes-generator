import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to safely parse JSON from Gemini model responses
function cleanAndParseJson(rawText?: string): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Initial JSON parse failed, trying relaxed extraction:', e);
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw e;
  }
}

// Endpoint: Generate Full Scheme of Work
app.post('/api/schemes/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      grade = 'Grade 7',
      subject = 'Integrated Science',
      term = 'Term 1',
      year = '2026',
      totalWeeks = 12,
      lessonsPerWeek = 4,
      schoolName = 'Kilimani Junior School',
      teacherName = 'Mwalimu J. Muturi',
      tscNumber = 'TSC/849201',
      courseBook = 'KLB Top Scholar & Oxford Mentor',
      includeMidTerm = true,
      includeEndTermExam = true,
      curriculumDesignContent = '',
    } = req.body;

    const systemInstruction = `You are Kenya's leading Curriculum & Pedagogy Specialist, expert in KICD (Kenya Institute of Curriculum Development) Competency Based Curriculum (CBC / CBE) designs and TSC (Teachers Service Commission) standard Schemes of Work.

Generate an authentic, thorough, lesson-by-lesson Scheme of Work for Kenyan schools strictly following the official TSC 11-column table layout:
1. Week
2. Lesson
3. Strand (Theme/Major Topic)
4. Sub-strand (Sub-topic)
5. Specific Learning Outcomes (Formatted as: "By the end of the lesson, the learner should be able to: a) ... b) ... c) ...")
6. Key Inquiry Question(s) (KIQ)
7. Core Competencies & Values (e.g. Critical thinking & problem solving, Digital literacy, Communication & collaboration; Values: Love, Respect, Integrity, Unity; PCIs: Environmental education, Disaster risk reduction, Financial literacy)
8. Learning Experiences (Learner-centred practical activities, group tasks, observation, experiments, discussions)
9. Learning Resources & References (Specific textbook citations e.g. "${courseBook} Pg X-Y", real specimens, charts, digital devices, models)
10. Assessment Methods (Observation checklists, oral questions, written tests, portfolio, rubrics, peer assessment)
11. Reflection / Remarks (Professional notes or standard guidance like "To be filled after lesson execution. Ensure remedial for slower pacers.")

Term Structure Guidelines:
- Total teaching weeks: ${totalWeeks}.
- Lessons per week: ${lessonsPerWeek}.
- Total scheduled lessons: ${Number(totalWeeks) * Number(lessonsPerWeek)}.
${includeMidTerm ? `- Designate Week ${Math.floor(Number(totalWeeks) / 2)} as MID-TERM ASSESSMENT & HALF-TERM BREAK.` : ''}
${includeEndTermExam ? `- Designate Week ${totalWeeks} as END OF TERM SUMMATIVE ASSESSMENT & REMARKS.` : ''}
- Pace the learning outcomes logically: Introductory concepts -> Developmental hands-on concepts -> Practical application -> Formative checkpoint -> Consolidation.
- Ensure the language is standard professional Kenyan educational English (with accurate Kiswahili terms if subject is Kiswahili).`;

    const prompt = `Please generate the full CBC Scheme of Work for:
- Level / Grade: ${grade}
- Learning Area / Subject: ${subject}
- Term: ${term}, Year: ${year}
- Total Weeks: ${totalWeeks}
- Lessons per week: ${lessonsPerWeek}
- Recommended Coursebook & Teacher's Guide: ${courseBook}
- School: ${schoolName}
- Teacher: ${teacherName} (TSC No: ${tscNumber})

Curriculum Design Guidelines / Reference Input:
${curriculumDesignContent ? curriculumDesignContent : `Use standard official KICD CBC Curriculum Design strands and sub-strands for ${grade} ${subject} for ${term}.`}

Return a JSON object matching the requested schema with an array of lessons covering the entire term.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            schoolName: { type: Type.STRING },
            teacherName: { type: Type.STRING },
            tscNumber: { type: Type.STRING },
            grade: { type: Type.STRING },
            subject: { type: Type.STRING },
            term: { type: Type.STRING },
            year: { type: Type.STRING },
            lessonsPerWeek: { type: Type.INTEGER },
            totalWeeks: { type: Type.INTEGER },
            courseBook: { type: Type.STRING },
            summary: { type: Type.STRING },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  week: { type: Type.INTEGER },
                  lesson: { type: Type.INTEGER },
                  strand: { type: Type.STRING },
                  subStrand: { type: Type.STRING },
                  learningOutcomes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  keyInquiryQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  coreCompetencies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  values: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  pcis: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  learningExperiences: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  learningResources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  assessmentMethods: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  reflection: { type: Type.STRING },
                  isSpecialRow: { type: Type.BOOLEAN },
                  specialRowType: { type: Type.STRING }, // 'midterm' | 'assessment' | 'csl' | 'regular'
                },
                required: [
                  'week',
                  'lesson',
                  'strand',
                  'subStrand',
                  'learningOutcomes',
                  'keyInquiryQuestions',
                  'learningExperiences',
                  'learningResources',
                  'assessmentMethods',
                ],
              },
            },
          },
          required: ['title', 'grade', 'subject', 'term', 'year', 'lessons'],
        },
      },
    });

    const parsedData = cleanAndParseJson(response.text);

    // Ensure all lessons have IDs
    if (parsedData.lessons && Array.isArray(parsedData.lessons)) {
      parsedData.lessons = parsedData.lessons.map((lesson: any, index: number) => ({
        ...lesson,
        id: lesson.id || `lesson-${lesson.week || 1}-${lesson.lesson || index + 1}-${Date.now().toString(36)}-${index}`,
      }));
    }

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating Scheme of Work:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate scheme of work.',
    });
  }
});

// Endpoint: Generate Official TSC 5-Step CBC Lesson Plan
app.post('/api/schemes/lesson-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      lessonData,
      schoolName = 'Kilimani Junior School',
      teacherName = 'Mwalimu J. Muturi',
      tscNumber = 'TSC/849201',
      grade = 'Grade 7',
      subject = 'Integrated Science',
      duration = '40 minutes',
      roll = '45 learners (23 boys, 22 girls)',
      date = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
    } = req.body;

    if (!lessonData) {
      res.status(400).json({ success: false, error: 'lessonData is required' });
      return;
    }

    const systemInstruction = `You are a Senior TSC Quality Assurance & Standards Officer (QASO) and Master Trainer in Kenya.
Create an exhaustive, inspection-ready official TSC CBC Lesson Plan based on the provided Scheme of Work lesson.

Follow the standard TSC Kenya 5-Stage CBC Lesson Plan format:
1. Administrative details: School, Date, Time, Roll, Grade, Learning Area, Strand, Sub-strand.
2. Specific Learning Outcomes (stated using Bloom's revised taxonomy with observable action verbs).
3. Key Inquiry Question (KIQ).
4. Core Competencies to be developed.
5. Values and Pertinent & Contemporary Issues (PCIs).
6. Learning Resources (concrete apparatus, textbooks, digital aids).
7. Lesson Stages (Timed):
   - Introduction (approx 5 mins): Learner engagement, baseline recall, sharing lesson objectives, introducing the KIQ.
   - Lesson Development:
     - Step 1 (approx 10 mins): Guided exploration, demonstration, or group task.
     - Step 2 (approx 15 mins): Learner-centred investigation, practical manipulation, recording data, peer discussion.
     - Step 3 (approx 5 mins): Reporting, teacher consolidation, clarifying misconceptions.
   - Conclusion (approx 5 mins): Formative reflection, wrap-up Q&A, extended learning / homework task.
8. Assessment Criteria & Rubric (Exceeding Expectation 4, Meeting Expectation 3, Approaching Expectation 2, Below Expectation 1).
9. Self-Reflection / Remarks section (Prompt for the teacher to gauge mastery, note absent learners, and schedule remediation).`;

    const prompt = `Generate a complete official TSC CBC Lesson Plan for:
School: ${schoolName}
Teacher: ${teacherName} (TSC No: ${tscNumber})
Grade: ${grade}
Subject: ${subject}
Date: ${date}
Duration: ${duration}
Roll: ${roll}

Scheme Lesson Details:
- Week: ${lessonData.week}, Lesson: ${lessonData.lesson}
- Strand: ${lessonData.strand}
- Sub-strand: ${lessonData.subStrand}
- Learning Outcomes: ${JSON.stringify(lessonData.learningOutcomes)}
- Key Inquiry Question: ${JSON.stringify(lessonData.keyInquiryQuestions)}
- Core Competencies: ${JSON.stringify(lessonData.coreCompetencies || [])}
- Values & PCIs: ${JSON.stringify(lessonData.values || [])} / ${JSON.stringify(lessonData.pcis || [])}
- Learning Experiences: ${JSON.stringify(lessonData.learningExperiences)}
- Learning Resources: ${JSON.stringify(lessonData.learningResources)}
- Assessment: ${JSON.stringify(lessonData.assessmentMethods)}

Return comprehensive structured JSON matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            administrativeDetails: {
              type: Type.OBJECT,
              properties: {
                school: { type: Type.STRING },
                teacher: { type: Type.STRING },
                tscNo: { type: Type.STRING },
                grade: { type: Type.STRING },
                learningArea: { type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                roll: { type: Type.STRING },
                strand: { type: Type.STRING },
                subStrand: { type: Type.STRING },
              },
            },
            learningOutcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyInquiryQuestion: { type: Type.STRING },
            coreCompetencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            values: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pcis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            learningResources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            organizationOfLearning: { type: Type.STRING },
            stages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stageName: { type: Type.STRING },
                  timeAllocation: { type: Type.STRING },
                  teacherFacilitation: { type: Type.STRING },
                  learnerActivities: { type: Type.STRING },
                  learningPoints: { type: Type.STRING },
                },
                required: ['stageName', 'timeAllocation', 'teacherFacilitation', 'learnerActivities'],
              },
            },
            assessmentRubric: {
              type: Type.OBJECT,
              properties: {
                exceedingExpectations: { type: Type.STRING },
                meetingExpectations: { type: Type.STRING },
                approachingExpectations: { type: Type.STRING },
                belowExpectations: { type: Type.STRING },
              },
            },
            extendedLearningActivity: { type: Type.STRING },
            teacherSelfReflection: { type: Type.STRING },
          },
          required: [
            'administrativeDetails',
            'learningOutcomes',
            'keyInquiryQuestion',
            'stages',
            'assessmentRubric',
          ],
        },
      },
    });

    const plan = cleanAndParseJson(response.text);

    res.json({ success: true, data: plan });
  } catch (error: any) {
    console.error('Error generating Lesson Plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate lesson plan.',
    });
  }
});

// Endpoint: Parse Raw Curriculum Design Text / Syllabus / Pasted PDF
app.post('/api/curriculum/parse-raw', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawText, grade = 'Grade 7', subject = 'General' } = req.body;

    if (!rawText || rawText.trim().length < 10) {
      res.status(400).json({ success: false, error: 'Curriculum text is required.' });
      return;
    }

    const systemInstruction = `You are a Kenyan curriculum design parser. The user will provide raw text extracted from a Kenya KICD Curriculum Design booklet, syllabus page, or teacher notes.
Extract and normalize the strands, sub-strands, specific learning outcomes, key inquiry questions, core competencies, values, suggested learning experiences, and suggested assessment modes.`;

    const prompt = `Parse and organize this curriculum text for ${grade} ${subject}:
"""
${rawText}
"""

Format it into a structured JSON representation so that a complete scheme of work can be created from it.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedSubject: { type: Type.STRING },
            extractedGrade: { type: Type.STRING },
            generalLearningOutcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            strands: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  strandName: { type: Type.STRING },
                  subStrands: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        subStrandName: { type: Type.STRING },
                        suggestedLessons: { type: Type.INTEGER },
                        specificLearningOutcomes: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        keyInquiryQuestions: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        coreCompetencies: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        values: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        suggestedLearningExperiences: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        suggestedAssessment: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['subStrandName', 'specificLearningOutcomes'],
                    },
                  },
                },
                required: ['strandName', 'subStrands'],
              },
            },
          },
          required: ['strands'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error parsing curriculum raw text:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse curriculum text.',
    });
  }
});

// Endpoint: AI Refine / Differentiate Lesson Row
app.post('/api/schemes/refine-row', async (req: Request, res: Response): Promise<void> => {
  try {
    const { row, instruction } = req.body;
    if (!row || !instruction) {
      res.status(400).json({ success: false, error: 'Row and instruction are required.' });
      return;
    }

    const systemInstruction = `You are a senior Kenyan pedagogical coach. Modify the provided Scheme of Work row according to the teacher's instruction (e.g. adjust resources for low-resource environments, add digital tools, adapt for special needs, enhance learning outcomes). Keep the Kenyan CBC TSC standard format.`;

    const prompt = `Current Scheme Row:
${JSON.stringify(row, null, 2)}

Teacher Request: "${instruction}"

Return the updated row object in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strand: { type: Type.STRING },
            subStrand: { type: Type.STRING },
            learningOutcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyInquiryQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coreCompetencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            values: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pcis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            learningExperiences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            learningResources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            assessmentMethods: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reflection: { type: Type.STRING },
          },
          required: [
            'strand',
            'subStrand',
            'learningOutcomes',
            'keyInquiryQuestions',
            'learningExperiences',
            'learningResources',
            'assessmentMethods',
          ],
        },
      },
    });

    const updatedRow = cleanAndParseJson(response.text);
    res.json({ success: true, data: { ...row, ...updatedRow } });
  } catch (error: any) {
    console.error('Error refining row:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refine row.',
    });
  }
});

// Vite or Static file middleware
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
