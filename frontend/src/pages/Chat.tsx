import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage, logBehaviorEvent } from '../services/api';

const SELL_KEYWORDS = ['cuándo vendo', 'cuando vendo', 'debería vender', 'deberia vender', 'vender ya', 'vendo todo', 'cuándo vender', 'cuando vender', 'sell'];
const HOLD_KEYWORDS = ['mantener', 'aguantar', 'quedarme', 'seguir esperando', 'cuánto tiempo espero', 'cuando se recupera', 'se va a recuperar', 'hold'];

function detectIntent(text: string): { has_sell_intent: boolean; has_hold_intent: boolean } {
  const lower = text.toLowerCase();
  return {
    has_sell_intent: SELL_KEYWORDS.some(k => lower.includes(k)),
    has_hold_intent: HOLD_KEYWORDS.some(k => lower.includes(k)),
  };
}
import AcademicBanner from '../components/AcademicBanner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const QUICK_QUESTIONS = [
  '¿Qué es la diversificación?',
  '¿Cómo funciona un ETF?',
  '¿Qué es el índice Miedo/Codicia?',
  '¿Por qué sube el oro en crisis?',
  '¿Qué es el sesgo de recencia?',
  '¿Cómo afectan las tasas de interés a los bonos?',
  '¿Qué diferencia hay entre acción y bono?',
  '¿Qué es el horizonte de inversión?',
  '¿Cómo funciona el mercado de acciones en Colombia?',
  '¿Qué son los TES?',
  'Explícame qué pasó en la crisis de 2008',
  '¿Qué es el análisis técnico?',
  '¿Cómo se calcula el P/E ratio?',
  '¿Qué es la inflación y cómo afecta mis inversiones?',
];

const WELCOME: Message = {
  role: 'assistant',
  content: '¡Hola! Soy FinVise, tu asistente educativo de inversiones 📚\n\nPuedes preguntarme cualquier cosa sobre finanzas e inversiones: conceptos básicos, activos específicos (acciones, ETFs, criptomonedas, bonos), mercados locales e internacionales, historia económica, sesgos del inversor, análisis de portafolios, y mucho más.\n\n¿Qué quieres aprender hoy?',
};

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16, animation: 'fadeIn 200ms ease',
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0, marginRight: 12, marginTop: 4,
        }}>
          F
        </div>
      )}
      <div style={{
        maxWidth: '75%', padding: '12px 16px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'var(--bg-surface)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: 14, lineHeight: 1.7,
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {msg.loading ? (
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <span style={{ animation: 'pulse 1s infinite', animationDelay: '0ms' }}>●</span>
            <span style={{ animation: 'pulse 1s infinite', animationDelay: '200ms' }}>●</span>
            <span style={{ animation: 'pulse 1s infinite', animationDelay: '400ms' }}>●</span>
          </span>
        ) : isUser ? msg.content : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px', fontFamily: 'DM Serif Display, serif' }}>{children}</div>,
              h2: ({ children }) => <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 4px', borderBottom: '1px solid var(--border)', paddingBottom: 3 }}>{children}</div>,
              h3: ({ children }) => <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', margin: '8px 0 3px' }}>{children}</div>,
              p: ({ children }) => <p style={{ margin: '4px 0', lineHeight: 1.7 }}>{children}</p>,
              ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: 18 }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: 18 }}>{children}</ol>,
              li: ({ children }) => <li style={{ margin: '2px 0', lineHeight: 1.6 }}>{children}</li>,
              strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>,
              em: ({ children }) => <em style={{ color: 'var(--text-secondary)' }}>{children}</em>,
              code: ({ children }) => <code style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--gold)' }}>{children}</code>,
              hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />,
              table: ({ children }) => <div style={{ overflowX: 'auto', margin: '8px 0' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>{children}</table></div>,
              th: ({ children }) => <th style={{ padding: '6px 10px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</th>,
              td: ({ children }) => <td style={{ padding: '6px 10px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{children}</td>,
              blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--gold)', margin: '8px 0', paddingLeft: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{children}</blockquote>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const loadingMsg: Message = { role: 'assistant', content: '', loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setSending(true);

    // Anthropic requires the first message to be from 'user'.
    // The welcome message is an assistant turn — drop it from the API history.
    const history = [...messages, userMsg]
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.content }))
      .filter((_, i, arr) => !(i === 0 && arr[0].role === 'assistant'));

    // Log behavioral signal for disposition effect detection
    const intent = detectIntent(text);
    logBehaviorEvent('chat_message', { metadata: intent });

    try {
      const { reply } = await sendChatMessage(history);
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        content: 'Lo siento, tuve un problema al procesar tu pregunta. Por favor intenta de nuevo.',
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', paddingBottom: 20 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Asistente educativo
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
          Pregúntame sobre conceptos financieros, mercados y tu portafolio educativo
        </p>
      </div>

      {/* Quick questions */}
      {messages.length === 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Ideas para empezar — o escribe cualquier pregunta:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--gold)'; (e.target as HTMLButtonElement).style.color = 'var(--gold)'; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.target as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            >
              {q}
            </button>
          ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 0',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-end',
        borderTop: '1px solid var(--border)', paddingTop: 16,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu pregunta sobre inversiones... (Enter para enviar)"
          rows={2}
          disabled={sending}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 12, resize: 'none',
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            color: 'var(--text-primary)', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
            outline: 'none', lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={sending || !input.trim()}
          style={{
            padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--gold), #f59e0b)',
            color: '#0a0f1e', fontSize: 14, fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif', opacity: (sending || !input.trim()) ? 0.5 : 1,
            transition: 'opacity 200ms',
          }}
        >
          Enviar →
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
        ⚠️ Material educativo · Pontificia Universidad Javeriana Cali · No es asesoramiento financiero
      </p>

      <AcademicBanner />
    </div>
  );
}
