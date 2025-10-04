// frontend/src/App.jsx
import LandingPage from './landing/landing';
import React, { useEffect, useState } from 'react';
import Dashboard from './dashboard/dashboard';
import Teacher from './teacher/teacher';
import Classroom from './classroom/classroom';
import Login from './auth/login';
import Signup from './auth/signup';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  const navigate = (to) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const renderRoute = () => {
    switch (path) {
      case '/':
      case '/landing':
      case '':
        return <LandingPage/>;
      case '/dashboard':
        return <Dashboard initialTab="dashboard"/>;
      case '/teacher':
        return <Dashboard initialTab="teacher"/>;
      case '/classroom':
        return <Dashboard initialTab="classroom"/>;
      case '/login':
        return <Login onLoggedIn={() => navigate('/dashboard')} />;
      case '/signup':
        return <Signup onSignedUp={() => navigate('/login')} />;
      default:
        return <LandingPage/>;
    }
  };

  return (
    // <LandingPage/>
    renderRoute()
  )
}

export default App