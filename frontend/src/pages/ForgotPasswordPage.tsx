import './ForgotPasswordPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      //send only email to backend
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
    
      setMessage('If an account matches that email, a password reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false); 
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-container">
        
        <div className="forgot-header">
          <h2>Taskflow Pro</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form onSubmit={handleForgotPassword}>
          
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

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
          
          <button type="submit" className="btn-reset" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="back-to-login">
          Remembered your password? <span style={{ cursor: 'pointer', color: '#7260e0', fontWeight: 700 }} onClick={handleBackToLogin}>Log in</span>
        </div>
        
      </div>
    </div>
  );
}