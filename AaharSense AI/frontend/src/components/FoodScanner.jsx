import { useState, useRef } from 'react';
import { analyzeFoodImage, analyzeFoodText } from '../services/api';
import './FoodScanner.css';

const T = {
  English: {
    title: "AI Food Analyzer",
    subtitle: "Identify nutrients and detect potential adulterants in seconds",
    imageMode: "Image Scan",
    textMode: "Text Input",
    uploadTitle: "Upload Food Photo",
    uploadSub: "Drop an image or click to browse",
    analyzeBtn: "Analyze Meal",
    analyzing: "Analyzing...",
    resultsTitle: "Analysis Report",
    safetyVerdict: "Safety Verdict",
    healthScore: "Health Score",
    safetyScore: "Safety Score",
    adulterationCheck: "Adulteration Check",
    identifiedFoods: "Identified Foods",
    alternatives: "Healthier Alternatives",
    reset: "Scan Another",
    error: "Analysis failed. Please try again."
  },
  'ಕನ್ನಡ': {
    title: "AI ಆಹಾರ ವಿಶ್ಲೇಷಕ",
    subtitle: "ಪೋಷಕಾಂಶಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಕಲಬೆರಕೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ",
    imageMode: "ಚಿತ್ರ ಸ್ಕ್ಯಾನ್",
    textMode: "ಪಠ್ಯ ಇನ್‌ಪುಟ್",
    uploadTitle: "ಆಹಾರದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadSub: "ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಬಿಡಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    analyzeBtn: "ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    resultsTitle: "ವಿಶ್ಲೇಷಣಾ ವರದಿ",
    safetyVerdict: "ಸುರಕ್ಷತಾ ತೀರ್ಪು",
    healthScore: "ಆರೋಗ್ಯ ಸ್ಕೋರ್",
    safetyScore: "ಸುರಕ್ಷತಾ ಸ್ಕೋರ್",
    adulterationCheck: "ಕಲಬೆರಕೆ ತಪಾಸಣೆ",
    identifiedFoods: "ಗುರುತಿಸಲಾದ ಆಹಾರಗಳು",
    alternatives: "ಆರೋಗ್ಯಕರ ಪರ್ಯಾಯಗಳು",
    reset: "ಮತ್ತೊಂದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    error: "ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
  },
  'हिन्दी': {
    title: "AI भोजन विश्लेषक",
    subtitle: "पोषक तत्वों की पहचान करें और मिलावट का पता लगाएं",
    imageMode: "इमेज स्कैन",
    textMode: "टेक्स्ट इनपुट",
    uploadTitle: "भोजन का फोटो अपलोड करें",
    uploadSub: "छवि यहाँ छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
    analyzeBtn: "विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    resultsTitle: "विश्लेषण रिपोर्ट",
    safetyVerdict: "सुरक्षा फैसला",
    healthScore: "स्वास्थ्य स्कोर",
    safetyScore: "सुरक्षा स्कोर",
    adulterationCheck: "मिलावट की जाँच",
    identifiedFoods: "पहचाने गए खाद्य पदार्थ",
    alternatives: "स्वस्थ विकल्प",
    reset: "दूसरा स्कैन करें",
    error: "विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।"
  }
};

export default function FoodScanner({ language }) {
  const [mode, setMode] = useState('image');
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const t = T[language] || T.English;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setResult(null); setError('');
    doAnalyzeImage(f);
  };

  const doAnalyzeImage = async (f) => {
    setAnalyzing(true); setError('');
    try { 
      const r = await analyzeFoodImage(f); 
      setResult(r.analysis); 
    } catch (e) { 
      setError(t.error); 
    } finally { 
      setAnalyzing(false); 
    }
  };

  const doAnalyzeText = async () => {
    if (!text.trim()) return;
    setAnalyzing(true); setError(''); setResult(null);
    try { 
      const r = await analyzeFoodText(text); 
      setResult(r.analysis); 
    } catch (e) { 
      setError(t.error); 
    } finally { 
      setAnalyzing(false); 
    }
  };

  const reset = () => { 
    setPreview(null); setText(''); setResult(null); setError(''); 
    if (fileRef.current) fileRef.current.value = ''; 
  };

  const getVerdictClass = (v) => {
    if (v === 'SAFE') return 'badge-green';
    if (v === 'UNSAFE') return 'badge-red';
    return 'badge-yellow';
  };

  return (
    <div className="container py-8 anim-fade">
      <div className="text-center mb-8">
        <h1 className="text-accent mb-2">{t.title}</h1>
        <p className="text-muted">{t.subtitle}</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button 
          className={`btn ${mode === 'image' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('image')}
        >
          📷 {t.imageMode}
        </button>
        <button 
          className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('text')}
        >
          ✎ {t.textMode}
        </button>
      </div>

      <div className="grid grid-auto gap-8">
        {/* Input Card */}
        <div className="card">
          {mode === 'image' ? (
            preview ? (
              <div className="text-center">
                <img src={preview} alt="Food" className="w-full rounded-md mb-4 shadow-sm" style={{ maxHeight: '300px', objectFit: 'cover' }} />
                <button className="btn btn-secondary w-full" onClick={reset}>↻ {t.reset}</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary-container transition-colors">
                <input ref={fileRef} type="file" className="sr-only" onChange={handleFile} accept="image/*" />
                <span className="text-4xl mb-4">📸</span>
                <h3 className="mb-1">{t.uploadTitle}</h3>
                <p className="text-xs text-muted">{t.uploadSub}</p>
              </label>
            )
          ) : (
            <div>
              <textarea 
                className="input w-full mb-4" 
                rows={5} 
                placeholder="e.g., 2 Chapatis, Dal, and Rice"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button 
                className="btn btn-primary w-full" 
                onClick={doAnalyzeText}
                disabled={!text.trim() || analyzing}
              >
                {analyzing ? t.analyzing : t.analyzeBtn}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-4 text-center">⚠ {error}</p>}
        </div>

        {/* Results Card */}
        {(result || analyzing) && (
          <div className="card anim-scale">
            {analyzing ? (
              <div className="flex flex-col items-center py-12">
                <div className="loading-spinner mb-4"></div>
                <p className="text-muted">{t.analyzing}</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg">{t.resultsTitle}</h2>
                  <div className={`badge ${getVerdictClass(result.safety_verdict)}`}>
                    {result.safety_verdict}
                  </div>
                </div>

                <div className="grid grid-2 gap-4 mb-6">
                  <div className="p-4 bg-background rounded-md text-center border border-outline-variant">
                    <span className="text-xs text-muted uppercase font-bold">{t.healthScore}</span>
                    <div className="text-2xl font-black text-secondary-container">{result.health_score}</div>
                  </div>
                  <div className="p-4 bg-background rounded-md text-center border border-outline-variant">
                    <span className="text-xs text-muted uppercase font-bold">{t.safetyScore}</span>
                    <div className="text-2xl font-black text-primary-container">{result.safety_score}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">🥗 {t.identifiedFoods}</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.foods?.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-surface-dim text-xs rounded-full border border-outline-variant">
                        {f.name} ({f.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">🔍 {t.adulterationCheck}</h4>
                  <p className="text-sm p-3 bg-red-50 text-red-900 rounded-md border border-red-100">
                    {result.adulteration_check}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">💡 {t.alternatives}</h4>
                  <ul className="text-sm pl-4">
                    {result.alternatives?.map((a, i) => (
                      <li key={i} className="mb-1">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
