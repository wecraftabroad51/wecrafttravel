import { useState } from 'react';
import { X } from 'lucide-react';

export default function GalleryPage({ lang, t, tours }) {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const continents = ['All', ...new Set(tours.map(tr => tr.continent))];
  const allImages = tours
    .filter(tr => filter === 'All' || tr.continent === filter)
    .flatMap(tr => tr.gallery.map(img => ({ img, tourName: t(tr.name), continent: tr.continent })));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t({ th: 'แกลเลอรี่', en: 'Gallery' })}</h1>
        <p className="text-slate-500">{t({ th: 'ภาพสวยงามจากทั่วทุกมุมโลก', en: 'Beautiful photos from around the world' })}</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {continents.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === c ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}>
            {c === 'All' ? t({ th: 'ทั้งหมด', en: 'All' }) : c}
          </button>
        ))}
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {allImages.map((item, i) => (
          <button key={i} onClick={() => setLightbox(i)}
            className="break-inside-avoid w-full rounded-xl overflow-hidden block group">
            <img src={item.img} alt={item.tourName}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div onClick={e => e.stopPropagation()} className="relative max-w-4xl w-full">
            <img src={allImages[lightbox].img} alt="" className="w-full rounded-xl max-h-[80vh] object-contain" />
            <div className="text-white text-center mt-3 text-sm">{allImages[lightbox].tourName}</div>
          </div>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => setLightbox((lightbox - 1 + allImages.length) % allImages.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 rounded-full p-3 text-lg">◀</button>
          <button onClick={() => setLightbox((lightbox + 1) % allImages.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 rounded-full p-3 text-lg">▶</button>
        </div>
      )}
    </div>
  );
}
