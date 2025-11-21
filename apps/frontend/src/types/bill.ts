export interface Bill {
  id: string;
  item: string; // Changed from description
  bill: number; // Changed from amount
  date: Date;
  status: string;
}

export {};