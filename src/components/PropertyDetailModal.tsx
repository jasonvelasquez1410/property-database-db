
import React, { useState } from 'react';
import { Property, PropertyType, User } from '../types';
import { Icon } from './shared/Icon';
import { DocumentLink } from './shared/DocumentLink';

interface PropertyDetailModalProps {
    property: Property | null;
    user: User;
    onClose: () => void;
    onEdit: (property: Property) => void;
    onDelete: (id: string) => void;
}

const DetailSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, className = '' }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="font-semibold text-gray-500">{label}</span>
        <span className="text-gray-900">{value ?? 'N/A'}</span>
    </div>
);

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return 'N/A';
    return `₱ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const PropertyDetailModal = ({ property, user, onClose, onEdit, onDelete }: PropertyDetailModalProps) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!property) return null;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'financials', label: 'Financials' },
        { id: 'legal', label: 'Legal & Docs' },
        { id: 'operations', label: 'Operations' },
        { id: 'valuation', label: 'Valuation' },
    ];

    const handleEditClick = () => {
        onEdit(property);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab property={property} />;
            case 'financials': return <FinancialsTab property={property} />;
            case 'legal': return <LegalTab property={property} />;
            case 'operations': return <OperationsTab property={property} />;
            case 'valuation': return <ValuationTab property={property} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 sm:p-6 border-b bg-gray-800 text-white rounded-t-xl flex justify-between items-start gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{property.propertyName}</h2>
                        <p className="text-sm text-gray-300">{property.propertyType} in {property.location}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {(user.role === 'admin' || user.role === 'manager') && (
                            <>
                                <button onClick={handleEditClick} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition-colors">
                                    <Icon type="edit" className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button onClick={() => onDelete(property.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors">
                                    <Icon type="trash" className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                            <Icon type="close" className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row flex-grow min-h-0">
                    <div className="w-full md:w-1/3 xl:w-2/5 p-4 sm:p-6 border-b md:border-b-0 md:border-r bg-white overflow-y-auto">
                        <img src={property.photoUrl} alt={property.propertyName} className="w-full h-48 object-cover rounded-lg shadow-md mb-6" />
                        <div className="space-y-3 text-sm">
                            <DetailItem label="Full Address" value={property.fullAddress} />
                            <DetailItem label="Unit No." value={property.unitNumber} />
                            <DetailItem label="Floor No." value={property.floorNumber} />
                            <DetailItem label="Area" value={`${property.areaSqm.toLocaleString()} sqm`} />
                            <DetailItem label="Lot/Blk No." value={property.lotNo} />
                            <DetailItem label="TCT/CCT No." value={property.tctOrCctNo} />
                        </div>
                        <div className="flex flex-col gap-3 pt-4 border-t mt-4">
                            {property.gpsCoordinates && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${property.gpsCoordinates}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors font-semibold">
                                    <Icon type="map-pin" className="w-5 h-5" />
                                    View on Google Maps
                                </a>
                            )}
                            {property.videoUrl && (
                                <a href={property.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors font-semibold">
                                    <Icon type="video" className="w-5 h-5" />
                                    Watch Video Tour
                                </a>
                            )}
                        </div>
                    </div>
                    <main className="w-full md:w-2/3 xl:w-3/5 flex flex-col min-h-0">
                        <nav className="border-b border-gray-200 px-4 sm:px-6 bg-white">
                            <div className="-mb-px flex space-x-6" aria-label="Tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </nav>
                        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};


const OverviewTab = ({ property }: { property: Property }) => (
    <div>
        <DetailSection title="Property Details">
            <DetailItem label="Original Developer / Registered Owner" value={property.originalDeveloper} />
            <DetailItem label="Buyer's Name" value={property.buyersName} />
            <DetailItem label="Broker's Name" value={property.brokersName} />
            <DetailItem label="Broker's Contact" value={property.brokersContact} />
        </DetailSection>
        <DetailSection title="Core Documents">
            <div className="col-span-full flex flex-wrap gap-3">
                <DocumentLink label="Title (TCT)" href={property.tctUrl} />
                <DocumentLink label="Tax Declaration (TD)" href={property.tdUrl} />
                <DocumentLink label="Condo Cert. (CCT)" href={property.cctUrl} disabled={property.propertyType !== PropertyType.CONDOMINIUM && property.propertyType !== PropertyType.CONDOTEL} />
                <DocumentLink label="Location Plan" href={property.locationPlanUrl} />
            </div>
        </DetailSection>
    </div>
);

const FinancialsTab = ({ property }: { property: Property }) => (
    <div>
        <DetailSection title="Acquisition Cost">
            <DetailItem label="Unit / Lot Cost" value={formatCurrency(property.acquisition.unitLotCost)} />
            <DetailItem label="Cost / Sqm" value={formatCurrency(property.acquisition.costPerSqm)} />
            <DetailItem label="Fit Out Cost" value={formatCurrency(property.acquisition.fitOutCost)} />
            <DetailItem label="Total Acquisition Cost" value={formatCurrency(property.acquisition.totalCost)} className="font-bold" />
        </DetailSection>
        <DetailSection title="Payment Status">
            <DetailItem label="Manner of Payment" value={property.payment.status} />
            <div className="col-span-full">
                {property.payment.paymentScheduleUrl && <DocumentLink label="View Payment Schedule" href={property.payment.paymentScheduleUrl} />}
            </div>
        </DetailSection>
    </div>
);

const LegalTab = ({ property }: { property: Property }) => (
    <div>
        <DetailSection title="Documentation Status">
            {property.documentation.docs.map((doc, index) => (
                <div key={`${doc.type}-${index}`} className="bg-gray-100 p-3 rounded-lg col-span-full sm:col-span-1">
                    <p className="font-bold text-gray-800">{doc.type}</p>
                    <DetailItem label="Status" value={doc.status} />
                    <DetailItem label="Execution Date" value={formatDate(doc.executionDate)} />
                    <DetailItem label="Priority" value={doc.priority} />
                    {doc.dueDate && <DetailItem label="Due Date" value={formatDate(doc.dueDate)} />}
                    <div className="mt-2">
                        <DocumentLink label={`View ${doc.type}`} href={doc.documentUrl} disabled={!doc.status.toLowerCase().includes('available')} />
                    </div>
                </div>
            ))}
            <div className="col-span-full mt-2">
                <DetailItem label="Pending Documents" value={property.documentation.pendingDocuments.length > 0 ? property.documentation.pendingDocuments.join(', ') : 'None'} />
            </div>
        </DetailSection>
        <DetailSection title="Possession / Turnover">
            <DetailItem label="Status" value={property.possession.isTurnedOver ? 'Turned Over' : 'Pending'} />
            <DetailItem label="Date" value={formatDate(property.possession.turnoverDate)} />
            <DetailItem label="Authorized Recipient" value={property.possession.authorizedRecipient} />
        </DetailSection>
    </div>
);

const OperationsTab = ({ property }: { property: Property }) => {
    const { lease, insurance, management } = property;
    return (
        <div>
            {lease && (
                <DetailSection title="Lease Information">
                    <DetailItem label="Lessee" value={lease.lessee} />
                    <DetailItem label="Lease Date" value={formatDate(lease.leaseDate)} />
                    <DetailItem label="Lease Rate" value={`${formatCurrency(lease.leaseRate)} / month`} />
                    <DetailItem label="Term" value={`${lease.termInYears} years`} />
                    <DetailItem label="Referring Broker" value={lease.referringBroker} />
                    <DetailItem label="Broker Contact" value={lease.brokerContact} />
                    <div className="col-span-full mt-2">
                        <DocumentLink label="View Lease Contract" href={lease.contractUrl} />
                    </div>
                </DetailSection>
            )}
            {insurance && (
                <DetailSection title="Insurance Data">
                    <DetailItem label="Date of Coverage" value={formatDate(insurance.coverageDate)} />
                    <DetailItem label="Amount Insured" value={formatCurrency(insurance.amountInsured)} />
                    <DetailItem label="Insurance Company" value={insurance.insuranceCompany} />
                    <div className="col-span-full mt-2">
                        <DocumentLink label="View Policy" href={insurance.policyUrl} />
                    </div>
                </DetailSection>
            )}
            <DetailSection title="Property Management">
                <DetailItem label="Caretaker" value={management.caretakerName} />
                <DetailItem label="Rate per Month" value={formatCurrency(management.caretakerRatePerMonth)} />
                <div className="col-span-full my-2 border-t"></div>
                <div className="bg-gray-100 p-3 rounded-lg col-span-full sm:col-span-1">
                    <p className="font-bold text-gray-800">Real Estate Taxes</p>
                    <DetailItem label="Last Paid" value={formatDate(management.realEstateTaxes.lastPaidDate)} />
                    <DetailItem label="Amount Paid" value={formatCurrency(management.realEstateTaxes.amountPaid)} />
                    <div className="mt-2"><DocumentLink label="View Receipt" href={management.realEstateTaxes.receiptUrl} /></div>
                </div>
                {management.condoDues && (
                    <div className="bg-gray-100 p-3 rounded-lg col-span-full sm:col-span-1">
                        <p className="font-bold text-gray-800">Condo Dues</p>
                        <DetailItem label="Last Paid" value={formatDate(management.condoDues.lastPaidDate)} />
                        <DetailItem label="Amount Paid" value={formatCurrency(management.condoDues.amountPaid)} />
                        <div className="mt-2"><DocumentLink label="View Receipt" href={management.condoDues.receiptUrl} /></div>
                    </div>
                )}
            </DetailSection>
        </div>
    )
};

const ValuationTab = ({ property }: { property: Property }) => (
    <div>
        <DetailSection title="Appraisal History">
            <div className="col-span-full space-y-4">
                {property.appraisals.length > 0 ? property.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime()).map((appraisal, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div>
                            <p className="font-semibold text-gray-500">Appraisal Date</p>
                            <p className="text-gray-900">{formatDate(appraisal.appraisalDate)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-500">Appraised Value</p>
                            <p className="text-gray-900 font-bold">{formatCurrency(appraisal.appraisedValue)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-500">Appraisal Company</p>
                            <p className="text-gray-900">{appraisal.appraisalCompany}</p>
                        </div>
                        <div className="sm:col-span-3 mt-2">
                            <DocumentLink label="View Appraisal Report" href={appraisal.reportUrl} />
                        </div>
                    </div>
                )) : <p>No appraisal history found.</p>}
            </div>
        </DetailSection>
    </div>
);
