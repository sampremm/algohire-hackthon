import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';

function App() {
  const [currentDashboard, setCurrentDashboard] = useState('admin');

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">📮 In-App Messaging System</div>
        <div className="nav-buttons">
          <button
            onClick={() => setCurrentDashboard('admin')}
            className={`nav-btn ${currentDashboard === 'admin' ? 'active' : ''}`}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => setCurrentDashboard('user')}
            className={`nav-btn ${currentDashboard === 'user' ? 'active' : ''}`}
          >
            User Dashboard
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentDashboard === 'admin' && <AdminDashboard />}
        {currentDashboard === 'user' && <UserDashboard />}
      </main>

      <footer className="footer">
        <p>Notification System • Backend: http://localhost:3000</p>
      </footer>
    </div>
  );
}

export default App;
