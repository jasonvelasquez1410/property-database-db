import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Property, Appraisal } from '../../types';
import { Icon } from '../shared/Icon';

interface AppraisalHistoryProps {
    properties: Property[];
}

export const AppraisalHistory = ({ properties }: AppraisalHistoryProps) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

    // 1. Prepare Data
    const chartData = useMemo(() => {
        let targets = properties;
        if (selectedPropertyId !== 'all') {
            targets = properties.filter(p => p.id === selectedPropertyId);
        }

        // Collect all relevant dates (Acquisition + All Appraisals)
        const allDates = new Set<string>();
        targets.forEach(p => {
            // Acquisition Date (approximate if not stored, use possession/turnover or a default)
            // For this chart, let's assume acquisition happened at '2020-01-01' if specific date missing, 
            // or use the earliest appraisal date - 1 year.
            // Actually, let's allow the chart to start from the earliest available date data point.

            // For simplicity in this demo, we'll map acquisition cost to "Year 0" effectively.
            // But better: use actual years.

            // Add Appraisal Dates
            p.appraisals.forEach(a => {
                if (a.appraisalDate) allDates.add(a.appraisalDate.substring(0, 4)); // Just Year for smoother chart? Or full date?
            });
        });

        // Sort years
        const years = Array.from(allDates).sort();
        // If empty, maybe add current year
        if (years.length === 0) years.push(new Date().getFullYear().toString());

        // Construct Datasets
        // We want to show TOTAL Value over time.
        const totalValueOverTime = years.map(year => {
            return targets.reduce((sum, p) => {
                // Find latest appraisal for this property up to this year
                const relevantAppraisals = p.appraisals.filter(a => a.appraisalDate.startsWith(year) || a.appraisalDate < year);
                // Sort descending by date
                relevantAppraisals.sort((a, b) => b.appraisalDate.localeCompare(a.appraisalDate));

                const latestVal = relevantAppraisals.length > 0 ? relevantAppraisals[0].appraisedValue : p.acquisition.totalCost;
                return sum + latestVal;
            }, 0);
        });

        // Baseline (Acquisition Cost) - Static line? Or accumulating acquisition costs over time?
        // Let's compare "Current Valuation" vs "Initial Investment"
        const totalAcquisition = targets.reduce((sum, p) => sum + p.acquisition.totalCost, 0);
        const acquisitionLine = years.map(() => totalAcquisition);

        return {
            labels: years,
            datasets: [
                {
                    label: 'Total Market Value',
                    data: totalValueOverTime,
                    borderColor: 'rgb(34, 197, 94)', // Green
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Total Acquisition Cost',
                    data: acquisitionLine,
                    borderColor: 'rgb(99, 102, 241)', // Indigo
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 0
                }
            ]
        };
    }, [properties, selectedPropertyId]);

    // 2. Metrics
    const metrics = useMemo(() => {
        let targets = properties;
        if (selectedPropertyId !== 'all') {
            targets = properties.filter(p => p.id === selectedPropertyId);
        }

        const totalCost = targets.reduce((sum, p) => sum + p.acquisition.totalCost, 0);

        // Latest Value calculation
        const totalCurrentValue = targets.reduce((sum, p) => {
            if (p.appraisals && p.appraisals.length > 0) {
                // Sort by date desc
                const sorted = [...p.appraisals].sort((a, b) => b.appraisalDate.localeCompare(a.appraisalDate));
                return sum + sorted[0].appraisedValue;
            }
            return sum + p.acquisition.totalCost;
        }, 0);

        const appreciationAmount = totalCurrentValue - totalCost;
        const appreciationPercent = totalCost > 0 ? (appreciationAmount / totalCost) * 100 : 0;

        return { totalCost, totalCurrentValue, appreciationAmount, appreciationPercent };
    }, [properties, selectedPropertyId]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Icon type="line-chart" className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Appraisal & Value Analysis</h3>
                        <p className="text-sm text-gray-500">Track your property wealth over time.</p>
                    </div>
                </div>
                <select
                    value={selectedPropertyId}
                    onChange={e => setSelectedPropertyId(e.target.value)}
                    className="border-gray-300 rounded-lg text-sm min-w-[200px]"
                >
                    <option value="all">Check All Properties</option>
                    {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.propertyName}</option>
                    ))}
                </select>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Acquisition Cost</p>
                    <h3 className="text-2xl font-bold text-indigo-900">₱{metrics.totalCost.toLocaleString()}</h3>
                    <p className="text-xs text-indigo-500 mt-2">Initial Investment</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Current Market Value</p>
                    <h3 className="text-2xl font-bold text-green-700">₱{metrics.totalCurrentValue.toLocaleString()}</h3>
                    <p className="text-xs text-green-600 mt-2">Based on latest appraisals</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl shadow-md text-white">
                    <p className="text-sm text-purple-100 mb-1">Total Appreciation</p>
                    <h3 className="text-2xl font-bold">+{metrics.appreciationPercent.toFixed(1)}%</h3>
                    <p className="text-xs text-purple-200 mt-2">
                        +₱{metrics.appreciationAmount.toLocaleString()} growth
                    </p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="h-[350px]">
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                    mode: 'index',
                                    intersect: false,
                                    callbacks: {
                                        label: (context) => {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                label += new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(context.parsed.y);
                                            }
                                            return label;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    ticks: {
                                        callback: (value: any) => {
                                            return '₱' + (value / 1000000).toFixed(1) + 'M';
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">
                    * Value is interpolated based on available appraisal years.
                </p>
            </div>
        </div>
    );
};
