import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import './Dashboard.css';

export default function Dashboard({ user, nav }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await getDashboard();
        setData(r.dashboard);
      } catch {
        setData({
          date: new Date().toISOString().split('T')[0],
          total_calories: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0,
          total_fiber_g: 0, avg_health_score: 0, meal_count: 0,
          daily_calorie_target: user?.profile?.daily_calorie_target || 2200,
          calorie_progress: 0, meals: [],
        });
      } finally { setLoading(false); }
    })();
  }, []);

  const p = user?.profile || {};
  const target = data?.daily_calorie_target || p.daily_calorie_target || 2200;
  const calPct = data ? Math.min(100, (data.total_calories / target) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const scoreColor = (s) => s >= 70 ? 'emerald' : s >= 40 ? 'amber' : 'rose';

  if (loading) return (
    <div className="page container">
      <div className="dash-skeleton grid-4">{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:200}}></div>)}</div>
    </div>
  );

  return (
    <div className="page container">
      {/* Header */}
      <div className="page-header anim-fade">
        <p className="greeting-tag">{greeting}</p>
        <h1 className="page-title">{user?.name || 'there'} <span className="wave">👋</span></h1>
        <p className="page-subtitle">
          {data.meal_count > 0 ? `${data.meal_count} meal${data.meal_count > 1 ? 's' : ''} tracked today · Let's keep going` : `No meals logged yet — scan your first meal to begin`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="actions-strip anim-slide delay-1">
        {[
          { id: 'scanner', icon: '◉', label: 'Scan Food', desc: 'AI Vision Analysis' },
          { id: 'recommendations', icon: '◈', label: 'Get Suggestions', desc: 'Context-Aware AI' },
          { id: 'query', icon: '◎', label: 'Ask Anything', desc: 'Food Q&A Chat' },
          { id: 'weekly', icon: '▣', label: 'Weekly Report', desc: 'Trend Analysis' },
        ].map(a => (
          <button key={a.id} className="action-card glass" onClick={() => nav(a.id)}>
            <span className="action-icon">{a.icon}</span>
            <div>
              <span className="action-label">{a.label}</span>
              <span className="action-desc">{a.desc}</span>
            </div>
            <span className="action-arrow">→</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid anim-slide delay-2">
        {/* Health Score */}
        <div className="glass-static stat-hero">
          <span className="card-title">Health Score</span>
          <div className="score-ring-wrap">
            <svg className="score-ring" viewBox="0 0 120 120" aria-label={`Health score ${data.avg_health_score}`}>
              <circle className="ring-track" cx="60" cy="60" r="52" />
              <circle className={`ring-val ring-${scoreColor(data.avg_health_score)}`} cx="60" cy="60" r="52"
                style={{strokeDasharray: `${data.avg_health_score * 3.27} 327`}} />
            </svg>
            <div className="score-center">
              <span className={`score-num font-mono stat-${scoreColor(data.avg_health_score)}`}>{data.avg_health_score}</span>
              <span className="score-of font-mono">/100</span>
            </div>
          </div>
          <p className="score-verdict text-sm">
            {data.avg_health_score >= 70 ? '🌟 Excellent choices today' : data.avg_health_score >= 40 ? '👍 Decent progress' : '📸 Scan food to track'}
          </p>
        </div>

        {/* Calories */}
        <div className="glass-static stat-calories">
          <span className="card-title">Calorie Budget</span>
          <div className="cal-display">
            <span className="cal-consumed font-mono">{data.total_calories}</span>
            <span className="cal-sep">/</span>
            <span className="cal-target font-mono">{target}</span>
            <span className="cal-unit">kcal</span>
          </div>
          <div className="progress-track mt-4">
            <div className={`progress-fill fill-${calPct > 100 ? 'rose' : calPct > 80 ? 'amber' : 'emerald'}`}
              style={{width: `${Math.min(100, calPct)}%`}} role="progressbar" aria-valuenow={data.total_calories} aria-valuemax={target}></div>
          </div>
          <p className="cal-remaining text-sm mt-3">
            {target - data.total_calories > 0 ? (
              <><span className="font-mono font-bold">{target - data.total_calories}</span> kcal remaining</>
            ) : 'Target reached ✓'}
          </p>
        </div>

        {/* Macros */}
        <div className="glass-static stat-macros">
          <span className="card-title">Macronutrients</span>
          <div className="macro-bars">
            {[
              { name: 'Protein', val: data.total_protein_g, target: p.protein_target_g || 55, color: 'emerald', unit: 'g' },
              { name: 'Carbs', val: data.total_carbs_g, target: p.carbs_target_g || 275, color: 'sky', unit: 'g' },
              { name: 'Fat', val: data.total_fat_g, target: p.fat_target_g || 73, color: 'amber', unit: 'g' },
              { name: 'Fiber', val: data.total_fiber_g || 0, target: p.fiber_target_g || 30, color: 'emerald', unit: 'g' },
            ].map(m => (
              <div key={m.name} className="macro-row">
                <div className="macro-info">
                  <span className={`macro-dot dot-${m.color}`}></span>
                  <span className="macro-name">{m.name}</span>
                  <span className="macro-val font-mono">{m.val?.toFixed(1) || 0}{m.unit}</span>
                  <span className="macro-target text-muted font-mono">/ {m.target}{m.unit}</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill fill-${m.color}`}
                    style={{width: `${Math.min(100, (m.val || 0) / m.target * 100)}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="glass-static stat-numbers">
          <span className="card-title">Today at a Glance</span>
          <div className="number-grid">
            <div className="num-cell">
              <span className="num-val font-mono stat-emerald">{data.meal_count}</span>
              <span className="num-label">Meals</span>
            </div>
            <div className="num-cell">
              <span className="num-val font-mono stat-cyan">{Math.round(calPct)}%</span>
              <span className="num-label">Budget Used</span>
            </div>
            <div className="num-cell">
              <span className="num-val font-mono stat-amber">
                {data.total_calories > 0 ? Math.round(data.total_protein_g * 4 / data.total_calories * 100) : 0}%
              </span>
              <span className="num-label">Protein Ratio</span>
            </div>
            <div className="num-cell">
              <span className="num-val font-mono stat-violet">
                {data.total_calories > 0 ? (data.total_protein_g / (data.total_calories / 1000)).toFixed(0) : 0}
              </span>
              <span className="num-label">g/1000kcal P-Density</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meals Timeline */}
      <section className="meals-section anim-slide delay-3" aria-labelledby="meals-heading">
        <h2 id="meals-heading" className="card-title mb-4">Meal Timeline</h2>
        {data.meals?.length > 0 ? (
          <div className="meals-timeline">
            {data.meals.map((meal, i) => (
              <article key={i} className="glass meal-row">
                <div className="meal-time-col">
                  <span className="tag tag-cyan">{meal.meal_type || 'meal'}</span>
                  <span className="text-xs text-muted mt-1">{meal.logged_at ? new Date(meal.logged_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                </div>
                <div className="meal-info-col">
                  <h4 className="meal-foods">{meal.foods?.map(f => f.name).join(', ') || 'Meal logged'}</h4>
                  <div className="meal-macros">
                    <span>🔥 {meal.total_calories || 0}</span>
                    <span>💪 {meal.total_protein_g?.toFixed(1) || 0}g</span>
                    <span>🍞 {meal.total_carbs_g?.toFixed(1) || 0}g</span>
                    <span>🧈 {meal.total_fat_g?.toFixed(1) || 0}g</span>
                  </div>
                </div>
                <div className="meal-score-col">
                  <span className={`meal-score stat-${scoreColor(meal.health_score || 0)} font-mono`}>{meal.health_score || '—'}</span>
                  <span className="text-xs text-muted">score</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-static empty-state">
            <span className="empty-icon">🍽️</span>
            <h3>No meals logged yet</h3>
            <p>Scan your first meal to start tracking nutrition with AI-powered analysis</p>
            <button className="btn btn-primary" onClick={() => nav('scanner')}>◉ Scan Your First Meal</button>
          </div>
        )}
      </section>
    </div>
  );
}
