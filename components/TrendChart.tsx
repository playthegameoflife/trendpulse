import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendDataPoint } from '../types';

interface TrendChartProps {
  data: TrendDataPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          <p className="label text-sm font-semibold text-gray-700">{`${label}`}</p>
          <p className="intro text-xs text-gray-500">{`Interest: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
            data={data}
            margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
            }}
            >
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
            />
            <YAxis 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
             />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorUv)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;