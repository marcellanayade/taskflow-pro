import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* if user accesses root directory redirect to login page */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/*Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Projects route */}
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;