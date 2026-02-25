import { prisma } from '../config/database.js';
import { openaiService } from './openai.service.js';
import { codeGenerationService } from './codeGeneration.service.js';
import crypto from 'crypto';

export class LandingPageService {
    async generateLandingPage(
        companyName,
        companyDescription,
        logoBase64,
        contactInfo,
        theme = 'light'
    ) {
        // Generate content using OpenAI
        const generatedData = await openaiService.generateLandingPageContent(
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
                layout: generatedData.layout,
                colors: generatedData.colors,
                content: generatedData.content,
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
                        content: generatedData.content[sectionType] || {},
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

    async getLandingPageById(id) {
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

    async getLandingPageByPublicUrl(publicUrl) {
        const landingPage = await prisma.landingPage.findUnique({
            where: { publicUrl },
            include: {
                company: true,
            },
        });

        return landingPage;
    }

    async regenerateSection(landingPageId, sectionType) {
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
                content: generatedData.content[sectionType] || {},
            },
        });

        // Update landing page content
        const updatedContent = { ...landingPage.content, [sectionType]: generatedData.content[sectionType] };

        await prisma.landingPage.update({
            where: { id: landingPageId },
            data: {
                content: updatedContent,
            },
        });

        return {
            sectionType,
            content: generatedData.content[sectionType],
        };
    }
}

export const landingPageService = new LandingPageService();
