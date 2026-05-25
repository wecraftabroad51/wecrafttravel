import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function ArticleDetailPage({ lang, t, navigate, articles, articleId }) {
  const article = articles.find(a => a.id === articleId);
  if (!article) return <div className="p-10 text-center text-slate-400">Article not found</div>;

  const body = t(article.body);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate('articles')}
        className="flex items-center gap-2 text-teal-700 hover:text-teal-600 mb-6 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t({ th: 'กลับไปบทความ', en: 'Back to Articles' })}
      </button>

      <img src={article.coverImage} alt={t(article.title)} className="w-full h-64 object-cover rounded-2xl mb-6" />

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.author}</span>
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{article.date}</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">{t(article.title)}</h1>

      <div className="prose prose-slate max-w-none">
        {body.split('\n').map((line, i) => {
          if (!line.trim()) return <br key={i} />;
          const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          return (
            <p key={i} className="mb-3 text-slate-600 leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: bold }} />
          );
        })}
      </div>

      <div className="mt-10 pt-6 border-t">
        <button onClick={() => navigate('articles')}
          className="text-teal-700 hover:text-teal-600 font-medium transition-colors">
          ← {t({ th: 'ดูบทความทั้งหมด', en: 'View All Articles' })}
        </button>
      </div>
    </div>
  );
}
