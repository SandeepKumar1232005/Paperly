
import { db } from './db';

export const paymentGateway = {
  async processPayment(assignmentId: string, amount: number): Promise<boolean> {
    return true;
  },

  async releaseEscrow(assignmentId: string, amount: number, writerId: string): Promise<void> {
    const users = db.getUsers();
    const writerIdx = users.findIndex(u => u.id === writerId);
    if (writerIdx !== -1) {
      users[writerIdx].balance = (users[writerIdx].balance || 0) + (amount * 0.85); // 15% platform fee
      db.saveUsers(users);
    }
  }
};
