import React from 'react';
import { Icon } from '../shared/Icon';

interface AppraisalGuideProps {
    onClose: () => void;
}

export const AppraisalGuide = ({ onClose }: AppraisalGuideProps) => {
    return (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8 relative animate-fade-in">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-purple-400 hover:text-purple-600 transition-colors"
                aria-label="Close Guide"
            >
                <Icon type="close" className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Icon type="help" className="w-5 h-5" /> Appraisal & Equity Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">

                {/* Metric 1: Market Value vs Cost */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-800 font-semibold">
                        <Icon type="line-chart" className="w-4 h-4" />
                        <h3>Market Value vs. Cost</h3>
                    </div>
                    <p className="text-purple-700 leading-relaxed">
                        Compare your <strong>Total Acquisition Cost</strong> (what you paid) against the <strong>Current Market Value</strong>. The gap between these lines represents your potential profit or equity.
                    </p>
                </div>

                {/* Metric 2: Appreciation */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-800 font-semibold">
                        <Icon type="arrow-trending-up" className="w-4 h-4" />
                        <h3>Tracking Appreciation</h3>
                    </div>
                    <p className="text-purple-700 leading-relaxed">
                        As you add new appraisal records, the system calculates your <strong>Total Appreciation</strong> percentage. This helps you understand which properties are performing best over time.
                    </p>
                </div>

                {/* Metric 3: How to Update */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-800 font-semibold">
                        <Icon type="edit" className="w-4 h-4" />
                        <h3>How to Update Data</h3>
                    </div>
                    <p className="text-purple-700 leading-relaxed">
                        To add a new data point, go to <strong>Properties</strong>, edit a property, and select the <strong>Financials</strong> tab. Add a new record under "Appraisal History".
                    </p>
                </div>

            </div>
        </div>
    );
};
