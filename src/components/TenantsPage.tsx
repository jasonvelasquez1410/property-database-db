import React, { useState, useEffect } from 'react';
import { User, Tenant, Lease, PaymentRecord, Property } from '../types';
import { api } from '../services/api';
import { Icon } from './shared/Icon';

interface TenantsPageProps {
    user: User;
}

export const TenantsPage = ({ user }: TenantsPageProps) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [leases, setLeases] = useState<Lease[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'tenants' | 'leases' | 'payments'>('tenants');

    // Forms state
    const [newTenant, setNewTenant] = useState<Partial<Tenant>>({ status: 'Active' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedTenants, fetchedLeases, fetchedProperties] = await Promise.all([
                api.fetchTenants(),
                api.fetchLeases(),
                api.fetchProperties()
            ]);
            setTenants(fetchedTenants);
            setLeases(fetchedLeases);
            setProperties(fetchedProperties);
        } catch (error) {
            console.error("Failed to load tenant data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTenant.name || !newTenant.email) return;

        try {
            const added = await api.addTenant(newTenant as Tenant);
            setTenants([added, ...tenants]);
            setIsAddTenantOpen(false);
            setNewTenant({ status: 'Active' });
        } catch (error) {
            console.error(error);
            alert("Failed to add tenant");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tenant & Lease Management</h1>
                    <p className="mt-1 text-md text-gray-600">Manage tenants, track leases, and monitor rental payments.</p>
                </div>
                <button
                    onClick={() => setIsAddTenantOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Icon type="plus" className="w-5 h-5" />
                    Add Tenant
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-4">
                <button
                    className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tenants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('tenants')}
                >
                    Tenants
                </button>
                <button
                    className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'leases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('leases')}
                >
                    Leases
                </button>
                <button
                    className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('payments')}
                >
                    Payment History
                </button>
            </div>

            <div className="bg-white rounded-b-xl shadow p-6 min-h-[400px]">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading data...</div>
                ) : (
                    <>
                        {activeTab === 'tenants' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tenants.map(tenant => (
                                            <tr key={tenant.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                            {tenant.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                                            <div className="text-sm text-gray-500">{tenant.occupation || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{tenant.email}</div>
                                                    <div className="text-sm text-gray-500">{tenant.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ID: {tenant.idType || 'None'} - {tenant.idNumber || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {tenant.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {tenants.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                                    No tenants found. Click "Add Tenant" to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'leases' && (
                            <div className="text-center py-10 text-gray-500">
                                <Icon type="document-text" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Lease management view coming soon.</p>
                                <p className="text-sm">Here you will verify active leases and link tenants to properties.</p>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="text-center py-10 text-gray-500">
                                <Icon type="finance" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Payment ledger coming soon.</p>
                                <p className="text-sm">Here you will track monthly rent payments.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Tenant Modal */}
            {isAddTenantOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Tenant</h2>
                        <form onSubmit={handleAddTenant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    value={newTenant.name || ''}
                                    onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                        value={newTenant.email || ''}
                                        onChange={e => setNewTenant({ ...newTenant, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                        value={newTenant.phone || ''}
                                        onChange={e => setNewTenant({ ...newTenant, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Occupation</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    value={newTenant.occupation || ''}
                                    onChange={e => setNewTenant({ ...newTenant, occupation: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddTenantOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Tenant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
