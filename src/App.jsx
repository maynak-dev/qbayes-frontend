import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Users from './components/Users/Users'; 
import CompanyCreation from './components/CompanyCreation/CompanyCreation';
import Roles from './components/Roles/Roles'; 
import Jewellery from './components/Jewellery/Jewellery';
import RFID from './components/RFID/RFID';
import RFIDJewelleryMap from './components/RFIDJewelleryMap/RFIDJewelleryMap';
import RFIDScans from './components/RFIDScans/RFIDScans';

// Simple auth check – replace with real token validation if needed
const isAuthenticated = () => {
  return localStorage.getItem('access') !== null;
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/company-creation"
          element={
            <PrivateRoute>
              <Layout>
                <CompanyCreation />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute>
              <Layout>
                <Roles /> 
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/admin/jewellery" element={<PrivateRoute><Layout><Jewellery /></Layout></PrivateRoute>} />
        <Route path="/admin/rfid" element={<PrivateRoute><Layout><RFID /></Layout></PrivateRoute>} />
        <Route path="/admin/rfid-jewellery-map" element={<PrivateRoute><Layout><RFIDJewelleryMap /></Layout></PrivateRoute>} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/admin" />} />

        <Route path="/admin/rfid-scans" element={<RFIDScans />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;