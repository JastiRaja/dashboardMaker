import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { ChartConfig, DataRow } from '../../types';
import api from '../../services/api';
import ChartExport from './ChartExport';

interface ChartRendererProps {
  config: ChartConfig;
  data: DataRow[];
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff',
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'
];

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

  // Prepare data for charts
  const preparedData = React.useMemo(() => {
    if (!xAxis || !yAxis) return chartData;
    return chartData.map(row => ({
      ...row,
      [xAxis]: row[xAxis] || '',
      [yAxis]: Number(row[yAxis]) || 0,
    }));
  }, [chartData, xAxis, yAxis]);

  // Enhanced tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${xAxis}: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2 text-gray-600">Loading chart data...</span>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-48 text-red-500">
      <span className="text-center">{error}</span>
    </div>
  );
  
  if (!chartData || chartData.length === 0) return (
    <div className="flex items-center justify-center h-48 text-gray-500">
      <span className="text-center">No data to display</span>
    </div>
  );

  const renderChart = () => {
    const commonProps = {
      data: preparedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    // Type guard to ensure xAxis and yAxis are defined for chart types that need them
    if (type !== 'table' && (!xAxis || !yAxis)) {
      return <div>Chart configuration incomplete</div>;
    }

    // After type guard, we know xAxis and yAxis are defined for non-table charts
    const xAxisKey = xAxis!;
    const yAxisKey = yAxis!;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey={yAxisKey} 
                fill={settings.colors?.[0] || COLORS[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={settings.colors?.[0] || COLORS[0]} 
                strokeWidth={3}
                dot={{ fill: settings.colors?.[0] || COLORS[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: settings.colors?.[0] || COLORS[0], strokeWidth: 2 }}
                animationDuration={1000}
                animationBegin={0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={settings.colors?.[0] || COLORS[0]}
                fill={settings.colors?.[0] || COLORS[0]}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={1000}
                animationBegin={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter 
                dataKey={yAxisKey} 
                fill={settings.colors?.[0] || COLORS[0]}
                animationDuration={1000}
                animationBegin={0}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <RadarChart data={preparedData}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
              />
              <PolarRadiusAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Radar 
                dataKey={yAxisKey} 
                stroke={settings.colors?.[0] || COLORS[0]}
                fill={settings.colors?.[0] || COLORS[0]}
                fillOpacity={0.3}
                animationDuration={1000}
                animationBegin={0}
              />
            </RadarChart>
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
                dataKey={yAxisKey}
                nameKey={xAxisKey}
                animationDuration={1000}
                animationBegin={0}
              >
                {preparedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={settings.height || 300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey={yAxisKey} 
                fill={settings.colors?.[0] || COLORS[0]}
                radius={[4, 4, 0, 0]}
                fillOpacity={0.6}
                animationDuration={1000}
                animationBegin={0}
              />
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={settings.colors?.[1] || COLORS[1]} 
                strokeWidth={2}
                dot={{ fill: settings.colors?.[1] || COLORS[1], strokeWidth: 2, r: 3 }}
                animationDuration={1000}
                animationBegin={200}
              />
            </ComposedChart>
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
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
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
    <div className="w-full h-full" data-chart-id={chartConfig.id}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{chartConfig.title}</h3>
        <div className="z-10">
          <ChartExport 
            chartConfig={chartConfig} 
            data={preparedData}
          />
        </div>
      </div>
      <div className="chart-content">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartRenderer;