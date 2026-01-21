import { Icon } from '../shared/Icon';

interface FinanceGuideProps {
    onClose: () => void;
}

export const FinanceGuide = ({ onClose }: FinanceGuideProps) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition-colors"
                title="Dismiss Guide"
            >
                <Icon type="close" className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Icon type="help" className="w-5 h-5" />
                Owner's Financial Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Net Operating Income (NOI)</h3>
                    <p className="text-blue-700">
                        The actual profit your property generates annually.
                        <br />
                        <span className="font-mono bg-blue-100 px-1 rounded">Gross Income - Operating Expenses</span>
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Cash Flow</h3>
                    <p className="text-blue-700">
                        The net cash moving in or out of your business. Positive cash flow means you are making money after all bills are paid.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-blue-800 mb-2">ROI (Return on Investment)</h3>
                    <p className="text-blue-700">
                        A percentage that tells you how efficient your investment is.
                        <br />
                        <span className="font-mono bg-blue-100 px-1 rounded">(NOI / Total Acquisition Cost) x 100</span>
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Pending Collectibles</h3>
                    <p className="text-blue-700">
                        Rent checks or payments that are due but not yet cleared/collected. Follow up on these to improve cash flow.
                    </p>
                </div>
            </div>
        </div>
    );
};
