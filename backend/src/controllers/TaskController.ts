import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { AuthRequest } from '../middlewares/authMiddleware';

const taskService = new TaskService();

export class TaskController {
  
  //route gets a request to create task 
  async create(req: AuthRequest, res: Response) {
    try {
      //get task data and userid 
      const taskData = {
        ...req.body,
        user: req.userId 
      };

      //send it to service
      const newTask = await taskService.createTask(taskData);

      //if success
      return res.status(201).json(newTask);
      
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      //service gets tasks list from specific user
      const tasks = await taskService.getAllTasks(req.userId as string);
      
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
      const updatedTask = await taskService.updateTask(id as string, taskData);
      return res.status(200).json(updatedTask);
      
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await taskService.deleteTask(id as string);
      
      //send success message
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}