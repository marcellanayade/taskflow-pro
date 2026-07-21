import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* if user accesses root directory redirect to login page */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/*Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/*Sign up route */}
        <Route path="/signup" element={<SignUpPage />} />

        {/*Forget password route */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/*Reset password route */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/*Projects route */}
        <Route path="/projects" element={<ProjectsPage />} />

        <Route path="/projects/:id" element={<ProjectDetailsPage />} />

        {/*Fallback route: any unknown URL redirects to the login page */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;