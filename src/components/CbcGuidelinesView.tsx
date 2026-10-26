import React from 'react';
import {
  BookOpen,
  Award,
  Heart,
  Globe,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export const CbcGuidelinesView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Hero card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-xs">
        <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>KICD & TSC Pedagogical Framework</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
          Kenyan CBC Professional Scheming Guidelines
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
          The Teachers Service Commission (TSC) and Kenya Institute of Curriculum Development (KICD)
          require every practicing teacher to prepare and maintain professional schemes of work and
          lesson plans before instruction begins.
        </p>
      </div>

      {/* The 7 Core Competencies */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              The 7 Core Competencies of CBC (Kenya)
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Must be intentionally woven into specific learning outcomes and learning experiences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-0.5">
              1. Communication and Collaboration
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Sharing thoughts, listening actively, working cooperatively in diverse groups, and presenting findings.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-0.5">
              2. Critical Thinking and Problem Solving
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Analyzing situations, making reasoned judgments, evaluating evidence, and formulating innovative solutions.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-0.5">
              3. Creativity and Imagination
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Generating original ideas, experimenting with alternative approaches, and crafting unique artifacts.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-0.5">4. Citizenship</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Understanding rights and civic responsibilities, active participation in community improvement, and national cohesion.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-0.5">5. Digital Literacy</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Using digital tools, tablets, educational apps, and online resources responsibly for discovery and communication.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-0.5">6. Learning to Learn</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Organizing one's own learning, reflective self-evaluation, and applying knowledge across unfamiliar situations.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg sm:col-span-2 lg:col-span-1">
            <span className="font-bold text-slate-900 block mb-0.5">7. Self-Efficacy</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Cultivating self-confidence, emotional regulation, perseverance, and pride in personal achievements.
            </p>
          </div>
        </div>
      </div>

      {/* The 8 Core Values & PCIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Core Values */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">The 8 Core Values</h2>
              <p className="text-[11px] text-slate-500">Character pillars in every Kenyan lesson</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              1. Love
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              2. Responsibility
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              3. Respect
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              4. Unity
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              5. Peace
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              6. Patriotism
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              7. Social Justice
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 font-medium text-slate-800">
              8. Integrity
            </div>
          </div>
        </div>

        {/* Pertinent & Contemporary Issues (PCIs) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Pertinent & Contemporary Issues
              </h2>
              <p className="text-[11px] text-slate-500">Cross-cutting real world challenges</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
              <b>Environmental Education:</b> Climate change mitigation, tree planting, waste segregation.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
              <b>Financial Literacy:</b> Savings, budgeting, consumer awareness, entrepreneurship.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
              <b>Health & Safety:</b> Hygiene, nutrition, communicable diseases, first aid, drug abuse prevention.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
              <b>Disaster Risk Reduction (DRR):</b> Fire safety, flood response, road safety precautions.
            </div>
          </div>
        </div>
      </div>

      {/* TSC QASO Inspection Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              TSC QASO Inspection Standards
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Key indicators Curriculum Support Officers (CSO) and QASO look for during school inspections
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b>Alignment to Official KICD Designs:</b> Strands and Sub-strands must strictly match
              the approved KICD curriculum design for that specific grade and learning area.
            </div>
          </div>

          <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b>Observable Action Verbs:</b> Use Bloom's Revised Taxonomy action verbs (e.g. <i>identify, state, demonstrate, formulate, construct, classify</i>) rather than vague terms.
            </div>
          </div>

          <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b>Inquiry-Based Questions (KIQs):</b> Key Inquiry Questions must stimulate curiosity and cannot be answered with a simple "yes" or "no".
            </div>
          </div>

          <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b>Specific Concrete Resources:</b> Citations must include exact textbook page numbers (e.g. <i>KLB Top Scholar Pg 14-18</i>) and realia / apparatus.
            </div>
          </div>

          <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b>Signed Remarks & Reflection:</b> Teachers must sign and date schemes and write genuine daily reflections post-lesson.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
