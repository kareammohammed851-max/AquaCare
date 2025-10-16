import React, { useMemo, useContext } from 'react';
import type { ConsumptionRecord } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface ConsumptionChartProps {
    history: ConsumptionRecord[];
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ history }) => {
    const { t, language } = useContext(LanguageContext)!;

    const chartData = useMemo(() => {
        if (history.length === 0) return null;

        const totalConsumption = history.reduce((sum, record) => sum + record.consumption, 0);
        const average = totalConsumption / history.length;
        const maxConsumption = Math.max(...history.map(r => r.consumption), average * 1.2); // Ensure average line is visible
        const highestRecordIndex = history.findIndex(r => r.consumption === Math.max(...history.map(r => r.consumption)));

        return {
            average,
            maxConsumption,
            highestRecordIndex,
        };
    }, [history]);

    if (!chartData) {
        return null;
    }

    const { average, maxConsumption, highestRecordIndex } = chartData;
    const chartHeight = 180;
    const barWidth = 35;
    const barMargin = 15;
    const chartWidth = history.length * (barWidth + barMargin);

    const formatMonth = (isoDate: string) => {
        return new Date(isoDate).toLocaleString(language, { month: 'short' });
    };

    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/80 shadow-lg p-5">
            <h2 className="text-lg font-bold text-white mb-4">{t('homeChartTitle')}</h2>
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
                <svg width={chartWidth} height={chartHeight + 40} className="font-sans">
                    {/* Average Line */}
                    <g>
                        <line
                            x1="0"
                            y1={chartHeight - (average / maxConsumption) * chartHeight}
                            x2={chartWidth}
                            y2={chartHeight - (average / maxConsumption) * chartHeight}
                            className="stroke-green-400/80 stroke-2"
                            strokeDasharray="4 4"
                        />
                         <text x={5} y={chartHeight - ((average / maxConsumption) * chartHeight) - 6} className="text-xs fill-green-300 font-semibold">
                            {t('homeChartAverage')}: {average.toFixed(1)}m³
                        </text>
                    </g>
                    <g>
                        {history.map((record, index) => {
                            const barHeight = (record.consumption / maxConsumption) * chartHeight;
                            const x = index * (barWidth + barMargin);
                            const y = chartHeight - barHeight;
                            const isHighest = index === highestRecordIndex;
                            const isLatest = index === history.length - 1;

                            return (
                                <g key={record.date}>
                                    <title>{`${formatMonth(record.date)}: ${record.consumption} m³`}</title>
                                    <rect
                                        x={x}
                                        y={chartHeight}
                                        width={barWidth}
                                        height="0"
                                        className={isHighest ? "fill-red-500/80" : "fill-cyan-500/80"}
                                        rx="4"
                                        ry="4"
                                    >
                                        <animate attributeName="height" from="0" to={barHeight} dur="0.5s" begin={`${index * 50}ms`} fill="freeze" />
                                        <animate attributeName="y" from={chartHeight} to={y} dur="0.5s" begin={`${index * 50}ms`} fill="freeze" />
                                    </rect>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight + 20}
                                        textAnchor="middle"
                                        className={`text-sm ${isLatest ? 'font-bold fill-white' : 'fill-slate-400'}`}
                                    >
                                        {formatMonth(record.date)}
                                    </text>
                                     <text
                                        x={x + barWidth / 2}
                                        y={y - 8}
                                        textAnchor="middle"
                                        className="text-xs font-bold fill-slate-200 opacity-0"
                                    >
                                      <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin={`${index * 50 + 300}ms`} fill="freeze" />
                                        {record.consumption.toFixed(1)}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default ConsumptionChart;