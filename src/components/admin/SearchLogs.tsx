import { useState, useEffect } from 'react';
import { Search, User, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchLogWithDetails {
  id: string;
  searched_at: string;
  user: {
    name: string;
    email: string;
  };
  person: {
    full_name: string;
    national_id: string;
  };
}

export default function SearchLogs() {
  const [logs, setLogs] = useState<SearchLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_logs')
        .select(`
          id,
          searched_at,
          user:profiles!search_logs_user_id_fkey(name, email),
          person:people!search_logs_person_id_fkey(full_name, national_id)
        `)
        .order('searched_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const logsWithDetails = (data || []).map((log: any) => ({
        id: log.id,
        searched_at: log.searched_at,
        user: Array.isArray(log.user) ? log.user[0] : log.user,
        person: Array.isArray(log.person) ? log.person[0] : log.person,
      }));

      setLogs(logsWithDetails);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">سجلات البحث</h2>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
        >
          تحديث
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  الشخص المبحوث عنه
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  التوقيت
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {log.user?.name || 'غير معروف'}
                        </div>
                        <div className="text-xs text-slate-600">
                          {log.user?.email || 'غير متاح'}
                        </div>
                      </div>
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {log.person?.full_name || 'غير معروف'}
                        </div>
                        <div className="text-xs text-slate-600">
                          {log.person?.national_id || 'غير متاح'}
                        </div>
                      </div>
                      <Search className="w-4 h-4 text-slate-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700 justify-end">
                      <div className="text-right">
                        <div>{new Date(log.searched_at).toLocaleDateString('ar-SA')}</div>
                        <div className="text-xs text-slate-600">
                          {new Date(log.searched_at).toLocaleTimeString('ar-SA')}
                        </div>
                      </div>
                      <Clock className="w-4 h-4 text-slate-600" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="p-12 text-center text-slate-600">
            لم يتم العثور على سجلات بحث.
          </div>
        )}
      </div>
    </div>
  );
}
