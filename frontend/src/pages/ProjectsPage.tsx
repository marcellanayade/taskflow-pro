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
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h2>My Projects</h2>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <form className="project-form" onSubmit={handleCreateProject}>
        <h3>Add New Project</h3>
        <div>
          <input 
            type="text" 
            placeholder="Project name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Project description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        <button type="submit">Create Project</button>
      </form>

      {projects.length === 0 ? (
        <p>You don't have any projects yet.</p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <li 
              key={project._id} 
              className="project-card" 
              onClick={() => navigate(`/projects/${project._id}`)} 
              style={{ cursor: 'pointer' }}
            >
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}