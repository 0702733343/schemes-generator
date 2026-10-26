import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { SchemeLessonRow } from '../types/scheme';

interface RefineRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: SchemeLessonRow | null;
  onRowRefined: (updatedRow: SchemeLessonRow) => void;
}

const QUICK_PROMPTS = [
  'Improvise using low-cost local materials (no lab setup needed)',
  'Add practical outdoor learner investigation and group work',
  'Differentiate for remedial learners and special needs',
  'Incorporate Kenya Digital Literacy tablets & digital devices',
  'Sharpen Bloom’s revised taxonomy action verbs in learning outcomes',
  'Add Community Service Learning (CSL) local application',
];

export const RefineRowModal: React.FC<RefineRowModalProps> = ({
  isOpen,
  onClose,
  row,
  onRowRefined,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !row) return null;

  const handleRefine = async (customInstruction?: string) => {
    const textToUse = customInstruction || instruction;
    if (!textToUse.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/schemes/refine-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row,
          instruction: textToUse,
        }),
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || 'Failed to refine lesson row.');
      }

      onRowRefined(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error refining lesson row.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold truncate">
              AI Refine Lesson (Wk {row.week}, Lsn {row.lesson})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3.5 text-xs">
          <div>
            <span className="text-slate-500 font-medium text-[11px]">Active Topic:</span>
            <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 line-clamp-1">
              {row.strand} · {row.subStrand}
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
              Quick Pedagogical Enhancements:
            </label>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {QUICK_PROMPTS.map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInstruction(promptText);
                    handleRefine(promptText);
                  }}
                  disabled={isLoading}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-200 text-slate-700 rounded-lg border border-slate-200 transition-colors text-left text-xs min-h-[38px] flex items-center"
                >
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">
              Or specify custom teacher notes:
            </label>
            <textarea
              rows={2}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Adapt resources using everyday items found around the school compound."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg font-medium min-h-[38px]"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRefine()}
              disabled={isLoading || !instruction.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50 min-h-[38px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Refining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Refinement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
