import { useState } from 'react';
import { demoLogin } from '../services/api';
import './Landing.css';

export default function Landing({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await demoLogin();
      onLogin(data.user);
    } catch {
      const demoUser = {
        uid: 'demo_user_001', email: 'demo@AaharSense AI.app', name: 'Demo User',
        profile: { age: 25, weight_kg: 70, height_cm: 175, gender: 'male',
          activity_level: 'moderate', health_goals: ['maintenance'],
          dietary_preferences: ['none'], allergies: [], daily_calorie_target: 2200 },
        onboarding_complete: false,
      };
      localStorage.setItem('AaharSense AI_uid', demoUser.uid);
      localStorage.setItem('AaharSense AI_user', JSON.stringify(demoUser));
      onLogin(demoUser);
    } finally { setLoading(false); }
  };

  return (
    <div className="landing">
      {/* Animated Background Mesh */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb mesh-orb-1"></div>
        <div className="mesh-orb mesh-orb-2"></div>
        <div className="mesh-orb mesh-orb-3"></div>
        <div className="mesh-orb mesh-orb-4"></div>
        <div className="mesh-grid"></div>
      </div>

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow anim-slide delay-1">
              <div className="eyebrow-dot"></div>
              <span>Powered by Google Gemini 2.0 Flash</span>
            </div>

            <h1 id="hero-heading" className="hero-heading anim-slide delay-2">
              <span className="hero-line-1">Your Personal</span>
              <span className="hero-line-2">
                <span className="hero-gradient">AI Nutritionist</span>
              </span>
              <span className="hero-line-3">in Your Pocket</span>
            </h1>

            <p className="hero-desc anim-slide delay-3">
              Scan any meal with your camera. Get instant nutritional analysis,
              glycemic index, micronutrient profiling, and personalized health
              recommendations — all powered by Google's most advanced AI.
            </p>

            <div className="hero-cta anim-slide delay-4">
              <button className="btn btn-primary btn-lg hero-btn" onClick={handleStart} disabled={loading} id="hero-start-btn">
                {loading ? (
                  <><span className="btn-spinner"></span> Initializing...</>
                ) : (
                  <><span className="btn-icon-wrap">→</span> Start Analyzing</>
                )}
              </button>
              <a href="#features" className="btn btn-secondary btn-lg">
                Explore Features
              </a>
            </div>

            {/* Live Stats */}
            <div className="hero-metrics anim-slide delay-5">
              <div className="hero-metric">
                <span className="metric-val font-mono">6</span>
                <span className="metric-label">Google Services</span>
              </div>
              <div className="metric-divider"></div>
              <div className="hero-metric">
                <span className="metric-val font-mono">AI</span>
                <span className="metric-label">Multimodal Vision</span>
              </div>
              <div className="metric-divider"></div>
              <div className="hero-metric">
                <span className="metric-val font-mono">5</span>
                <span className="metric-label">Health Factors</span>
              </div>
              <div className="metric-divider"></div>
              <div className="hero-metric">
                <span className="metric-val font-mono">0$</span>
                <span className="metric-label">Free Forever</span>
              </div>
            </div>
          </div>

          {/* Feature Preview Cards - Floating */}
          <div className="hero-preview anim-scale delay-4" aria-hidden="true">
            <div className="preview-card preview-card-1 anim-float">
              <div className="preview-icon">📸</div>
              <div className="preview-data">
                <span className="preview-title">Food Scanned</span>
                <span className="preview-val font-mono text-accent">Paneer Tikka</span>
              </div>
            </div>
            <div className="preview-card preview-card-2 anim-float" style={{animationDelay: '1s'}}>
              <div className="preview-icon score-ring-mini">
                <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--glass-border)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--emerald-400)" strokeWidth="3" strokeDasharray="72 94" strokeLinecap="round" transform="rotate(-90 18 18)"/></svg>
                <span className="mini-score font-mono">76</span>
              </div>
              <div className="preview-data">
                <span className="preview-title">Health Score</span>
                <span className="preview-val font-mono" style={{color: 'var(--emerald-400)'}}>Good</span>
              </div>
            </div>
            <div className="preview-card preview-card-3 anim-float" style={{animationDelay: '2s'}}>
              <div className="preview-icon">⚡</div>
              <div className="preview-data">
                <span className="preview-title">Suggestion</span>
                <span className="preview-val text-sm" style={{color: 'var(--cyan-400)'}}>Add fiber-rich sides</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" aria-labelledby="features-heading">
        <div className="container">
          <div className="section-head anim-fade">
            <span className="section-tag tag tag-emerald">Features</span>
            <h2 id="features-heading" className="section-heading">
              Industry-Grade <span className="text-accent">Health Intelligence</span>
            </h2>
            <p className="section-desc">Not just calorie counting. Real nutritional science meets multimodal AI.</p>
          </div>

          <div className="features-grid">
            {[
              { icon: '📸', title: 'Multimodal Food Scanner', desc: 'Upload any meal photo. Gemini Vision identifies foods, estimates portions, and provides lab-grade nutritional breakdown.', tag: 'Gemini Vision' },
              { icon: '🧬', title: 'Micronutrient Profiling', desc: 'Track 12+ vitamins and minerals. Detect deficiencies before they become symptoms. Backed by WHO RDA guidelines.', tag: 'Clinical' },
              { icon: '📊', title: 'Glycemic Index Analysis', desc: 'Real-time GI and glycemic load calculation for every meal. Critical for diabetes management and energy optimization.', tag: 'Medical-Grade' },
              { icon: '🧠', title: 'Context-Aware AI Advisor', desc: 'Recommendations adapt to your goals, allergies, time of day, recent meals, and nutritional gaps. Not generic — personal.', tag: 'Personalized' },
              { icon: '⚗️', title: 'Nutrient Synergy Engine', desc: 'Detects food combinations that enhance or inhibit absorption. E.g., Vitamin C + Iron = 6x better absorption.', tag: 'Advanced' },
              { icon: '📈', title: 'Predictive Health Trends', desc: 'Weekly AI reports with trend analysis, pattern recognition, and early warning for nutritional imbalances.', tag: 'Analytics' },
            ].map((f, i) => (
              <article key={i} className={`feature-card glass anim-slide delay-${i % 3 + 1}`}>
                <div className="feature-icon-wrap">
                  <span className="feature-icon">{f.icon}</span>
                </div>
                <span className="tag tag-emerald">{f.tag}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="stack-section" aria-labelledby="stack-heading">
        <div className="container">
          <div className="section-head anim-fade">
            <span className="section-tag tag tag-cyan">Architecture</span>
            <h2 id="stack-heading" className="section-heading">
              Built on <span className="hero-gradient">Google Cloud</span>
            </h2>
          </div>
          <div className="stack-grid anim-slide">
            {[
              { name: 'Gemini 2.0 Flash', desc: 'Multimodal AI Engine', icon: '🤖' },
              { name: 'Cloud Firestore', desc: 'Real-time NoSQL Database', icon: '🔥' },
              { name: 'Firebase Auth', desc: 'Google OAuth 2.0', icon: '🔐' },
              { name: 'Cloud Run', desc: 'Container Deployment', icon: '☁️' },
              { name: 'Cloud Storage', desc: 'Image Processing', icon: '📦' },
              { name: 'Cloud Logging', desc: 'Observability', icon: '📋' },
            ].map((s, i) => (
              <div key={i} className="stack-chip glass">
                <span className="stack-icon">{s.icon}</span>
                <div>
                  <span className="stack-name">{s.name}</span>
                  <span className="stack-desc">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section anim-fade">
        <div className="container text-center">
          <div className="cta-glow"></div>
          <h2 className="section-heading">
            Ready to eat <span className="hero-gradient">smarter</span>?
          </h2>
          <p className="section-desc mb-8">
            Join AaharSense AI and let AI transform your relationship with food.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={loading}>
            {loading ? 'Starting...' : '→ Begin Your Journey'}
          </button>
        </div>
      </section>
    </div>
  );
}

