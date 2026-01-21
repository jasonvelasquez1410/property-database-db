import React from 'react';
import { Page } from '../../types';
import { Icon } from '../shared/Icon';

interface MobileBottomNavProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
    onMenuClick: () => void;
}

export const MobileBottomNav = ({ activePage, setActivePage, onMenuClick }: MobileBottomNavProps) => {
    const NavItem = ({ page, icon, label, isMenu = false, onMenuClick }: { page?: Page, icon: any, label: string, isMenu?: boolean, onMenuClick?: () => void }) => {
        const isActive = activePage === page && !isMenu;

        return (
            <button
                onClick={() => isMenu && onMenuClick ? onMenuClick() : setActivePage(page!)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                <Icon type={icon} className={`w-6 h-6 ${isActive ? 'stroke-current' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-40 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <NavItem page="dashboard" icon="dashboard" label="Home" />
            <NavItem page="properties" icon="properties" label="Properties" />
            <NavItem page="tenants" icon="user" label="Tenants" />
            <NavItem page="finance" icon="finance" label="Finance" />
            <NavItem icon="menu" label="Menu" isMenu onMenuClick={onMenuClick} />
        </div>
    );
};
