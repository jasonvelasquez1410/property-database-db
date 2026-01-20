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
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
    const [isAddLeaseOpen, setIsAddLeaseOpen] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'tenants' | 'leases' | 'payments'>('tenants');

    // Forms state
    const [newTenant, setNewTenant] = useState<Partial<Tenant>>({ status: 'Active' });
    const [newLease, setNewLease] = useState<Partial<Lease>>({ status: 'Active', monthlyRent: 0, securityDeposit: 0 });
    const [newPayment, setNewPayment] = useState<Partial<PaymentRecord>>({ status: 'Completed', amount: 0, paymentDate: new Date().toISOString().split('T')[0] });
    const [autoGeneratePDCs, setAutoGeneratePDCs] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedTenants, fetchedLeases, fetchedProperties, fetchedPayments] = await Promise.all([
                api.fetchTenants(),
                api.fetchLeases(),
                api.fetchProperties(),
                api.fetchPayments()
            ]);
            setTenants(fetchedTenants);
            setLeases(fetchedLeases);
            setProperties(fetchedProperties);
            setPayments(fetchedPayments);
        } catch (error: any) {
            console.error("Failed to load tenant data", error);
            // alert("Failed to load initial data: " + (error.message || "Unknown error"));
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
        } catch (error: any) {
            console.error(error);
            alert("Failed to add tenant: " + (error.message || "Please check your network connection."));
        }
    };

    const handleAddLease = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLease.propertyId || !newLease.tenantId) {
            alert("Please select both a property and a tenant.");
            return;
        }

        try {
            const added = await api.addLease(newLease as Lease);
            // Manually populate names for UI since the API returns raw IDs
            const tName = tenants.find(t => t.id === added.tenantId)?.name;
            const pName = properties.find(p => p.id === added.propertyId)?.propertyName;

            setLeases([{ ...added, tenantName: tName, propertyName: pName }, ...leases]);

            // Handle PDC Generation
            if (autoGeneratePDCs && newLease.startDate && newLease.endDate && newLease.monthlyRent) {
                const start = new Date(newLease.startDate);
                const end = new Date(newLease.endDate);
                const pdcsToCreate: Partial<PaymentRecord>[] = [];

                let current = new Date(start);
                // Move to next month for the first payment if rent is paid in advance? 
                // Usually first payment is immediate. Let's assume start date is first payment.

                while (current <= end) {
                    pdcsToCreate.push({
                        leaseId: added.id,
                        paymentDate: current.toISOString().split('T')[0],
                        amount: newLease.monthlyRent,
                        paymentType: 'Rent',
                        paymentMethod: 'Check', // Default to Check for PDCs
                        status: 'Pending',
                        remarks: 'PDC - Waiting for deposit'
                    });
                    // Increment month
                    current.setMonth(current.getMonth() + 1);
                }

                // Add all to database (in parallel for speed)
                const paymentPromises = pdcsToCreate.map(p => api.addPayment(p));
                const createdPayments = await Promise.all(paymentPromises);

                // Update local state
                setPayments(prev => [...createdPayments, ...prev]); // Add new ones to top/list
                alert(`Successfully created Lease and generated ${createdPayments.length} pending payment records.`);
            } else {
                alert("Lease created successfully.");
            }

            setIsAddLeaseOpen(false);
            setNewLease({ status: 'Active', monthlyRent: 0, securityDeposit: 0 });
            setAutoGeneratePDCs(false); // Reset checkbox
        } catch (error) {
            console.error(error);
            alert("Failed to add lease");
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPayment.amount || !newPayment.leaseId) {
            alert("Please select a lease and enter an amount.");
            return;
        }

        try {
            const added = await api.addPayment(newPayment as PaymentRecord);
            setPayments([added, ...payments]);
            setIsAddPaymentOpen(false);
            setNewPayment({ status: 'Completed', amount: 0, paymentDate: new Date().toISOString().split('T')[0] });
        } catch (error) {
            console.error(error);
            alert("Failed to record payment");
        }
    }

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

            {/* Workflow Guide */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Icon type="help" className="w-5 h-5" />
                    How to Manage Rentals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Step 1 */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">1</div>
                            <h4 className="font-semibold text-gray-900">Add Tenant</h4>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            Create a profile for your new tenant with their contact details and ID.
                            <br />
                            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setIsAddTenantOpen(true)}>+ Add Tenant Now</span>
                        </p>
                    </div>
                    {/* Arrow for Desktop */}
                    <div className="hidden md:block absolute top-4 left-[30%] w-[10%] h-[2px] bg-blue-200"></div>

                    {/* Step 2 */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">2</div>
                            <h4 className="font-semibold text-gray-900">Create Lease</h4>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            Link the tenant to a specific property. Set the monthly rent, term dates, and deposit.
                            <br />
                            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => { setActiveTab('leases'); setIsAddLeaseOpen(true); }}>+ New Lease</span>
                        </p>
                    </div>
                    {/* Arrow for Desktop */}
                    <div className="hidden md:block absolute top-4 left-[64%] w-[10%] h-[2px] bg-blue-200"></div>

                    {/* Step 3 */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">3</div>
                            <h4 className="font-semibold text-gray-900">Track Payments</h4>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            Record monthly rent payments against the active lease to keep your ledger updated.
                            <br />
                            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => { setActiveTab('payments'); setIsAddPaymentOpen(true); }}>+ Record Payment</span>
                        </p>
                    </div>
                </div>
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
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsAddLeaseOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                                    >
                                        <Icon type="plus" className="w-4 h-4" />
                                        New Lease Agreement
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rent</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {leases.map(lease => (
                                                <tr key={lease.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {lease.propertyName || 'Unknown Property'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {lease.tenantName || 'Unknown Tenant'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {lease.startDate} - {lease.endDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        ₱{lease.monthlyRent.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lease.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                            lease.status === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {lease.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {lease.contractUrl && (
                                                            <a
                                                                href={lease.contractUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1"
                                                            >
                                                                <Icon type="document-text" className="w-4 h-4" />
                                                                View Contract
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {leases.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                                        No active leases found. Create one to link a tenant to a property.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsAddPaymentOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                                    >
                                        <Icon type="plus" className="w-4 h-4" />
                                        Record Payment
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* Assuming 'payments' state variable exists and is populated */}
                                            {/* For now, using a placeholder for payments array */}
                                            {/* You'll need to fetch and manage 'payments' state similarly to tenants and leases */}
                                            {/* Example: const [payments, setPayments] = useState<PaymentRecord[]>([]); */}
                                            {/* And fetch them in loadData: api.fetchPaymentRecords() */}
                                            {/* For this example, I'll use an empty array for payments to avoid errors */}
                                            {([] as PaymentRecord[]).map(payment => (
                                                <tr key={payment.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.paymentDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {payment.paymentType}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        ₱{payment.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.paymentMethod}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                        {payment.referenceNo || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                                                        {payment.remarks}
                                                    </td>
                                                </tr>
                                            ))}
                                            {leases.length === 0 && ( // Changed from payments.length to leases.length for now, assuming payments is not yet implemented
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                                        No payment history available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Tenant Modal */}
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
                                        type="text"
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

            {/* Add Lease Modal */}
            {isAddLeaseOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Lease</h2>
                        <form onSubmit={handleAddLease} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tenant</label>
                                <select
                                    required
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    value={newLease.tenantId || ''}
                                    onChange={e => setNewLease({ ...newLease, tenantId: e.target.value })}
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Property</label>
                                <select
                                    required
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    value={newLease.propertyId || ''}
                                    onChange={e => setNewLease({ ...newLease, propertyId: e.target.value })}
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.propertyName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                        value={newLease.startDate || ''}
                                        onChange={e => setNewLease({ ...newLease, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                        value={newLease.endDate || ''}
                                        onChange={e => setNewLease({ ...newLease, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                        value={newLease.monthlyRent}
                                        onChange={e => setNewLease({ ...newLease, monthlyRent: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Security Deposit</label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                        value={newLease.securityDeposit}
                                        onChange={e => setNewLease({ ...newLease, securityDeposit: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Contract Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Upload Contract (PDF/Image)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Icon type="document-text" className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            const file = e.target.files[0];
                                                            const fakeUrl = URL.createObjectURL(file);
                                                            setNewLease({ ...newLease, contractUrl: fakeUrl });
                                                            alert(`File "${file.name}" ready to upload.`);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                        {newLease.contractUrl && (
                                            <p className="text-xs text-green-600 font-semibold mt-2">
                                                File selected (Ready to submit)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                                <input
                                    type="checkbox"
                                    id="generatePDCs"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={autoGeneratePDCs}
                                    onChange={(e) => setAutoGeneratePDCs(e.target.checked)}
                                />
                                <label htmlFor="generatePDCs" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Auto-generate Monthly Payment Records? (For PDCs)
                                    <span className="block text-xs text-gray-500 font-normal">Creates "Pending" payment entries for each month.</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddLeaseOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Lease
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};
