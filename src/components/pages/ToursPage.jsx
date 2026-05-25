import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import TourCard from '../TourCard.jsx';

const CONTINENTS = ['All', 'Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];

export default function ToursPage({ lang, t, navigate, tours, compareList, toggleCompare }) {
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  let filtered = tours.filter(tr => {
    const q = search.toLowerCase();
    const matchSearch = !q || t(tr.name).toLowerCase().includes(q) || t(tr.destination).toLowerCase().includes(q);
    const matchContinent = continent === 'All' || tr.continent === continent;
    return matchSearch && matchContinent;
  });

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'duration') filtered.sort((a, b) => b.duration - a.duration);
  else filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t({ th: 'ทัวร์ทั้งหมด', en: 'All Tours' })}</h1>
        <p className="text-slate-500">{t({ th: `พบ ${filtered.length} ทัวร์`, en: `Found ${filtered.length} tours` })}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            className="flex-1 text-sm focus:outline-none"
            placeholder={t({ th: 'ค้นหาทัวร์...', en: 'Search tours...' })}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="featured">{t({ th: 'แนะนำ', en: 'Featured' })}</option>
          <option value="price-asc">{t({ th: 'ราคา: น้อย → มาก', en: 'Price: Low → High' })}</option>
          <option value="price-desc">{t({ th: 'ราคา: มาก → น้อย', en: 'Price: High → Low' })}</option>
          <option value="duration">{t({ th: 'ระยะเวลา (ยาวสุด)', en: 'Duration (Longest)' })}</option>
        </select>
      </div>

      {/* Continent tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CONTINENTS.map(c => (
          <button
            key={c}
            onClick={() => setContinent(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              continent === c
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {c === 'All' ? t({ th: 'ทั้งหมด', en: 'All' }) : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{t({ th: 'ไม่พบทัวร์ที่ค้นหา', en: 'No tours found' })}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(tour => (
            <TourCard key={tour.id} tour={tour} t={t} navigate={navigate}
              inCompare={compareList.includes(tour.id)} onCompare={() => toggleCompare(tour.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
