import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, AlertCircle, User } from 'lucide-react';
import { supabase, Person } from '../../lib/supabase';

export default function PeopleManagement() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setPeople(data || []);
    } catch (err) {
      console.error('Error loading people:', err);
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
          .from('people')
          .update({
            full_name: formData.full_name,
            national_id: formData.national_id || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('تم تحديث الشخص بنجاح');
      } else {
        const { error } = await supabase
          .from('people')
          .insert({
            full_name: formData.full_name,
            national_id: formData.national_id || null,
          });

        if (error) throw error;
        setSuccess('تم إضافة الشخص بنجاح');
      }

      setFormData({ full_name: '', national_id: '' });
      setShowForm(false);
      setEditingId(null);
      await loadPeople();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشلت العملية');
    }
  };

  const handleEdit = (person: Person) => {
    setFormData({
      full_name: person.full_name,
      national_id: person.national_id || '',
    });
    setEditingId(person.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الشخص؟ سيتم حذف جميع القضايا المرتبطة به أيضاً.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('تم حذف الشخص بنجاح');
      await loadPeople();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حذف الشخص');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ full_name: '', national_id: '' });
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center sm:text-right">إدارة الأشخاص</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm sm:text-base"
        >
          <span>إضافة شخص</span>
          <UserPlus className="w-4 h-4" />
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
            {editingId ? 'تعديل الشخص' : 'إضافة شخص جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الرقم الوطني (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="اختياري"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm sm:text-base"
              >
                {editingId ? 'تحديث' : 'إضافة'} الشخص
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm sm:text-base"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  الاسم الكامل
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  الرقم الوطني
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  تاريخ الإنشاء
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3 justify-end whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-medium text-slate-900">{person.full_name}</span>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-700 text-right whitespace-nowrap">
                    {person.national_id || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 text-right whitespace-nowrap">
                    {new Date(person.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2 justify-end whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition"
                        title="حذف الشخص"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(person)}
                        className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        title="تعديل الشخص"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {people.length === 0 && (
          <div className="p-12 text-center text-slate-600">
            لم يتم العثور على أشخاص. أضف أول شخص للبدء.
          </div>
        )}
      </div>
    </div>
  );
}
