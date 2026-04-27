import { useState } from 'react';
import { getRecommendations } from '../services/api';
import './Recommendations.css';

export default function Recommendations({ user }) {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetch_ = async () => {
    setLoading(true); setError('');
    try { const r = await getRecommendations(); setRecs(r.recommendations); }
    catch (e) { setError(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page container">
      <div className="page-header anim-fade">
        <span className="section-tag tag tag-violet">Context-Aware AI</span>
        <h1 className="page-title">Smart <span className="gradient-text">Recommendations</span></h1>
        <p className="page-subtitle">AI-generated meal suggestions based on your goals, today's intake, nutritional gaps, and time of day</p>
      </div>

      {!recs && !loading && (
        <div className="glass-static text-center anim-slide" style={{maxWidth: 520, margin: '0 auto', padding: 'var(--s-16) var(--s-8)'}}>
          <span style={{fontSize:'3.5rem',display:'block',marginBottom:'var(--s-4)'}}>◈</span>
          <h2 style={{fontSize:'1.2rem',marginBottom:'var(--s-2)'}}>Get Personalized Meal Suggestions</h2>
          <p className="text-secondary text-sm mb-6">Gemini AI analyzes your profile, today's intake and remaining nutritional budget</p>
          <button className="btn btn-primary btn-lg" onClick={fetch_}>→ Generate Recommendations</button>
        </div>
      )}

      {loading && (
        <div className="glass-static text-center anim-slide" style={{padding: 'var(--s-16)'}}>
          <div className="spinner"></div>
          <h3>Gemini AI thinking...</h3>
          <p className="text-muted text-sm">Analyzing nutrition profile and today's intake</p>
        </div>
      )}

      {error && <div className="scan-error anim-fade"><span>⚠</span> {error} <button className="btn btn-secondary" style={{marginLeft:'auto'}} onClick={fetch_}>Retry</button></div>}

      {recs && !loading && (
        <div className="anim-slide">
          {recs.daily_summary && (
            <div className="glass-static mb-6">
              <span className="card-title">Daily Summary</span>
              <p className="text-secondary text-sm mt-2">{recs.daily_summary}</p>
            </div>
          )}

          {recs.nutritional_gaps?.length > 0 && (
            <div className="glass-static mb-6">
              <span className="card-title">⚡ Nutritional Gaps</span>
              <div className="flex gap-2 mt-3">{recs.nutritional_gaps.map((g,i) => <span key={i} className="tag tag-amber">{g}</span>)}</div>
            </div>
          )}

          <span className="card-title mb-4" style={{display:'block'}}>Recommended Meals</span>
          <div className="recs-grid">
            {recs.recommendations?.map((r, i) => (
              <article key={i} className="glass rec-card">
                <div className="flex justify-between items-start gap-2">
                  <h4 style={{fontWeight:700, fontSize:'0.95rem'}}>{r.name}</h4>
                  {r.meal_type && <span className="tag tag-cyan">{r.meal_type}</span>}
                </div>
                <p className="text-secondary text-sm">{r.description}</p>
                <div className="rec-macros font-mono text-xs">
                  <span>🔥 {r.calories}kcal</span>
                  <span className="stat-emerald">P:{r.protein_g}g</span>
                  <span className="stat-sky">C:{r.carbs_g}g</span>
                  <span className="stat-amber">F:{r.fat_g}g</span>
                </div>
                {r.why_recommended && <div className="rec-why"><span className="text-accent font-bold">Why:</span> {r.why_recommended}</div>}
                {r.prep_time_minutes && <span className="text-xs text-muted">⏱ ~{r.prep_time_minutes} min</span>}
              </article>
            ))}
          </div>
          <div className="text-center mt-6">
            <button className="btn btn-secondary" onClick={fetch_}>↻ Refresh</button>
          </div>
        </div>
      )}
    </div>
  );
}
