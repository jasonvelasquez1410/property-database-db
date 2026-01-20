

import React, { useState } from 'react';
import { User, Page } from './types';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { Sidebar } from './components/layout/Sidebar';
import { PropertiesPage } from './components/PropertiesPage';
import { DocumentsPage } from './components/DocumentsPage';
import { FinancePage } from './components/FinancePage';


import { SettingsPage } from './components/SettingsPage';

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

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage user={user!} onLogout={handleLogout} />;
      case 'properties': return <PropertiesPage user={user!} onLogout={handleLogout} />;
      case 'documents': return <DocumentsPage user={user!} />;
      case 'finance': return <FinancePage user={user!} />;
      case 'settings': return <SettingsPage />;
      case 'help': return <HelpPage />;
      case 'admin': return <AdminPage />;
      default: return <DashboardPage user={user!} onLogout={handleLogout} />;
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;