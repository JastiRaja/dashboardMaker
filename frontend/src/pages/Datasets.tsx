import React, { useState, useEffect } from 'react';
import { Plus, Upload, Edit3, Trash2, Calendar, Database } from 'lucide-react';
import { Dataset, DataRow } from '../types';
import { datasetApi } from '../services/api';
import FileUpload from '../components/Data/FileUpload';
import DataGrid from '../components/Data/DataGrid';
import toast from 'react-hot-toast';

const Datasets: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState<DataRow[]>([]);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await datasetApi.getAll();
      setDatasets(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (dataset: Dataset) => {
    setDatasets([dataset, ...datasets]);
    setShowUpload(false);
  };

  const handleManualSave = async (name: string, data: DataRow[]) => {
    try {
      const dataset = await datasetApi.create(name, data);
      setDatasets([dataset, ...datasets]);
      setManualData([]);
      setShowManualEntry(false);
      toast.success('Dataset created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create dataset');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    try {
      await datasetApi.delete(id);
      setDatasets(datasets.filter(d => d.id !== id));
      toast.success('Dataset deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete dataset');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600 mt-1">
            Manage your data sources for creating charts and dashboards
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="h-5 w-5" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload Dataset</h2>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {/* Manual Entry Section */}
      {showManualEntry && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Manual Data Entry</h2>
            <button
              onClick={() => {
                setShowManualEntry(false);
                setManualData([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <DataGrid
            data={manualData}
            onDataChange={setManualData}
            onSave={handleManualSave}
          />
        </div>
      )}

      {/* Datasets List */}
      {datasets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No datasets yet
            </h3>
            <p className="text-gray-500 mb-6">
              Upload a CSV/Excel file or create data manually to get started.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowManualEntry(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="h-5 w-5" />
                <span>Manual Entry</span>
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {dataset.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium">Columns:</span>
                        <span className="ml-1">{dataset.columns.length}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Rows:</span>
                        <span className="ml-1">{dataset.data.length}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Created {new Date(dataset.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Columns:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dataset.columns.slice(0, 3).map((column) => (
                      <span
                        key={column}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {column}
                      </span>
                    ))}
                    {dataset.columns.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{dataset.columns.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={() => handleDelete(dataset.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Dataset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Datasets;