export type Transaction = {
  id: number;
  ofUser: number;
  referenceId: number;
  content: string;
  amount: number;
  transactionType: number;
  createdAt: string;
};
