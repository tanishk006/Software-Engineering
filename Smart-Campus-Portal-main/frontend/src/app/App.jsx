import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import Signup from '../features/auth/pages/Signup';
import Dashboard from '../features/dashboard/pages/Dashboard';
import Events from '../features/events/pages/Events';
import LostFound from '../features/lost-found/pages/LostFound';
import FacultyDirectory from '../features/faculty-directory/pages/FacultyDirectory';
import Marketplace from '../features/marketplace/pages/Marketplace';
import Complaints from '../features/complaints/pages/Complaints';
import EmergencyContacts from '../features/emergency-contacts/pages/EmergencyContacts';
import CampusMap from '../features/campus-map/pages/CampusMap';
import Settings from '../features/settings/pages/Settings';
import Help from '../features/help/pages/Help';
import ProtectedRoute from './routes/ProtectedRoute';
import '../App.css';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-found"
        element={
          <ProtectedRoute>
            <LostFound />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty-directory"
        element={
          <ProtectedRoute>
            <FacultyDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency-contacts"
        element={
          <ProtectedRoute>
            <EmergencyContacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campus-map"
        element={
          <ProtectedRoute>
            <CampusMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;