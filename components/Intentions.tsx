
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../App';
import { Intention, IntentionType } from '../types';
import { getAllIntentions, saveIntention } from '../services/db';
import { PlusCircleIcon, FileDownIcon, XIcon } from './icons';
import { exportToWord } from '../services/exportService';

const IntentionForm: React.FC<{
  onClose: () => void;
  onSave: (intention: Intention) => void;
}> = ({ onClose, onSave }) => {
    const { currentParish } = useContext(AppContext);
    const [personName, setPersonName] = useState('');
    const [type, setType] = useState<IntentionType>(IntentionType.DIFUNTOS);
    const [time, setTime] = useState<'8:00 AM' | '7:00 PM'>('8:00 AM');
    const [amountPaid, setAmountPaid] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIntention: Intention = {
            id: Date.now().toString(),
            personName,
            type,
            time,
            amountPaid: parseFloat(amountPaid) || 0,
            date,
            parish: currentParish,
        };
        onSave(newIntention);
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Nueva Intención</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Por quien piden</label>
                <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tipo de Intención</label>
                <select value={type} onChange={e => setType(e.target.value as IntentionType)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                    {Object.values(IntentionType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Fecha de la Misa</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Horario</label>
                 <select value={time} onChange={e => setTime(e.target.value as '8:00 AM' | '7:00 PM')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="7:00 PM">7:00 PM</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Pago ($)</label>
                <input type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Guardar Intención</button>
            </div>
        </form>
      </div>
    </div>
  );
};

const IntentionsList: React.FC<{ intentions: Intention[], time: string, date: string }> = ({ intentions, time, date }) => {
    const filteredIntentions = intentions.filter(i => i.time === time && i.date === date);

    if(filteredIntentions.length > 20) {
        // This is a simple alert. A more robust solution would prevent adding more than 20.
        alert(`Advertencia: Hay ${filteredIntentions.length} intenciones para la misa de las ${time}, superando el límite de 20.`);
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Intenciones - Misa de {time} del {date} ({filteredIntentions.length}/20)</h3>
            {filteredIntentions.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                    {filteredIntentions.map(i => (
                        <li key={i.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-slate-900">{i.personName}</p>
                                <p className="text-sm text-slate-500">{i.type}</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">${i.amountPaid.toFixed(2)}</p>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-slate-500">No hay intenciones registradas para este horario y fecha.</p>}
        </div>
    );
};


const Intentions: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [intentions, setIntentions] = useState<Intention[]>([]);
    const { currentParish } = useContext(AppContext);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

    const loadIntentions = () => setIntentions(getAllIntentions(currentParish));

    useEffect(() => {
        loadIntentions();
    }, [currentParish]);
    
    const handleSaveIntention = (intention: Intention) => {
        saveIntention(intention, currentParish);
        loadIntentions();
        setShowForm(false);
    };

    const handleExport = () => {
        const intentionsForDate = intentions.filter(i => i.date === viewDate);
        const intentions8AM = intentionsForDate.filter(i => i.time === '8:00 AM');
        const intentions7PM = intentionsForDate.filter(i => i.time === '7:00 PM');
        
        let htmlContent = `<h1>Reporte de Intenciones para ${viewDate}</h1>`;
        htmlContent += `<h2>Parroquia: ${currentParish}</h2>`;

        htmlContent += `<h3>Misa de 8:00 AM</h3>`;
        if(intentions8AM.length > 0) {
            htmlContent += '<table><thead><tr><th>Por quien piden</th><th>Tipo</th><th>Pago</th></tr></thead><tbody>';
            intentions8AM.forEach(i => {
                htmlContent += `<tr><td>${i.personName}</td><td>${i.type}</td><td>$${i.amountPaid.toFixed(2)}</td></tr>`;
            });
            htmlContent += '</tbody></table>';
        } else {
            htmlContent += '<p>No hay intenciones.</p>';
        }

        htmlContent += `<h3>Misa de 7:00 PM</h3>`;
        if(intentions7PM.length > 0) {
            htmlContent += '<table><thead><tr><th>Por quien piden</th><th>Tipo</th><th>Pago</th></tr></thead><tbody>';
            intentions7PM.forEach(i => {
                htmlContent += `<tr><td>${i.personName}</td><td>${i.type}</td><td>$${i.amountPaid.toFixed(2)}</td></tr>`;
            });
            htmlContent += '</tbody></table>';
        } else {
            htmlContent += '<p>No hay intenciones.</p>';
        }

        exportToWord(htmlContent, `Intenciones_${currentParish.replace(/\s/g, '_')}_${viewDate}`);
    };

    return (
        <div>
            {showForm && <IntentionForm onClose={() => setShowForm(false)} onSave={handleSaveIntention} />}
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Intenciones</h1>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                        <FileDownIcon />
                        Exportar a Word
                    </button>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">
                        <PlusCircleIcon />
                        Nueva Intención
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <label className="block text-sm font-medium text-slate-700">Seleccionar fecha para visualizar intenciones:</label>
                <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IntentionsList intentions={intentions} time="8:00 AM" date={viewDate}/>
                <IntentionsList intentions={intentions} time="7:00 PM" date={viewDate}/>
            </div>
        </div>
    );
};

export default Intentions;
