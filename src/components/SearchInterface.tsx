import { useState } from 'react';
import { Search, User, FileText, LogOut } from 'lucide-react';
import { supabase, PersonWithCaseCount } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SearchInterfaceProps {
  onPersonSelect: (personId: string) => void;
}

export default function SearchInterface({ onPersonSelect }: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PersonWithCaseCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const { profile, signOut } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: people, error: searchError } = await supabase
        .from('people')
        .select('*')
        .ilike('full_name', `%${searchQuery}%`)
        .order('full_name');

      if (searchError) throw searchError;

      const peopleWithCounts: PersonWithCaseCount[] = await Promise.all(
        (people || []).map(async (person) => {
          const { count } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('person_id', person.id);

          return {
            ...person,
            case_count: count || 0,
          };
        })
      );

      setResults(peopleWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل البحث');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonClick = async (person: PersonWithCaseCount) => {
    try {
      await supabase.from('search_logs').insert({
        user_id: profile?.id,
        person_id: person.id,
      });

      onPersonSelect(person.id);
    } catch (err) {
      console.error('Error logging search:', err);
      onPersonSelect(person.id);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      alert('فشل تسجيل الخروج. يرجى المحاولة مرة أخرى.');
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900">البحث في القضايا القانونية</h1>
              <p className="text-sm text-slate-600 mt-1">
                مرحباً، {profile?.name} ({profile?.role === 'admin' ? 'مسؤول' : 'محامي'})
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center justify-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm sm:text-base">{signingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <form onSubmit={handleSearch}>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
              البحث بالاسم
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                  placeholder="أدخل اسم الشخص..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري البحث...' : 'بحث'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                نتائج البحث ({results.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-200">
              {results.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handlePersonClick(person)}
                  className="w-full px-6 py-4 text-right hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-medium">{person.case_count} قضية</span>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition">
                          {person.full_name}
                        </h3>
                        {person.national_id && (
                          <p className="text-sm text-slate-600">الرقم الوطني: {person.national_id}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-semibold group-hover:bg-slate-800 transition">
                        <User className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchQuery && !loading && results.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-slate-600">
              لم يتم العثور على أشخاص يطابقون "{searchQuery}". حاول كلمة بحث مختلفة.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
