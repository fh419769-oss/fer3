
import React, { useState } from 'react';
import { User } from '../types';
import { getAllUsers, saveUser } from '../services/db';
import { ChurchIcon } from './icons';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getAllUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    const newUser = { username, password };
    const success = saveUser(newUser);
    if (success) {
      onRegister(newUser);
    } else {
      setError('El nombre de usuario ya existe.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
            <div className="inline-block bg-sky-100 text-sky-700 p-3 rounded-full mb-4">
                <ChurchIcon />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Parroquia San Isidro Labrador</h1>
            <p className="text-slate-500 mt-2">{isRegistering ? 'Crear una nueva cuenta' : 'Sistema de Gestión Parroquial'}</p>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
        
        <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2" htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          {isRegistering && (
            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2" htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}
          <button type="submit" className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition duration-300">
            {isRegistering ? 'Registrar' : 'Iniciar Sesión'}
          </button>
        </form>
        <div className="text-center">
          <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-sm text-sky-600 hover:underline">
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : 'Crear una nueva cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
