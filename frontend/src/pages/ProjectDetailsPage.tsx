import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ProjectDetailsPage() {
    //get id from url
    const { id } = useParams();
    const navigate = useNavigate();
    
    //tasks from db
    const [tasks, setTasks] = useState<any[]>([]);
    
    //is screen loading
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                //get task with this id
                const response = await axios.get(`http://localhost:5000/api/projects/${id}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                //save task
                setTasks(response.data);
            } catch (error) {
                console.error('Error when searching for tasks:', error);
            } finally {
                //remove "loading" message 
                setLoading(false);
            }
        };

        fetchTasks();
    }, [id, navigate]); //whenever id changes 

    //send new task to backend
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`http://localhost:5000/api/projects/${id}/tasks`, 
                { title, description, priority, project: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            //add new task to list on screen 
            setTasks([...tasks, response.data]);
            
            //clear fields
            setTitle('');
            setDescription('');
            setPriority('medium');
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Project Tasks</h2>
                <button className="btn-logout" onClick={() => navigate('/projects')}>
                    Back to Projects
                </button>
            </div>

            {/*form to create tasks */}
            <form className="project-form" onSubmit={handleCreateTask}>
                <h3>Add New Task</h3>
                <div>
                    <input 
                        type="text" 
                        placeholder="Task title (Ex: Create data base)" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <input 
                        type="text" 
                        placeholder="Description (optional)" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                    />
                </div>
                
                {/* task priority */}
                <div style={{ marginBottom: '1rem' }}>
                    <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
                <button type="submit">Create Task</button>
            </form>

            {loading ? (
                <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <div className="project-form">
                    <p>This project does not have any tasks yet.</p>
                    <p>Project ID: <strong style={{ color: 'var(--primary-color)' }}>{id}</strong></p>
                </div>
            ) : (
                <ul className="project-list">
                    {tasks.map((task) => (
                        <li key={task._id} className="project-card">
                            <h3>{task.title}</h3>
                            <p>Status: <strong>{task.status}</strong></p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}