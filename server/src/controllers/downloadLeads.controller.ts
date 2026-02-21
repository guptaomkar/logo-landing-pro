import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { z } from 'zod';

const downloadLeadSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    contactNumber: z.string().min(1).max(20),
    businessName: z.string().min(1).max(200),
    location: z.string().min(1).max(200),
    downloadFormat: z.enum(['html', 'react']),
});

export class DownloadLeadsController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = downloadLeadSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors,
                });
            }

            const lead = await prisma.downloadLead.create({
                data: validation.data,
            });

            res.status(201).json({ success: true, id: lead.id });
        } catch (error) {
            next(error);
        }
    }
}

export const downloadLeadsController = new DownloadLeadsController();
