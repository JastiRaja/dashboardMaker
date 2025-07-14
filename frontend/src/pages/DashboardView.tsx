import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, ArrowLeft } from 'lucide-react';
import { Dashboard } from '../types';
import { dashboardApi } from '../services/api';
import DashboardBuilder from '../components/Dashboard/DashboardBuilder';
import toast from 'react-hot-toast';

const DashboardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDashboard(Number(id));
    }
  }, [id]);

  const loadDashboard = async (dashboardId: number) => {
    try {
      const data = await dashboardApi.getById(dashboardId);
      setDashboard(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard not found</h2>
        <p className="text-gray-600 mb-6">
          The dashboard you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link
          to="/dashboards"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboards</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboards"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-gray-600 mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>
        <Link
          to={`/dashboard/${dashboard.id}/edit`}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </Link>
      </div>

      <DashboardBuilder dashboard={dashboard} isReadOnly={true} />
    </div>
  );
};

export default DashboardView;