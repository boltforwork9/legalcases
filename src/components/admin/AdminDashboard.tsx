import { useState } from 'react';
import { Users, UserCog, FileText, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UserManagement from './UserManagement';
import PeopleManagement from './PeopleManagement';
import CasesManagement from './CasesManagement';
import SearchLogs from './SearchLogs';

type Tab = 'users' | 'people' | 'cases' | 'logs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const tabs = [
    { id: 'users' as Tab, label: 'Users', icon: UserCog },
    { id: 'people' as Tab, label: 'People', icon: Users },
    { id: 'cases' as Tab, label: 'Cases', icon: FileText },
    { id: 'logs' as Tab, label: 'Search Logs', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">
                Welcome, {profile?.name}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'people' && <PeopleManagement />}
        {activeTab === 'cases' && <CasesManagement />}
        {activeTab === 'logs' && <SearchLogs />}
      </main>
    </div>
  );
}
