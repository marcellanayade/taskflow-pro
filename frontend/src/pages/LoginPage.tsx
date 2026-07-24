import './LoginPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  //log in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      //get error from backend and show with SweetAlert2
      const errorMessage = err.response?.data?.error || 'Error logging in. Please check your credentials.';
      
      Swal.fire({
        title: 'Login failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#7260e0'
      });
    }
  };

  //redirect to forgot password page
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault(); 
    navigate('/forgot-password');
  };

  //redirect to sign up page
  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault(); 
    navigate('/signup');
  };

  //google OAuth placeholder
  const handleGoogleLogin = () => {
    Swal.fire({
      title: 'Under Construction',
      text: 'Google OAuth integration is coming soon!',
      icon: 'info',
      confirmButtonColor: '#7260e0'
    });
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        <div className="login-header">
          <h2>Taskflow Pro</h2>
          <p>Log in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          
          {/* Email Input */}
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Type your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email" 
            />
          </div>
          
          {/* Password Input */}
          <div className="input-group">
            <div className="password-container">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Type your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password" 
              />
              <button 
                type="button" 
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
        
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <a href="#" onClick={handleForgotPassword}>Forgot Password</a>
          </div>

          <button type="submit" className="btn-signin">Sign in</button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button type="button" className="btn-google" onClick={handleGoogleLogin}>
          {/*Google logo*/}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          Continue with Google
        </button>

        <div className="signup-link">
          Don't have an account yet? <a href="#" onClick={handleSignUp}>Sign up</a>
        </div>
        
      </div>
    </div>
  );
}