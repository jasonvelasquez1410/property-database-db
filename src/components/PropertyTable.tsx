import React from 'react';
import { Property, PaymentStatus } from '../types';
import { Icon } from './shared/Icon';

interface PropertyTableProps {
    properties: Property[];
    onSelectProperty: (property: Property) => void;
    onEditProperty: (property: Property) => void;
}

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return 'N/A';
    return `₱${amount.toLocaleString('en-US')}`;
}

const getStatusTags = (property: Property) => {
    const tags: { text: string, className: string }[] = [];
    if (property.lease) {
        tags.push({ text: 'Leased', className: 'bg-blue-100 text-blue-800' });
    } else {
        tags.push({ text: 'Vacant', className: 'bg-gray-100 text-gray-800' });
    }

    if (property.payment.status === PaymentStatus.AMORTIZED) {
        tags.push({ text: 'Amortized', className: 'bg-yellow-100 text-yellow-800' });
    }
    
    if(property.documentation.pendingDocuments.length > 0) {
        tags.push({ text: 'Non-Compliant', className: 'bg-red-100 text-red-800' });
    }

    return tags;
};

const SortableHeader = ({ label, sortable = true }: { label: string, sortable?: boolean }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex items-center gap-1">
            {label}
            {sortable && <Icon type="chevron-down" className="w-3 h-3 text-gray-400" />}
        </div>
    </th>
)

export const PropertyTable = ({ properties, onSelectProperty, onEditProperty }: PropertyTableProps) => {

    if (properties.length === 0) {
        return <p className="text-center py-16 text-gray-600">No properties found for the selected filters.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="relative px-6 py-3">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </th>
                        <SortableHeader label="Property Name" />
                        <SortableHeader label="Type" />
                        <SortableHeader label="Location" />
                        <SortableHeader label="Acquisition Cost" />
                        <SortableHeader label="Market Value" />
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {properties.map((property) => {
                        const statusTags = getStatusTags(property);
                        const latestAppraisal = property.appraisals?.sort((a,b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
                        return (
                            <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                     <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => onSelectProperty(property)}>{property.propertyName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.propertyType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(property.acquisition.totalCost)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{formatCurrency(latestAppraisal?.appraisedValue)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col items-start gap-1">
                                        {statusTags.map(tag => (
                                             <span key={tag.text} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tag.className}`}>
                                                {tag.text}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onSelectProperty(property)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100" title="View"><Icon type="eye" className="w-5 h-5"/></button>
                                        <button onClick={() => onEditProperty(property)} className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-md hover:bg-gray-100" title="Edit"><Icon type="edit" className="w-5 h-5"/></button>
                                        <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="Copy"><Icon type="copy" className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};