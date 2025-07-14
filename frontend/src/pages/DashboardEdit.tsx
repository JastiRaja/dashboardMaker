import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Dashboard } from '../types';
import { dashboardApi } from '../services/api';
import DashboardBuilder from '../components/Dashboard/DashboardBuilder';
import toast from 'react-hot-toast';

const DashboardEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      loadDashboard(Number(id));
    } else {
      setIsLoading(false);
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

  const handleSave = (savedDashboard: Dashboard) => {
    navigate(`/dashboard/${savedDashboard.id}`);
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
      <div className="flex items-center space-x-4">
        <Link
          to={dashboard ? `/dashboard/${dashboard.id}` : '/dashboards'}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {dashboard ? 'Edit Dashboard' : 'Create New Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {dashboard 
              ? 'Make changes to your dashboard and save when ready'
              : 'Build your custom dashboard with charts and visualizations'
            }
          </p>
        </div>
      </div>

      <DashboardBuilder dashboard={dashboard || undefined} onSave={handleSave} />
    </div>
  );
};

export default DashboardEdit;