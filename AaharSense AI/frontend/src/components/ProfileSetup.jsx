import { useState } from 'react';
import { updateProfile } from '../services/api';
import './ProfileSetup.css';

export default function ProfileSetup({ user, onComplete, isOnboarding }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [prof, setProf] = useState({
    age: user?.profile?.age || '', weight_kg: user?.profile?.weight_kg || '',
    height_cm: user?.profile?.height_cm || '', gender: user?.profile?.gender || '',
    activity_level: user?.profile?.activity_level || 'moderate',
    health_goals: user?.profile?.health_goals || ['maintenance'],
    dietary_preferences: user?.profile?.dietary_preferences || ['none'],
    allergies: user?.profile?.allergies || [],
  });

  const set = (k, v) => setProf(p => ({ ...p, [k]: v }));
  const toggle = (k, item) => {
    setProf(p => {
      const arr = p[k] || [];
      if (arr.includes(item)) {
        const f = arr.filter(i => i !== item);
        return { ...p, [k]: f.length ? f : k === 'dietary_preferences' ? ['none'] : [] };
      }
      return { ...p, [k]: [...arr.filter(i => i !== 'none'), item] };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await updateProfile(prof);
      const u = { ...user, profile: r.user?.profile || prof, onboarding_complete: true };
      localStorage.setItem('nutrisense_user', JSON.stringify(u));
      onComplete(u);
    } catch {
      const u = { ...user, profile: prof, onboarding_complete: true };
      localStorage.setItem('nutrisense_user', JSON.stringify(u));
      onComplete(u);
    } finally { setSaving(false); }
  };

  const goals = [
    { id: 'weight_loss', label: '🏋️ Weight Loss' },
    { id: 'muscle_gain', label: '💪 Muscle Gain' },
    { id: 'maintenance', label: '⚖️ Maintenance' },
    { id: 'heart_health', label: '❤️ Heart Health' },
    { id: 'diabetes_management', label: '🩺 Diabetes Mgmt' },
  ];

  const diets = ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'];
  const allergens = ['gluten', 'dairy', 'nuts', 'shellfish', 'soy', 'eggs', 'fish', 'wheat'];

  return (
    <div className="page container">
      <div className="profile-wrap">
        <div className="page-header anim-fade text-center">
          <h1 className="page-title">{isOnboarding ? <>Personalize Your <span className="gradient-text">Experience</span></> : <>Edit <span className="gradient-text">Profile</span></>}</h1>
          <p className="page-subtitle">Your data powers personalized AI recommendations via Mifflin-St Jeor calculations</p>
          <div className="steps-bar mt-6">{[1,2,3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'done' : ''} ${step === s ? 'current' : ''}`}>
              <span className="dot-num font-mono">{s}</span>
              <span className="dot-label">{['Body Stats','Goals','Diet'][s-1]}</span>
            </div>
          ))}<div className="steps-line"><div className="steps-fill" style={{width:`${((step-1)/2)*100}%`}}></div></div></div>
        </div>

        <div className="glass-static setup-card anim-slide">
          {step === 1 && (
            <div>
              <h2 className="setup-heading">📏 Body Statistics</h2>
              <p className="text-muted text-sm mb-6">Used for BMR calculation (Mifflin-St Jeor equation)</p>
              <div className="form-grid">
                <div><label className="label" htmlFor="p-age">Age</label><input id="p-age" className="input" type="number" min="10" max="120" value={prof.age} onChange={e => set('age', parseInt(e.target.value)||'')} placeholder="25" /></div>
                <div><label className="label" htmlFor="p-gen">Gender</label><select id="p-gen" className="input" value={prof.gender} onChange={e => set('gender', e.target.value)}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                <div><label className="label" htmlFor="p-wt">Weight (kg)</label><input id="p-wt" className="input" type="number" min="20" max="300" step="0.1" value={prof.weight_kg} onChange={e => set('weight_kg', parseFloat(e.target.value)||'')} placeholder="70" /></div>
                <div><label className="label" htmlFor="p-ht">Height (cm)</label><input id="p-ht" className="input" type="number" min="100" max="250" value={prof.height_cm} onChange={e => set('height_cm', parseFloat(e.target.value)||'')} placeholder="175" /></div>
                <div style={{gridColumn:'1/-1'}}><label className="label" htmlFor="p-act">Activity Level</label><select id="p-act" className="input" value={prof.activity_level} onChange={e => set('activity_level', e.target.value)}>
                  <option value="sedentary">Sedentary (office job)</option><option value="light">Light (1-3 days/wk)</option><option value="moderate">Moderate (3-5 days/wk)</option><option value="active">Active (6-7 days/wk)</option><option value="very_active">Very Active (physical job)</option>
                </select></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="setup-heading">🎯 Health Goals</h2>
              <p className="text-muted text-sm mb-6">Affects calorie target and macro ratios</p>
              <div className="goal-grid">{goals.map(g => (
                <button key={g.id} className={`goal-btn ${prof.health_goals.includes(g.id) ? 'active' : ''}`} onClick={() => toggle('health_goals', g.id)}>{g.label}</button>
              ))}</div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="setup-heading">🥗 Diet & Allergies</h2>
              <p className="text-muted text-sm mb-6">Filters AI recommendations and detects allergens</p>
              <span className="label">Dietary Preferences</span>
              <div className="chip-grid mb-6">{diets.map(d => (
                <button key={d} className={`chip-btn ${prof.dietary_preferences.includes(d) ? 'active' : ''}`} onClick={() => toggle('dietary_preferences', d)}>{d === 'none' ? 'No Preference' : d}</button>
              ))}</div>
              <span className="label">Allergies</span>
              <div className="chip-grid">{allergens.map(a => (
                <button key={a} className={`chip-btn chip-warn ${prof.allergies.includes(a) ? 'active' : ''}`} onClick={() => toggle('allergies', a)}>{a}</button>
              ))}</div>
            </div>
          )}
          <div className="setup-nav mt-8">
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(s => s-1)}>← Back</button>}
            <div style={{flex:1}}></div>
            {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(s => s+1)}>Next →</button>
            : <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>{saving ? '⟳ Saving...' : '✓ Save & Continue'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
