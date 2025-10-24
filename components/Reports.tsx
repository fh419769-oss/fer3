
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../App';
import { Receipt } from '../types';
import { getAllReceipts } from '../services/db';
import { exportToWord } from '../services/exportService';
import { FileDownIcon } from './icons';

const Reports: React.FC = () => {
    const { currentParish } = useContext(AppContext);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        setReceipts(getAllReceipts(currentParish));
    }, [currentParish]);

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // End of week (Saturday)
        return { start, end };
    };

    const getMonthRange = (date: Date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { start, end };
    };

    const filteredReceipts = useMemo(() => {
        const date = new Date(selectedDate);
        date.setUTCHours(0, 0, 0, 0); // Normalize date

        const { start, end } = reportType === 'weekly' ? getWeekRange(date) : getMonthRange(date);
        
        return receipts.filter(r => {
            const receiptDate = new Date(r.date);
            receiptDate.setUTCHours(0, 0, 0, 0);
            return receiptDate >= start && receiptDate <= end;
        });
    }, [receipts, reportType, selectedDate]);

    const reportData = useMemo(() => {
        const summary: { [key: string]: { count: number, totalPaid: number } } = {};
        let total = 0;
        
        filteredReceipts.forEach(r => {
            if (!summary[r.celebration]) {
                summary[r.celebration] = { count: 0, totalPaid: 0 };
            }
            summary[r.celebration].count += 1;
            summary[r.celebration].totalPaid += r.amountPaid;
            total += r.amountPaid;
        });
        
        return { summary, total };
    }, [filteredReceipts]);

    const handleExport = () => {
        const date = new Date(selectedDate);
        const { start, end } = reportType === 'weekly' ? getWeekRange(date) : getMonthRange(date);
        
        let htmlContent = `<h1>Reporte ${reportType === 'weekly' ? 'Semanal' : 'Mensual'}</h1>`;
        htmlContent += `<h2>Parroquia: ${currentParish}</h2>`;
        htmlContent += `<p>Periodo: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}</p>`;
        
        htmlContent += `<h3>Resumen por Celebración</h3>`;
        htmlContent += '<table><thead><tr><th>Celebración</th><th>Cantidad</th><th>Total Recaudado</th></tr></thead><tbody>';
        Object.entries(reportData.summary).forEach(([celebration, data]) => {
            // Fix: Explicitly type `data` to resolve 'unknown' type from Object.entries.
            const typedData = data as { count: number; totalPaid: number };
            htmlContent += `<tr><td>${celebration}</td><td>${typedData.count}</td><td>$${typedData.totalPaid.toFixed(2)}</td></tr>`;
        });
        htmlContent += `</tbody><tfoot><tr><td colspan="2" style="text-align:right; font-weight:bold;">Total General</td><td style="font-weight:bold;">$${reportData.total.toFixed(2)}</td></tr></tfoot></table>`;

        htmlContent += `<h3>Detalle de Recibos</h3>`;
        htmlContent += '<table><thead><tr><th>Folio</th><th>Nombre</th><th>Celebración</th><th>Fecha</th><th>Pagado</th><th>Restante</th></tr></thead><tbody>';
        filteredReceipts.forEach(r => {
             htmlContent += `<tr><td>${r.id}</td><td>${r.personName}</td><td>${r.celebration}</td><td>${r.date}</td><td>$${r.amountPaid.toFixed(2)}</td><td>$${r.amountRemaining.toFixed(2)}</td></tr>`;
        });
        htmlContent += '</tbody></table>';

        const filename = `Reporte_${currentParish.replace(/\s/g, '_')}_${selectedDate}`;
        exportToWord(htmlContent, filename);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Reportes Financieros</h1>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                    <FileDownIcon />
                    Exportar a Word
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6 flex items-center gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Tipo de Reporte</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value as 'weekly' | 'monthly')} className="mt-1 p-2 border border-gray-300 rounded-md">
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Seleccionar Fecha</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">
                    Reporte {reportType === 'weekly' ? 'Semanal' : 'Mensual'} - Total: ${reportData.total.toFixed(2)}
                </h2>
                 <p className="text-slate-500 mb-4">Mostrando {filteredReceipts.length} registros.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Celebración</th>
                                <th className="px-6 py-3">Cantidad de Eventos</th>
                                <th className="px-6 py-3">Total Recaudado</th>
                            </tr>
                        </thead>
                        <tbody>
                             {Object.entries(reportData.summary).map(([celebration, data]) => {
                                // Fix: Explicitly type `data` to resolve 'unknown' type from Object.entries.
                                const typedData = data as { count: number; totalPaid: number };
                                return (
                                <tr key={celebration} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-slate-900">{celebration}</td>
                                    <td className="px-6 py-4">{typedData.count}</td>
                                    <td className="px-6 py-4">${typedData.totalPaid.toFixed(2)}</td>
                                </tr>
                             );
                             })}
                             {Object.keys(reportData.summary).length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-10">No hay datos para el periodo seleccionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;