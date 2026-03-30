import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            next();
        } catch (error) {
            const err = error as any;
            res.status(400).json({ success: false, error: err.errors || 'Validation failed' });
        }
    };
};
