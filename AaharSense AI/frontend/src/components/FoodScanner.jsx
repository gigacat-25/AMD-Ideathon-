import { useState, useRef } from 'react';

const API = '/api';

// Translations
const T = {
  English: {
    heroTitle: ['Detect ', 'Adulteration', ' in Indian Food'],
    heroSub: 'Upload a photo or describe your food — Gemini AI checks for safety risks and nutritional value instantly.',
    ctaScan: '🔍 Scan Food',
    imageScan: '📷 Image Scan',
    textInput: '✏️ Text Input',
    uploadTitle: 'Drop a food photo here',
    uploadSub: 'JPG, PNG, WEBP supported',
    placeholder: 'e.g. Milk from a local vendor, turmeric powder, chapati with dal…',
    analyzeBtn: 'Analyze for Safety',
    analyzing: 'Analyzing…',
    reportTitle: 'AaharSense Report',
    healthScore: 'Health Score',
    safetyScore: 'Safety Score',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    foods: 'Identified Foods',
    adulteration: 'Adulteration Check',
    allergens: 'Allergens Detected',
    clinical: 'Clinical Summary',
    swaps: 'Healthier Alternatives',
    reset: '← Scan Another',
    errorGeneric: 'Analysis failed. Please try again.',
    noInput: 'Please describe your food first.',
    noImage: 'Please upload or capture an image.',
    scanning: 'AaharSense AI is running safety checks…',
  },
  'ಕನ್ನಡ': {
    heroTitle: ['ಭಾರತೀಯ ಆಹಾರದಲ್ಲಿ ', 'ಕಲಬೆರಕೆ', ' ಪತ್ತೆಹಚ್ಚಿ'],
    heroSub: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಆಹಾರ ವಿವರಿಸಿ — AI ತಕ್ಷಣ ಪರೀಕ್ಷಿಸುತ್ತದೆ.',
    ctaScan: '🔍 ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    imageScan: '📷 ಚಿತ್ರ ಸ್ಕ್ಯಾನ್',
    textInput: '✏️ ಪಠ್ಯ ಇನ್‌ಪುಟ್',
    uploadTitle: 'ಚಿತ್ರ ಇಲ್ಲಿ ಡ್ರಾಪ್ ಮಾಡಿ',
    uploadSub: 'JPG, PNG, WEBP ಬೆಂಬಲಿತ',
    placeholder: 'ಉದಾ. ಸ್ಥಳೀಯ ಹಾಲು, ಅರಿಶಿನ, ಚಪಾತಿ…',
    analyzeBtn: 'ಸುರಕ್ಷತೆ ವಿಶ್ಲೇಷಿಸಿ',
    analyzing: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…',
    reportTitle: 'AaharSense ವರದಿ',
    healthScore: 'ಆರೋಗ್ಯ ಸ್ಕೋರ್',
    safetyScore: 'ಸುರಕ್ಷತಾ ಸ್ಕೋರ್',
    calories: 'ಕ್ಯಾಲೊರಿಗಳು',
    protein: 'ಪ್ರೋಟೀನ್',
    carbs: 'ಕಾರ್ಬ್ಸ್',
    fat: 'ಕೊಬ್ಬು',
    foods: 'ಗುರುತಿಸಲಾದ ಆಹಾರ',
    adulteration: 'ಕಲಬೆರಕೆ ತಪಾಸಣೆ',
    allergens: 'ಅಲರ್ಜನ್‌ಗಳು',
    clinical: 'ವೈದ್ಯಕೀಯ ಸಾರಾಂಶ',
    swaps: 'ಆರೋಗ್ಯಕರ ಪರ್ಯಾಯಗಳು',
    reset: '← ಮತ್ತೊಮ್ಮೆ ಸ್ಕ್ಯಾನ್',
    errorGeneric: 'ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    noInput: 'ಆಹಾರ ವಿವರಣೆ ನಮೂದಿಸಿ.',
    noImage: 'ದಯವಿಟ್ಟು ಚಿತ್ರ ಆಯ್ಕೆ ಮಾಡಿ.',
    scanning: 'AI ಸುರಕ್ಷತೆ ಪರಿಶೀಲಿಸುತ್ತಿದೆ…',
  },
  'हिन्दी': {
    heroTitle: ['भारतीय भोजन में ', 'मिलावट', ' का पता लगाएं'],
    heroSub: 'फोटो अपलोड करें या भोजन बताएं — AI तुरंत सुरक्षा जाँच करेगा।',
    ctaScan: '🔍 स्कैन करें',
    imageScan: '📷 इमेज स्कैन',
    textInput: '✏️ टेक्स्ट इनपुट',
    uploadTitle: 'यहाँ फोटो छोड़ें',
    uploadSub: 'JPG, PNG, WEBP समर्थित',
    placeholder: 'उदा. स्थानीय दूध, हल्दी पाउडर, चपाती…',
    analyzeBtn: 'सुरक्षा जाँच करें',
    analyzing: 'विश्लेषण हो रहा है…',
    reportTitle: 'AaharSense रिपोर्ट',
    healthScore: 'स्वास्थ्य स्कोर',
    safetyScore: 'सुरक्षा स्कोर',
    calories: 'कैलोरी',
    protein: 'प्रोटीन',
    carbs: 'कार्ब्स',
    fat: 'वसा',
    foods: 'पहचाने गए खाद्य',
    adulteration: 'मिलावट जाँच',
    allergens: 'एलर्जन',
    clinical: 'नैदानिक सारांश',
    swaps: 'स्वस्थ विकल्प',
    reset: '← दूसरा स्कैन',
    errorGeneric: 'विश्लेषण विफल। कृपया पुनः प्रयास करें।',
    noInput: 'पहले भोजन का विवरण दें।',
    noImage: 'कृपया इमेज चुनें।',
    scanning: 'AI सुरक्षा की जाँच कर रहा है…',
  },
};

