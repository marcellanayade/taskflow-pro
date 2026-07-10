import { Task, ITask } from '../models/Task';

export class TaskService {
  //new task
  async createTask(data: Partial<ITask>) {
    //rule: task requires title
    if (!data.title) {
      throw new Error('The task title is required.');
    }
    
    //rule: task requires project
    if (!data.project) {
      throw new Error('The task must belong to a project.');
    }

    //if rules, save in db
    const newTask = await Task.create(data);
    return newTask;
  }

  async getAllTasks() {
    //get all data from db
    const tasks = await Task.find();
    return tasks;
  }

  async updateTask(id: string, data: Partial<ITask>) {
    //{ new: true } gets task with new data 
    const updatedTask = await Task.findByIdAndUpdate(id, data, { new: true });
    
    //if id not found
    if (!updatedTask) {
      throw new Error('Task not found in the database.');
    }

    return updatedTask;
  }

  async deleteTask(id: string) {
    //findByIdAndDelete finds and delete task from db
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      throw new Error('Task not found.');
    }

    return { message: 'Task successfully deleted.' };
  }
}