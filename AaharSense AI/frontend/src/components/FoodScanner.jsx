import { useState, useRef } from 'react';
import { analyzeFoodImage, analyzeFoodText, logFood } from '../services/api';
import './FoodScanner.css';

export default function FoodScanner({ user, nav }) {
  const [mode, setMode] = useState('image');
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Max 5MB'); return; }
    setPreview(URL.createObjectURL(f));
    setResult(null); setSaved(false); setError('');
    doAnalyzeImage(f);
  };

  const doAnalyzeImage = async (f) => {
    setAnalyzing(true); setError('');
    try { const r = await analyzeFoodImage(f); setResult(r.analysis); }
    catch (e) { setError(e.message || 'Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const doAnalyzeText = async () => {
    if (!text.trim()) return;
    setAnalyzing(true); setError(''); setResult(null);
    try { const r = await analyzeFoodText(text); setResult(r.analysis); }
    catch (e) { setError(e.message || 'Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const doSave = async () => {
    if (!result || saved) return;
    try {
      await logFood({
        meal_type: result.meal_type_guess || 'snack',
        foods: result.foods || [], total_calories: result.total_calories || 0,
        total_protein_g: result.total_protein_g || 0, total_carbs_g: result.total_carbs_g || 0,
        total_fat_g: result.total_fat_g || 0, health_score: result.health_score || 0,
        health_summary: result.health_summary || '', alternatives: result.alternatives || [],
        allergens_detected: result.allergens_detected || [],
      });
    } catch {} finally { setSaved(true); }
  };

  const reset = () => { setPreview(null); setText(''); setResult(null); setSaved(false); setError(''); if (fileRef.current) fileRef.current.value = ''; };

  const sc = (s) => s >= 70 ? 'emerald' : s >= 40 ? 'amber' : 'rose';

  return (
    <div className="page container">
      <div className="page-header anim-fade">
        <span className="section-tag tag tag-emerald">Gemini Vision AI</span>
        <h1 className="page-title">AI Food <span className="text-accent">Scanner</span></h1>
        <p className="page-subtitle">Upload a photo or describe your meal — get clinical-grade nutritional analysis in seconds</p>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle anim-slide delay-1">
        <button className={`mode-opt ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>
          <span>◉</span> Image Scan
        </button>
        <button className={`mode-opt ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
          <span>✎</span> Text Input
        </button>
      </div>

      <div className="scanner-grid anim-slide delay-2">
        {/* Input */}
        <div className="glass-static scanner-input">
          {mode === 'image' ? (
            preview ? (
              <div className="img-preview">
                <img src={preview} alt="Food" />
                <button className="btn btn-secondary mt-4" onClick={reset}>↻ Scan Another</button>
              </div>
            ) : (
              <label className="dropzone" htmlFor="scan-file" tabIndex="0">
                <input ref={fileRef} id="scan-file" type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleFile} className="sr-only" aria-label="Upload food image" />
                <div className="dropzone-inner">
                  <div className="dropzone-rings">
                    <div className="dz-ring dz-ring-1"></div>
                    <div className="dz-ring dz-ring-2"></div>
                    <div className="dz-ring dz-ring-3"></div>
                    <span className="dz-icon">◉</span>
                  </div>
                  <h3>Upload Food Photo</h3>
                  <p className="text-muted text-sm">Drop an image or click to browse</p>
                  <span className="text-xs text-muted mt-2">JPEG · PNG · WebP · Max 5MB</span>
                </div>
              </label>
            )
          ) : (
            <div className="text-zone">
              <label className="label" htmlFor="food-desc">Describe your meal</label>
              <textarea id="food-desc" className="input scan-textarea"
                placeholder="e.g., 2 chapatis with paneer butter masala, a bowl of dal, and a glass of buttermilk"
                value={text} onChange={e => setText(e.target.value)} rows={5} maxLength={500} />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted font-mono">{text.length}/500</span>
                <button className="btn btn-primary" onClick={doAnalyzeText} disabled={!text.trim() || analyzing}>
                  {analyzing ? '⟳ Analyzing...' : '→ Analyze Meal'}
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Overlay */}
          {analyzing && (
            <div className="analyze-overlay">
              <div className="spinner"></div>
              <h3>Gemini AI analyzing...</h3>
              <p className="text-muted text-sm">Identifying foods · Calculating nutrition · Scoring health</p>
              <div className="analyze-steps">
                {['Food Detection', 'Portion Estimation', 'Nutrient Calculation', 'Health Scoring', 'GI Analysis'].map((s, i) => (
                  <div key={i} className="analyze-step" style={{animationDelay: `${i * 0.4}s`}}>
                    <span className="step-check">✓</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="scan-error mt-4"><span>⚠</span> {error}</div>}
        </div>

        {/* Results */}
        {result && (
          <div className="scanner-results anim-scale">
            {/* Score + Totals */}
            <div className="glass-static result-hero">
              <div className="result-hero-top">
                <div>
                  <span className="card-title">Analysis Complete</span>
                  <p className="text-sm text-secondary mt-1">{result.health_summary}</p>
                </div>
                <div className={`score-badge badge-${sc(result.health_score)}`}>
                  <span className="font-mono">{result.health_score}</span>
                </div>
              </div>
              <div className="result-metrics">
                {[
                  { label: 'Calories', val: result.total_calories, unit: 'kcal', color: 'emerald' },
                  { label: 'Protein', val: result.total_protein_g?.toFixed(1), unit: 'g', color: 'sky' },
                  { label: 'Carbs', val: result.total_carbs_g?.toFixed(1), unit: 'g', color: 'amber' },
                  { label: 'Fat', val: result.total_fat_g?.toFixed(1), unit: 'g', color: 'violet' },
                ].map((m, i) => (
                  <div key={i} className="result-metric">
                    <span className={`metric-number font-mono stat-${m.color}`}>{m.val}</span>
                    <span className="metric-unit text-muted">{m.unit}</span>
                    <span className="metric-name text-muted">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Items */}
            <div className="glass-static">
              <span className="card-title">Identified Foods</span>
              <div className="food-list mt-4">
                {result.foods?.map((f, i) => (
                  <div key={i} className="food-row">
                    <div>
                      <span className="food-name">{f.name}</span>
                      <span className="food-qty text-xs text-muted">{f.quantity}</span>
                    </div>
                    <div className="food-nums font-mono text-xs">
                      <span>{f.calories}kcal</span>
                      <span className="stat-emerald">P:{f.protein_g}g</span>
                      <span className="stat-sky">C:{f.carbs_g}g</span>
                      <span className="stat-amber">F:{f.fat_g}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Healthier Alternatives */}
            {result.alternatives?.length > 0 && (
              <div className="glass-static">
                <span className="card-title">💡 Healthier Alternatives</span>
                <div className="alt-list mt-3">
                  {result.alternatives.map((a, i) => (
                    <div key={i} className="alt-item">{a}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Save */}
            <div className="save-actions mt-4">
              <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-lg w-full`}
                onClick={doSave} disabled={saved}>
                {saved ? '✓ Saved' : '→ Save to Log'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
