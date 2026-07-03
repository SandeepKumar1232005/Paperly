
import { User, Assignment, ChatMessage, Notification } from '../types';
import { mockUsers, initialAssignments } from '../mockData';

const STORAGE_KEYS = {
  USERS: 'paperly_users_v3',
  ASSIGNMENTS: 'paperly_assignments_v3',
  MESSAGES: 'paperly_messages_v3',
  NOTIFICATIONS: 'paperly_notifications_v3'
};

class LocalDB {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
  }

  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save<T>(key: string, data: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.message?.includes('usage limit')) {
        console.error('LocalStorage quota exceeded. Data could not be saved locally.');
      } else {
        console.error('Error saving to localStorage', e);
      }
    }
  }

  getUsers(): User[] {
    const users = this.get<User>(STORAGE_KEYS.USERS);
    // Deduplicate by email to fix older bugs having multiple user ids for the same email
    const uniqueUsers: Record<string, User> = {};
    for (const u of users) {
      if (u.email) {
        uniqueUsers[u.email.toLowerCase()] = u;
      } else if (u.username) {
        uniqueUsers[u.username.toLowerCase()] = u;
      } else {
        uniqueUsers[u.id] = u;
      }
    }
    return Object.values(uniqueUsers);
  }
  saveUsers(data: User[]) { this.save(STORAGE_KEYS.USERS, data); }
  addUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    this.save(STORAGE_KEYS.USERS, users);
  }

  getAssignments(): Assignment[] { return this.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS); }
  saveAssignments(data: Assignment[]) { this.save(STORAGE_KEYS.ASSIGNMENTS, data); }

  getMessages(): ChatMessage[] { return this.get<ChatMessage>(STORAGE_KEYS.MESSAGES); }
  saveMessages(data: ChatMessage[]) { this.save(STORAGE_KEYS.MESSAGES, data); }

  getNotifications(): Notification[] { return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS); }
  saveNotifications(data: Notification[]) { this.save(STORAGE_KEYS.NOTIFICATIONS, data); }
}

export const db = new LocalDB();
