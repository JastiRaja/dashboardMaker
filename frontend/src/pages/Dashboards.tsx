import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Share2, Calendar } from 'lucide-react';
import { Dashboard } from '../types';
import { dashboardApi } from '../services/api';
import toast from 'react-hot-toast';

const Dashboards: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const data = await dashboardApi.getAll();
      setDashboards(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) {
      return;
    }

    try {
      await dashboardApi.delete(id);
      setDashboards(dashboards.filter(d => d.id !== id));
      toast.success('Dashboard deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete dashboard');
    }
  };

  const handleShare = async (dashboard: Dashboard) => {
    try {
      if (dashboard.isPublic && dashboard.publicId) {
        const shareUrl = `${window.location.origin}/dashboard/public/${dashboard.publicId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      } else {
        const { publicId } = await dashboardApi.share(dashboard.id);
        const shareUrl = `${window.location.origin}/dashboard/public/${publicId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Dashboard shared! Link copied to clipboard.');
        
        // Update local state
        setDashboards(dashboards.map(d => 
          d.id === dashboard.id 
            ? { ...d, isPublic: true, publicId }
            : d
        ));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to share dashboard');
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
          <h1 className="text-2xl font-bold text-gray-900">My Dashboards</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your custom dashboards
          </p>
        </div>
        <Link
          to="/dashboard/new"
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Dashboard</span>
        </Link>
      </div>

      {dashboards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No dashboards yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first dashboard with charts and visualizations.
            </p>
            <Link
              to="/dashboard/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Dashboard</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {dashboard.name}
                    </h3>
                    {dashboard.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {dashboard.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Created {new Date(dashboard.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {dashboard.isPublic && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {dashboard.widgets.length} chart{dashboard.widgets.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/dashboard/${dashboard.id}`}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="View Dashboard"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/dashboard/${dashboard.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Dashboard"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleShare(dashboard)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Share Dashboard"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dashboard.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Dashboard"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboards;