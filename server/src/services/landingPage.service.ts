import { prisma } from '../config/database';
import { openaiService } from './openai.service';
import { codeGenerationService } from './codeGeneration.service';
import type { GeneratedLandingPage } from '../types';
import crypto from 'crypto';

export class LandingPageService {
    async generateLandingPage(
        companyName: string,
        companyDescription: string,
        logoBase64: string,
        contactInfo: { email: string; phone: string; address: string },
        theme: 'light' | 'dark' = 'light'
    ) {
        // Generate content using OpenAI
        const generatedData: GeneratedLandingPage = await openaiService.generateLandingPageContent(
            companyName,
            companyDescription,
            theme
        );

        // Generate HTML and React code
        const htmlCode = codeGenerationService.generateHTML(companyName, generatedData, logoBase64, contactInfo, theme);
        const reactCode = codeGenerationService.generateReact(companyName, generatedData, logoBase64, contactInfo, theme);

        // Create or find company
        let company = await prisma.company.findFirst({
            where: { name: companyName },
        });

        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: companyName,
                    description: companyDescription,
                    logoUrl: logoBase64,
                },
            });
        }

        // Create landing page
        const publicUrl = crypto.randomBytes(16).toString('hex');

        const landingPage = await prisma.landingPage.create({
            data: {
                companyId: company.id,
                layout: generatedData.layout as any,
                colors: generatedData.colors as any,
                content: generatedData.content as any,
                htmlCode,
                reactCode,
                publicUrl,
                isPublished: false,
            },
        });

        // Create sections
        const sectionTypes = ['hero', 'features', 'services', 'testimonials', 'cta', 'contact'];
        await Promise.all(
            sectionTypes.map((sectionType, index) =>
                prisma.pageSection.create({
                    data: {
                        landingPageId: landingPage.id,
                        sectionType,
                        content: (generatedData.content as any)[sectionType] || {},
                        order: index,
                    },
                })
            )
        );

        return {
            id: landingPage.id,
            html: htmlCode,
            react: reactCode,
            content: generatedData.content,
            colors: generatedData.colors,
            layout: generatedData.layout,
            publicUrl,
        };
    }

    async getLandingPageById(id: string) {
        const landingPage = await prisma.landingPage.findUnique({
            where: { id },
            include: {
                company: true,
                sections: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return landingPage;
    }

    async getLandingPageByPublicUrl(publicUrl: string) {
        const landingPage = await prisma.landingPage.findUnique({
            where: { publicUrl },
            include: {
                company: true,
            },
        });

        return landingPage;
    }

    async regenerateSection(landingPageId: string, sectionType: string) {
        const landingPage = await prisma.landingPage.findUnique({
            where: { id: landingPageId },
            include: { company: true },
        });

        if (!landingPage) {
            throw new Error('Landing page not found');
        }

        // Regenerate content for specific section using OpenAI
        const generatedData = await openaiService.generateLandingPageContent(
            landingPage.company.name,
            landingPage.company.description
        );

        // Update the section
        await prisma.pageSection.updateMany({
            where: {
                landingPageId,
                sectionType,
            },
            data: {
                content: (generatedData.content as any)[sectionType] || {},
            },
        });

        // Update landing page content
        const updatedContent = { ...(landingPage.content as Record<string, unknown>), [sectionType]: (generatedData.content as any)[sectionType] };

        await prisma.landingPage.update({
            where: { id: landingPageId },
            data: {
                content: updatedContent as any,
            },
        });

        return {
            sectionType,
            content: (generatedData.content as any)[sectionType],
        };
    }
}

export const landingPageService = new LandingPageService();
