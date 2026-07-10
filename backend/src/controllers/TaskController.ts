import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';

const taskService = new TaskService();

export class TaskController {
  
  //route gets a request to create task 
  async create(req: Request, res: Response) {
    try {
      //get data from frontend 
      const taskData = req.body;

      //send it to service
      const newTask = await taskService.createTask(taskData);

      //if success
      return res.status(201).json(newTask);
      
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      //service gets tasks list
      const tasks = await taskService.getAllTasks();
      
      //if success
      return res.status(200).json(tasks);
    } catch (error: any) {
      return res.status(500).json({ error: 'An error occurred while retrieving the tasks.'});
    }
  }

  async update(req: Request, res: Response) {
    try {
      //get id from url
      const { id } = req.params;
      
      //get changes from json
      const taskData = req.body;

      //send it for service to update
      const updatedTask = await taskService.updateTask(id, taskData);
      return res.status(200).json(updatedTask);
      
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await taskService.deleteTask(id);
      
      //send success message
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}