import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';
import { Plus, Trash2, Save } from 'lucide-react';
import { DataRow } from '../../types';

interface DataGridProps {
  data: DataRow[];
  onDataChange: (data: DataRow[]) => void;
  onSave: (name: string, data: DataRow[]) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ data, onDataChange, onSave }) => {
  const [datasetName, setDatasetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get columns from data
  const columns = React.useMemo(() => {
    if (data.length === 0) return [];
    
    const keys = Object.keys(data[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue, row, column }: any) => {
        const value = getValue();
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateCell(row.index, column.id, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        );
      },
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const updateCell = (rowIndex: number, columnId: string, value: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
    onDataChange(newData);
  };

  const addRow = () => {
    if (data.length === 0) {
      // Create initial structure
      const newRow = { Column1: '', Column2: '', Column3: '' };
      onDataChange([newRow]);
    } else {
      const keys = Object.keys(data[0]);
      const newRow = keys.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      onDataChange([...data, newRow]);
    }
  };

  const addColumn = () => {
    const columnName = `Column${Object.keys(data[0] || {}).length + 1}`;
    const newData = data.map(row => ({ ...row, [columnName]: '' }));
    if (newData.length === 0) {
      newData.push({ [columnName]: '' });
    }
    onDataChange(newData);
  };

  const removeRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onDataChange(newData);
  };

  const handleSave = async () => {
    if (!datasetName.trim()) {
      alert('Please enter a dataset name');
      return;
    }
    if (data.length === 0) {
      alert('Please add some data');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(datasetName, data);
      setDatasetName('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Manual Data Entry</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={addColumn}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Add Column
          </button>
          <button
            onClick={addRow}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => removeRow(row.index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No data yet. Click "Add Row" to start.</p>
          <button
            onClick={addRow}
            className="flex items-center space-x-1 mx-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Row</span>
          </button>
        </div>
      )}

      {data.length > 0 && (
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
          <input
            type="text"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="Enter dataset name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !datasetName.trim()}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Dataset'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DataGrid;