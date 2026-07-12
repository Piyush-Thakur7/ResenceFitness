'use client';

import { useState } from 'react';

export default function BodyAssessmentSection({
  profile,
  assessments = [],
  onUploadAndAssess,
  loading = false,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 3) {
      setError('You can select a maximum of 3 photos.');
      return;
    }

    setError('');
    setSelectedFiles(files);

    // Generate previews
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least 1 photo.');
      return;
    }

    setError('');
    
    // Read files as base64
    try {
      const base64Files = await Promise.all(
        selectedFiles.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Call parent handler
      await onUploadAndAssess(base64Files, selectedFiles.map(f => f.name));
      
      // Reset
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error('File parsing failed:', err);
      setError('Failed to process photos. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-wide uppercase">AI Body Assessment</h1>
        <p className="text-zinc-400 text-xs mt-1 font-light">Upload front/side physique photos to receive a detailed breakdown of focus areas and gap analyses from Gemini Vision.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="stripe-card p-6 space-y-4">
          <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-wider font-display">New Assessment</h2>

          {error && (
            <div className="p-3 bg-red-950 border border-red-900 text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-400">Upload 1-3 Photos (Front, Side, Back)</label>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-orange-500 rounded-xl py-8 bg-zinc-950 cursor-pointer transition-colors relative">
                <svg className="w-8 h-8 text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-zinc-400 font-medium">Select Images (Max 3)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={loading}
                />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || selectedFiles.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Consulting Vision AI...
                </>
              ) : (
                'Generate AI Report'
              )}
            </button>

            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              🔒 Photos are stored privately in Supabase Storage. Only you have view permissions.
            </p>
          </form>
        </div>

        {/* Right Column: Historical Reports & Active Report */}
        <div className="lg:col-span-2 space-y-6">
          {assessments.length === 0 ? (
            <div className="stripe-card p-8 text-center text-zinc-400 space-y-3">
              <svg className="w-10 h-10 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-bold text-white text-xs font-display uppercase tracking-wider">No assessments generated</h3>
              <p className="text-[10px] font-light">Select and upload photos on the left to trigger your first body critique.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active / Latest report details */}
              <div className="stripe-card p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                  <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-wider font-display">Latest Critique Report</h3>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    {new Date(assessments[0].date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Markdown body rendering */}
                <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-4 leading-relaxed whitespace-pre-wrap font-light">
                  {assessments[0].assessment_report}
                </div>
              </div>

              {/* Historical summaries if multiple exist */}
              {assessments.length > 1 && (
                <div className="stripe-card p-6 space-y-4">
                  <h3 className="text-zinc-350 font-bold text-xs uppercase tracking-wider font-display">Historical Logs</h3>
                  <div className="divide-y divide-zinc-900">
                    {assessments.slice(1).map((as, idx) => (
                      <details key={idx} className="group py-3.5 cursor-pointer">
                        <summary className="flex justify-between items-center list-none text-xs text-zinc-400 group-open:text-orange-400 font-bold transition-colors uppercase tracking-wider">
                          <span>
                            Assessment from{' '}
                            {new Date(as.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform text-zinc-550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-3 prose prose-invert max-w-none text-xs text-zinc-400 space-y-2 whitespace-pre-wrap pt-3 border-t border-zinc-900 font-light">
                          {as.assessment_report}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
