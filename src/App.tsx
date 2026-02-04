import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import SearchInterface from './components/SearchInterface';
import PersonDetails from './components/PersonDetails';
import AdminDashboard from './components/admin/AdminDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  if (profile.must_change_password) {
    return <ChangePassword />;
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  if (selectedPersonId) {
    return (
      <PersonDetails
        personId={selectedPersonId}
        onBack={() => setSelectedPersonId(null)}
      />
    );
  }

  return <SearchInterface onPersonSelect={setSelectedPersonId} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
