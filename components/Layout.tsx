
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { PARISHES } from '../constants';
import { DashboardIcon, ReceiptIcon, PrayIcon, ChartIcon, ChurchIcon, LogoutIcon, CalendarIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center p-3 my-1 w-full text-base font-normal rounded-lg transition duration-75 group ${
        isActive
          ? 'bg-sky-200 text-sky-800'
          : 'text-slate-100 hover:bg-sky-700'
      }`}
    >
      <span className={`transition duration-75 ${isActive ? 'text-sky-800' : 'text-slate-300 group-hover:text-white'}`}>
        {icon}
      </span>
      <span className="ml-3">{label}</span>
    </button>
  </li>
);

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const { currentUser, logout, currentParish, setCurrentParish } = useContext(AppContext);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-800 text-white flex flex-col p-4">
        <div className="flex items-center mb-6 pb-4 border-b border-sky-700">
          <div className="bg-white text-sky-800 p-2 rounded-lg mr-3">
            <ChurchIcon />
          </div>
          <h1 className="text-xl font-bold">Gestión Parroquial</h1>
        </div>
        <nav className="flex-1">
          <ul>
            <NavItem icon={<DashboardIcon />} label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <NavItem icon={<ReceiptIcon />} label="Recibos y Pagos" isActive={activeView === 'receipts'} onClick={() => setActiveView('receipts')} />
            <NavItem icon={<PrayIcon />} label="Intenciones" isActive={activeView === 'intentions'} onClick={() => setActiveView('intentions')} />
            <NavItem icon={<CalendarIcon />} label="Todas las Celebraciones" isActive={activeView === 'all-celebrations'} onClick={() => setActiveView('all-celebrations')} />
            <NavItem icon={<ChartIcon />} label="Reportes" isActive={activeView === 'reports'} onClick={() => setActiveView('reports')} />
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={logout} className="flex items-center p-3 w-full text-base font-normal text-slate-100 rounded-lg hover:bg-sky-700 group">
            <LogoutIcon />
            <span className="ml-3">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">{currentParish}</h2>
                 <p className="text-slate-500">Bienvenido, {currentUser?.username}</p>
            </div>
            <div>
                <label htmlFor="parish-select" className="block text-sm font-medium text-slate-700 mb-1">Consultar otra Parroquia</label>
                <select 
                    id="parish-select"
                    value={currentParish}
                    onChange={(e) => setCurrentParish(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                >
                    {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
