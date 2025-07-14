import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Plus, Settings, Trash2, Save, Eye, Share2 } from 'lucide-react';
import ChartRenderer from '../Charts/ChartRenderer';
import ChartConfigModal from '../Charts/ChartConfigModal';
import { Dashboard, DashboardWidget, Dataset, ChartConfig } from '../../types';
import { datasetApi, dashboardApi } from '../../services/api';
import toast from 'react-hot-toast';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBuilderProps {
  dashboard?: Dashboard;
  onSave?: (dashboard: Dashboard) => void;
  isReadOnly?: boolean;
}

const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  dashboard,
  onSave,
  isReadOnly = false,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(dashboard?.widgets || []);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [dashboardName, setDashboardName] = useState(dashboard?.name || '');
  const [dashboardDescription, setDashboardDescription] = useState(dashboard?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await datasetApi.getAll();
      setDatasets(data);
    } catch (error) {
      toast.error('Failed to load datasets');
    }
  };

  const handleLayoutChange = (layout: Layout[]) => {
    if (isReadOnly) return;
    
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.i);
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
      return widget;
    });
    setWidgets(updatedWidgets);
  };

  const handleAddChart = (config: ChartConfig) => {
    console.log('handleAddChart called with config:', config);
    const newWidget: DashboardWidget = {
      i: config.id,
      x: 0,
      y: 0,
      w: Math.ceil(config.settings.width / 100),
      h: Math.ceil(config.settings.height / 100),
      chartConfig: config,
    };
    setWidgets(prevWidgets => {
      const updatedWidgets = [...prevWidgets, newWidget];
      console.log('Updated widgets state:', updatedWidgets);
      return updatedWidgets;
    });
  };

  const handleEditChart = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setIsConfigModalOpen(true);
  };

  const handleUpdateChart = (config: ChartConfig) => {
    if (editingWidget) {
      const updatedWidgets = widgets.map(widget =>
        widget.i === editingWidget.i
          ? { ...widget, chartConfig: config }
          : widget
      );
      setWidgets(updatedWidgets);
      setEditingWidget(null);
    }
  };

  const handleDeleteChart = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.i !== widgetId));
  };

  const handleSave = async () => {
    if (!dashboardName.trim()) {
      toast.error('Please enter a dashboard name');
      return;
    }

    setIsSaving(true);
    try {
      const dashboardData: Partial<Dashboard> = {
        name: dashboardName,
        description: dashboardDescription,
        widgets,
      };

      let savedDashboard: Dashboard;
      if (dashboard?.id) {
        savedDashboard = await dashboardApi.update(dashboard.id, dashboardData);
        toast.success('Dashboard updated successfully');
      } else {
        savedDashboard = await dashboardApi.create(dashboardData);
        toast.success('Dashboard created successfully');
      }

      if (onSave) {
        onSave(savedDashboard);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!dashboard?.id) return;

    try {
      const { publicId } = await dashboardApi.share(dashboard.id);
      const shareUrl = `${window.location.origin}/dashboard/public/${publicId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to share dashboard');
    }
  };

  const getDatasetForWidget = (widget: DashboardWidget): Dataset | undefined => {
    return datasets.find(d => d.id === widget.chartConfig.datasetId);
  };

  return (
    <div className="space-y-6">
      {!isReadOnly && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {dashboard ? 'Edit Dashboard' : 'Create Dashboard'}
            </h2>
            <div className="flex items-center space-x-2">
              {dashboard && (
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              )}
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Chart</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dashboard Name *
              </label>
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter dashboard name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter description (optional)"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No charts yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first chart to get started
              </p>
              {!isReadOnly && (
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="flex items-center space-x-1 mx-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Chart</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: widgets }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              onLayoutChange={handleLayoutChange}
              isDraggable={!isReadOnly}
              isResizable={!isReadOnly}
            >
              {widgets.map((widget) => {
                const dataset = getDatasetForWidget(widget);
                return (
                  <div key={widget.i} className="bg-white border border-gray-200 rounded-lg p-4">
                    {!isReadOnly && (
                      <div className="flex justify-end space-x-1 mb-2">
                        <button
                          onClick={() => handleEditChart(widget)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(widget.i)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {dataset ? (
                      <ChartRenderer
                        config={widget.chartConfig}
                        data={dataset.data}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Dataset not found
                      </div>
                    )}
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          </div>
        )}
      </div>

      <ChartConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setEditingWidget(null);
        }}
        onSave={editingWidget ? handleUpdateChart : handleAddChart}
        datasets={datasets}
        initialConfig={editingWidget?.chartConfig}
      />
    </div>
  );
};

export default DashboardBuilder;