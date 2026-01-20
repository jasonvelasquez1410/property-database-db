import React from 'react';
import { User, Page } from '../../types';
import { Icon } from '../shared/Icon';

interface SidebarProps {
  user: User;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem = ({ icon, label, page, activePage, setActivePage, disabled = false }: { icon: any, label: string, page: Page, activePage: Page, setActivePage: (page: Page) => void, disabled?: boolean }) => {
    const isActive = activePage === page;
    return (
        <button
            onClick={() => !disabled && setActivePage(page)}
            disabled={disabled}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            } ${disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
        >
            <Icon type={icon} className="w-6 h-6" />
            <span>{label}</span>
        </button>
    );
};

export const Sidebar = ({ user, activePage, setActivePage }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white flex-shrink-0 flex flex-col border-r shadow-lg z-10">
        <div className="flex items-center gap-2 h-16 border-b px-4">
            <Icon type="building-office" className="w-8 h-8 text-blue-600"/>
            <span className="font-bold text-lg tracking-wider text-gray-800">SVMPROPERTIES</span>
        </div>

        <div className="p-4 flex-grow">
            <nav className="space-y-2">
                <NavItem icon="dashboard" label="Dashboard" page="dashboard" activePage={activePage} setActivePage={setActivePage} />
                <NavItem icon="properties" label="Properties" page="properties" activePage={activePage} setActivePage={setActivePage} />
                <NavItem icon="document-text" label="Documents" page="documents" activePage={activePage} setActivePage={setActivePage} />
                <NavItem icon="finance" label="Finance" page="finance" activePage={activePage} setActivePage={setActivePage} />
            </nav>
            <div className="my-4 border-t"></div>
            <nav className="space-y-2">
                <NavItem icon="settings" label="Settings" page="settings" activePage={activePage} setActivePage={setActivePage} />
                <NavItem icon="help" label="Help" page="help" activePage={activePage} setActivePage={setActivePage} />
                {user.role === 'admin' && (
                    <NavItem icon="admin" label="Admin" page="admin" activePage={activePage} setActivePage={setActivePage} />
                )}
            </nav>
        </div>
        <div className="p-4 border-t">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                     {user.name.charAt(0)}
                </div>
                 <div>
                    <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <Icon type="chevron-up" className="w-5 h-5 ml-auto text-gray-500" />
            </div>
        </div>
    </aside>
  );
};
