import React from 'react';
import { User } from '../../types';
import { Icon } from '../shared/Icon';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="flex justify-end items-center p-4 bg-gray-50">
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Icon type="bell" className="w-6 h-6" />
           <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                {user.name.charAt(0)}
            </div>
             <button onClick={onLogout} className="text-gray-500 hover:text-gray-700 ml-2 p-1.5 rounded-full hover:bg-gray-200">
                <Icon type="logout" className="w-5 h-5" />
            </button>
        </div>
      </div>
    </header>
  );
};
