import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Upload, Grid3X3, Share2, Zap, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Upload,
      title: 'Easy Data Import',
      description: 'Upload CSV or Excel files, or enter data manually with our intuitive data grid.',
    },
    {
      icon: BarChart3,
      title: 'Multiple Chart Types',
      description: 'Create bar charts, line charts, pie charts, and tables to visualize your data.',
    },
    {
      icon: Grid3X3,
      title: 'Drag & Drop Builder',
      description: 'Build custom dashboards with our intuitive drag-and-drop interface.',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share your dashboards with others using secure public links.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Make changes to your dashboards and see updates instantly.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is secure with JWT authentication and private user accounts.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Build Beautiful
            <span className="text-indigo-600"> Dashboards</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your data into stunning visualizations. Upload files, create charts, 
            and build interactive dashboards with our powerful yet simple platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboards"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                View Dashboards
              </Link>
              <Link
                to="/dashboard/new"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create New Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need to visualize data
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From data import to sharing, we've got all the tools you need to create 
            professional dashboards in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-indigo-50 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already creating amazing dashboards. 
            Sign up for free and start building today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;