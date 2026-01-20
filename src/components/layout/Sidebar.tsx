import React from 'react';
import { User, Page } from '../../types';
import { Icon } from '../shared/Icon';

interface SidebarProps {
    user: User;
    activePage: Page;
    setActivePage: (page: Page) => void;
    isOpen: boolean;
    onClose: () => void;
}

const NavItem = ({ icon, label, page, activePage, setActivePage, disabled = false, onClose }: { icon: any, label: string, page: Page, activePage: Page, setActivePage: (page: Page) => void, disabled?: boolean, onClose: () => void }) => {
    const isActive = activePage === page;
    const handleClick = () => {
        if (!disabled) {
            setActivePage(page);
            onClose(); // Close sidebar on mobile when item clicked
        }
    }
    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                } ${disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
        >
            <Icon type={icon} className="w-6 h-6" />
            <span>{label}</span>
        </button>
    );
};

export const Sidebar = ({ user, activePage, setActivePage, isOpen, onClose }: SidebarProps) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30
                w-64 bg-white flex flex-col border-r shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="flex items-center justify-between h-16 border-b px-6">
                    <div className="flex items-center gap-3">
                        <img src="/svm-logo.jpg" alt="SVM Logo" className="h-10 w-10 object-cover rounded-full" />
                        <span className="font-bold text-lg tracking-wider text-gray-800">SVMPROPERTIES</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
                        <Icon type="close" className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 flex-grow overflow-y-auto">
                    <nav className="space-y-2">
                        <NavItem icon="dashboard" label="Dashboard" page="dashboard" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                        <NavItem icon="properties" label="Properties" page="properties" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                        <NavItem icon="document-text" label="Documents" page="documents" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                        <NavItem icon="finance" label="Finance" page="finance" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                    </nav>
                    <div className="my-4 border-t"></div>
                    <nav className="space-y-2">
                        <NavItem icon="settings" label="Settings" page="settings" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                        <NavItem icon="help" label="Help" page="help" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                        {user.role === 'admin' && (
                            <NavItem icon="admin" label="Admin" page="admin" activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
                        )}
                    </nav>
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
