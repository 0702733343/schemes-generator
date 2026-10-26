import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  ShadingType,
  HeadingLevel,
} from 'docx';
import { SchemeOfWork, TSC5StepLessonPlan } from '../types/scheme';

const BORDER_COLOR = 'CBD5E1';
const HEADER_BG = '0F172A';
const SUBTLE_BG = 'F8FAFC';
const ACCENT_BG = 'FEF3C7';

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: BORDER_COLOR,
};

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

/**
 * Generates an authentic, fully editable Microsoft Word (.docx) file for the Scheme of Work.
 */
export async function generateSchemeDocx(scheme: SchemeOfWork): Promise<Blob> {
  const { metadata, lessons } = scheme;

  // 1. Header Paragraphs
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'REPUBLIC OF KENYA · TEACHERS SERVICE COMMISSION (TSC)',
          bold: true,
          size: 18, // 9pt
          color: '64748B',
          allCaps: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: metadata.schoolName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: `COMPETENCY BASED CURRICULUM (CBC) SCHEME OF WORK - ${metadata.term.toUpperCase()} ${metadata.year}`,
          bold: true,
          size: 24, // 12pt
          color: '1E3A8A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Standard Professional Teaching Record Aligned with KICD Curriculum Designs',
          italics: true,
          size: 18, // 9pt
          color: '475569',
        }),
      ],
    }),
  ];

  // 2. Metadata Summary Table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createMetaCell('LEARNING AREA:', true, 18),
          createMetaCell(metadata.subject, false, 32, true),
          createMetaCell('GRADE / LEVEL:', true, 18),
          createMetaCell(metadata.grade, false, 32, true),
        ],
      }),
      new TableRow({
        children: [
          createMetaCell("TEACHER'S NAME:", true, 18),
          createMetaCell(metadata.teacherName, false, 32),
          createMetaCell('TSC NUMBER:', true, 18),
          createMetaCell(metadata.tscNumber, false, 32),
        ],
      }),
      new TableRow({
        children: [
          createMetaCell('TERM & YEAR:', true, 18),
          createMetaCell(`${metadata.term}, ${metadata.year}`, false, 32),
          createMetaCell('LESSONS / TOTAL:', true, 18),
          createMetaCell(`${metadata.lessonsPerWeek} lessons/wk (${metadata.totalWeeks} Weeks)`, false, 32),
        ],
      }),
      new TableRow({
        children: [
          createMetaCell('REFERENCE TEXTS:', true, 18),
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
            columnSpan: 3,
            borders: cellBorders,
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: metadata.courseBook, size: 18 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 3. Scheme Table Headers (Repeated across pages)
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell('Wk', 4),
      createHeaderCell('Lsn', 4),
      createHeaderCell('Strand', 10),
      createHeaderCell('Sub-strand', 10),
      createHeaderCell('Specific Learning Outcomes', 20),
      createHeaderCell('Key Inquiry Questions', 10),
      createHeaderCell('Core Competencies & Values', 11),
      createHeaderCell('Learning Experiences', 15),
      createHeaderCell('Learning Resources', 8),
      createHeaderCell('Assessment', 4),
      createHeaderCell('Reflection', 4),
    ],
  });

  // 4. Scheme Table Body Rows
  const bodyRows: TableRow[] = lessons.map((row, index) => {
    if (row.isSpecialRow) {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: ACCENT_BG },
            margins: { top: 100, bottom: 100, left: 60, right: 60 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(row.week), bold: true, size: 18 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: ACCENT_BG },
            margins: { top: 100, bottom: 100, left: 60, right: 60 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(row.lesson), bold: true, size: 18 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 92, type: WidthType.PERCENTAGE },
            columnSpan: 9,
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: ACCENT_BG },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: row.subStrand.toUpperCase(),
                    bold: true,
                    size: 20,
                    color: '78350F',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: row.learningExperiences?.join('; ') || '',
                    size: 17,
                    color: '92400E',
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    }

    const rowBg = index % 2 === 1 ? SUBTLE_BG : 'FFFFFF';

    // Competencies formatted paragraphs
    const compParagraphs: Paragraph[] = [];
    if (row.coreCompetencies?.length) {
      compParagraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'Comp: ', bold: true, size: 16 }),
            new TextRun({ text: row.coreCompetencies.join(', '), size: 16 }),
          ],
        })
      );
    }
    if (row.values?.length) {
      compParagraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'Values: ', bold: true, size: 16 }),
            new TextRun({ text: row.values.join(', '), size: 16 }),
          ],
        })
      );
    }
    if (row.pcis?.length) {
      compParagraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'PCIs: ', bold: true, size: 16 }),
            new TextRun({ text: row.pcis.join(', '), size: 16 }),
          ],
        })
      );
    }

    return new TableRow({
      children: [
        // Wk
        createDataCell(String(row.week), 4, rowBg, true, AlignmentType.CENTER),
        // Lsn
        createDataCell(String(row.lesson), 4, rowBg, true, AlignmentType.CENTER),
        // Strand
        createDataCell(row.strand, 10, rowBg, true),
        // Sub-strand
        createDataCell(row.subStrand, 10, rowBg),
        // Specific Learning Outcomes (bulleted)
        createBulletCell(
          'By the end of the lesson, the learner should be able to:',
          row.learningOutcomes,
          20,
          rowBg
        ),
        // Key Inquiry Questions
        createBulletCell('', row.keyInquiryQuestions, 10, rowBg),
        // Competencies & Values
        new TableCell({
          width: { size: 11, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: rowBg },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: compParagraphs.length ? compParagraphs : [new Paragraph({ children: [new TextRun({ text: '-', size: 16 })] })],
        }),
        // Learning Experiences
        createBulletCell('', row.learningExperiences, 15, rowBg),
        // Learning Resources
        createBulletCell('', row.learningResources, 8, rowBg),
        // Assessment Methods
        createBulletCell('', row.assessmentMethods, 4, rowBg),
        // Reflection
        createDataCell(row.reflection || '', 4, rowBg, false, AlignmentType.LEFT, true),
      ],
    });
  });

  const schemeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [headerRow, ...bodyRows],
  });

  // 5. Signatures Table
  const signTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createSignCell('1. PREPARED BY SUBJECT TEACHER', [
            `Name: ${metadata.teacherName}`,
            `TSC No: ${metadata.tscNumber}`,
            'Signature: __________________________',
            'Date: _______________________________',
          ]),
          createSignCell('2. VERIFIED BY HEAD OF DEPARTMENT (HOD)', [
            'Name: _______________________________',
            'Remarks: ____________________________',
            'Signature: __________________________',
            'Date: _______________________________',
          ]),
          createSignCell('3. APPROVED BY PRINCIPAL / HEAD', [
            'Name: _______________________________',
            'Official Stamp: [                   ]',
            'Signature: __________________________',
            'Date: _______________________________',
          ]),
        ],
      }),
    ],
  });

  // Document Assembly
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 16838, // A4 Landscape in twips (11.69 inches)
              height: 11906, // 8.27 inches
            },
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          ...titleParagraphs,
          metaTable,
          new Paragraph({ spacing: { after: 150 } }),
          schemeTable,
          new Paragraph({ spacing: { after: 200 } }),
          signTable,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates an authentic, fully editable Microsoft Word (.docx) file for a TSC 5-Step Lesson Plan.
 */
