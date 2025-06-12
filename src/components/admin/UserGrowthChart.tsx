import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface UserGrowthData {
  date: string;
  users: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="date" 
          stroke="#aaa" 
          tick={{ fill: '#aaa' }}
        />
        <YAxis 
          stroke="#aaa" 
          tick={{ fill: '#aaa' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#333', 
            border: '1px solid #555',
            color: '#eee'
          }} 
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="users"
          name="New Users"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default UserGrowthChart;
