/**
 * @file App.jsx
 * @description Master Application Routing component for Public, Patient, Admin, and Doctor portals.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public Pages
import PublicDashboard from "./pages/public/PublicDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Patient / User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserAppointments from "./pages/user/Appointments";
import BookAppointment from "./pages/user/BookAppointment";
import Profile from "./pages/user/Profile";
import Reports from "./pages/user/Reports";
import ReportDetails from "./pages/user/ReportDetails";
import UploadReport from "./pages/user/UploadReport";
import Chat from "./pages/user/Chat";

// Admin Pages
import Patients from "./pages/admin/Patients";
import PatientDetails from "./pages/admin/PatientDetails";
import Doctors from "./pages/admin/Doctors";
import DoctorDetails from "./pages/admin/DoctorDetails";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AppointmentDetails from "./pages/admin/AppointmentDetails";
import AdminReports from "./pages/admin/Reports";
import AdminReportDetails from "./pages/admin/ReportDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Doctor Portal Pages
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorChat from "./pages/doctor/DoctorChat";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/public/dashboard" element={<PublicDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/appointments"
          element={
            <ProtectedRoute>
              <UserAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/book-appointment"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/reports/:id"
          element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/upload-report"
          element={
            <ProtectedRoute>
              <UploadReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients/:id"
          element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute>
              <Doctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors/:id"
          element={
            <ProtectedRoute>
              <DoctorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute>
              <AdminAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/reports/:id" element={<AdminReportDetails />} />

        {/* Doctor Routes */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/chat" element={<DoctorChat />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;