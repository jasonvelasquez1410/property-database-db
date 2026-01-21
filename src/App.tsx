

import React, { useState } from 'react';
import { User, Page } from './types';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { PropertiesPage } from './components/PropertiesPage';
import { DocumentsPage } from './components/DocumentsPage';
import { FinancePage } from './components/FinancePage';
import { TenantsPage } from './components/TenantsPage';



import { SettingsPage } from './components/SettingsPage';

import { TeamPage } from './components/TeamPage';

// Placeholder pages for navigation demonstration
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="mt-2 text-gray-600">This page is under construction.</p>
  </div>
);

const HelpPage = () => <PlaceholderPage title="Help" />;
const AdminPage = () => <PlaceholderPage title="Admin" />;


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage user={user!} onLogout={handleLogout} onNavigate={setActivePage} />;
      case 'properties': return <PropertiesPage user={user!} onLogout={handleLogout} />;
      case 'documents': return <DocumentsPage user={user!} />;
      case 'tenants': return <TenantsPage user={user!} />;
      case 'finance': return <FinancePage user={user!} />;
      case 'settings': return <SettingsPage />;
      case 'help': return <HelpPage />;
      case 'admin': return <TeamPage user={user!} onLogout={handleLogout} onNavigate={setActivePage} />;
      default: return <DashboardPage user={user!} onLogout={handleLogout} />;
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header (Simplified) */}
        {!isSidebarOpen && (
          <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <img src="/svm-logo.jpg" alt="SVM Logo" className="h-8 w-8 object-cover rounded-full" />
              <span className="font-bold text-lg text-gray-800">SVMPROPERTIES</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pb-20 md:pb-0">
          {renderPage()}
        </main>

        <MobileBottomNav
          activePage={activePage}
          setActivePage={setActivePage}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

export default App;