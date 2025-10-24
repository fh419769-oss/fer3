
import React, { useState, useCallback, useMemo } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Receipts from './components/Receipts';
import Intentions from './components/Intentions';
import Reports from './components/Reports';
import AllCelebrations from './components/AllCelebrations';
import { User } from './types';
import { getAllUsers } from './services/db';

export const AppContext = React.createContext<{
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  currentParish: string;
  setCurrentParish: React.Dispatch<React.SetStateAction<string>>;
}>({
  currentUser: null,
  setCurrentUser: () => {},
  logout: () => {},
  currentParish: 'Parroquia San Isidro Labrador',
  setCurrentParish: () => {},
});

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [currentParish, setCurrentParish] = useState('Parroquia San Isidro Labrador');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };
  
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveView('dashboard');
    sessionStorage.removeItem('currentUser');
  }, []);

  const handleRegister = (user: User) => {
    // In a real app, this would be a separate flow. Here we just log them in.
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };
  
  React.useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // Initialize with a default admin user if none exist
        const users = getAllUsers();
        if (users.length === 0) {
            const adminUser = { username: 'admin', password: 'password' };
            const updatedUsers = [...users, adminUser];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
    }
  }, []);

  const appContextValue = useMemo(() => ({
    currentUser,
    setCurrentUser,
    logout: handleLogout,
    currentParish,
    setCurrentParish,
  }), [currentUser, handleLogout, currentParish]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'receipts':
        return <Receipts />;
      case 'intentions':
        return <Intentions />;
      case 'reports':
        return <Reports />;
      case 'all-celebrations':
        return <AllCelebrations />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <Layout activeView={activeView} setActiveView={setActiveView}>
        {renderView()}
      </Layout>
    </AppContext.Provider>
  );
};

export default App;
