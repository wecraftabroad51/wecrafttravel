import { useState } from 'react';
import { X, BarChart2 } from 'lucide-react';

export default function CompareBar({ compareList, setCompareList, tours, t, navigate }) {
  const [showModal, setShowModal] = useState(false);
  const selected = tours.filter(tr => compareList.includes(tr.id));

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-teal-800 text-white z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-sm">เปรียบเทียบทัวร์ ({compareList.length}/3)</span>
            {selected.map(tr => (
              <span key={tr.id} className="bg-teal-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {t(tr.name)}
                <button onClick={() => setCompareList(p => p.filter(id => id !== tr.id))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              เปรียบเทียบ
            </button>
            <button onClick={() => setCompareList([])} className="bg-teal-700 hover:bg-teal-600 px-3 py-2 rounded-lg text-sm transition-colors">
              ล้าง
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-slate-800">เปรียบเทียบทัวร์</h2>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <td className="font-semibold text-slate-500 pr-4 w-32">รายการ</td>
                    {selected.map(tr => (
                      <th key={tr.id} className="text-center pb-4 px-4">
                        <img src={tr.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                        <div className="font-bold text-slate-800">{t(tr.name)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['ปลายทาง', tr => t(tr.destination)],
                    ['ทวีป', tr => tr.continent],
                    ['ระยะเวลา', tr => `${tr.duration} วัน`],
                    ['กลุ่มใหญ่สุด', tr => `${tr.groupSize} คน`],
                    ['สายการบิน', tr => tr.flight.outbound.airline],
                    ['ราคาเริ่มต้น', tr => `฿${tr.price.toLocaleString()}`],
                  ].map(([label, fn]) => (
                    <tr key={label}>
                      <td className="py-3 text-slate-500 font-medium pr-4">{label}</td>
                      {selected.map(tr => (
                        <td key={tr.id} className={`py-3 px-4 text-center font-semibold ${
                          label === 'ราคาเริ่มต้น'
                            ? Math.min(...selected.map(x => x.price)) === tr.price ? 'text-amber-600' : 'text-slate-700'
                            : 'text-slate-700'
                        }`}>
                          {fn(tr)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="grid mt-6" style={{ gridTemplateColumns: `8rem repeat(${selected.length}, 1fr)` }}>
                <div />
                {selected.map(tr => (
                  <div key={tr.id} className="px-4">
                    <button
                      onClick={() => { navigate('tour-detail', tr.id); setShowModal(false); }}
                      className="w-full bg-teal-700 hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
                      ดูรายละเอียด
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
