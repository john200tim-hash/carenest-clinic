export interface Bill {
  id: string;
  service: string;
  amount: number;
  dateIssued: Date;
  status: 'paid' | 'unpaid';
}