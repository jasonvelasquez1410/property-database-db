import React from 'react';
import { Documentation } from '../../types';
import { Icon } from '../shared/Icon';
import { formatDistanceToNowStrict } from 'date-fns';

const priorityClasses: { [key: string]: string } = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-gray-100 text-gray-700',
}

export const PendingDocumentsWidget = ({ documents }: { documents: Documentation[] }) => (
     <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pending Documents</h3>
            <span className="text-sm font-medium text-gray-500">{documents.length} items</span>
        </div>
        <ul className="space-y-3">
            {documents.slice(0, 3).map(doc => ( // Show top 3 for brevity
                <li key={`${doc.propertyId}-${doc.type}`} className="bg-gray-50 rounded-lg p-3 flex items-center gap-4">
                    <div className="flex-grow overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${priorityClasses[doc.priority]}`}>{doc.priority.toUpperCase()}</span>
                            <p className="font-semibold text-gray-800 truncate" title={doc.propertyName}>{doc.propertyName}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{doc.type}: {doc.status}</p>
                        {doc.dueDate && (
                             <p className="text-xs text-red-500 mt-1">Due in {formatDistanceToNowStrict(new Date(doc.dueDate))}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-200"><Icon type="eye" className="w-5 h-5"/></button>
                        <button className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-200"><Icon type="upload-cloud" className="w-5 h-5"/></button>
                    </div>
                </li>
            ))}
             {documents.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No pending documents. Great job!</p>}
        </ul>
    </div>
);
