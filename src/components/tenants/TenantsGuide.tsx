import { Icon } from '../shared/Icon';

interface TenantsGuideProps {
    onClose: () => void;
}

export const TenantsGuide = ({ onClose }: TenantsGuideProps) => {
    return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6 relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 transition-colors"
                title="Dismiss Guide"
            >
                <Icon type="close" className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Icon type="help" className="w-5 h-5" />
                Lease Management Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                    <h3 className="font-semibold text-indigo-800 mb-2">1. Tenants & Leases</h3>
                    <p className="text-indigo-700">
                        First, add a <strong>Tenant</strong>. Then, create a <strong>Lease</strong> to link that tenant to a property.
                        <br />
                        <span className="text-xs opacity-75">Tip: You can have multiple leases for one tenant.</span>
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-indigo-800 mb-2">2. Auto-Generate PDCs</h3>
                    <p className="text-indigo-700">
                        When adding a Lease, check <strong>"Auto-generate PDCs"</strong>. This automatically creates "Pending" check payments for every month of the lease term.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-indigo-800 mb-2">3. Tracking Payments</h3>
                    <p className="text-indigo-700">
                        Go to the <strong>Payments Tab</strong> to see all scheduled checks.
                        <br />
                        <span className="font-mono bg-indigo-100 px-1 rounded">Pending</span> = Check not yet cleared.
                        <br />
                        <span className="font-mono bg-green-100 text-green-800 px-1 rounded">Completed</span> = Cash in bank.
                    </p>
                </div>
            </div>
        </div>
    );
};
