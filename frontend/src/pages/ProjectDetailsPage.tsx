import './ProjectDetailsPage.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

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
    const [dueDate, setDueDate] = useState('');

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    //kanban columns
    const COLUMNS = ['pending', 'in-progress', 'completed'];

    // helper to get date status for colors
    const getDateStatus = (dateString: string) => {
        if (!dateString) return '';
        
        //get user local date, not utc
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        const taskDateStr = dateString.split('T')[0];

        if (taskDateStr < todayStr) return 'overdue';
        if (taskDateStr === todayStr) return 'today';
        return 'future';
    };

    // helper to format date to DD/MM/YYYY
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

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

                const fetchedTasks = tasksResponse.data;
                setTasks(fetchedTasks);

               //reminder logic for overdue and today tasks
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const todayStr = `${year}-${month}-${day}`;
                
                let overdueCount = 0;
                let todayCount = 0;

                fetchedTasks.forEach((t: any) => {
                    if (t.status !== 'completed' && t.dueDate) {
                        const taskDate = t.dueDate.split('T')[0];
                        if (taskDate < todayStr) overdueCount++;
                        else if (taskDate === todayStr) todayCount++;
                    }
                });

                if (overdueCount > 0 || todayCount > 0) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'warning',
                        title: 'Task Reminder',
                        html: `You have <b>${overdueCount}</b> overdue task(s) and <b>${todayCount}</b> due today.`,
                        showConfirmButton: false,
                        timer: 5000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });
                }

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

        //ensure empty string sends null to DB
        const finalDueDate = dueDate ? dueDate : null;

        try {
            if (editingTaskId) {
                //update task
                const response = await axios.put(`http://localhost:5000/api/tasks/${editingTaskId}`,
                    { title, description, priority, dueDate: finalDueDate },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setTasks(tasks.map(t => t._id === editingTaskId ? response.data : t));
                setEditingTaskId(null);

                Swal.fire({
                    title: 'Success!',
                    text: 'Task updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#7260e0',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                //create task
                const response = await axios.post(`http://localhost:5000/api/projects/${id}/tasks`,
                    { title, description, priority, dueDate: finalDueDate, project: id, status: 'pending' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setTasks([...tasks, response.data]);

                Swal.fire({
                    title: 'Created!',
                    text: 'New task added to the board.',
                    icon: 'success',
                    confirmButtonColor: '#7260e0',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            //clear fields
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
        } catch (error) {
            console.error('Error saving task:', error);
            Swal.fire({
                title: 'Oops...',
                text: 'Error saving task!',
                icon: 'error',
                confirmButtonColor: '#7260e0'
            });
        }
    };

    //cancel edit mode
    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
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

        //get current date if task is completed 
        const isCompleted = newStatus === 'completed';
        const completedDate = isCompleted ? new Date().toISOString() : null;

        //updates screen
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus, completedAt: completedDate } : task
        ));

        //send change to backend
        try {
            const token = localStorage.getItem('token');
            const updateData: any = { status: newStatus };

            // if completed, send current date. If moved, send null 
            if (isCompleted) {
                updateData.completedAt = completedDate;
            } else {
                updateData.completedAt = null;
            }

            await axios.put(`http://localhost:5000/api/tasks/${taskId}`,
                updateData,
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
            setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
            setEditingTaskId(taskId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    //delete task
    const handleDeleteTask = async (taskId: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this task deletion!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTasks(tasks.filter(t => t._id !== taskId));

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your task has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#7260e0'
                });
            } catch (error) {
                console.error('Error deleting task:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete the task.',
                    icon: 'error',
                    confirmButtonColor: '#7260e0'
                });
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

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>

                        <div className="project-input-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }}>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ paddingRight: '2.5rem' }}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        <div className="project-input-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}
                            >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <input
                                type="date"
                                title="Due date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                onClick={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (target.showPicker) target.showPicker();
                                }}
                                style={{ paddingLeft: '2.8rem', cursor: 'pointer' }}
                            />
                        </div>
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

                                                    {/* task meta info: priority and date */}
                                                    <div className="task-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        {task.priority && <span className={`badge-priority priority-${task.priority}`}>{task.priority}</span>}

                                                        {/*if completed, show done task date with check */}
                                                        {columnStatus === 'completed' && task.completedAt && (
                                                            <span className="badge-date date-completed">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                                </svg>
                                                                Done in {formatDate(task.completedAt)}
                                                            </span>
                                                        )}

                                                        {/* if not completed, show deadline */}
                                                        {task.dueDate && columnStatus !== 'completed' && (
                                                            <span className={`badge-date date-${getDateStatus(task.dueDate)}`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                </svg>
                                                                {formatDate(task.dueDate)}
                                                            </span>
                                                        )}
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