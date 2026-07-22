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

  async getAllTasks(userId: string) {
    //get data from db
    const tasks = await Task.find({ user: userId });
    return tasks;
  }

  async updateTask(id: string, userId: string, data: Partial<ITask>) {
    //{ new: true } gets task with new data 
    //findOneAndUpdate ensures the task belongs to the user
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { new: true }
    );
    
    //if id not found or unauthorized
    if (!updatedTask) {
      throw new Error('Task not found or unauthorized.');
    }

    return updatedTask;
  }

  async deleteTask(id: string, userId: string) {
    //findOneAndDelete finds and delete task from db securely
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: userId });
    
    if (!deletedTask) {
      throw new Error('Task not found or unauthorized.');
    }

    return { message: 'Task successfully deleted.' };
  }
}