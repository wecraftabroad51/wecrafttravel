import { Calendar, User } from 'lucide-react';

export default function ArticlesPage({ lang, t, navigate, articles }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t({ th: 'บทความ', en: 'Articles' })}</h1>
        <p className="text-slate-500">{t({ th: 'ความรู้และเคล็ดลับสำหรับนักท่องเที่ยว', en: 'Tips and knowledge for travelers' })}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <div key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="overflow-hidden h-48">
              <img src={article.coverImage} alt={t(article.title)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.author}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{t(article.title)}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{t(article.excerpt)}</p>
              <button onClick={() => navigate('article-detail', article.id)}
                className="text-teal-700 hover:text-teal-600 text-sm font-semibold transition-colors">
                {t({ th: 'อ่านต่อ →', en: 'Read more →' })}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
