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

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      const result = await userService.forgotPassword(email);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token as string;; //get token from url
      const { password } = req.body;

      const result = await userService.resetPassword(token, password);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}