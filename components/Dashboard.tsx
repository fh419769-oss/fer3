
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { getAllReceipts, getAllIntentions } from '../services/db';
import { Receipt, Intention } from '../types';

const StatCard: React.FC<{title: string; value: string | number; description: string}> = ({title, value, description}) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        <p className="text-slate-400 text-xs mt-2">{description}</p>
    </div>
);


const Dashboard: React.FC = () => {
    const { currentUser, currentParish } = useContext(AppContext);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [intentions, setIntentions] = useState<Intention[]>([]);

    useEffect(() => {
        setReceipts(getAllReceipts(currentParish));
        setIntentions(getAllIntentions(currentParish));
    }, [currentParish]);

    const totalPaid = receipts.reduce((sum, r) => sum + r.amountPaid, 0);
    const totalRemaining = receipts.reduce((sum, r) => sum + r.amountRemaining, 0);
    const paidReceipts = receipts.filter(r => r.amountRemaining === 0).length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Recaudado" 
                    value={`$${totalPaid.toFixed(2)}`} 
                    description="Suma de todos los pagos recibidos" 
                />
                <StatCard 
                    title="Monto Pendiente" 
                    value={`$${totalRemaining.toFixed(2)}`}
                    description="Suma de todos los saldos restantes" 
                />
                <StatCard 
                    title="Celebraciones Liquidadas" 
                    value={paidReceipts} 
                    description={`${receipts.length} celebraciones registradas en total`}
                />
                <StatCard 
                    title="Intenciones Registradas" 
                    value={intentions.length}
                    description="Intenciones para las próximas misas" 
                />
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Próximas Celebraciones (Últimas 5 registradas)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Folio</th>
                                <th scope="col" className="px-6 py-3">Celebración</th>
                                <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.slice(-5).reverse().map(receipt => (
                                <tr key={receipt.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-slate-900">{receipt.id}</td>
                                    <td className="px-6 py-4">{receipt.celebration}</td>
                                    <td className="px-6 py-4">{receipt.date} a las {receipt.time}</td>
                                    <td className="px-6 py-4">
                                        {receipt.amountRemaining === 0 ? 
                                            <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Liquidado</span> :
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Pendiente</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                             {receipts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">No hay celebraciones registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
