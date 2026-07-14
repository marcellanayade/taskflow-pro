import { User, IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
  
  //create new user
  async createUser(data: Partial<IUser>) {
    
    //check if email exists
    const userExists = await User.findOne({ email: data.email });
    if (userExists) {
      throw new Error('This email address is already registered in the system.');
    }

    if (!data.password) {
      throw new Error('A password is required.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    //save user with encrypted password 
    const newUser = await User.create({
      ...data, //name + email
      password: hashedPassword 
    });

    //safety cleaning
    const userResponse = newUser.toObject(); 
    delete userResponse.password;            

    return userResponse;
  }

  async login(data: Partial<IUser>) {
    
    //check if email exists
    const user = await User.findOne({ email: data.email }).select('+password');;
    
    if (!user) {
      throw new Error('Incorrect email address or password.');
    }

    //compare passwords
    const isPasswordValid = await bcrypt.compare(data.password as string, user.password);
    if (!isPasswordValid) {
      throw new Error('Incorrect email address or password.');
    }

    //generate token
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      secret,                              
      { expiresIn: '1d' }                  //valid for a day
    );

    //send back token and user data without password
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  }
}