import { useState, useEffect } from 'react';
import { ArrowLeft, User, FileText, Building2, Hash, Activity } from 'lucide-react';
import { supabase, PersonWithCases } from '../lib/supabase';

interface PersonDetailsProps {
  personId: string;
  onBack: () => void;
}

export default function PersonDetails({ personId, onBack }: PersonDetailsProps) {
  const [person, setPerson] = useState<PersonWithCases | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPersonDetails();
  }, [personId]);

  const loadPersonDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: personData, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .maybeSingle();

      if (personError) throw personError;
      if (!personData) {
        setError('Person not found');
        return;
      }

      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      setPerson({
        ...personData,
        cases: casesData || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Person not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Person Details</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{person.full_name}</h2>
              <div className="flex items-center gap-2 text-slate-600">
                <Hash className="w-4 h-4" />
                <span>National ID: {person.national_id}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-slate-600">
                <FileText className="w-4 h-4" />
                <span>{person.cases.length} total cases</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Cases</h3>
          </div>

          {person.cases.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No cases found for this person</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {person.cases.map((caseItem) => (
                <div key={caseItem.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg mb-1">
                        {caseItem.case_type}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Hash className="w-4 h-4" />
                        <span>Case #: {caseItem.case_number}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        caseItem.status.toLowerCase() === 'open'
                          ? 'bg-green-100 text-green-800'
                          : caseItem.status.toLowerCase() === 'closed'
                          ? 'bg-slate-100 text-slate-800'
                          : caseItem.status.toLowerCase() === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {caseItem.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      <span>{caseItem.court_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Activity className="w-4 h-4" />
                      <span>
                        Created: {new Date(caseItem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
