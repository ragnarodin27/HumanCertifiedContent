import React from 'react';
import { CertifiedArticle, AppView } from '../types';
import { FileText, CheckCircle, TrendingUp, Calendar, Plus, ChevronRight, BarChart3 } from 'lucide-react';

interface DashboardProps {
  history: CertifiedArticle[];
  onChangeView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, onChangeView }) => {
  const totalWords = history.reduce((acc, item) => acc + item.wordCount, 0);
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, item) => acc + item.humanScore, 0) / history.length) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome & Primary Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Writer Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage your certified content and writing impact.</p>
        </div>
        <button 
          onClick={() => onChangeView(AppView.WRITE)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" /> New Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Certified Articles</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">{history.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Words Certified</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalWords.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Avg. Human Score</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">{avgScore > 0 ? `${avgScore}%` : '-'}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            Certified History
          </h3>
          <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{history.length} Records</span>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="mb-4">No certified articles yet.</p>
            <button onClick={() => onChangeView(AppView.WRITE)} className="text-blue-600 font-medium hover:underline">Start writing now</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title / Excerpt</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {article.title || "Untitled Article"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(article.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${article.humanScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{article.humanScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {article.blockchainReceipt ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3 h-3" /> On-Chain
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                           Local
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};