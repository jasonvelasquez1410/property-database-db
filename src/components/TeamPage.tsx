import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Header } from './layout/Header';
import { Icon } from './shared/Icon';

interface TeamPageProps {
    user: User;
    onLogout: () => void;
    onNavigate: (page: any) => void;
}

export const TeamPage = ({ user, onLogout, onNavigate }: TeamPageProps) => {
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        setLoading(true);
        try {
            const members = await api.getAllProfiles();
            // If members are empty (e.g., profiles table doesn't have email/name sync), we might struggle.
            // But let's assume it works for now.
            setTeamMembers(members);
        } catch (err) {
            console.error(err);
            setError('Failed to load team members.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: string, newRole: 'admin' | 'manager' | 'staff') => {
        try {
            await api.updateProfileRole(memberId, newRole);
            // Optimistic update
            setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        } catch (err) {
            alert('Failed to update role');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogout={onLogout} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                        <p className="text-gray-500">Manage user access and permissions.</p>
                    </div>
                    {/* Future: Invite Button */}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Loading team...</div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200">
                            {teamMembers.length === 0 && (
                                <li className="p-6 text-center text-gray-500">
                                    No profiles found. (Ensure users have signed in at least once)
                                </li>
                            )}
                            {teamMembers.map((member) => (
                                <li key={member.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{member.name || 'Unnamed User'}</div>
                                                <div className="text-sm text-gray-500">{member.email || 'No Email'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {member.role.toUpperCase()}
                                            </span>

                                            {/* Role Editor - Only if current user is admin and not editing themselves (optional safety) */}
                                            {user.role === 'admin' && user.id !== member.id && (
                                                <div className="relative inline-block text-left">
                                                    <select
                                                        className="block max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                                                    >
                                                        <option value="staff">Staff</option>
                                                        <option value="manager">Manager</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};
