
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../App';
import { Receipt } from '../types';
import { getAllReceipts } from '../services/db';
import { exportToWord } from '../services/exportService';
import { FileDownIcon } from './icons';

const AllCelebrations: React.FC = () => {
    const { currentParish } = useContext(AppContext);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        setReceipts(getAllReceipts(currentParish));
    }, [currentParish]);
    
    const sortedReceipts = useMemo(() => {
        return [...receipts].sort((a, b) => {
            const fieldA = a[sortField as keyof Receipt];
            const fieldB = b[sortField as keyof Receipt];
            
            let comparison = 0;
            if (fieldA > fieldB) {
                comparison = 1;
            } else if (fieldA < fieldB) {
                comparison = -1;
            }
            
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [receipts, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleExport = () => {
        let htmlContent = `<h1>Reporte de Todas las Celebraciones</h1>`;
        htmlContent += `<h2>Parroquia: ${currentParish}</h2>`;
        htmlContent += `<table><thead><tr>
            <th>Folio</th>
            <th>Celebración</th>
            <th>Solicitante</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Lugar</th>
            <th>Estado</th>
        </tr></thead><tbody>`;

        sortedReceipts.forEach(r => {
            htmlContent += `<tr>
                <td>${r.id}</td>
                <td>${r.celebration}</td>
                <td>${r.personName}</td>
                <td>${r.date}</td>
                <td>${r.time}</td>
                <td>${r.location}</td>
                <td>${r.amountRemaining === 0 ? 'Liquidado' : 'Pendiente'}</td>
            </tr>`;
        });
        htmlContent += '</tbody></table>';

        const filename = `Todas_Celebraciones_${currentParish.replace(/\s/g, '_')}`;
        exportToWord(htmlContent, filename);
    };

    const SortableHeader: React.FC<{field: string, label: string}> = ({field, label}) => (
        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort(field)}>
            {label}
            {sortField === field && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
        </th>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Todas las Celebraciones</h1>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                    <FileDownIcon />
                    Exportar Lista a Word
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <SortableHeader field="celebration" label="Celebración" />
                                <SortableHeader field="date" label="Fecha y Hora" />
                                <SortableHeader field="personName" label="Solicitante" />
                                <th scope="col" className="px-6 py-3">Estado del Pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedReceipts.map(r => (
                                <tr key={r.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-slate-900">{r.celebration}</td>
                                    <td className="px-6 py-4">{r.date} a las {r.time}</td>
                                    <td className="px-6 py-4">{r.personName}</td>
                                    <td className="px-6 py-4">
                                        {r.amountRemaining === 0 ? 
                                            <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Liquidado</span> :
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Pendiente ($ {r.amountRemaining.toFixed(2)})</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {sortedReceipts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-500">
                                        No hay celebraciones registradas en esta parroquia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllCelebrations;
