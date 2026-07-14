import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export class UserController {
  
  async register(req: Request, res: Response) {
    try {
      const userData = req.body;
      
      const newUser = await userService.createUser(userData);
      
      return res.status(201).json(newUser);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const loginData = req.body;
      
      const result = await userService.login(loginData);
      
      return res.status(200).json(result);
    } catch (error: any) {
      //unauthorized
      return res.status(401).json({ error: error.message });
    }
  }
}