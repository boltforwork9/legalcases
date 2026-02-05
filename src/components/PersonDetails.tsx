import { useState, useEffect } from 'react';
import { ArrowRight, User, FileText, Building2, Hash, Calendar, FileCheck } from 'lucide-react';
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
        setError('لم يتم العثور على الشخص');
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
      setError(err instanceof Error ? err.message : 'فشل تحميل التفاصيل');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'لم يتم العثور على الشخص'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            العودة
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
            <span>العودة إلى البحث</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">تفاصيل الشخص</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{person.full_name}</h2>
              {person.national_id && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span>الرقم الوطني: {person.national_id}</span>
                  <Hash className="w-4 h-4" />
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-slate-600">
                <span>إجمالي القضايا: {person.cases.length}</span>
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <User className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">القضايا</h3>
          </div>

          {person.cases.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">لا توجد قضايا لهذا الشخص</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {person.cases.map((caseItem) => (
                <div key={caseItem.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-left">
                      {caseItem.session_date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(caseItem.session_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-slate-900 text-lg mb-1">
                        {caseItem.case_type}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>رقم القضية: {caseItem.case_number}</span>
                        <Hash className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 justify-end">
                      <span>{caseItem.court_name}</span>
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>

                  {caseItem.decision && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start gap-2 justify-end">
                        <div className="text-sm text-slate-700 text-right">{caseItem.decision}</div>
                        <FileCheck className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
