
import React, { useState, useEffect } from 'react';
import { Property, PropertyType, Location, PaymentStatus, Documentation } from '../types';
import { Icon } from './shared/Icon';
import { FormField } from './shared/FormField';
import { PROPERTY_TYPES, LOCATIONS } from '../constants';
import { FileUploadControl } from './shared/FileUploadControl';

interface PropertyFormModalProps {
    onClose: () => void;
    onSubmit: (property: Omit<Property, 'id' | 'photoUrl'> | Property) => Promise<void>;
    property: Property | null;
    loading: boolean;
}

const getInitialState = (): Omit<Property, 'id' | 'photoUrl'> => ({
    propertyName: '',
    propertyType: PropertyType.CONDOMINIUM,
    fullAddress: '',
    location: Location.LUZON,
    gpsCoordinates: '',
    videoUrl: '',
    unitNumber: '',
    floorNumber: '',
    lotNo: '',
    tctOrCctNo: '',
    areaSqm: 0,
    originalDeveloper: '',
    brokersName: '',
    brokersContact: '',
    buyersName: '',
    tctUrl: '#', tctFileName: '',
    tdUrl: '#', tdFileName: '',
    cctUrl: '#', cctFileName: '',
    locationPlanUrl: '#', locationPlanFileName: '',
    acquisition: { unitLotCost: 0, costPerSqm: 0, fitOutCost: 0, totalCost: 0 },
    payment: { status: PaymentStatus.CASH, paymentScheduleUrl: '#' },
    documentation: { docs: [], pendingDocuments: [] },
    possession: { isTurnedOver: false },
    management: { realEstateTaxes: {}, condoDues: {} },
    appraisals: [],
    lease: undefined,
    insurance: undefined,
});

