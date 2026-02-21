export type UserRole = 'ADMIN' | 'PROVIDER' | 'CLIENT';

export interface User {
    id: number;
    email: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    provider_profile?: {
        business_name: string;
        is_verified: boolean;
    };
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User; // We might need to fetch user separately or include it in login response
}
