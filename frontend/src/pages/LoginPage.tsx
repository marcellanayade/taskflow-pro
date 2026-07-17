import './LoginPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  //log in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(''); //clear old error 
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      //get token
      const token = response.data.token;

      //store token in browser
      localStorage.setItem('token', token);
      
      console.log('Login successful! Token saved:', token);

      //send user to projects page
      navigate('/projects');

    } catch (err: any) {
      //get error from backend 
      setError(err.response?.data?.error || 'Error logging in. Please try again.');
    }
  };;

  return (
    <div className="login-container">
      <h2>Log in to TaskFlow Pro</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email: </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email" 
          />
        </div>
        <br />
        <div>
          <label>Password: </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password" 
          />
        </div>
        <br />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}