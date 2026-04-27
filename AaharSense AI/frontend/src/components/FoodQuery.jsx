import { useState } from 'react';
import { askFoodQuestion } from '../services/api';
import './FoodQuery.css';

const SUGGESTIONS = [
  "Is butter chicken healthy for weight loss?",
  "What should I eat after a workout?",
  "What are the best sources of iron for vegetarians?",
  "How does intermittent fasting affect metabolism?",
  "What foods help reduce inflammation?",
  "What's the glycemic index of white rice vs brown rice?",
];

export default function FoodQuery({ user }) {
  const [q, setQ] = useState('');
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (text) => {
    const query = text || q;
    if (!query.trim()) return;
    setLoading(true);
    setConvos(p => [...p, { type: 'q', text: query }]);
    setQ('');
    try {
      const r = await askFoodQuestion(query);
      setConvos(p => [...p, { type: 'a', data: r.response }]);
    } catch (e) {
      setConvos(p => [...p, { type: 'err', text: e.message || 'Failed' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="page container">
      <div className="page-header anim-fade">
        <span className="section-tag tag tag-emerald">Gemini AI</span>
        <h1 className="page-title">Ask <span className="gradient-text">Anything</span></h1>
        <p className="page-subtitle">Get personalized, science-backed answers to any food or nutrition question</p>
      </div>

      <div className="chat-layout anim-slide">
        <div className="glass-static chat-box">
          {convos.length === 0 && !loading && (
            <div className="chat-empty">
              <span style={{fontSize:'3rem',display:'block',marginBottom:'var(--s-4)'}}>◎</span>
              <h3>Ask your first question</h3>
              <p className="text-muted text-sm mb-6">Try a suggestion or type your own</p>
              <div className="suggestions">{SUGGESTIONS.map((s,i) => (
                <button key={i} className="sug-btn" onClick={() => ask(s)}>{s}</button>
              ))}</div>
            </div>
          )}

          {convos.map((c, i) => (
            <div key={i} className={`chat-msg chat-${c.type}`}>
              {c.type === 'q' && <div className="msg-q"><span className="msg-avatar">👤</span><p>{c.text}</p></div>}
              {c.type === 'a' && (
                <div className="msg-a"><span className="msg-avatar">◈</span>
                  <div className="msg-a-body">
                    <p>{c.data.answer}</p>
                    {c.data.key_facts?.length > 0 && (
                      <div className="msg-facts mt-3">
                        <h5 className="text-xs font-bold mb-2">Key Facts</h5>
                        <ul>{c.data.key_facts.map((f,j) => <li key={j}>{f}</li>)}</ul>
                      </div>
                    )}
                    {c.data.health_tip && <div className="msg-tip mt-3">💡 {c.data.health_tip}</div>}
                  </div>
                </div>
              )}
              {c.type === 'err' && <div className="scan-error"><span>⚠</span> {c.text}</div>}
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-a">
              <div className="msg-a"><span className="msg-avatar">◈</span>
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-bar">
          <input className="input" type="text" placeholder="Ask about food, nutrition, or health..."
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); }}}
            disabled={loading} id="food-query-input" aria-label="Ask a nutrition question" />
          <button className="btn btn-primary" onClick={() => ask()} disabled={!q.trim() || loading}>
            {loading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
