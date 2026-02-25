import OpenAI from 'openai';
import { config } from '../config/env.js';

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

export class OpenAIService {
    async generateLandingPageContent(companyName, companyDescription, theme = 'light') {
        const themeGuidance = theme === 'dark'
            ? 'Use DARK theme colors: dark backgrounds (#0a0a0a, #111111), light text (#ffffff, #f5f5f5), and vibrant accent colors that pop on dark backgrounds.'
            : 'Use LIGHT theme colors: light backgrounds (#ffffff, #f8fafc), dark text (#1f2937, #111827), and professional accent colors.';

        const prompt = `You are an expert web designer and marketing copywriter. Create a STUNNING, UNIQUE landing page design tailored specifically to this company.

COMPANY: ${companyName}
DESCRIPTION: ${companyDescription}
THEME: ${theme.toUpperCase()} - ${themeGuidance}

CRITICAL INSTRUCTIONS:
1. Analyze the company description deeply to understand their industry, target audience, and value proposition
2. Create content that sounds authentic and specific to THIS business (not generic templates)
3. Use industry-appropriate language, tone, and terminology
4. Generate realistic, detailed content for ALL sections

INDUSTRY-SPECIFIC RULES:
- Restaurant/Cafe/Food: Use "ecommerce" style with "bold" hero, show menu items as services, NO pricing tiers, YES team (chef/staff), warm colors (browns, oranges, reds), food-focused testimonials
- Tech/SaaS/Software: Use "modern-saas" style with "centered" hero, YES pricing tiers (3 plans), YES stats (users, uptime, etc.), YES FAQ (technical questions), cool colors (blues, purples, teals)
- Creative Agency/Design: Use "creative-agency" style with "minimal" hero, YES portfolio, NO pricing, vibrant/bold colors, creative testimonials
- Law/Finance/Consulting: Use "professional-services" style with "split" hero, YES stats (cases won, clients, years), YES team (partners), NO pricing, conservative colors (navy, gold, dark blue)
- Healthcare/Medical: Use "corporate" style with "centered" hero, YES team (doctors/staff), YES FAQ (medical questions), calming colors (greens, blues, white)
- E-commerce/Retail: Use "ecommerce" style with "bold" hero, YES stats (products, customers), consider pricing for featured products
- Startup/Innovation: Use "startup" style with "bold" hero, YES stats (growth metrics), YES pricing, modern vibrant colors (purple, cyan, pink)
- Education/Training: Use "corporate" style with "split" hero, YES pricing (course tiers), YES FAQ (enrollment questions), professional colors (blue, green)
- Fitness/Wellness: Use "startup" style with "bold" hero, YES pricing (membership tiers), YES team (trainers), energetic colors (orange, red, green)

Return JSON with this EXACT structure:
{
  "layout": {
    "style": "modern-saas" | "corporate" | "creative-agency" | "ecommerce" | "startup" | "professional-services",
    "heroStyle": "centered" | "split" | "minimal" | "bold",
    "navStyle": "transparent" | "solid" | "floating",
    "features": {
      "hasStats": boolean,
      "hasPricing": boolean,
      "hasTeam": boolean,
      "hasFAQ": boolean,
      "hasPortfolio": boolean,
      "hasCTA": boolean,
      "hasNewsletter": boolean
    }
  },
  "colors": {
    "primary": "#hexcode (industry-appropriate, vibrant main brand color)",
    "secondary": "#hexcode (complementary color that works with primary)",
    "accent": "#hexcode (highlight/CTA color, should pop)",
    "background": "#hexcode (light background color)",
    "text": "#hexcode (dark text color for readability)"
  },
  "content": {
    "hero": {
      "headline": "Compelling, specific headline under 60 chars that captures ${companyName}'s unique value",
      "subheadline": "Clear value proposition under 160 chars explaining what they do and why it matters",
      "ctaText": "Industry-specific action (e.g., 'View Menu', 'Start Free Trial', 'Book Consultation', 'Get Started')",
      "secondaryCta": "Secondary action or null"
    },
    "stats": [
      { "value": "Impressive number", "label": "Relevant metric" },
      { "value": "Another metric", "label": "Another relevant achievement" },
      { "value": "Third metric", "label": "Third achievement" },
      { "value": "Fourth metric", "label": "Fourth achievement (optional)" }
    ],
    "about": {
      "title": "About ${companyName} (or creative variation)",
      "description": "2-3 compelling sentences about the company's mission, history, or unique approach"
    },
    "features": [
      { "title": "Key Benefit 1", "description": "Detailed explanation (2-3 sentences) of this benefit", "icon": "relevant emoji" },
      { "title": "Key Benefit 2", "description": "Detailed explanation", "icon": "relevant emoji" },
      { "title": "Key Benefit 3", "description": "Detailed explanation", "icon": "relevant emoji" },
      { "title": "Key Benefit 4", "description": "Detailed explanation", "icon": "relevant emoji" },
      { "title": "Key Benefit 5", "description": "Detailed explanation", "icon": "relevant emoji" },
      { "title": "Key Benefit 6", "description": "Detailed explanation", "icon": "relevant emoji" }
    ],
    "services": [
      { "title": "Service/Product 1", "description": "Detailed description (2-3 sentences)", "price": "price if relevant or null" },
      { "title": "Service/Product 2", "description": "Detailed description", "price": "price if relevant or null" },
      { "title": "Service/Product 3", "description": "Detailed description", "price": "price if relevant or null" },
      { "title": "Service/Product 4 (optional)", "description": "Detailed description", "price": "price if relevant or null" }
    ],
    "pricing": [
      { "name": "Basic/Starter Plan", "price": "$XX/mo or one-time price", "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"], "highlighted": false },
      { "name": "Pro/Popular Plan", "price": "$XX/mo", "features": ["All Basic features", "Feature 3", "Feature 4", "Feature 5", "Feature 6"], "highlighted": true },
      { "name": "Enterprise/Premium Plan", "price": "$XX/mo or 'Contact Us'", "features": ["All Pro features", "Feature 7", "Feature 8", "Priority support", "Custom solutions"], "highlighted": false }
    ],
    "team": [
      { "name": "Realistic name", "role": "Job title", "bio": "Compelling 1-2 sentence bio highlighting expertise" },
      { "name": "Another name", "role": "Job title", "bio": "Another bio" },
      { "name": "Third person", "role": "Job title", "bio": "Third bio" }
    ],
    "testimonials": [
      { "name": "Realistic customer name", "role": "Job title", "company": "Company name", "content": "Specific, detailed testimonial (2-3 sentences) mentioning concrete results or benefits", "rating": 5 },
      { "name": "Another customer", "role": "Job title", "company": "Company", "content": "Another detailed testimonial with specific praise", "rating": 5 },
      { "name": "Third customer", "role": "Job title", "company": "Company", "content": "Third detailed testimonial", "rating": 5 }
    ],
    "faq": [
      { "question": "Industry-relevant question customers actually ask?", "answer": "Detailed, helpful answer (2-3 sentences)" },
      { "question": "Another common question?", "answer": "Detailed answer" },
      { "question": "Third question?", "answer": "Detailed answer" },
      { "question": "Fourth question?", "answer": "Detailed answer" },
      { "question": "Fifth question?", "answer": "Detailed answer" }
    ],
    "cta": {
      "headline": "Compelling final call-to-action headline",
      "subheadline": "Supporting text that creates urgency or reinforces value",
      "buttonText": "Clear action button text"
    }
  }
}

QUALITY REQUIREMENTS:
- Headlines must be punchy, specific, and benefit-focused (not generic)
- Descriptions must be detailed and informative (not vague)
- Testimonials must sound authentic with specific details
- FAQ must address real questions customers would have
- Stats must be realistic and relevant to the industry
- Features must highlight actual benefits, not just features
- Use industry-appropriate emojis for icons

Return ONLY valid JSON. No markdown formatting, no explanations.`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert web designer and content strategist. Analyze companies deeply to create perfectly tailored landing pages. Return only valid JSON.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
            });

            const responseText = response.choices[0].message.content || '';
            const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned);

            // Validate and provide fallbacks
            return this.validateAndFillDefaults(parsed, companyName, companyDescription);
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Failed to generate landing page content');
        }
    }

    validateAndFillDefaults(parsed, companyName, companyDescription) {
        const defaultContent = {
            hero: {
                headline: `Welcome to ${companyName}`,
                subheadline: companyDescription || 'Your trusted partner for success',
                ctaText: 'Get Started',
                secondaryCta: 'Learn More',
            },
            stats: [
                { value: '100+', label: 'Happy Clients' },
                { value: '50+', label: 'Projects Completed' },
                { value: '5+', label: 'Years Experience' },
            ],
            about: {
                title: `About ${companyName}`,
                description: companyDescription || `${companyName} is dedicated to providing exceptional services and solutions.`,
            },
            features: [
                { title: 'Quality Service', description: 'We deliver excellence in everything we do.', icon: '⭐' },
                { title: 'Expert Team', description: 'Our professionals are here to help you succeed.', icon: '👥' },
                { title: 'Fast Delivery', description: 'Quick turnaround without compromising quality.', icon: '🚀' },
            ],
            services: [
                { title: 'Consulting', description: 'Expert guidance for your needs.', price: null },
                { title: 'Implementation', description: 'End-to-end solution delivery.', price: null },
                { title: 'Support', description: '24/7 customer support.', price: null },
            ],
            pricing: [
                { name: 'Basic', price: '$29/mo', features: ['Feature 1', 'Feature 2'], highlighted: false },
                { name: 'Pro', price: '$59/mo', features: ['All Basic features', 'Feature 3', 'Feature 4'], highlighted: true },
                { name: 'Enterprise', price: 'Contact Us', features: ['All Pro features', 'Custom solutions'], highlighted: false },
            ],
            team: [
                { name: 'John Doe', role: 'CEO', bio: 'Founder and visionary leader.' },
                { name: 'Jane Smith', role: 'CTO', bio: 'Technical expert with 10+ years experience.' },
            ],
            testimonials: [
                { name: 'Customer Name', role: 'CEO', company: 'Company', content: 'Amazing service and great results!', rating: 5 },
            ],
            faq: [
                { question: 'How do I get started?', answer: 'Simply contact us and we will guide you through the process.' },
                { question: 'What is your pricing?', answer: 'We offer flexible pricing options to suit your needs.' },
            ],
            cta: {
                headline: 'Ready to Get Started?',
                subheadline: 'Contact us today to learn more.',
                buttonText: 'Contact Us',
            },
        };

        const defaultLayout = {
            style: 'modern-saas',
            heroStyle: 'centered',
            navStyle: 'solid',
            features: {
                hasStats: true,
                hasPricing: true,
                hasTeam: false,
                hasFAQ: true,
                hasPortfolio: false,
                hasCTA: true,
                hasNewsletter: true,
            },
        };

        const defaultColors = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#f59e0b',
            background: '#f8fafc',
            text: '#1f2937',
        };

        // Merge with defaults
        const safeContent = {
            hero: { ...defaultContent.hero, ...(parsed.content?.hero || {}) },
            stats: parsed.content?.stats?.length ? parsed.content.stats : defaultContent.stats,
            about: { ...defaultContent.about, ...(parsed.content?.about || {}) },
            features: parsed.content?.features?.length ? parsed.content.features : defaultContent.features,
            services: parsed.content?.services?.length ? parsed.content.services : defaultContent.services,
            pricing: parsed.content?.pricing?.length ? parsed.content.pricing : defaultContent.pricing,
            team: parsed.content?.team?.length ? parsed.content.team : defaultContent.team,
            testimonials: parsed.content?.testimonials?.length ? parsed.content.testimonials : defaultContent.testimonials,
            faq: parsed.content?.faq?.length ? parsed.content.faq : defaultContent.faq,
            cta: { ...defaultContent.cta, ...(parsed.content?.cta || {}) },
        };

        const safeLayout = {
            style: parsed.layout?.style || defaultLayout.style,
            heroStyle: parsed.layout?.heroStyle || defaultLayout.heroStyle,
            navStyle: parsed.layout?.navStyle || defaultLayout.navStyle,
            features: { ...defaultLayout.features, ...(parsed.layout?.features || {}) },
        };

        const safeColors = { ...defaultColors, ...(parsed.colors || {}) };

        return {
            layout: safeLayout,
            colors: safeColors,
            content: safeContent,
        };
    }
}

export const openaiService = new OpenAIService();
