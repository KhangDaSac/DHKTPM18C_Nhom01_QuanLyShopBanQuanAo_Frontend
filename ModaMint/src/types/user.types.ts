// src/types/user.types.ts
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dob?: string;
    image?: string;
    roles?: string[];
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface AuthenticationRequest {
    username: string;
    password: string;
}

export interface AuthenticationResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}