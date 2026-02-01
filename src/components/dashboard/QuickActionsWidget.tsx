import React from 'react';
import { Icon } from '../shared/Icon';

interface QuickActionsWidgetProps {
    onAddProperty: () => void;
    onUploadDocument: () => void;
}

export const QuickActionsWidget = ({ onAddProperty, onUploadDocument }: QuickActionsWidgetProps) => (
    <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
            <button type="button" onClick={onAddProperty} className="w-full flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
                    <Icon type="plus" className="w-6 h-6 text-green-700" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Add Property</p>
                    <p className="text-sm text-gray-500">Register new property</p>
                </div>
            </button>
            <button type="button" onClick={onUploadDocument} className="w-full flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                    <Icon type="upload-cloud" className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Upload Document</p>
                    <p className="text-sm text-gray-500">Add property document</p>
                </div>
            </button>
        </div>
    </div>
);
