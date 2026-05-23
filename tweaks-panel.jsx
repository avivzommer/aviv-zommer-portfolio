/* tweaks-panel.jsx — loaded via Babel standalone, exposes globals to window */

(function () {
  const { useState, useEffect, useRef } = React;

  /* ─── useTweaks: persisted state via localStorage ─── */
  function useTweaks(defaults) {
    const STORE_KEY = 'portfolio-tweaks';
    function load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
      } catch (e) {
        return { ...defaults };
      }
    }
    const [tweaks, setTweaks] = useState(load);

    function setTweak(key, value) {
      setTweaks(prev => {
        const next = { ...prev, [key]: value };
        try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }

    return [tweaks, setTweak];
  }

  /* ─── TweaksPanel: floating panel shell ─── */
  function TweaksPanel({ title, children }) {
    const [open, setOpen] = useState(false);

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
      }}>
        {open && (
          <div style={{
            marginBottom: '8px',
            background: '#fff',
            border: '1px solid #e0e0e4',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            padding: '16px',
            minWidth: '180px',
          }}>
            <div style={{
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#b0b0b5',
              marginBottom: '12px',
            }}>
              {title}
            </div>
            {children}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setOpen(o => !o)}
            title={open ? 'Close tweaks' : 'Open tweaks'}
            style={{
              background: open ? '#0f0f0f' : '#fff',
              color: open ? '#fff' : '#0f0f0f',
              border: '1px solid #e0e0e4',
              borderRadius: '50px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            {open ? '✕' : '⚙ Tweaks'}
          </button>
        </div>
      </div>
    );
  }

  /* ─── TweakSection: labeled group ─── */
  function TweakSection({ label, children }) {
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#b0b0b5',
          marginBottom: '6px',
        }}>
          {label}
        </div>
        {children}
      </div>
    );
  }

  /* ─── TweakRadio: pill-style radio group ─── */
  function TweakRadio({ value, onChange, options }) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '50px',
              border: '1px solid',
              borderColor: value === opt.value ? '#0f0f0f' : '#e0e0e4',
              background: value === opt.value ? '#0f0f0f' : 'transparent',
              color: value === opt.value ? '#fff' : '#6e6e73',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '11px',
              fontWeight: value === opt.value ? 500 : 400,
              transition: 'all 0.12s ease',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  /* ─── Expose to window ─── */
  window.TweaksPanel = TweaksPanel;
  window.TweakSection = TweakSection;
  window.TweakRadio = TweakRadio;
  window.useTweaks = useTweaks;
})();
