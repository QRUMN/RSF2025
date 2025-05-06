import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardBody } from '../ui/Card';

interface ProgressChartProps {
  data: {
    date: string;
    value: number;
  }[];
  title: string;
  metric: string;
  isPremium: boolean;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, title, metric, isPremium }) => {
  if (!isPremium) {
    return (
      <Card className="h-full">
        <CardBody className="flex flex-col items-center justify-center text-center p-8">
          <h3 className="text-xl font-semibold text-light mb-4">{title}</h3>
          <p className="text-light/70 mb-4">
            Upgrade to premium to access detailed progress tracking and analytics.
          </p>
          <div className="w-full h-40 bg-dark-surface/50 rounded-lg flex items-center justify-center">
            <span className="text-light/50">Premium Feature</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardBody>
        <h3 className="text-xl font-semibold text-light mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={metric}
                stroke="#6AFFB7"
                strokeWidth={2}
                dot={{ fill: '#6AFFB7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};