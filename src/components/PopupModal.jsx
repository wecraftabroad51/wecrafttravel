function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  );
}

export default function PopupModal({ settings, t, onClose, navigate }) {
  const { popup } = settings;
  const title = t ? t(popup.title) : (popup.title?.en || popup.title?.th || popup.title || '');
  const description = t ? t(popup.description) : (popup.description?.en || popup.description?.th || popup.description || '');
  const ctaText = t ? t(popup.ctaText) : (popup.ctaText?.en || popup.ctaText?.th || popup.ctaText || '');

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--canvas)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 460, width: '100%',
          overflow: 'hidden',
          animation: 'pageIn .25s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {popup.image && (
          <div style={{ aspectRatio: '16/7', overflow: 'hidden' }}>
            <img src={popup.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: 28 }}>
          {title && (
            <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
              {title}
            </h2>
          )}
          {description && (
            <p style={{ margin: '0 0 22px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              {description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            {ctaText && (
              <button
                onClick={() => { navigate(popup.ctaLink || 'promotions'); onClose(); }}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'space-between' }}
              >
                <span>{ctaText}</span>
                <ArrowRightIcon />
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: 44, height: 44, borderRadius: 'var(--r-md)',
                border: '1px solid var(--line)', background: 'transparent',
                color: 'var(--ink)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
