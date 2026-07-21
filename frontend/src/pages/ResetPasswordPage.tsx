import './ResetPasswordPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pega o token diretamente dos parâmetros da URL (:token)
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      //send new password to backend route with token from url 
      await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { password });
      
      setMessage('Password successfully reset! Redirecting to login...');
      
      //redirect to login 
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-container">
        
        <div className="reset-header">
          <h2>Taskflow Pro</h2>
          <p>Create a new password</p>
        </div>

        <form onSubmit={handleResetPassword}>
          
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <div className="input-group">
            <input 
              type="password" 
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          
          <button type="submit" className="btn-reset-submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

      </div>
    </div>
  );
}