export const PropertyFormModal = ({ onClose, onSubmit, property, loading }: PropertyFormModalProps) => {
    const isEditMode = !!property;

    const [activeTab, setActiveTab] = useState('core');
    const [propertyData, setPropertyData] = useState<Omit<Property, 'id' | 'photoUrl'> | Property>(getInitialState());
    const [hasLease, setHasLease] = useState(false);
    const [hasInsurance, setHasInsurance] = useState(false);

    useEffect(() => {
        if (isEditMode && property) {
            setPropertyData(property);
            setHasLease(!!property.lease);
            setHasInsurance(!!property.insurance);
        } else {
            setPropertyData(getInitialState());
        }
    }, [isEditMode, property]);


    useEffect(() => {
        if (hasLease && !propertyData.lease) {
            setPropertyData(prev => ({ ...prev, lease: { lessee: '', leaseDate: '', leaseRate: 0, termInYears: 0, referringBroker: '', brokerContact: '', contractUrl: '#' } }));
        } else if (!hasLease && propertyData.lease) {
            setPropertyData(prev => {
                const { lease, ...rest } = prev as Property;
                return rest;
            });
        }
    }, [hasLease, propertyData.lease]);

    useEffect(() => {
        if (hasInsurance && !propertyData.insurance) {
            setPropertyData(prev => ({ ...prev, insurance: { coverageDate: '', amountInsured: 0, insuranceCompany: '', policyUrl: '#' } }));
        } else if (!hasInsurance && propertyData.insurance) {
            setPropertyData(prev => {
                const { insurance, ...rest } = prev as Property;
                return rest;
            });
        }
    }, [hasInsurance, propertyData.insurance]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        const parsedValue = isNumber ? parseFloat(value) || 0 : value;

        setPropertyData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleNestedChange = (section: keyof typeof propertyData, field: string, value: string | number | boolean | string[]) => {
        setPropertyData(prev => ({
            ...prev,
            [section]: {
                ...((prev[section] as object) || {}),
                [field]: value,
            }
        }))
    }

    const handleFileChange = (fieldName: keyof Property, file: File | null) => {
        setPropertyData(prev => ({
            ...prev,
            [fieldName]: file ? URL.createObjectURL(file) : '#',
            [`${fieldName.replace('Url', '')}FileName`]: file?.name
        }));
    }

    const handleNestedFileChange = (section: 'payment' | 'lease' | 'insurance', fieldName: string, file: File | null) => {
        setPropertyData(prev => ({
            ...prev,
            [section]: {
                ...((prev[section] as object) || {}),
                [`${fieldName}Url`]: file ? URL.createObjectURL(file) : '#',
                [`${fieldName}FileName`]: file?.name
            }
        }))
    }

    const handleAcquisitionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value) || 0;

        setPropertyData(prev => {
            const newAcquisition = { ...prev.acquisition, [name]: numValue };
            const { unitLotCost = 0, fitOutCost = 0 } = newAcquisition;
            const { areaSqm } = prev;

            newAcquisition.totalCost = unitLotCost + fitOutCost;
            newAcquisition.costPerSqm = areaSqm > 0 ? unitLotCost / areaSqm : 0;

            return { ...prev, acquisition: newAcquisition };
        });
    };

    const addDoc = () => {
        const newDoc: Documentation = {
            type: 'CTS',
            status: 'Available (Copy)',
            priority: 'Medium',
            executionDate: new Date().toISOString().split('T')[0],
            documentUrl: '#',
            fileName: '',
            propertyId: isEditMode && property ? property.id : 'new-property',
            propertyName: propertyData.propertyName || 'New Property'
        };
        setPropertyData(prev => ({
            ...prev,
            documentation: {
                ...prev.documentation,
                docs: [...prev.documentation.docs, newDoc]
            }
        }));
    };

    const removeDoc = (index: number) => {
        setPropertyData(prev => ({
            ...prev,
            documentation: {
                ...prev.documentation,
                docs: prev.documentation.docs.filter((_, i) => i !== index)
            }
        }));
    };

    const handleDocChange = (index: number, field: keyof Documentation, value: any) => {
        setPropertyData(prev => {
            const newDocs = [...prev.documentation.docs];
            const docToUpdate = { ...newDocs[index], [field]: value };
            newDocs[index] = docToUpdate as Documentation;
            return { ...prev, documentation: { ...prev.documentation, docs: newDocs } };
        });
    };

    const handleDocFileChange = (index: number, file: File | null) => {
        setPropertyData(prev => {
            const newDocs = [...prev.documentation.docs];
            const docToUpdate = { ...newDocs[index] };
            docToUpdate.documentUrl = file ? URL.createObjectURL(file) : '#';
            docToUpdate.fileName = file?.name;
            newDocs[index] = docToUpdate;
            return { ...prev, documentation: { ...prev.documentation, docs: newDocs } };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(propertyData);
    }

    const tabs = [
        { id: 'core', label: 'Core Details' },
        { id: 'financials', label: 'Financials' },
        { id: 'legal', label: 'Legal & Docs' },
        { id: 'operations', label: 'Operations' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'core': return (
                <div className="space-y-4">
                    <FormField label="Property Name" id="propertyName" required>
                        <input id="propertyName" name="propertyName" type="text" value={propertyData.propertyName} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm" />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Property Type" id="propertyType" required>
                            <select id="propertyType" name="propertyType" value={propertyData.propertyType} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm">
                                {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Location" id="location" required>
                            <select id="location" name="location" value={propertyData.location} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm">
                                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <FormField label="Full Address" id="fullAddress" required>
                        <textarea id="fullAddress" name="fullAddress" value={propertyData.fullAddress} onChange={handleChange} rows={2} className="w-full border-gray-300 rounded-md shadow-sm" />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="GPS Coordinates" id="gpsCoordinates">
                            <div className="relative">
                                <Icon type="map-pin" className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                                <input id="gpsCoordinates" name="gpsCoordinates" type="text" value={propertyData.gpsCoordinates || ''} onChange={handleChange} className="w-full pl-9 border-gray-300 rounded-md shadow-sm" placeholder="e.g. 14.5547, 121.0244" />
                            </div>
                        </FormField>
                        <FormField label="Video Tour URL" id="videoUrl">
                            <div className="relative">
                                <Icon type="video" className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                                <input id="videoUrl" name="videoUrl" type="url" value={propertyData.videoUrl || ''} onChange={handleChange} className="w-full pl-9 border-gray-300 rounded-md shadow-sm" placeholder="https://youtube.com/..." />
                            </div>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Area (sqm)" id="areaSqm" required><input id="areaSqm" name="areaSqm" type="number" value={propertyData.areaSqm} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Unit No." id="unitNumber"><input id="unitNumber" name="unitNumber" type="text" value={propertyData.unitNumber || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="e.g. 18A" /></FormField>
                        <FormField label="Floor No." id="floorNumber"><input id="floorNumber" name="floorNumber" type="text" value={propertyData.floorNumber || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="e.g. 18th Floor" /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Lot/Blk No." id="lotNo"><input id="lotNo" name="lotNo" type="text" value={propertyData.lotNo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="TCT/CCT No." id="tctOrCctNo"><input id="tctOrCctNo" name="tctOrCctNo" type="text" value={propertyData.tctOrCctNo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Original Developer" id="originalDeveloper"><input id="originalDeveloper" name="originalDeveloper" type="text" value={propertyData.originalDeveloper} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Buyer's Name" id="buyersName"><input id="buyersName" name="buyersName" type="text" value={propertyData.buyersName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Broker's Name" id="brokersName"><input id="brokersName" name="brokersName" type="text" value={propertyData.brokersName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Broker's Contact" id="brokersContact"><input id="brokersContact" name="brokersContact" type="text" value={propertyData.brokersContact} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Core Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Title (TCT)" id="tctUrl">
                            <FileUploadControl id="tct-upload" fileName={propertyData.tctFileName} fileUrl={propertyData.tctUrl} onFileChange={(file) => handleFileChange('tctUrl', file)} />
                        </FormField>
                        <FormField label="Tax Declaration (TD)" id="tdUrl">
                            <FileUploadControl id="td-upload" fileName={propertyData.tdFileName} fileUrl={propertyData.tdUrl} onFileChange={(file) => handleFileChange('tdUrl', file)} />
                        </FormField>
                        <FormField label="Condo Cert. (CCT)" id="cctUrl">
                            <FileUploadControl id="cct-upload" fileName={propertyData.cctFileName} fileUrl={propertyData.cctUrl} onFileChange={(file) => handleFileChange('cctUrl', file)} />
                        </FormField>
                        <FormField label="Location Plan" id="locationPlanUrl">
                            <FileUploadControl id="loc-upload" fileName={propertyData.locationPlanFileName} fileUrl={propertyData.locationPlanUrl} onFileChange={(file) => handleFileChange('locationPlanUrl', file)} />
                        </FormField>
                    </div>
                </div>
            );
            case 'financials': return (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Acquisition Cost</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Unit / Lot Cost" id="unitLotCost"><input id="unitLotCost" name="unitLotCost" type="number" value={propertyData.acquisition.unitLotCost} onChange={handleAcquisitionChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Fit Out Cost" id="fitOutCost"><input id="fitOutCost" name="fitOutCost" type="number" value={propertyData.acquisition.fitOutCost || ''} onChange={handleAcquisitionChange} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Cost / Sqm" id="costPerSqm"><input id="costPerSqm" name="costPerSqm" type="number" value={propertyData.acquisition.costPerSqm?.toFixed(2)} readOnly className="w-full bg-gray-100 border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Total Cost" id="totalCost"><input id="totalCost" name="totalCost" type="number" value={propertyData.acquisition.totalCost?.toFixed(2)} readOnly className="w-full bg-gray-100 border-gray-300 rounded-md shadow-sm" /></FormField>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Payment Status" id="paymentStatus">
                            <select id="paymentStatus" name="status" value={propertyData.payment.status} onChange={(e) => handleNestedChange('payment', 'status', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </FormField>
                        {propertyData.payment.status === PaymentStatus.AMORTIZED && (
                            <FormField label="Payment Schedule" id="paymentScheduleUrl">
                                <FileUploadControl id="payment-schedule-upload" fileName={propertyData.payment.paymentScheduleFileName} fileUrl={propertyData.payment.paymentScheduleUrl} onFileChange={(file) => handleNestedFileChange('payment', 'paymentSchedule', file)} />
                            </FormField>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Appraisal History</h3>
                    <div className="space-y-4">
                        {propertyData.appraisals.map((appraisal, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 relative">
                                <button type="button" onClick={() => {
                                    const newAppraisals = [...propertyData.appraisals];
                                    newAppraisals.splice(index, 1);
                                    setPropertyData(prev => ({ ...prev, appraisals: newAppraisals }));
                                }} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Icon type="trash" className="w-4 h-4" /></button>

                                <FormField label="Date" id={`appraisal-date-${index}`}>
                                    <input type="date" value={appraisal.appraisalDate.split('T')[0]} onChange={(e) => {
                                        const newAppraisals = [...propertyData.appraisals];
                                        newAppraisals[index] = { ...newAppraisals[index], appraisalDate: e.target.value };
                                        setPropertyData(prev => ({ ...prev, appraisals: newAppraisals }));
                                    }} className="w-full border-gray-300 rounded-md shadow-sm" />
                                </FormField>
                                <FormField label="Value" id={`appraisal-value-${index}`}>
                                    <input type="number" value={appraisal.appraisedValue} onChange={(e) => {
                                        const newAppraisals = [...propertyData.appraisals];
                                        newAppraisals[index] = { ...newAppraisals[index], appraisedValue: parseFloat(e.target.value) || 0 };
                                        setPropertyData(prev => ({ ...prev, appraisals: newAppraisals }));
                                    }} className="w-full border-gray-300 rounded-md shadow-sm" />
                                </FormField>
                                <FormField label="Appraisal Company" id={`appraisal-company-${index}`}>
                                    <input type="text" value={appraisal.appraisalCompany} onChange={(e) => {
                                        const newAppraisals = [...propertyData.appraisals];
                                        newAppraisals[index] = { ...newAppraisals[index], appraisalCompany: e.target.value };
                                        setPropertyData(prev => ({ ...prev, appraisals: newAppraisals }));
                                    }} className="w-full border-gray-300 rounded-md shadow-sm" />
                                </FormField>
                            </div>
                        ))}
                        <button type="button" onClick={() => {
                            setPropertyData(prev => ({
                                ...prev,
                                appraisals: [...prev.appraisals, {
                                    appraisalDate: new Date().toISOString().split('T')[0],
                                    appraisedValue: 0,
                                    appraisalCompany: '',
                                    reportUrl: '#'
                                }]
                            }));
                        }} className="flex items-center gap-2 text-sm text-purple-600 font-semibold hover:text-purple-800">
                            <Icon type="plus" className="w-5 h-5" /> Add Appraisal Record
                        </button>
                    </div>
                </div >
            );
            case 'legal': return (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Documentation Status</h3>
                    {propertyData.documentation.docs.map((doc, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4 relative bg-gray-100">
                            <button type="button" onClick={() => removeDoc(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Remove Document"><Icon type="trash" className="w-5 h-5" /></button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Doc Type" id={`doc-type-${index}`}>
                                    <select value={doc.type} onChange={(e) => handleDocChange(index, 'type', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                        <option value="CTS">CTS</option><option value="DOAS">DOAS</option><option value="COL">COL</option>
                                        <option value="TCT">TCT</option><option value="TD">TD</option><option value="CCT">CCT</option>
                                    </select>
                                </FormField>
                                <FormField label="Status" id={`doc-status-${index}`}>
                                    <input type="text" value={doc.status} onChange={(e) => handleDocChange(index, 'status', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="e.g., Available (Original)" />
                                </FormField>
                                <FormField label="Priority" id={`doc-priority-${index}`}>
                                    <select value={doc.priority} onChange={(e) => handleDocChange(index, 'priority', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                        <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                                    </select>
                                </FormField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Execution Date" id={`doc-exec-date-${index}`}>
                                    <input type="date" value={doc.executionDate?.split('T')[0] || ''} onChange={(e) => handleDocChange(index, 'executionDate', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" />
                                </FormField>
                                <FormField label="Due Date" id={`doc-due-date-${index}`}>
                                    <input type="date" value={doc.dueDate?.split('T')[0] || ''} onChange={(e) => handleDocChange(index, 'dueDate', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" />
                                </FormField>
                            </div>
                            <FormField label="Document File" id={`doc-file-${index}`}>
                                <FileUploadControl id={`doc-file-upload-${index}`} fileName={doc.fileName} fileUrl={doc.documentUrl} onFileChange={(file) => handleDocFileChange(index, file)} />
                            </FormField>
                        </div>
                    ))}
                    <button type="button" onClick={addDoc} className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800"><Icon type="plus" className="w-5 h-5" /> Add Document</button>
                    <FormField label="Pending Documents (comma-separated)" id="pendingDocs">
                        <input type="text" value={propertyData.documentation.pendingDocuments.join(', ')} onChange={e => handleNestedChange('documentation', 'pendingDocuments', e.target.value.split(',').map(s => s.trim()))} className="w-full border-gray-300 rounded-md shadow-sm" />
                    </FormField>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Possession / Turnover</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Status" id="isTurnedOver">
                            <select value={String(propertyData.possession.isTurnedOver)} onChange={(e) => handleNestedChange('possession', 'isTurnedOver', e.target.value === 'true')} className="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="true">Turned Over</option><option value="false">Pending</option>
                            </select>
                        </FormField>
                        <FormField label="Turnover Date" id="turnoverDate"><input type="date" value={propertyData.possession.turnoverDate?.split('T')[0] || ''} onChange={(e) => handleNestedChange('possession', 'turnoverDate', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Recipient" id="authorizedRecipient"><input type="text" value={propertyData.possession.authorizedRecipient || ''} onChange={(e) => handleNestedChange('possession', 'authorizedRecipient', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                    </div>
                </div>
            );
            case 'operations': return (
                <div className="space-y-6">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center">
                            <input type="checkbox" id="has-lease" checked={hasLease} onChange={e => setHasLease(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="has-lease" className="ml-2 block text-lg font-semibold text-gray-700">Lease Information</label>
                        </div>
                        {hasLease && propertyData.lease && (
                            <div className="space-y-4 pl-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Lessee Name" id="lessee"><input type="text" value={propertyData.lease.lessee} onChange={e => handleNestedChange('lease', 'lessee', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Lease Date" id="leaseDate"><input type="date" value={propertyData.lease.leaseDate.split('T')[0] || ''} onChange={e => handleNestedChange('lease', 'leaseDate', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Lease Rate" id="leaseRate"><input type="number" value={propertyData.lease.leaseRate} onChange={e => handleNestedChange('lease', 'leaseRate', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Term (Years)" id="termInYears"><input type="number" value={propertyData.lease.termInYears} onChange={e => handleNestedChange('lease', 'termInYears', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Referring Broker" id="referringBroker"><input type="text" value={propertyData.lease.referringBroker} onChange={e => handleNestedChange('lease', 'referringBroker', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Broker Contact" id="brokerContact"><input type="text" value={propertyData.lease.brokerContact} onChange={e => handleNestedChange('lease', 'brokerContact', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                </div>
                                <FormField label="Lease Contract" id="contractUrl">
                                    <FileUploadControl id="lease-contract-upload" fileName={propertyData.lease.contractFileName} fileUrl={propertyData.lease.contractUrl} onFileChange={(file) => handleNestedFileChange('lease', 'contract', file)} />
                                </FormField>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center">
                            <input type="checkbox" id="has-insurance" checked={hasInsurance} onChange={e => setHasInsurance(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="has-insurance" className="ml-2 block text-lg font-semibold text-gray-700">Insurance Data</label>
                        </div>
                        {hasInsurance && propertyData.insurance && (
                            <div className="space-y-4 pl-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Insurance Company" id="insuranceCompany"><input type="text" value={propertyData.insurance.insuranceCompany} onChange={e => handleNestedChange('insurance', 'insuranceCompany', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Amount Insured" id="amountInsured"><input type="number" value={propertyData.insurance.amountInsured} onChange={e => handleNestedChange('insurance', 'amountInsured', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                    <FormField label="Coverage Date" id="coverageDate"><input type="date" value={propertyData.insurance.coverageDate.split('T')[0] || ''} onChange={e => handleNestedChange('insurance', 'coverageDate', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                                </div>
                                <FormField label="Insurance Policy" id="policyUrl">
                                    <FileUploadControl id="insurance-policy-upload" fileName={propertyData.insurance.policyFileName} fileUrl={propertyData.insurance.policyUrl} onFileChange={(file) => handleNestedFileChange('insurance', 'policy', file)} />
                                </FormField>
                            </div>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Property Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Caretaker Name" id="caretakerName"><input type="text" value={propertyData.management.caretakerName || ''} onChange={(e) => handleNestedChange('management', 'caretakerName', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                        <FormField label="Caretaker Rate/Month" id="caretakerRatePerMonth"><input type="number" value={propertyData.management.caretakerRatePerMonth || ''} onChange={(e) => handleNestedChange('management', 'caretakerRatePerMonth', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
                    </div>
                </div>
            );
            default: return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 sm:p-6 border-b bg-gray-800 text-white rounded-t-xl flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Property' : 'Add New Property'}</h2>
                        <p className="text-sm text-gray-300">{isEditMode ? 'Update the details for this property.' : 'Fill in the details for the new property.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                        <Icon type="close" className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    <nav className="border-b border-gray-200 px-4 sm:px-6 bg-white">
                        <div className="-mb-px flex space-x-6" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
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
                    <main className="flex-grow overflow-y-auto p-6">
                        {renderContent()}
                    </main>
                    <footer className="p-4 bg-white border-t rounded-b-xl flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Property')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
