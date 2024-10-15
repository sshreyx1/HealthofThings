import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Helper function to generate random data
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => ({
    time: new Date().toLocaleTimeString(),
    value: Math.floor(Math.random() * (max - min + 1) + min),
  }));
};

// Inline Card component
const Card: React.FC<{ className?: string; title: string; children: React.ReactNode }> = ({ className, title, children }) => (
  <div className={`card ${className}`}>
    <div className="card-header">{title}</div>
    <div className="card-content">{children}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const heartRateData = generateRandomData(10, 60, 100);
  const bloodPressureData = generateRandomData(10, 80, 120);
  const bloodGlucoseData = generateRandomData(10, 70, 140);
  const temperatureData = generateRandomData(10, 36, 38);
  const spO2Data = generateRandomData(10, 95, 100);
  const activityData = [
    { name: 'Sedentary', value: 30 },
    { name: 'Light', value: 45 },
    { name: 'Moderate', value: 20 },
    { name: 'Vigorous', value: 5 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Patient Health Monitoring Dashboard</h1>
        <div className="dashboard-grid">
          <Card title="Heart Rate Monitor">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="ECG (Electrocardiogram)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateRandomData(100, -1, 1)}>
                <Line type="monotone" dataKey="value" stroke="#82ca9d" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Blood Pressure Monitor">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Blood Glucose Monitor">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bloodGlucoseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Temperature Sensor">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Pulse Oximeter (SpO2)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spO2Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Activity Tracker">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;