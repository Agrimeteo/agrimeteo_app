import { supabaseServiceClient } from '../config/supabase.js';
import { getMe } from '../services/authService.js';
import type { Request, Response, NextFunction } from 'express';

export type AuthenticatedUser = {
    id: string;
    email?: string;
    role?: string;
    full_name?: string;
    user_metadata?: Record<string, unknown>;
};

export type AuthRequest = Request & { user?: AuthenticatedUser };

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    try {
        const user = await getMe(token);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
        const { data: profile } = await supabaseServiceClient
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .maybeSingle();

        req.user = {
            id: user.id,
            email: user.email,
            full_name: profile?.full_name ?? (typeof metadata.full_name === 'string' ? metadata.full_name : undefined),
            role: profile?.role ?? (typeof metadata.role === 'string' ? metadata.role : undefined),
            user_metadata: metadata,
        };

        next();

    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};
