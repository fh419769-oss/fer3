
export interface User {
  username: string;
  password?: string; // Password should not be stored long-term
}

export interface Receipt {
  id: string; // folio number
  personName: string;
  celebration: string;
  date: string;
  time: string;
  location: string;
  amountPaid: number;
  amountRemaining: number;
  parish: string;
}

export enum IntentionType {
  DIFUNTOS = 'Difuntos',
  ACCION_DE_GRACIAS = 'Acción de Gracias',
  SALUD = 'Salud',
}

export interface Intention {
  id: string;
  personName: string; // Por quien piden
  type: IntentionType;
  time: '8:00 AM' | '7:00 PM';
  amountPaid: number;
  date: string;
  parish: string;
}