export async function generateLessonPlanDocx(plan: TSC5StepLessonPlan): Promise<Blob> {
  const admin = plan.administrativeDetails;

  const headerParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: admin.school.toUpperCase(),
          bold: true,
          size: 30, // 15pt
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'TEACHERS SERVICE COMMISSION (TSC) CBC LESSON PLAN',
          bold: true,
          size: 24, // 12pt
          color: '1E3A8A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: 'Competency Based Curriculum / Competency Based Education',
          italics: true,
          size: 18,
          color: '475569',
        }),
      ],
    }),
  ];

  // Admin Table
  const adminTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createMetaCell('TEACHER:', true, 20),
          createMetaCell(`${admin.teacher} (TSC: ${admin.tscNo})`, false, 30),
          createMetaCell('DATE & TIME:', true, 20),
          createMetaCell(`${admin.date} (${admin.time})`, false, 30),
        ],
      }),
      new TableRow({
        children: [
          createMetaCell('GRADE & ROLL:', true, 20),
          createMetaCell(`${admin.grade} · Roll: ${admin.roll}`, false, 30),
          createMetaCell('LEARNING AREA:', true, 20),
          createMetaCell(admin.learningArea, false, 30, true),
        ],
      }),
      new TableRow({
        children: [
          createMetaCell('STRAND:', true, 20),
          createMetaCell(admin.strand, false, 30, true),
          createMetaCell('SUB-STRAND:', true, 20),
          createMetaCell(admin.subStrand, false, 30, true),
        ],
      }),
    ],
  });

  // Stages Table
  const stagesHeader = new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell('Stage / Time', 20),
      createHeaderCell('Teacher Facilitation & Step Details', 40),
      createHeaderCell('Learner Activities & Engagement', 40),
    ],
  });

  const stageRows = plan.stages.map((stage, i) => {
    const bg = i % 2 === 1 ? SUBTLE_BG : 'FFFFFF';
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: bg },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: stage.stageName, bold: true, size: 18 })],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `(${stage.timeAllocation})`,
                  color: '047857',
                  size: 16,
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: bg },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: stage.teacherFacilitation, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: bg },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: stage.learnerActivities, size: 18 })] })],
        }),
      ],
    });
  });

  const stagesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [stagesHeader, ...stageRows],
  });

  // Rubric Table
  const rubricTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell('Level 4: Exceeding', 25),
          createHeaderCell('Level 3: Meeting', 25),
          createHeaderCell('Level 2: Approaching', 25),
          createHeaderCell('Level 1: Below', 25),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(plan.assessmentRubric.exceedingExpectations, 25, 'FFFFFF'),
          createDataCell(plan.assessmentRubric.meetingExpectations, 25, 'FFFFFF'),
          createDataCell(plan.assessmentRubric.approachingExpectations, 25, 'FFFFFF'),
          createDataCell(plan.assessmentRubric.belowExpectations, 25, 'FFFFFF'),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: 11906, // A4 Portrait
              height: 16838,
            },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          ...headerParagraphs,
          adminTable,
          createSectionHeader('1. SPECIFIC LEARNING OUTCOMES'),
          new Paragraph({
            children: [
              new TextRun({
                text: 'By the end of the lesson, the learner should be able to:',
                italics: true,
                size: 18,
              }),
            ],
            spacing: { after: 60 },
          }),
          ...plan.learningOutcomes.map(
            (slo) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 40 },
                children: [new TextRun({ text: slo, size: 18 })],
              })
          ),
          createSectionHeader('2. KEY INQUIRY QUESTION (KIQ)'),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: plan.keyInquiryQuestion,
                bold: true,
                size: 19,
                color: '1E3A8A',
              }),
            ],
          }),
          createSectionHeader('3. CORE COMPETENCIES, VALUES & PCIs'),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Core Competencies: ', bold: true, size: 18 }),
              new TextRun({ text: plan.coreCompetencies.join(', '), size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Values: ', bold: true, size: 18 }),
              new TextRun({ text: plan.values.join(', '), size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'PCIs: ', bold: true, size: 18 }),
              new TextRun({ text: plan.pcis.join(', '), size: 18 }),
            ],
          }),
          createSectionHeader('4. LEARNING RESOURCES & ORGANIZATION'),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Resources: ', bold: true, size: 18 }),
              new TextRun({ text: plan.learningResources.join('; '), size: 18 }),
            ],
          }),
          ...(plan.organizationOfLearning
            ? [
                new Paragraph({
                  spacing: { after: 80 },
                  children: [
                    new TextRun({ text: 'Class Organization: ', bold: true, size: 18 }),
                    new TextRun({ text: plan.organizationOfLearning, size: 18 }),
                  ],
                }),
              ]
            : []),
          createSectionHeader('5. LESSON DEVELOPMENT (40-MINUTE 5-STAGE MATRIX)'),
          stagesTable,
          createSectionHeader('6. ASSESSMENT CRITERIA & RUBRIC'),
          rubricTable,
          createSectionHeader('7. TEACHER’S SELF-EVALUATION / REFLECTION'),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text:
                  plan.teacherSelfReflection ||
                  'Lesson execution notes: Assess whether 100% of learners achieved the specific learning outcomes. Note absent learners and remedial intervention planned.',
                italics: true,
                size: 17,
                color: '475569',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Helpers
