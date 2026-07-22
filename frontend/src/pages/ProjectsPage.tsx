import './ProjectsPage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  //edit state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
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

  //create or update project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingProjectId) {
        //update project
        const response = await axios.put(`http://localhost:5000/api/projects/${editingProjectId}`, 
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects(projects.map(p => p._id === editingProjectId ? response.data : p));
        setEditingProjectId(null);

        Swal.fire({
          title: 'Success!',
          text: 'Project updated successfully.',
          icon: 'success',
          confirmButtonColor: '#7260e0',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        //create new project
        const response = await axios.post('http://localhost:5000/api/projects', 
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects([...projects, response.data]);

        Swal.fire({
          title: 'Created!',
          text: 'New project added to your list.',
          icon: 'success',
          confirmButtonColor: '#7260e0',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      //clear fields
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving project:', error);
      Swal.fire({
        title: 'Oops...',
        text: 'Error saving project!',
        icon: 'error',
        confirmButtonColor: '#7260e0'
      });
    }
  };

  //cancel edit
  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setName('');
    setDescription('');
  };

  //edit project
  const handleEditProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation(); //stop click from opening project page
    setName(project.name);
    setDescription(project.description || '');
    setEditingProjectId(project._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  //delete project
  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); //stop click from opening project page
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "All associated tasks will also be deleted. You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#9ca3af',  
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(projects.filter(p => p._id !== projectId));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your project has been deleted.',
          icon: 'success',
          confirmButtonColor: '#7260e0'
        });
      } catch (error) {
        console.error('Error deleting project:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the project.',
          icon: 'error',
          confirmButtonColor: '#7260e0'
        });
      }
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
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-create-project">
              {editingProjectId ? 'Update Project' : 'Create Project'}
            </button>
            
            {editingProjectId && (
              <button type="button" className="btn-create-project btn-cancel-edit" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
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
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <div className="project-card-actions">
                    <button className="btn-icon edit" onClick={(e) => handleEditProject(e, project)} title="Edit Project">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button className="btn-icon delete" onClick={(e) => handleDeleteProject(e, project._id)} title="Delete Project">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                  </div>
                </div>
                <p>{project.description || 'No description provided.'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}