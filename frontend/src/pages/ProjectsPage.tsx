import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  //when page is loaded
  useEffect(() => {
    const fetchProjects = async () => {
      //get token 
      const token = localStorage.getItem('token');
      
      //if no token go back to login page
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        //list projects
        const response = await axios.get('http://localhost:5000/api/projects', {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });

        //save projects on screen
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        //if expired token, go to login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProjects();
  }, [navigate]); 
  //create new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      //POST sending token 
      const response = await axios.post('http://localhost:5000/api/projects', 
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      //update screen and add new project 
      setProjects([...projects, response.data]);
      
      //clear fields
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project!');
    }
  };

  return (
    <div className="projects-container">
      <h2>My Projects</h2>
      <form onSubmit={handleCreateProject} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #aaa', borderRadius: '5px' }}>
        <h3>Add Ne Project</h3>
        <div>
          <input 
            type="text" 
            placeholder="Project Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
          />
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Project Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>Create Project</button>
      </form>
      
      {/* show message if list is empty */}
      {projects.length === 0 ? (
        <p>You don't have any projects yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}