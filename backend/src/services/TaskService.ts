import { Task, ITask } from '../models/Task';
import { Project } from '../models/Project';

export class TaskService {
  //new task
  async createTask(data: Partial<ITask>) {
    //task requires title
    if (!data.title) {
      throw new Error('The task title is required.');
    }
    
    //task requires project
    if (!data.project) {
      throw new Error('The task must belong to a project.');
    }

    //if rules, save in db and populate author data for the frontend avatar
    const newTask = await Task.create(data);
    const populatedTask = await Task.findById(newTask._id).populate('user', 'name email');
    
    return populatedTask;
  }

  async getAllTasks(userId: string) {
    //get data from db
    const tasks = await Task.find({ user: userId }).populate('user', 'name email');
    return tasks;
  }

  //update task (only task author)
  async updateTask(id: string, userId: string, data: Partial<ITask>) {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('Task not found.');
    }

    const isTaskAuthor = task.user.toString() === userId;

    //only the author of this specific task can edit or change its status
    if (!isTaskAuthor) {
      throw new Error('Unauthorized: You can only edit or move tasks you created.');
    }

    const updatedTask = await Task.findByIdAndUpdate(id, data, { new: true })
      .populate('user', 'name email');
    
    return updatedTask;
  }

  //delete task (only task author)
  async deleteTask(id: string, userId: string) {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('Task not found.');
    }

    const isTaskAuthor = task.user.toString() === userId;

    //only the author of this specific task can delete it
    if (!isTaskAuthor) {
      throw new Error('Unauthorized: You can only delete tasks you created.');
    }

    await Task.findByIdAndDelete(id);

    return { message: 'Task successfully deleted.' };
  }
}