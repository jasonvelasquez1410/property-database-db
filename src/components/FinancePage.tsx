import { useState, useEffect, useMemo } from 'react';
import { User, Property, PropertyType, PaymentStatus, PaymentRecord } from '../types';
import { api } from '../services/api';
import { Icon } from './shared/Icon';
import { SummaryCard } from './SummaryCard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, TimeScale } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Automatically registers all components

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, TimeScale);

const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface FinancePageProps {
    user: User;
}

export const FinancePage = ({ user: _user }: FinancePageProps) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [propertyTypeFilter, setPropertyTypeFilter] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [props, payRecords] = await Promise.all([
                    api.fetchProperties(),
                    api.fetchPayments()
                ]);
                setProperties(props);
                setPayments(payRecords);
            } catch (error) {
                console.error("Failed to fetch financial data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            const matchesSearch = p.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.fullAddress.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRegion = regionFilter ? p.location.toLowerCase().includes(regionFilter.toLowerCase()) : true;
            const matchesType = propertyTypeFilter ? p.propertyType.toLowerCase().includes(propertyTypeFilter.toLowerCase()) : true;

            return matchesSearch && matchesRegion && matchesType;
        });
    }, [properties, searchTerm, regionFilter, propertyTypeFilter]);

    const handleExportReport = () => {
        // Generate CSV content from FILTERED properties
        const headers = ['Property Name', 'Type', 'Location', 'Acquisition Cost', 'Market Value', 'Payment Status', 'Last Updated'];
        const rows = filteredProperties.map(p => {
            const latestAppraisal = p.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
            const marketValue = latestAppraisal?.appraisedValue || p.acquisition.totalCost;
            return [
                `"${p.propertyName}"`,
                p.propertyType,
                p.location,
                p.acquisition.totalCost,
                marketValue,
                p.payment.status,
                new Date().toLocaleDateString()
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + "\n"
            + rows.join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`Financial Report exported successfully! (${filteredProperties.length} records)`);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const financialSummary = useMemo(() => {
        const dataToUse = filteredProperties;

        // 1. Asset Value (Wealth)
        const totalAcquisitionCost = dataToUse.reduce((sum, p) => sum + p.acquisition.totalCost, 0);
        const totalMarketValue = dataToUse.reduce((sum, p) => {
            const latestAppraisal = p.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
            return sum + (latestAppraisal?.appraisedValue || p.acquisition.totalCost);
        }, 0);

        // 2. Cash Flow (Income vs Expense) - Annualized Estimate based on current state
        /* 
           Real implementation would filter 'payments' by date range (e.g., This Year).
           For this "Owner View", we will calculate 'Annualized Run Rate' to show potential.
        */

        // Income: Sum of lease rates for active leases (Annualized)
        const annualizedGrossIncome = dataToUse.reduce((sum, p) => {
            if (p.lease) {
                return sum + (p.lease.leaseRate * 12);
            }
            return sum;
        }, 0);

        // Actual Collected Income (Year to Date) - derived from Payments table
        // Filter payments related to the filtered properties (needs implicit link via lease, but leases link to property. 
        // For simplicity in this view, we sum ALL payments if no filters, or filter if we had lease-property mapping handy in payments loop.
        // Assuming 'payments' are relevant to the global portfolio for now.
        const totalCollectedIncome = payments
            .filter(p => p.status === 'Completed' && p.paymentType === 'Rent')
            .reduce((sum, p) => sum + p.amount, 0);


        // Expenses (Annualized)
        const annualizedExpenses = dataToUse.reduce((sum, p) => {
            let exp = 0;
            // 1. Caretaker
            if (p.management.caretakerRatePerMonth) exp += (p.management.caretakerRatePerMonth * 12);
            // 2. Condo Dues (Approximate from last paid * 12 ?? Or just assume last paid is monthly?)
            // Let's assume 'amountPaid' is monthly for calculation if recent, otherwise 0.
            if (p.management.condoDues?.amountPaid) exp += (p.management.condoDues.amountPaid * 12);
            // 3. Taxes (Annual) -> Assume 'amountPaid' is annual tax? Usually RPT is annual.
            if (p.management.realEstateTaxes.amountPaid) exp += p.management.realEstateTaxes.amountPaid;

            return sum + exp;
        }, 0);

        const netOperatingIncome = annualizedGrossIncome - annualizedExpenses;
        const roi = totalAcquisitionCost > 0 ? (netOperatingIncome / totalAcquisitionCost) * 100 : 0;

        // 3. Receivables
        const pendingPayments = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

        // 4. Trend (Market Value Change)
        const previousMarketValue = dataToUse.reduce((sum, p) => {
            const appraisals = p.appraisals.sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime());
            return sum + (appraisals[1]?.appraisedValue || p.acquisition.totalCost);
        }, 0);
        const valueChangePercentage = previousMarketValue > 0 ? ((totalMarketValue - previousMarketValue) / previousMarketValue) * 100 : 0;

        return {
            totalAcquisitionCost,
            totalMarketValue,
            annualizedGrossIncome,
            annualizedExpenses,
            netOperatingIncome,
            roi,
            totalCollectedIncome,
            pendingPayments,
            valueChangePercentage
        };
    }, [filteredProperties, payments]);

    const chartData = useMemo(() => {
        const dataToUse = filteredProperties; // Use filtered data
        const costDistribution = dataToUse.reduce((acc, p) => {
            acc[p.propertyType] = (acc[p.propertyType] || 0) + p.acquisition.totalCost;
            return acc;
        }, {} as Record<PropertyType, number>);

        const paymentStatus = dataToUse.reduce((acc, p) => {
            acc[p.payment.status] = (acc[p.payment.status] || 0) + 1;
            return acc;
        }, {} as Record<PaymentStatus, number>);

        const trendData: Record<string, number> = {};
        if (dataToUse.length > 0) {
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                const monthValue = dataToUse.reduce((sum, p) => {
                    const latestAppraisalForMonth = p.appraisals
                        .filter(a => new Date(a.appraisalDate) <= date)
                        .sort((a, b) => new Date(b.appraisalDate).getTime() - new Date(a.appraisalDate).getTime())[0];
                    return sum + (latestAppraisalForMonth?.appraisedValue || p.acquisition.totalCost);
                }, 0);
                trendData[monthKey] = monthValue;
            }
        }

        // Expense Breakdown Logic
        const expenses = {
            Taxes: dataToUse.reduce((sum, p) => sum + (p.management.realEstateTaxes.amountPaid || 0), 0),
            Dues: dataToUse.reduce((sum, p) => sum + ((p.management.condoDues?.amountPaid || 0) * 12), 0),
            Maintenance: dataToUse.reduce((sum, p) => sum + ((p.management.caretakerRatePerMonth || 0) * 12), 0),
        };

        return {
            costDistribution: {
                labels: Object.keys(costDistribution),
                datasets: [{
                    label: 'Total Acquisition Cost',
                    data: Object.values(costDistribution),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                }],
            },
            paymentStatus: {
                labels: Object.keys(paymentStatus),
                datasets: [{
                    data: Object.values(paymentStatus),
                    backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
                }]
            },
            expenseBreakdown: {
                labels: Object.keys(expenses),
                datasets: [{
                    data: Object.values(expenses),
                    backgroundColor: ['#EF4444', '#F59E0B', '#6B7280'], // Red, Yellow, Gray
                }]
            },
            marketValueTrend: {
                labels: Object.keys(trendData),
                datasets: [{
                    label: 'Portfolio Market Value',
                    data: Object.values(trendData),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        };
    }, [filteredProperties]);

    if (loading) {
        return <div className="p-8 text-center">Loading financial data...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Tracking</h1>
                <p className="mt-1 text-md text-gray-600">Monitor payments, costs, and financial performance across your property portfolio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Net Operating Income (Annual)"
                    value={formatCurrency(financialSummary.netOperatingIncome)}
                    description={`ROI: ${financialSummary.roi.toFixed(1)}%`}
                    trend={financialSummary.roi > 5 ? "Healthy" : "Low"}
                    trendDirection={financialSummary.roi > 5 ? 'up' : 'down'}
                    icon="properties" // Fallback to properties icon
                    onClick={() => scrollToSection('cost-chart')}
                />
                <SummaryCard
                    title="Gross Income (Annualized)"
                    value={formatCurrency(financialSummary.annualizedGrossIncome)}
                    description="Potential Rent"
                    trend={`Coll: ${formatCurrency(financialSummary.totalCollectedIncome)}`}
                    trendDirection="up"
                    icon="dollar-circle"
                    onClick={() => scrollToSection('cost-chart')}
                />
                <SummaryCard
                    title="Est. Annual Expenses"
                    value={formatCurrency(financialSummary.annualizedExpenses)}
                    description="Taxes, Dues, Maintenance"
                    trend="Fixed Costs"
                    trendDirection="down"
                    icon="document-text" // Fallback to document icon
                    onClick={() => scrollToSection('cost-chart')}
                />
                <SummaryCard
                    title="Pending Collectibles"
                    value={formatCurrency(financialSummary.pendingPayments)}
                    description="Unpaid Rent/PDCs"
                    trend="Action Required"
                    trendDirection="down" // Down is bad here? actually high pending is bad.
                    icon="exclamation-triangle"
                    onClick={() => scrollToSection('payment-status-chart')}
                />
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h3 className="font-bold text-lg">Financial Filters</h3>
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border bg-white rounded-md hover:bg-gray-50"
                            onClick={() => { setSearchTerm(''); setRegionFilter(''); setPropertyTypeFilter(''); }}
                        >
                            Clear Filters
                        </button>
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border bg-white rounded-md hover:bg-gray-50"
                            onClick={handleExportReport}
                        >
                            <Icon type="export" className="w-5 h-5" /> Export Report
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon type="properties" className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search properties..."
                            className="pl-10 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="">All Regions</option>
                        <option value="Luzon">Luzon</option>
                        <option value="Visayas">Visayas</option>
                        <option value="Mindanao">Mindanao</option>
                    </select>

                    <select
                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={propertyTypeFilter}
                        onChange={(e) => setPropertyTypeFilter(e.target.value)}
                    >
                        <option value="">All Property Types</option>
                        <option value="Condominium">Condominium</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land</option>
                        <option value="House">House</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div id="cost-chart" className="lg:col-span-3 bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Distribution by Property Type</h3>
                    <div className="h-80">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData.costDistribution} />
                    </div>
                </div>
                <div id="payment-status-chart" className="lg:col-span-1 bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Collection Status</h3>
                    <div className="h-64">
                        <Pie options={{ responsive: true, maintainAspectRatio: false }} data={chartData.paymentStatus} />
                    </div>
                </div>
                <div className="lg:col-span-1 bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h3>
                    <div className="h-64">
                        <Pie options={{ responsive: true, maintainAspectRatio: false }} data={chartData.expenseBreakdown} />
                    </div>
                </div>
            </div>

            <div id="value-trend-chart" className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Market Value Trends</h3>
                <div className="h-80">
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData.marketValueTrend} />
                </div>
            </div>
        </div>
    );
};