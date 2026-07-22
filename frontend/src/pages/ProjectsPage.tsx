import './ProjectsPage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
      }
    };
    fetchProjects();
  }, [navigate]);

  //create new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/projects', 
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([...projects, response.data]);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project!');
    }
  };

  //log out
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        <div className="dashboard-header">
          <h2></h2>

          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
          
        </div>

        <form className="project-form" onSubmit={handleCreateProject}>
          <h3>My Projects</h3>
          
          <div className="project-input-group">
            <input 
              type="text" 
              placeholder="Project name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="project-input-group">
            <textarea 
              placeholder="Project description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
            />
          </div>
          
          <button type="submit" className="btn-create-project">Create Project</button>
        </form>

        {projects.length === 0 ? (
          <p className="empty-message">You don't have any projects yet.</p>
        ) : (
          <ul className="project-list">
            {projects.map((project) => (
              <li 
                key={project._id} 
                className="project-card" 
                onClick={() => navigate(`/projects/${project._id}`)} 
              >
                <h3>{project.name}</h3>
                <p>{project.description || 'No description provided.'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}