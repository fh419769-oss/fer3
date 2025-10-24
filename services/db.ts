
import { User, Receipt, Intention } from '../types';

// --- User Management ---
export const getAllUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: User): boolean => {
  const users = getAllUsers();
  const existingUser = users.find(u => u.username === user.username);
  if (existingUser) {
    return false; // User already exists
  }
  const updatedUsers = [...users, user];
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  return true;
};

// --- Receipt Management ---
const getReceiptsKey = (parish: string) => `receipts_${parish}`;

export const getAllReceipts = (parish: string): Receipt[] => {
  const receipts = localStorage.getItem(getReceiptsKey(parish));
  return receipts ? JSON.parse(receipts) : [];
};

export const getReceiptById = (id: string, parish: string): Receipt | undefined => {
  return getAllReceipts(parish).find(r => r.id === id);
};

export const saveReceipt = (receipt: Receipt, parish: string): { success: boolean, message: string } => {
  const receipts = getAllReceipts(parish);
  const existingIndex = receipts.findIndex(r => r.id === receipt.id);

  if (existingIndex !== -1) {
    const existingReceipt = receipts[existingIndex];
    if(existingReceipt.amountRemaining === 0) {
        return { success: false, message: `El folio ${receipt.id} ya existe y está liquidado.` };
    }
    // Update existing receipt
    receipts[existingIndex] = receipt;
     return { success: true, message: `Recibo ${receipt.id} actualizado.` };
  } else {
    // Add new receipt
    receipts.push(receipt);
  }
  
  localStorage.setItem(getReceiptsKey(parish), JSON.stringify(receipts));
  return { success: true, message: 'Recibo guardado exitosamente.'};
};

// --- Intention Management ---
const getIntentionsKey = (parish: string) => `intentions_${parish}`;

export const getAllIntentions = (parish: string): Intention[] => {
  const intentions = localStorage.getItem(getIntentionsKey(parish));
  return intentions ? JSON.parse(intentions) : [];
};

export const saveIntention = (intention: Intention, parish: string) => {
  const intentions = getAllIntentions(parish);
  // Simple push, can add update logic if needed
  intentions.push(intention);
  localStorage.setItem(getIntentionsKey(parish), JSON.stringify(intentions));
};
