import React, { useState } from 'react';
import { X, BarChart3, PieChart, TrendingUp, Table } from 'lucide-react';
import { ChartConfig, Dataset } from '../../types';
import Select from 'react-select';

interface ChartConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ChartConfig) => void;
  datasets: Dataset[];
  initialConfig?: ChartConfig;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'table', label: 'Table', icon: Table },
] as const;

const aggregationOptions = [
  { value: 'none', label: 'None' },
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

const operatorOptions = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '≠' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '≥' },
  { value: 'lte', label: '≤' },
  { value: 'contains', label: 'Contains' },
];

const ChartConfigModal: React.FC<ChartConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  datasets,
  initialConfig,
}) => {
  const [config, setConfig] = useState<Partial<ChartConfig>>({
    type: 'bar',
    title: '',
    datasetId: 0,
    xAxis: '',
    yAxis: '',
    settings: {
      width: 400,
      height: 300,
    },
    ...initialConfig,
  });

  const [aggregation, setAggregation] = useState('none');
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [filters, setFilters] = useState([
    { column: '', operator: 'eq', value: '' },
  ]);

  const selectedDataset = datasets.find(d => d.id === config.datasetId);

  const handleSave = () => {
    if (!config.title || !config.datasetId) {
      alert('Please fill in all required fields');
      return;
    }

    if (config.type !== 'table' && (!config.xAxis || !config.yAxis)) {
      alert('Please select X and Y axis for chart');
      return;
    }

    const chartConfig: ChartConfig = {
      id: initialConfig?.id || `chart-${Date.now()}`,
      type: config.type as ChartConfig['type'],
      title: config.title!,
      datasetId: config.datasetId!,
      xAxis: config.xAxis,
      yAxis: config.yAxis,
      aggregation,
      groupBy,
      filters,
      settings: config.settings!,
    };

    onSave(chartConfig);
    onClose();
  };

  const handleAddFilter = () => {
    setFilters([...filters, { column: '', operator: 'eq', value: '' }]);
  };
  const handleRemoveFilter = (idx: number) => {
    setFilters(filters.filter((_, i) => i !== idx));
  };
  const handleFilterChange = (idx: number, field: string, value: string) => {
    setFilters(filters.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialConfig ? 'Edit Chart' : 'Add Chart'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Title *
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter chart title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dataset *
            </label>
            <select
              value={config.datasetId}
              onChange={(e) => setConfig({ ...config, datasetId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={0}>Select a dataset</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setConfig({ ...config, type: type.value })}
                    className={`flex items-center space-x-2 p-3 border rounded-md transition-colors ${
                      config.type === type.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {config.type !== 'table' && selectedDataset && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  X-Axis *
                </label>
                <select
                  value={config.xAxis}
                  onChange={(e) => setConfig({ ...config, xAxis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select X-axis column</option>
                  {selectedDataset.columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Y-Axis *
                </label>
                <select
                  value={config.yAxis}
                  onChange={(e) => setConfig({ ...config, yAxis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Y-axis column</option>
                  {selectedDataset.columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aggregation (Y-Axis)
            </label>
            <select
              value={aggregation}
              onChange={e => setAggregation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {aggregationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group By
            </label>
            <Select
              isMulti
              options={datasets.find(d => d.id === config.datasetId)?.columns.map(col => ({ value: col, label: col })) || []}
              value={groupBy.map(g => ({ value: g, label: g }))}
              onChange={vals => setGroupBy(vals.map(v => v.value))}
              classNamePrefix="react-select"
              placeholder="Select columns to group by"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filters
            </label>
            {filters.map((filter, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <select
                  value={filter.column}
                  onChange={e => handleFilterChange(idx, 'column', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="">Column</option>
                  {(datasets.find(d => d.id === config.datasetId)?.columns || []).map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={filter.operator}
                  onChange={e => handleFilterChange(idx, 'operator', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded"
                >
                  {operatorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={filter.value}
                  onChange={e => handleFilterChange(idx, 'value', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded"
                  placeholder="Value"
                />
                <button type="button" onClick={() => handleRemoveFilter(idx)} className="text-red-500">✕</button>
              </div>
            ))}
            <button type="button" onClick={handleAddFilter} className="text-indigo-600 text-sm">+ Add Filter</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width
              </label>
              <input
                type="number"
                value={config.settings?.width}
                onChange={(e) => setConfig({
                  ...config,
                  settings: { ...config.settings!, width: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                min="200"
                max="800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="number"
                value={config.settings?.height}
                onChange={(e) => setConfig({
                  ...config,
                  settings: { ...config.settings!, height: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                min="200"
                max="600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {initialConfig ? 'Update' : 'Add'} Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartConfigModal;