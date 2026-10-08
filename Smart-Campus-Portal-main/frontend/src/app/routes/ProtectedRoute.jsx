import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-carbon-black text-white font-poppins">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-bright-amber border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-300">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-carbon-black text-white font-poppins p-6">
        <div className="max-w-md w-full bg-carbon-black-400 p-8 rounded-2xl border border-gray-800 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-300 mb-6">
            Your current role ({user.role}) does not have permission to access this module.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-yellow-300 text-black font-semibold rounded-xl text-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
