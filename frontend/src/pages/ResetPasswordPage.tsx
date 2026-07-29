import './ResetPasswordPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  //get token directly from the URL parameters (:token)
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Check passwords',
        text: 'Passwords do not match.',
        icon: 'warning',
        confirmButtonColor: '#7260e0'
      });
      return;
    }

    setIsLoading(true);

    try {
      //send new password to backend route with token from url 
      await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { password });
      
      await Swal.fire({
        title: 'Success!',
        text: 'Password successfully reset! Redirecting to login...',
        icon: 'success',
        confirmButtonColor: '#7260e0',
        timer: 2500,
        showConfirmButton: false
      });
      
      //redirect to login 
      navigate('/login');

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred. Please try again.';
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#7260e0'
      });
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