import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig, DataRow } from '../../types';
import api from '../../services/api';
import { config } from '../../config/env';

interface ChartRendererProps {
  config: ChartConfig;
  data: DataRow[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

const ChartRenderer: React.FC<ChartRendererProps> = ({ config: chartConfig, data }) => {
  const { type, xAxis, yAxis, settings, datasetId, aggregation, groupBy, filters } = chartConfig;
  const [chartData, setChartData] = React.useState<DataRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/api/charts/data', {
          datasetId,
          xAxis,
          yAxis,
          aggregation,
          groupBy,
          filters,
        });
        if (!cancelled) setChartData(response.data.data);
      } catch (err: any) {
        if (!cancelled) setError('Failed to load chart data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [datasetId, xAxis, yAxis, aggregation, groupBy, filters]);

  // Prepare data for charts - must be called before any early returns
  const preparedData = React.useMemo(() => {
    if (!xAxis || !yAxis) return chartData;
    return chartData.map(row => ({
      ...row,
      [xAxis]: row[xAxis],
      [yAxis]: Number(row[yAxis]) || 0,
    }));
  }, [chartData, xAxis, yAxis]);

  if (loading) return <div className="flex items-center justify-center h-48">Loading chart data...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!chartData || chartData.length === 0) return <div className="text-gray-500">No data to display</div>;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <BarChart data={preparedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxis} fill={settings.colors?.[0] || COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <LineChart data={preparedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yAxis} 
                stroke={settings.colors?.[0] || COLORS[0]} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <PieChart>
              <Pie
                data={preparedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yAxis}
                nameKey={xAxis}
              >
                {preparedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(chartData[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{chartConfig.title}</h3>
      </div>
      {renderChart()}
    </div>
  );
};

export default ChartRenderer;