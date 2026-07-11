'use client';

import { useState, useMemo } from 'react';

const LOGO_OPTIONS = [
  { id: 'logo_1', title: 'Option 1: Stylized "R" Mark', path: '/logos/logo_1.jpg', desc: 'Modern energy swoosh forming the letter "R" with orange and green gradients.' },
  { id: 'logo_2', title: 'Option 2: Rising Upward Swoosh', path: '/logos/logo_2.jpg', desc: 'Abstract geometric shape of rising bars/swoosh representing growth.' },
  { id: 'logo_3', title: 'Option 3: Lime Green Energy Wave', path: '/logos/logo_3.jpg', desc: 'Minimalist vector energy wave signifying vitality and motion.' },
  { id: 'logo_4', title: 'Option 4: Combined R + Growth Arrow', path: '/logos/logo_4.jpg', desc: 'Sleek geometric emblem combining the letter "R" with an upward-pointing arrow.' },
];

export default function ProgressSection({
  profile,
  weightHistory = [],
  assessments = [],
  onUpdateMetrics,
  onChooseLogo,
  selectedLogoId = '',
}) {
  const [newWeight, setNewWeight] = useState(profile.weight || '');
  const [newHeight, setNewHeight] = useState(profile.height || '');
  const [updating, setUpdating] = useState(false);

  // 1. Sort history by date
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
  }, [weightHistory]);

  // 2. Custom SVG Line Chart plotting
  const svgChart = useMemo(() => {
    if (sortedHistory.length < 2) return null;

    const width = 500;
    const height = 180;
    const padding = 30;

    const weights = sortedHistory.map((h) => parseFloat(h.weight));
    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const weightRange = maxWeight - minWeight;

    const points = sortedHistory.map((h, idx) => {
      const x = padding + (idx / (sortedHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - ((parseFloat(h.weight) - minWeight) / weightRange) * (height - padding * 2);
      return { x, y, weight: h.weight, date: new Date(h.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });

    // Create Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Area Path under the line for gradient fill
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathD, areaD, width, height, padding, minWeight, maxWeight };
  }, [sortedHistory]);

  // 3. Before/After Photos selection
  const beforeAfterPhotos = useMemo(() => {
    // Collect all photos from body assessments
    const allPhotos = [];
    assessments.forEach((as) => {
      if (as.photo_urls && Array.isArray(as.photo_urls)) {
        as.photo_urls.forEach((url) => {
          allPhotos.push({
            url,
            date: new Date(as.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          });
        });
      }
    });
    return allPhotos;
  }, [assessments]);

  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(Math.max(0, beforeAfterPhotos.length - 1));

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newWeight || !newHeight) return;

    setUpdating(true);
    try {
      await onUpdateMetrics({
        weight: parseFloat(newWeight),
        height: parseFloat(newHeight),
      });
      alert('Metrics logged and updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update metrics.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Progress Logs & Branding</h1>
        <p className="text-zinc-400 text-sm">Visualize weight trend history, compare before/after images, and preview branding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Metric Updates & SVG weight chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weight history Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Weight Progression Trend</h2>
            
            {svgChart ? (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} className="w-full min-w-[400px] h-auto">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1={svgChart.padding} y1={svgChart.padding} x2={svgChart.width - svgChart.padding} y2={svgChart.padding} stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                  <line
                    x1={svgChart.padding}
                    y1={svgChart.height / 2}
                    x2={svgChart.width - svgChart.padding}
                    y2={svgChart.height / 2}
                    stroke="#1f2937"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1={svgChart.padding}
                    y1={svgChart.height - svgChart.padding}
                    x2={svgChart.width - svgChart.padding}
                    y2={svgChart.height - svgChart.padding}
                    stroke="#374151"
                    strokeWidth="1"
                  />

                  {/* Gradient Area Fill */}
                  <path d={svgChart.areaD} fill="url(#chartGrad)" />

                  {/* Main Line */}
                  <path d={svgChart.pathD} fill="none" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" />

                  {/* Points & Labels */}
                  {svgChart.points.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#ff6b35" stroke="#000000" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {pt.weight}kg
                      </text>
                      <text x={pt.x} y={svgChart.height - 12} fill="#6b7280" fontSize="8" textAnchor="middle">
                        {pt.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-center text-zinc-500 text-xs italic">
                Log at least two updates in the weight history panel below to populate your progress curve.
              </div>
            )}
          </div>

          {/* Prompt re-enter metrics (30 days weight update) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Update Body Stats</h2>
            <p className="text-xs text-zinc-400">Keep plans calibrated. We recommend updating your weight and height every 30 days.</p>

            <form onSubmit={handleUpdate} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={updating}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Update & Log Stats'}
              </button>
            </form>
          </div>

          {/* Before/After comparisons */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Before & After Progression</h2>
            
            {beforeAfterPhotos.length < 2 ? (
              <p className="text-xs text-zinc-500 italic">Upload critique photos in the Assessment tab to populate side-by-side comparisons.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Before Frame */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Before: {beforeAfterPhotos[beforeIdx]?.date}</span>
                    <div className="aspect-[3/4] bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={beforeAfterPhotos[beforeIdx]?.url} alt="Before State" className="w-full h-full object-cover" />
                    </div>
                    <select
                      value={beforeIdx}
                      onChange={(e) => setBeforeIdx(parseInt(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                    >
                      {beforeAfterPhotos.map((p, idx) => (
                        <option key={idx} value={idx}>Photo from {p.date}</option>
                      ))}
                    </select>
                  </div>

                  {/* After Frame */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">After: {beforeAfterPhotos[afterIdx]?.date}</span>
                    <div className="aspect-[3/4] bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={beforeAfterPhotos[afterIdx]?.url} alt="After State" className="w-full h-full object-cover" />
                    </div>
                    <select
                      value={afterIdx}
                      onChange={(e) => setAfterIdx(parseInt(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                    >
                      {beforeAfterPhotos.map((p, idx) => (
                        <option key={idx} value={idx}>Photo from {p.date}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Branding / Logo Selection */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Resence Brand Selector</h2>
          <p className="text-xs text-zinc-400">Review the generated logo options and select your preferred branding. Your choice will update the navbar logo style.</p>

          <div className="space-y-4">
            {LOGO_OPTIONS.map((logo) => {
              const isSelected = selectedLogoId === logo.id;
              return (
                <button
                  key={logo.id}
                  onClick={() => onChooseLogo(logo.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${isSelected ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'}`}
                >
                  <div className="w-14 h-14 bg-zinc-900 rounded border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img src={logo.path} alt={logo.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white flex items-center">
                      {logo.title}
                      {isSelected && (
                        <span className="ml-2 text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase">Selected</span>
                      )}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{logo.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
