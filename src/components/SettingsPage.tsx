
import React, { useState } from 'react';
import { api } from '../services/api';
import { Icon } from './shared/Icon';

export const SettingsPage = () => {
    const [confirmClear, setConfirmClear] = useState(false);

    const handleResetDemo = () => {
        if (window.confirm("Are you sure? This will reset the app to the default demo data. Any changes you made will be lost.")) {
            api.resetToDemoData();
        }
    };

    const handleClearAll = () => {
        if (!confirmClear) {
            setConfirmClear(true);
            return;
        }
        api.clearAllData();
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 h-full">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-md text-gray-600">Manage your application data and preferences.</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Icon type="document" className="w-5 h-5" />
                    Data Management
                </h2>
                <div className="space-y-6">
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-gray-800">Demo Mode Reset</h3>
                        <p className="text-sm text-gray-500 mb-3">Restore the default sample data (Properties, Documents, etc.). Use this if you want to restart the demo.</p>
                        <button
                            onClick={handleResetDemo}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md font-medium transition-colors"
                        >
                            <Icon type="arrow-trending-up" className="w-4 h-4" /> {/* Recycling icon fallback */}
                            Reset to Demo Data
                        </button>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800">Clear All Data</h3>
                        <p className="text-sm text-gray-500 mb-3">Delete ALL properties, documents, and history. Use this when you are ready to input your own real data from scratch.</p>

                        {confirmClear ? (
                            <div className="bg-red-50 p-4 rounded-md border border-red-200 animate-fade-in">
                                <p className="text-red-700 font-bold mb-2">Are you sure? This action cannot be undone.</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleClearAll}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 transition-colors"
                                    >
                                        Yes, Delete Everything
                                    </button>
                                    <button
                                        onClick={() => setConfirmClear(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
                            >
                                <Icon type="trash" className="w-4 h-4" />
                                Clear All Data (Start Fresh)
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Application Info</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Version</p>
                        <p className="font-mono">1.0.1 (Demo)</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Environment</p>
                        <p className="font-mono">Development / Local</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
