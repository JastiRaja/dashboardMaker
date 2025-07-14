import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Dashboard } from '../types';
import { dashboardApi } from '../services/api';
import DashboardBuilder from '../components/Dashboard/DashboardBuilder';
import toast from 'react-hot-toast';

const PublicDashboard: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (publicId) {
      loadPublicDashboard(publicId);
    }
  }, [publicId]);

  const loadPublicDashboard = async (id: string) => {
    try {
      const data = await dashboardApi.getPublic(id);
      setDashboard(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard not found</h2>
          <p className="text-gray-600 mb-6">
            The dashboard you're looking for doesn't exist or is no longer public.
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit DashBuilder</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{dashboard.name}</h1>
                {dashboard.description && (
                  <p className="text-sm text-gray-600">{dashboard.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Public Dashboard
              </span>
              <a
                href="/"
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Powered by DashBuilder</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DashboardBuilder dashboard={dashboard} isReadOnly={true} />
      </main>
    </div>
  );
};

export default PublicDashboard;