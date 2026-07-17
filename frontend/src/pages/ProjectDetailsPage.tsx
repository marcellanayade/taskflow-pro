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
                console.error('Erro ao buscar tarefas:', error);
            } finally {
                //remove "loading" message 
                setLoading(false);
            }
        };

        fetchTasks();
    }, [id, navigate]); //whenever id changes 

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Project Tasks</h2>
                <button className="btn-logout" onClick={() => navigate('/projects')}>
                    Back to Projects
                </button>
            </div>

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