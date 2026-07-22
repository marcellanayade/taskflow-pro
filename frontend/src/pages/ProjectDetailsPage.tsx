import './ProjectDetailsPage.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ProjectDetailsPage() {
    //get id from url
    const { id } = useParams();
    const navigate = useNavigate();

    //tasks from db
    const [tasks, setTasks] = useState<any[]>([]);

    //save project name
    const [projectName, setProjectName] = useState<string>('');

    //is screen loading
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    //kanban columns
    const COLUMNS = ['pending', 'in-progress', 'completed'];

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                //get project and task with this id
                const projectResponse = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjectName(projectResponse.data.name);

                const tasksResponse = await axios.get(`http://localhost:5000/api/projects/${id}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(tasksResponse.data);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]); //whenever id changes 

    //send new task or update to backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (editingTaskId) {
                //update task
                const response = await axios.put(`http://localhost:5000/api/tasks/${editingTaskId}`, 
                    { title, description, priority },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                setTasks(tasks.map(t => t._id === editingTaskId ? response.data : t));
                setEditingTaskId(null);
            } else {
                //create task
                const response = await axios.post(`http://localhost:5000/api/projects/${id}/tasks`,
                    { title, description, priority, project: id, status: 'pending' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                setTasks([...tasks, response.data]);
            }
            
            // clear fields
            setTitle('');
            setDescription('');
            setPriority('medium');
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    // cancel edit mode
    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
    };


    //when user starts to drag a card 
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    //column gets an item 
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    //when user drops a card 
    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        //updates screen
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        ));

        //send change to backend
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    //carousel for mobile 
    const scrollColumn = (columnId: string, direction: 'left' | 'right') => {
        const container = document.getElementById(columnId);
        if (container) {
            const scrollAmount = 280;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    //edit task
    const handleEditTask = (taskId: string) => {
        const taskToEdit = tasks.find(t => t._id === taskId);
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setPriority(taskToEdit.priority || 'medium');
            setEditingTaskId(taskId);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // rola a tela pro topo
        }
    };

    //delete task
    const handleDeleteTask = async (taskId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this task?');
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setTasks(tasks.filter(t => t._id !== taskId));
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2></h2>

                    <button className="btn-back" onClick={() => navigate('/projects')} title="Back to Projects">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                </div>

                <form className="project-form" onSubmit={handleSubmit}>
                    <h3>
                        Project:
                        {projectName && (
                            <span style={{ color: '#888', fontWeight: '400', fontSize: '1.2rem' }}>
                                {' '}<strong style={{ color: '#7260e0' }}>{projectName}</strong>
                            </span>
                        )}
                    </h3>

                    <div className="project-input-group">
                        <input
                            type="text"
                            placeholder="Task title (Ex: Create database)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="project-input-group">
                        <textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="project-input-group">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn-create-project">
                            {editingTaskId ? 'Update Task' : 'Create Task'}
                        </button>
                        
                        {editingTaskId && (
                            <button type="button" className="btn-create-project btn-cancel-edit" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {loading ? (
                    <p className="empty-message">Loading tasks...</p>
                ) : (
                    /* kanban */
                    <div className="kanban-board">
                        {COLUMNS.map((columnStatus) => {
                            const columnTasks = tasks
                                .filter(task => (task.status || 'pending') === columnStatus)
                                .sort((a, b) => {
                                    const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1 };
                                    const weightA = priorityWeights[a.priority || 'low'] || 0;
                                    const weightB = priorityWeights[b.priority || 'low'] || 0;
                                    return weightB - weightA;
                                });

                            return (
                                <div
                                    key={columnStatus}
                                    className="kanban-column"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, columnStatus)}
                                >
                                    <h3 className="kanban-column-title">
                                        {columnStatus.replace('-', ' ')}
                                        <span className="task-count">
                                            {columnTasks.length}
                                        </span>
                                    </h3>

                                    <div className="kanban-carousel-wrapper">
                                        {/* left btn for mobile */}
                                        {columnTasks.length > 1 && (
                                            <button className="carousel-btn left" onClick={() => scrollColumn(`list-${columnStatus}`, 'left')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="15 18 9 12 15 6"></polyline>
                                                </svg>
                                            </button>
                                        )}

                                        <div className="kanban-task-list" id={`list-${columnStatus}`}>
                                            {columnTasks.map((task) => (
                                                <div 
                                                    key={task._id} 
                                                    className="kanban-card"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task._id)}
                                                >
                                                    <div className="kanban-card-header">
                                                        
                                                        <button className="btn-icon edit" onClick={() => handleEditTask(task._id)} title="Edit Task">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                        
                                                        <h4>{task.title}</h4>
                                                        
                                                        <button className="btn-icon delete" onClick={() => handleDeleteTask(task._id)} title="Delete Task">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            </svg>
                                                        </button>

                                                    </div>

                                                    {task.description && <p className="task-desc">{task.description}</p>}
                                                    <div className="task-meta">
                                                        {task.priority && <span className={`badge-priority priority-${task.priority}`}>{task.priority}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* right btn for mobile */}
                                        {columnTasks.length > 1 && (
                                            <button className="carousel-btn right" onClick={() => scrollColumn(`list-${columnStatus}`, 'right')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}