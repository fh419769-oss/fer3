
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../App';
import { Receipt } from '../types';
import { getAllReceipts, saveReceipt, getReceiptById } from '../services/db';
import { PlusCircleIcon, SearchIcon, XIcon } from './icons';

const ReceiptForm: React.FC<{
  onClose: () => void;
  onSave: (receipt: Receipt) => void;
  existingReceipt: Receipt | null;
}> = ({ onClose, onSave, existingReceipt }) => {
    const [id, setId] = useState(existingReceipt?.id || '');
    const [personName, setPersonName] = useState(existingReceipt?.personName || '');
    const [celebration, setCelebration] = useState(existingReceipt?.celebration || '');
    const [date, setDate] = useState(existingReceipt?.date || '');
    const [time, setTime] = useState(existingReceipt?.time || '');
    const [location, setLocation] = useState(existingReceipt?.location || '');
    const [amountPaid, setAmountPaid] = useState(existingReceipt?.amountPaid.toString() || '');
    const [amountRemaining, setAmountRemaining] = useState(existingReceipt?.amountRemaining.toString() || '');
    const [error, setError] = useState('');
    const { currentParish } = useContext(AppContext);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!id) {
            setError('El número de folio es obligatorio.');
            return;
        }

        const newReceipt: Receipt = {
            id,
            personName,
            celebration,
            date,
            time,
            location,
            amountPaid: parseFloat(amountPaid) || 0,
            amountRemaining: parseFloat(amountRemaining) || 0,
            parish: currentParish,
        };
        onSave(newReceipt);
    };
    
    useEffect(() => {
        if(id && !existingReceipt) {
            const found = getReceiptById(id, currentParish);
            if(found) {
                if(found.amountRemaining === 0) {
                     setError(`Folio ${id} ya existe y está liquidado. No se puede modificar.`);
                } else {
                     setError(`Folio ${id} ya existe con un saldo pendiente de $${found.amountRemaining}. Se actualizarán los datos.`);
                     setPersonName(found.personName);
                     setCelebration(found.celebration);
                     setDate(found.date);
                     setTime(found.time);
                     setLocation(found.location);
                     setAmountPaid(found.amountPaid.toString());
                     setAmountRemaining(found.amountRemaining.toString());
                }
            } else {
                setError('');
            }
        }
    }, [id, existingReceipt, currentParish]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{existingReceipt ? 'Editar' : 'Nuevo'} Recibo</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon/></button>
        </div>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Número de Recibo (Folio)</label>
                <input type="text" value={id} onChange={e => setId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Nombre de quien solicita</label>
                <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Celebración</label>
                <input type="text" value={celebration} onChange={e => setCelebration(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Día de la Celebración</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Hora</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Lugar</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Deja a cuenta ($)</label>
                <input type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Resta ($)</label>
                <input type="number" step="0.01" value={amountRemaining} onChange={e => setAmountRemaining(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Guardar Recibo</button>
            </div>
        </form>
      </div>
    </div>
  );
};

const Receipts: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const { currentParish } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('id');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const loadReceipts = () => {
    setReceipts(getAllReceipts(currentParish));
  };
  
  useEffect(() => {
    loadReceipts();
  }, [currentParish]);

  const handleSaveReceipt = (receipt: Receipt) => {
    const result = saveReceipt(receipt, currentParish);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if(result.success) {
        loadReceipts();
        setShowForm(false);
    }
    setTimeout(() => setMessage(null), 5000);
  };
  
  const filteredReceipts = useMemo(() => {
    if (!searchTerm) return receipts;
    return receipts.filter(r => {
        const value = r[searchField as keyof Receipt];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [receipts, searchTerm, searchField]);

  return (
    <div>
        {showForm && <ReceiptForm onClose={() => setShowForm(false)} onSave={handleSaveReceipt} existingReceipt={null} />}
        
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Recibos y Pagos</h1>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">
                <PlusCircleIcon />
                Nuevo Recibo
            </button>
        </div>

        {message && (
             <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
             </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Consultar Recibos</h2>
            <div className="flex items-center gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input type="text" placeholder={`Buscar por ${searchField}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full p-3 pl-10 text-sm text-slate-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-sky-500 focus:border-sky-500"/>
                </div>
                <select value={searchField} onChange={e => setSearchField(e.target.value)} className="p-3 text-sm text-slate-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-sky-500 focus:border-sky-500">
                    <option value="id">Folio</option>
                    <option value="personName">Nombre</option>
                    <option value="celebration">Celebración</option>
                    <option value="date">Día</option>
                </select>
            </div>
            {searchTerm && getReceiptById(searchTerm, currentParish)?.amountRemaining > 0 && 
                <p className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    El recibo con folio <strong>{searchTerm}</strong> tiene un pago pendiente.
                </p>
            }
             {searchTerm && !getReceiptById(searchTerm, currentParish) && 
                <p className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md">
                    No se encontró un recibo con el folio <strong>{searchTerm}</strong>.
                </p>
            }
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Folio</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Celebración</th>
                            <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                            <th scope="col" className="px-6 py-3">Pagado</th>
                            <th scope="col" className="px-6 py-3">Restante</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map(r => (
                            <tr key={r.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-slate-900">{r.id}</td>
                                <td className="px-6 py-4">{r.personName}</td>
                                <td className="px-6 py-4">{r.celebration}</td>
                                <td className="px-6 py-4">{r.date} {r.time}</td>
                                <td className="px-6 py-4">${r.amountPaid.toFixed(2)}</td>
                                <td className="px-6 py-4">${r.amountRemaining.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    {r.amountRemaining === 0 ? 
                                        <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Liquidado</span> :
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Pendiente</span>
                                    }
                                </td>
                            </tr>
                        ))}
                         {filteredReceipts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-500">
                                    <p className="font-semibold">No se encontraron recibos</p>
                                    <p className="text-sm">Intente ajustar su búsqueda o agregue un nuevo recibo.</p>
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

export default Receipts;
