import { X } from 'lucide-react';

export default function PopupModal({ settings, t, onClose, navigate }) {
  const { popup } = settings;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {popup.image && (
          <img src={popup.image} alt="" className="w-full h-48 object-cover" />
        )}
        <div className="p-6">
          {popup.title && <h2 className="text-xl font-bold text-slate-800 mb-2">{t(popup.title)}</h2>}
          {popup.description && <p className="text-slate-600 mb-4">{t(popup.description)}</p>}
          <div className="flex gap-3">
            {popup.ctaText && (
              <button
                onClick={() => { navigate(popup.ctaLink || 'promotions'); onClose(); }}
                className="flex-1 bg-teal-700 hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold transition-colors"
              >
                {t(popup.ctaText)}
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
