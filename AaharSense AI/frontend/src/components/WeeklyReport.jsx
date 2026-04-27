import { useState } from 'react';
import { getWeeklyReport } from '../services/api';
import './WeeklyReport.css';

export default function WeeklyReport({ user }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try { const r = await getWeeklyReport(); setReport(r.report); }
    catch { setReport({ days_tracked: 0, message: 'Start logging meals to see weekly insights!' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="page container">
      <div className="page-header anim-fade">
        <span className="section-tag tag tag-cyan">Analytics</span>
        <h1 className="page-title">Weekly <span className="gradient-text">Health Report</span></h1>
        <p className="page-subtitle">AI-powered analysis of your eating patterns and health trends</p>
      </div>

      {!report && !loading && (
        <div className="glass-static text-center anim-slide" style={{maxWidth:520, margin:'0 auto', padding:'var(--s-16) var(--s-8)'}}>
          <span style={{fontSize:'3.5rem',display:'block',marginBottom:'var(--s-4)'}}>▣</span>
          <h2 style={{fontSize:'1.2rem', marginBottom:'var(--s-2)'}}>Generate Weekly Report</h2>
          <p className="text-secondary text-sm mb-6">AI-powered insights on your eating patterns and areas for improvement</p>
          <button className="btn btn-primary btn-lg" onClick={fetch_}>→ Generate Report</button>
        </div>
      )}

      {loading && (
        <div className="glass-static text-center anim-slide" style={{padding:'var(--s-16)'}}>
          <div className="spinner"></div>
          <h3>Analyzing your week...</h3>
          <p className="text-muted text-sm">Crunching numbers and generating insights</p>
        </div>
      )}

      {report && !loading && (
        <div className="anim-slide">
          {report.message && report.days_tracked === 0 ? (
            <div className="glass-static text-center" style={{padding:'var(--s-12)'}}><p className="text-secondary">{report.message}</p></div>
          ) : (
            <>
              <div className="weekly-stats grid-4">
                {[
                  { val: report.days_tracked || 0, label: 'Days Tracked', color: 'emerald' },
                  { val: report.avg_daily_calories || 0, label: 'Avg Calories', color: 'sky' },
                  { val: report.avg_health_score || 0, label: 'Avg Score', color: 'amber' },
                  { val: report.total_meals_logged || 0, label: 'Total Meals', color: 'violet' },
                ].map((s, i) => (
                  <div key={i} className="glass-static text-center" style={{padding:'var(--s-6)'}}>
                    <span className={`num-val font-mono stat-${s.color}`}>{s.val}</span>
                    <span className="num-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {report.ai_insights && (
                <div className="glass-static mt-6">
                  <span className="card-title">🤖 AI Insights</span>
                  {report.ai_insights.summary && <p className="text-secondary text-sm mt-3" style={{lineHeight:1.8}}>{report.ai_insights.summary}</p>}
                  {report.ai_insights.achievements?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-muted mb-2" style={{textTransform:'uppercase',letterSpacing:'0.08em'}}>🏆 Achievements</h4>
                      <div className="insight-items">{report.ai_insights.achievements.map((a,i) => <div key={i} className="insight-item insight-green">{a}</div>)}</div>
                    </div>
                  )}
                  {report.ai_insights.improvements?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-muted mb-2" style={{textTransform:'uppercase',letterSpacing:'0.08em'}}>📈 Improvements</h4>
                      <div className="insight-items">{report.ai_insights.improvements.map((a,i) => <div key={i} className="insight-item insight-amber">{a}</div>)}</div>
                    </div>
                  )}
                  {report.ai_insights.tips?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-muted mb-2" style={{textTransform:'uppercase',letterSpacing:'0.08em'}}>💡 Tips</h4>
                      <div className="insight-items">{report.ai_insights.tips.map((t,i) => <div key={i} className="insight-item insight-cyan">{t}</div>)}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="glass-static mt-6">
                <span className="card-title">Average Daily Macros</span>
                <div className="weekly-macros mt-4">
                  {[
                    { label:'Protein', val: report.avg_daily_protein_g?.toFixed(1)||0, unit:'g', color:'emerald' },
                    { label:'Carbs', val: report.avg_daily_carbs_g?.toFixed(1)||0, unit:'g', color:'sky' },
                    { label:'Fat', val: report.avg_daily_fat_g?.toFixed(1)||0, unit:'g', color:'amber' },
                  ].map((m,i) => (
                    <div key={i} className="wk-macro text-center">
                      <span className="num-label">{m.label}</span>
                      <span className={`num-val font-mono stat-${m.color}`}>{m.val}</span>
                      <span className="text-xs text-muted">{m.unit}/day</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-6"><button className="btn btn-secondary" onClick={fetch_}>↻ Refresh</button></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
