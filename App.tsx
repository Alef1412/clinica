import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Financial from './pages/Financial';
import Patients from './pages/Patients';
import Products from './pages/Products';
import Anamnesis from './pages/Anamnesis';
import Settings from './pages/Settings';
import { User } from './types';
import { dataService } from './services/mockDb';

const App: React.FC = () => {
  // Session Persistence
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lumina_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Theme Persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('lumina_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('lumina_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('lumina_theme', 'light');
    }
  }, [isDarkMode]);

  // Simulate Background Job for WhatsApp Reminders
  useEffect(() => {
      if (user) {
          dataService.checkAndSendReminders().then(count => {
              if (count > 0) {
                  // In a real app this is a background job, but here we alert for demo visibility
                  setTimeout(() => {
                      alert(`${count} lembrete(s) de consulta foram enviados automaticamente via WhatsApp.`);
                  }, 2000);
              }
          });
      }
  }, [user]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('lumina_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_user');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('lumina_user', JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Dashboard user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        <Route 
          path="/schedule" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Schedule user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        <Route 
          path="/financial" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Financial user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        <Route 
          path="/patients" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Patients user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        <Route 
          path="/products" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Products user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        <Route 
          path="/settings" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Settings user={user} onUpdateUser={handleUserUpdate} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* Route for patient to fill own anamnesis */}
        <Route 
          path="/anamnesis" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Anamnesis user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* Route for professional to view patient anamnesis */}
        <Route 
          path="/anamnesis/:id" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Anamnesis user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* Placeholder for other routes */}
        <Route 
          path="*" 
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;