import { landingPageService } from '../services/landingPage.service.js';
import { z } from 'zod';

const generateSchema = z.object({
    companyName: z.string().min(1).max(200),
    companyDescription: z.string().min(1),
    logoBase64: z.string().min(1),
    companyEmail: z.string().email('Invalid email address'),
    companyPhone: z.string().min(1, 'Phone number is required'),
    companyAddress: z.string().min(1, 'Address is required'),
    theme: z.enum(['light', 'dark']).default('light'),
});

export class LandingPagesController {
    async generate(req, res, next) {
        try {
            const validation = generateSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors,
                });
            }

            const { companyName, companyDescription, logoBase64, companyEmail, companyPhone, companyAddress, theme } = validation.data;

            const result = await landingPageService.generateLandingPage(
                companyName,
                companyDescription,
                logoBase64,
                { email: companyEmail, phone: companyPhone, address: companyAddress },
                theme
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const landingPage = await landingPageService.getLandingPageById(id);

            if (!landingPage) {
                return res.status(404).json({ error: 'Landing page not found' });
            }

            res.json(landingPage);
        } catch (error) {
            next(error);
        }
    }

    async getByPublicUrl(req, res, next) {
        try {
            const { publicUrl } = req.params;
            const landingPage = await landingPageService.getLandingPageByPublicUrl(publicUrl);

            if (!landingPage) {
                return res.status(404).json({ error: 'Landing page not found' });
            }

            res.json(landingPage);
        } catch (error) {
            next(error);
        }
    }

    async regenerateSection(req, res, next) {
        try {
            const { id, sectionType } = req.params;

            const result = await landingPageService.regenerateSection(id, sectionType);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const landingPagesController = new LandingPagesController();