function ScoreBar({ label, value, type }) {
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-label">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="score-bar-track">
        <div
          className={`score-bar-fill ${type}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const map = {
    'SAFE': ['verdict-safe', '✅', 'SAFE'],
    'PROCEED WITH CAUTION': ['verdict-caution', '⚠️', 'CAUTION'],
    'UNSAFE': ['verdict-unsafe', '🚫', 'UNSAFE'],
  };
  const [cls, icon, label] = map[verdict?.toUpperCase()] ?? ['verdict-caution', '⚠️', verdict];
  return (
    <div className={`verdict ${cls}`}>
      {icon} {label}
    </div>
  );
}

function Results({ data, t, onReset }) {
  const riskIcon = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' };

  return (
    <div className="fade-up" style={{ marginTop: 24 }}>
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t.reportTitle}</h2>
          <VerdictBadge verdict={data.safety_verdict} />
        </div>

        {/* Score bars */}
        <div style={{ marginBottom: 20 }}>
          <ScoreBar label={t.healthScore} value={data.health_score ?? 0} type="health" />
          <div style={{ marginTop: 10 }} />
          <ScoreBar label={t.safetyScore} value={data.safety_score ?? 0} type="safety" />
        </div>

        {/* Macros */}
        <div className="macro-grid">
          {[
            { v: data.total_calories, u: 'kcal', l: t.calories },
            { v: `${data.total_protein_g}g`, u: '', l: t.protein },
            { v: `${data.total_carbs_g}g`, u: '', l: t.carbs },
            { v: `${data.total_fat_g}g`, u: '', l: t.fat },
          ].map(({ v, l }) => (
            <div className="macro-card" key={l}>
              <div className="macro-val">{v}</div>
              <div className="macro-lbl">{l}</div>
            </div>
          ))}
        </div>

        {/* Foods */}
        {data.foods?.length > 0 && (
          <>
            <div className="section-head">{t.foods}</div>
            <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
              {data.foods.map((f, i) => (
                <span key={i} className="food-pill">
                  <span className={`risk-dot ${riskIcon[f.adulteration_risk?.toLowerCase()] ?? 'risk-medium'}`} />
                  {f.name} · {f.quantity}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Adulteration */}
        <div className="section-head">{t.adulteration}</div>
        <div className="adulteration-box" style={{ marginBottom: 20 }}>
          {data.adulteration_check}
        </div>

        {/* Allergens */}
        {data.allergens_detected?.length > 0 && (
          <>
            <div className="section-head">{t.allergens}</div>
            <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
              {data.allergens_detected.map((a, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.78rem',
                  fontWeight: 700, background: '#FFEBEE', color: '#B71C1C',
                  border: '1px solid #EF9A9A'
                }}>{a}</span>
              ))}
            </div>
          </>
        )}

        {/* Clinical summary */}
        <div className="section-head">{t.clinical}</div>
        <p className="text-sm" style={{
          background: 'var(--green-dim)', borderRadius: 'var(--r-md)',
          padding: '14px 16px', color: '#1B4D1A', marginBottom: 20
        }}>
          {data.health_summary}
        </p>

        {/* Alternatives */}
        {data.alternatives?.length > 0 && (
          <>
            <div className="section-head">{t.swaps}</div>
            <div>
              {data.alternatives.map((a, i) => (
                <div key={i} className="alt-item">
                  <span className="alt-icon">→</span>
                  {a}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Reset */}
        <button className="btn btn-ghost w-full" style={{ marginTop: 24 }} onClick={onReset}>
          {t.reset}
        </button>
      </div>
    </div>
  );
}

export default function FoodScanner({ language }) {
  const t = T[language] || T.English;
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const reset = () => {
    setResult(null); setError(''); setPreview(null); setFile(null); setText('');
    if (fileRef.current) fileRef.current.value = '';
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraActive(true);
      // Need a slight timeout to let React render the <video> element before assigning stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions or upload a file.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current;
      const c = canvasRef.current;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);

      c.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setFile(file);
        setPreview(URL.createObjectURL(blob));
        stopCamera();
      }, "image/jpeg");
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null); setError('');
  };

  const runTextAnalysis = async () => {
    if (!text.trim()) { setError(t.noInput); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API}/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t.errorGeneric);
      setResult(json.analysis);
    } catch (e) {
      setError(e.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const runImageAnalysis = async () => {
    if (!file) { setError(t.noImage); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/analyze-image`, { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t.errorGeneric);
      setResult(json.analysis);
    } catch (e) {
      setError(e.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">🇮🇳 AMD Ideathon 2025</div>
        <h1>
          {t.heroTitle[0]}
          <span>{t.heroTitle[1]}</span>
          {t.heroTitle[2]}
        </h1>
        <p>{t.heroSub}</p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => document.getElementById('scanner-anchor')?.scrollIntoView({ behavior: 'smooth' })}>
            {t.ctaScan}
          </button>
          <a className="btn btn-ghost" href="#about">Learn More</a>
        </div>
      </div>

      {/* Scanner */}
      <div className="scanner-section" id="scanner-anchor">
        {/* Mode Tabs */}
        <div className="mode-tabs">
          <button className={`mode-tab ${mode === 'text' ? 'active' : ''}`} onClick={() => { setMode('text'); reset(); }}>
            {t.textInput}
          </button>
          <button className={`mode-tab ${mode === 'image' ? 'active' : ''}`} onClick={() => { setMode('image'); reset(); }}>
            {t.imageScan}
          </button>
        </div>

        {/* Input Card */}
        {!result && (
          <div className="card">
            {mode === 'text' ? (
              <>
                <textarea
                  className="textarea"
                  rows={5}
                  placeholder={t.placeholder}
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <button
                  className="btn btn-primary w-full mt-3"
                  onClick={runTextAnalysis}
                  disabled={loading}
                >
                  {loading ? t.analyzing : t.analyzeBtn}
                </button>
              </>
            ) : preview ? (
              <>
                <img
                  src={preview}
                  alt="Food"
                  style={{ width: '100%', borderRadius: 'var(--r-md)', maxHeight: 280, objectFit: 'cover', marginBottom: 16 }}
                />
                <div className="flex gap-2">
                  <button className="btn btn-green w-full" onClick={runImageAnalysis} disabled={loading}>
                    {loading ? t.analyzing : t.analyzeBtn}
                  </button>
                  <button className="btn btn-ghost" onClick={reset} style={{ flexShrink: 0 }}>✕</button>
                </div>
              </>
            ) : cameraActive ? (
              <div style={{ textAlign: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', borderRadius: 'var(--r-md)', maxHeight: 300, objectFit: 'cover', backgroundColor: '#000', marginBottom: 16 }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="flex gap-2">
                  <button className="btn btn-primary w-full" onClick={capturePhoto}>📸 Snap Photo</button>
                  <button className="btn btn-ghost" onClick={stopCamera} style={{ flexShrink: 0 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label className="upload-zone">
                  <input ref={fileRef} type="file" className="sr-only" accept="image/*" onChange={handleFile} />
                  <div className="upload-zone-icon">📁</div>
                  <h3>{t.uploadTitle}</h3>
                  <p>{t.uploadSub}</p>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                <button className="btn btn-ghost w-full" onClick={startCamera} style={{ padding: '16px' }}>
                  <span style={{ fontSize: '1.2rem', marginRight: 8 }}>📷</span> Take Photo with Camera
                </button>
              </div>
            )}

            {/* Loading spinner below button */}
            {loading && (
              <div className="spinner-wrap">
                <div className="spinner" />
                <p className="text-sm text-muted">{t.scanning}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#B71C1C', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {result && <Results data={result} t={t} onReset={reset} />}
      </div>
    </>
  );
}
