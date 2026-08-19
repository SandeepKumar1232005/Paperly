
import { User, Assignment } from './types';

export const mockUsers: (User & { password?: string })[] = [
    {
        id: 'admin-1',
        name: 'Charlie Admin',
        email: 'charlie@admin.com',
        username: 'charlie',
        password: 'adminpassword123',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        lastActive: new Date().toISOString()
    },
    {
        id: 'kit27-admin-id',
        name: 'Kit Admin',
        email: 'kit27.cse306@gmail.com',
        username: 'kit27',
        password: 'Pass@123',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KitAdmin',
        lastActive: new Date().toISOString()
    },
    {
        id: 'super-admin-id',
        name: 'Super Admin',
        email: 'admin@paperly.com',
        username: 'admin',
        password: 'adminpassword123',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin',
        lastActive: new Date().toISOString()
    }
];

export const initialAssignments: Assignment[] = [];
