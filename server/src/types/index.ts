export interface LandingPageLayout {
    style: 'modern-saas' | 'corporate' | 'creative-agency' | 'ecommerce' | 'startup' | 'professional-services';
    heroStyle: 'centered' | 'split' | 'video-bg' | 'minimal' | 'bold';
    navStyle: 'transparent' | 'solid' | 'floating';
    features: {
        hasStats: boolean;
        hasPricing: boolean;
        hasTeam: boolean;
        hasFAQ: boolean;
        hasPortfolio: boolean;
        hasCTA: boolean;
        hasNewsletter: boolean;
    };
}

export interface LandingPageColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface CompanyContactInfo {
    email: string;
    phone: string;
    address: string;
}

export interface LandingPageContent {
    hero: {
        headline: string;
        subheadline: string;
        ctaText: string;
        secondaryCta: string | null;
    };
    stats: Array<{ value: string; label: string }>;
    about: {
        title: string;
        description: string;
    };
    features: Array<{
        title: string;
        description: string;
        icon: string;
    }>;
    services: Array<{
        title: string;
        description: string;
        price: string | null;
    }>;
    pricing: Array<{
        name: string;
        price: string;
        features: string[];
        highlighted: boolean;
    }>;
    team: Array<{
        name: string;
        role: string;
        bio: string;
    }>;
    testimonials: Array<{
        name: string;
        role: string;
        company: string;
        content: string;
        rating: number;
    }>;
    faq: Array<{
        question: string;
        answer: string;
    }>;
    cta: {
        headline: string;
        subheadline: string;
        buttonText: string;
    };
}

export interface GeneratedLandingPage {
    layout: LandingPageLayout;
    colors: LandingPageColors;
    content: LandingPageContent;
}
