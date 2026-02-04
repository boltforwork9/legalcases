import { useState, useEffect } from 'react';
import { FilePlus, Edit2, Trash2, AlertCircle, FileText, User } from 'lucide-react';
import { supabase, Case, Person } from '../../lib/supabase';

interface CaseWithPerson extends Case {
  person?: Person;
}

export default function CasesManagement() {
  const [cases, setCases] = useState<CaseWithPerson[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    person_id: '',
    case_type: '',
    court_name: '',
    case_number: '',
    status: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesResponse, peopleResponse] = await Promise.all([
        supabase
          .from('cases')
          .select('*, people(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('people')
          .select('*')
          .order('full_name'),
      ]);

      if (casesResponse.error) throw casesResponse.error;
      if (peopleResponse.error) throw peopleResponse.error;

      const casesWithPerson = (casesResponse.data || []).map((c: any) => ({
        ...c,
        person: c.people,
      }));

      setCases(casesWithPerson);
      setPeople(peopleResponse.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('cases')
          .update({
            person_id: formData.person_id,
            case_type: formData.case_type,
            court_name: formData.court_name,
            case_number: formData.case_number,
            status: formData.status,
          })
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Case updated successfully');
      } else {
        const { error } = await supabase
          .from('cases')
          .insert({
            person_id: formData.person_id,
            case_type: formData.case_type,
            court_name: formData.court_name,
            case_number: formData.case_number,
            status: formData.status,
          });

        if (error) throw error;
        setSuccess('Case added successfully');
      }

      setFormData({
        person_id: '',
        case_type: '',
        court_name: '',
        case_number: '',
        status: '',
      });
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleEdit = (caseItem: CaseWithPerson) => {
    setFormData({
      person_id: caseItem.person_id,
      case_type: caseItem.case_type,
      court_name: caseItem.court_name,
      case_number: caseItem.case_number,
      status: caseItem.status,
    });
    setEditingId(caseItem.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Case deleted successfully');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete case');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      person_id: '',
      case_type: '',
      court_name: '',
      case_number: '',
      status: '',
    });
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
        <h2 className="text-2xl font-bold text-slate-900">Cases Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
        >
          <FilePlus className="w-4 h-4" />
          Add Case
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          {success}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Case' : 'Add New Case'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Person
              </label>
              <select
                value={formData.person_id}
                onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                required
              >
                <option value="">Select a person</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.full_name} ({person.national_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Case Type
                </label>
                <input
                  type="text"
                  value={formData.case_type}
                  onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="e.g., Criminal, Civil, Family"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Court Name
                </label>
                <input
                  type="text"
                  value={formData.court_name}
                  onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Case Number
                </label>
                <input
                  type="text"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                {editingId ? 'Update' : 'Add'} Case
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Case Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Case Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {caseItem.person?.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">{caseItem.case_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {caseItem.case_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {caseItem.court_name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        caseItem.status === 'Open'
                          ? 'bg-green-100 text-green-800'
                          : caseItem.status === 'Closed'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(caseItem)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        title="Edit case"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(caseItem.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition"
                        title="Delete case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cases.length === 0 && (
          <div className="p-12 text-center text-slate-600">
            No cases found. Add your first case to get started.
          </div>
        )}
      </div>
    </div>
  );
}