function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: HEADER_BG },
    margins: { top: 80, bottom: 80, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 17,
          }),
        ],
      }),
    ],
  });
}

function createMetaCell(
  text: string,
  isLabel: boolean,
  widthPercent: number,
  boldValue: boolean = false
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: isLabel ? 'F1F5F9' : 'FFFFFF' },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isLabel || boldValue,
            size: 18,
            color: isLabel ? '475569' : '0F172A',
          }),
        ],
      }),
    ],
  });
}

function createDataCell(
  text: string,
  widthPercent: number,
  bgColor: string,
  bold: boolean = false,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  italics: boolean = false
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: bgColor },
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment,
        children: [
          new TextRun({
            text,
            bold,
            italics,
            size: 17,
          }),
        ],
      }),
    ],
  });
}

function createBulletCell(
  preamble: string,
  items: string[],
  widthPercent: number,
  bgColor: string
): TableCell {
  const paragraphs: Paragraph[] = [];

  if (preamble) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [new TextRun({ text: preamble, italics: true, size: 15, color: '475569' })],
      })
    );
  }

  items.forEach((item) => {
    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 30 },
        children: [new TextRun({ text: item, size: 16 })],
      })
    );
  });

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: bgColor },
    margins: { top: 80, bottom: 80, left: 60, right: 60 },
    children: paragraphs.length ? paragraphs : [new Paragraph({ children: [new TextRun({ text: '-', size: 16 })] })],
  });
}

function createSignCell(title: string, lines: string[]): TableCell {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: title, bold: true, size: 17, color: '0F172A' })],
      }),
      ...lines.map(
        (line) =>
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: line, size: 16, color: '334155' })],
          })
      ),
    ],
  });
}

function createSectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 20,
        color: '0F172A',
      }),
    ],
  });
}
