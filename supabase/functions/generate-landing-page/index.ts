import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, companyDescription, logoBase64 } = await req.json();
    
    if (!companyName || !companyDescription || !logoBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating landing page for:', companyName);
    console.log('Company description:', companyDescription);

    // Combined prompt for structure, colors, and content
    const mainPrompt = `You are an expert web designer. Create a UNIQUE landing page design tailored specifically to this company.

COMPANY: ${companyName}
DESCRIPTION: ${companyDescription}

CRITICAL: Each company type requires a COMPLETELY DIFFERENT layout and structure:

INDUSTRY-SPECIFIC RULES:
- Restaurant/Cafe/Food: Use "ecommerce" style with "bold" hero, show menu items as services, NO pricing tiers, YES team (chef/staff), warm colors (browns, oranges, reds)
- Tech/SaaS/Software: Use "modern-saas" style with "centered" hero, YES pricing tiers, YES stats, YES FAQ, cool colors (blues, purples)
- Creative Agency/Design: Use "creative-agency" style with "minimal" hero, YES portfolio, NO pricing, vibrant/bold colors
- Law/Finance/Consulting: Use "professional-services" style with "split" hero, YES stats, YES team, NO pricing, conservative colors (navy, gold)
- Healthcare/Medical: Use "corporate" style with "centered" hero, YES team (doctors), YES FAQ, calming colors (greens, blues)
- E-commerce/Retail: Use "ecommerce" style with "bold" hero, YES stats, consider pricing for products
- Startup/Innovation: Use "startup" style with "bold" hero, YES stats, YES pricing, modern vibrant colors
- Education/Training: Use "corporate" style with "split" hero, YES pricing (courses), YES FAQ, professional colors
- Fitness/Wellness: Use "startup" style with "bold" hero, YES pricing (memberships), YES team, energetic colors

Return JSON:
{
  "layout": {
    "style": "modern-saas" | "corporate" | "creative-agency" | "ecommerce" | "startup" | "professional-services",
    "heroStyle": "centered" | "split" | "video-bg" | "minimal" | "bold",
    "navStyle": "transparent" | "solid" | "floating",
    "features": {
      "hasStats": boolean (true for B2B, consulting, agencies),
      "hasPricing": boolean (true for SaaS, courses, memberships - false for restaurants, agencies),
      "hasTeam": boolean (true for restaurants, medical, law firms),
      "hasFAQ": boolean (true for complex services, SaaS),
      "hasPortfolio": boolean (true for creative agencies, photographers),
      "hasCTA": boolean (usually true),
      "hasNewsletter": boolean (true for content-focused businesses)
    }
  },
  "colors": {
    "primary": "#hexcode (industry-appropriate main brand color)",
    "secondary": "#hexcode (complementary color)",
    "accent": "#hexcode (highlight/CTA color)",
    "background": "#hexcode (page background)",
    "text": "#hexcode (main text color)"
  },
  "content": {
    "hero": {
      "headline": "compelling headline under 60 chars specific to ${companyName}",
      "subheadline": "value proposition under 160 chars",
      "ctaText": "action button (industry-specific: 'View Menu', 'Get Started', 'Book Consultation', etc.)",
      "secondaryCta": "secondary CTA or null"
    },
    "stats": [{ "value": "100+", "label": "Relevant metric" }],
    "about": { "title": "About section title", "description": "2-3 sentences about ${companyName}" },
    "features": [{ "title": "Feature/Benefit", "description": "1-2 sentences", "icon": "relevant emoji" }],
    "services": [{ "title": "Service/Product", "description": "1-2 sentences", "price": "price if relevant or null" }],
    "pricing": [{ "name": "Plan", "price": "$XX/mo", "features": ["f1", "f2"], "highlighted": boolean }],
    "team": [{ "name": "Name", "role": "Title", "bio": "Short bio" }],
    "testimonials": [{ "name": "Customer", "role": "Title", "company": "Company", "content": "Review quote", "rating": 5 }],
    "faq": [{ "question": "Industry-relevant question?", "answer": "Answer" }],
    "cta": { "headline": "Final CTA", "subheadline": "Supporting text", "buttonText": "Action" }
  }
}

MANDATORY: Vary the features.has* booleans based on the company type. A coffee shop should NOT have pricing tiers. A SaaS should NOT have a team section prominently. Match the structure to what makes sense for THIS specific business.

Return ONLY valid JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert web designer and content strategist. Analyze companies deeply to create perfectly tailored landing pages. Return only valid JSON.' 
          },
          { role: 'user', content: mainPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      throw new Error('AI API error');
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    let parsed;
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Content:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Validate and provide fallbacks for all required fields
    const defaultContent = {
      hero: {
        headline: `Welcome to ${companyName}`,
        subheadline: companyDescription || 'Your trusted partner for success',
        ctaText: 'Get Started',
        secondaryCta: 'Learn More'
      },
      stats: [
        { value: '100+', label: 'Happy Clients' },
        { value: '50+', label: 'Projects Completed' },
        { value: '5+', label: 'Years Experience' }
      ],
      about: {
        title: `About ${companyName}`,
        description: companyDescription || `${companyName} is dedicated to providing exceptional services and solutions.`
      },
      features: [
        { title: 'Quality Service', description: 'We deliver excellence in everything we do.', icon: '⭐' },
        { title: 'Expert Team', description: 'Our professionals are here to help you succeed.', icon: '👥' },
        { title: 'Fast Delivery', description: 'Quick turnaround without compromising quality.', icon: '🚀' }
      ],
      services: [
        { title: 'Consulting', description: 'Expert guidance for your needs.', price: null },
        { title: 'Implementation', description: 'End-to-end solution delivery.', price: null },
        { title: 'Support', description: '24/7 customer support.', price: null }
      ],
      pricing: [
        { name: 'Basic', price: '$29/mo', features: ['Feature 1', 'Feature 2'], highlighted: false },
        { name: 'Pro', price: '$59/mo', features: ['All Basic features', 'Feature 3', 'Feature 4'], highlighted: true },
        { name: 'Enterprise', price: 'Contact Us', features: ['All Pro features', 'Custom solutions'], highlighted: false }
      ],
      team: [
        { name: 'John Doe', role: 'CEO', bio: 'Founder and visionary leader.' },
        { name: 'Jane Smith', role: 'CTO', bio: 'Technical expert with 10+ years experience.' }
      ],
      testimonials: [
        { name: 'Customer Name', role: 'CEO', company: 'Company', content: 'Amazing service and great results!', rating: 5 }
      ],
      faq: [
        { question: 'How do I get started?', answer: 'Simply contact us and we will guide you through the process.' },
        { question: 'What is your pricing?', answer: 'We offer flexible pricing options to suit your needs.' }
      ],
      cta: {
        headline: 'Ready to Get Started?',
        subheadline: 'Contact us today to learn more.',
        buttonText: 'Contact Us'
      }
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
        hasNewsletter: true
      }
    };

    const defaultColors = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#f8fafc',
      text: '#1f2937'
    };

    // Merge with defaults to ensure all fields exist
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
      cta: { ...defaultContent.cta, ...(parsed.content?.cta || {}) }
    };

    const safeLayout = {
      style: parsed.layout?.style || defaultLayout.style,
      heroStyle: parsed.layout?.heroStyle || defaultLayout.heroStyle,
      navStyle: parsed.layout?.navStyle || defaultLayout.navStyle,
      features: { ...defaultLayout.features, ...(parsed.layout?.features || {}) }
    };

    const safeColors = { ...defaultColors, ...(parsed.colors || {}) };

    const safeData = {
      layout: safeLayout,
      colors: safeColors,
      content: safeContent
    };

    console.log('Generated layout:', JSON.stringify(safeLayout, null, 2));
    console.log('Generated colors:', JSON.stringify(safeColors, null, 2));

    const html = generateHTML(companyName, safeData, logoBase64);
    const react = generateReact(companyName, safeData, logoBase64);

    return new Response(
      JSON.stringify({
        html,
        react,
        content: safeContent,
        colors: safeColors,
        layout: safeLayout,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateHTML(companyName: string, data: any, logoBase64: string) {
  const { layout, colors, content } = data;
  const c = colors;
  const f = layout.features;
  
  const heroStyles: Record<string, string> = {
    'centered': `text-align: center; padding: 120px 20px;`,
    'split': `display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: 80px 20px; gap: 60px;`,
    'minimal': `text-align: center; padding: 150px 20px; background: ${c.background};`,
    'bold': `text-align: center; padding: 100px 20px; position: relative;`,
    'video-bg': `text-align: center; padding: 120px 20px; position: relative;`,
  };

  const layoutStyles: Record<string, { bodyBg: string, sectionAlt: string }> = {
    'modern-saas': { bodyBg: '#ffffff', sectionAlt: '#f8fafc' },
    'corporate': { bodyBg: '#ffffff', sectionAlt: '#f3f4f6' },
    'creative-agency': { bodyBg: '#0a0a0a', sectionAlt: '#111111' },
    'ecommerce': { bodyBg: '#ffffff', sectionAlt: '#fafafa' },
    'startup': { bodyBg: '#ffffff', sectionAlt: '#f0f9ff' },
    'professional-services': { bodyBg: '#ffffff', sectionAlt: '#f9fafb' },
  };

  const isDark = layout.style === 'creative-agency';
  const textColor = isDark ? '#ffffff' : c.text || '#1f2937';
  const mutedText = isDark ? '#a1a1aa' : '#6b7280';
  const ls = layoutStyles[layout.style] || layoutStyles['modern-saas'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - ${content.hero.headline}</title>
  <meta name="description" content="${content.hero.subheadline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: ${textColor};
      background: ${ls.bodyBg};
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    
    /* Navigation */
    nav {
      position: ${layout.navStyle === 'floating' ? 'fixed' : 'absolute'};
      top: ${layout.navStyle === 'floating' ? '20px' : '0'};
      left: 0; right: 0;
      z-index: 100;
      padding: 20px 0;
      ${layout.navStyle === 'solid' ? `background: ${isDark ? '#111' : '#fff'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);` : ''}
      ${layout.navStyle === 'floating' ? `margin: 0 auto; max-width: 1160px; background: ${isDark ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.95)'}; backdrop-filter: blur(10px); border-radius: 100px; padding: 12px 30px;` : ''}
    }
    nav .container { display: flex; justify-content: space-between; align-items: center; }
    .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; }
    .nav-logo img { height: 40px; width: auto; }
    .nav-logo span { font-weight: 700; font-size: 1.25rem; }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a { text-decoration: none; color: ${isDark ? '#e5e5e5' : '#4b5563'}; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover { color: ${c.primary}; }
    .nav-cta {
      background: ${c.primary};
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 12px ${c.primary}40; }
    
    /* Hero */
    .hero { 
      background: ${layout.heroStyle === 'bold' ? `linear-gradient(135deg, ${c.primary}, ${c.secondary})` : isDark ? '#0a0a0a' : `linear-gradient(180deg, ${c.background || '#f8fafc'} 0%, #ffffff 100%)`};
      color: ${layout.heroStyle === 'bold' ? 'white' : textColor};
      ${heroStyles[layout.heroStyle] || heroStyles['centered']}
      min-height: ${layout.heroStyle === 'minimal' ? '90vh' : '80vh'};
      display: flex;
      align-items: center;
      position: relative;
    }
    .hero-content { ${layout.heroStyle === 'split' ? '' : 'max-width: 800px; margin: 0 auto;'} }
    .hero h1 { 
      font-size: clamp(2.5rem, 5vw, 4rem); 
      font-weight: 800; 
      margin-bottom: 24px; 
      line-height: 1.1;
      ${layout.heroStyle !== 'bold' ? `background: linear-gradient(135deg, ${c.primary}, ${c.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;` : ''}
    }
    .hero p { font-size: 1.25rem; margin-bottom: 32px; opacity: 0.9; color: ${layout.heroStyle === 'bold' ? 'rgba(255,255,255,0.9)' : mutedText}; max-width: 600px; ${layout.heroStyle === 'centered' || layout.heroStyle === 'bold' ? 'margin-left: auto; margin-right: auto;' : ''} }
    .hero-buttons { display: flex; gap: 16px; ${layout.heroStyle === 'centered' || layout.heroStyle === 'bold' ? 'justify-content: center;' : ''} flex-wrap: wrap; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 16px 32px;
      background: ${layout.heroStyle === 'bold' ? 'white' : c.primary};
      color: ${layout.heroStyle === 'bold' ? c.primary : 'white'};
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s;
      box-shadow: 0 4px 14px ${c.primary}30;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px ${c.primary}40; }
    .btn-secondary {
      padding: 16px 32px;
      background: transparent;
      color: ${layout.heroStyle === 'bold' ? 'white' : textColor};
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      border: 2px solid ${layout.heroStyle === 'bold' ? 'rgba(255,255,255,0.3)' : c.primary + '30'};
      transition: all 0.3s;
    }
    .btn-secondary:hover { background: ${layout.heroStyle === 'bold' ? 'rgba(255,255,255,0.1)' : c.primary + '10'}; }
    
    /* Stats */
    .stats { padding: 60px 0; background: ${isDark ? '#111' : ls.sectionAlt}; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; text-align: center; }
    .stat-item h3 { font-size: 3rem; font-weight: 800; color: ${c.primary}; margin-bottom: 8px; }
    .stat-item p { color: ${mutedText}; font-weight: 500; }
    
    /* Section Styles */
    section { padding: 100px 0; }
    .section-header { text-align: center; max-width: 700px; margin: 0 auto 60px; }
    .section-header h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 16px; color: ${textColor}; }
    .section-header p { color: ${mutedText}; font-size: 1.1rem; }
    .section-alt { background: ${ls.sectionAlt}; }
    
    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }
    .feature-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 32px;
      border-radius: 16px;
      ${isDark ? '' : 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'}
      border: 1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'};
      transition: all 0.3s;
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15); border-color: ${c.primary}40; }
    .feature-card .icon { 
      font-size: 2.5rem; 
      margin-bottom: 20px;
      width: 60px; height: 60px;
      display: flex; align-items: center; justify-content: center;
      background: ${c.primary}15;
      border-radius: 12px;
    }
    .feature-card h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 12px; color: ${textColor}; }
    .feature-card p { color: ${mutedText}; line-height: 1.7; }
    
    /* Services */
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .service-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 32px;
      border-radius: 16px;
      border-left: 4px solid ${c.primary};
      ${isDark ? '' : 'box-shadow: 0 2px 4px rgba(0,0,0,0.05);'}
    }
    .service-card h3 { font-weight: 600; margin-bottom: 12px; color: ${textColor}; }
    .service-card p { color: ${mutedText}; }
    .service-card .price { margin-top: 16px; font-size: 1.5rem; font-weight: 700; color: ${c.primary}; }
    
    /* Pricing */
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 1000px; margin: 0 auto; }
    .pricing-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 40px;
      border-radius: 20px;
      border: 2px solid ${isDark ? '#2a2a2a' : '#e5e7eb'};
      text-align: center;
      transition: all 0.3s;
    }
    .pricing-card.highlighted {
      border-color: ${c.primary};
      transform: scale(1.05);
      box-shadow: 0 20px 40px -12px ${c.primary}30;
    }
    .pricing-card h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 8px; }
    .pricing-card .price { font-size: 3rem; font-weight: 800; color: ${c.primary}; margin: 20px 0; }
    .pricing-card .price span { font-size: 1rem; font-weight: 400; color: ${mutedText}; }
    .pricing-card ul { list-style: none; text-align: left; margin: 24px 0; }
    .pricing-card li { padding: 12px 0; color: ${mutedText}; display: flex; align-items: center; gap: 12px; }
    .pricing-card li::before { content: '✓'; color: ${c.primary}; font-weight: 700; }
    .pricing-card .btn-primary { width: 100%; justify-content: center; margin-top: 24px; }
    
    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .testimonial-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 32px;
      border-radius: 16px;
      ${isDark ? '' : 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'}
    }
    .testimonial-card .stars { color: #fbbf24; font-size: 1.25rem; margin-bottom: 16px; }
    .testimonial-card .quote { font-size: 1.1rem; line-height: 1.7; margin-bottom: 24px; color: ${textColor}; font-style: italic; }
    .testimonial-card .author { display: flex; align-items: center; gap: 16px; }
    .testimonial-card .author-avatar { width: 48px; height: 48px; border-radius: 50%; background: ${c.primary}20; display: flex; align-items: center; justify-content: center; font-weight: 600; color: ${c.primary}; }
    .testimonial-card .author-info h4 { font-weight: 600; color: ${textColor}; }
    .testimonial-card .author-info p { color: ${mutedText}; font-size: 0.9rem; }
    
    /* Team */
    .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; }
    .team-card { text-align: center; }
    .team-card .avatar { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, ${c.primary}, ${c.secondary}); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; font-weight: 700; }
    .team-card h3 { font-weight: 600; margin-bottom: 4px; }
    .team-card .role { color: ${c.primary}; font-weight: 500; margin-bottom: 12px; }
    .team-card p { color: ${mutedText}; font-size: 0.95rem; }
    
    /* FAQ */
    .faq-list { max-width: 800px; margin: 0 auto; }
    .faq-item { border-bottom: 1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}; padding: 24px 0; }
    .faq-item h3 { font-weight: 600; margin-bottom: 12px; color: ${textColor}; }
    .faq-item p { color: ${mutedText}; line-height: 1.7; }
    
    /* CTA Section */
    .cta-section { 
      background: linear-gradient(135deg, ${c.primary}, ${c.secondary}); 
      color: white; 
      text-align: center;
      padding: 100px 20px;
      border-radius: ${layout.style === 'modern-saas' ? '24px' : '0'};
      ${layout.style === 'modern-saas' ? 'margin: 60px 24px;' : ''}
    }
    .cta-section h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 16px; }
    .cta-section p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
    .cta-section .btn-primary { background: white; color: ${c.primary}; }
    
    /* Contact Form */
    .contact-form { max-width: 500px; margin: 0 auto; }
    .contact-form input, .contact-form textarea {
      width: 100%;
      padding: 16px;
      margin-bottom: 16px;
      border: 2px solid ${isDark ? '#2a2a2a' : '#e5e7eb'};
      border-radius: 12px;
      font-size: 1rem;
      background: ${isDark ? '#1a1a1a' : 'white'};
      color: ${textColor};
      transition: border-color 0.2s;
    }
    .contact-form input:focus, .contact-form textarea:focus { outline: none; border-color: ${c.primary}; }
    
    /* Footer */
    footer { background: ${isDark ? '#050505' : '#111827'}; color: white; padding: 60px 0 30px; }
    .footer-content { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .footer-brand p { color: #9ca3af; margin-top: 16px; max-width: 300px; }
    .footer-links h4 { font-weight: 600; margin-bottom: 20px; }
    .footer-links a { display: block; color: #9ca3af; text-decoration: none; margin-bottom: 12px; transition: color 0.2s; }
    .footer-links a:hover { color: white; }
    .footer-bottom { border-top: 1px solid #374151; padding-top: 30px; text-align: center; color: #9ca3af; }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      .hero { padding: 100px 20px 60px; min-height: auto; }
      nav .nav-links { display: none; }
      .footer-content { grid-template-columns: 1fr; }
      .pricing-card.highlighted { transform: scale(1); }
      section { padding: 60px 0; }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <div class="container">
      <a href="#" class="nav-logo">
        <img src="${logoBase64}" alt="${companyName}">
        <span>${companyName}</span>
      </a>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#services">Services</a>
        ${f.hasPricing ? '<a href="#pricing">Pricing</a>' : ''}
        ${f.hasTeam ? '<a href="#team">Team</a>' : ''}
        <a href="#contact">Contact</a>
        <a href="#contact" class="nav-cta">${content.hero.ctaText}</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>${content.hero.headline}</h1>
        <p>${content.hero.subheadline}</p>
        <div class="hero-buttons">
          <a href="#contact" class="btn-primary">${content.hero.ctaText} →</a>
          ${content.hero.secondaryCta ? `<a href="#features" class="btn-secondary">${content.hero.secondaryCta}</a>` : ''}
        </div>
      </div>
    </div>
  </section>

  ${f.hasStats && content.stats?.length ? `
  <!-- Stats Section -->
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        ${content.stats.map((s: any) => `
          <div class="stat-item">
            <h3>${s.value}</h3>
            <p>${s.label}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- About Section -->
  <section id="about">
    <div class="container">
      <div class="section-header">
        <h2>${content.about.title}</h2>
        <p>${content.about.description}</p>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Why Choose ${companyName}</h2>
        <p>Discover what makes us different</p>
      </div>
      <div class="features-grid">
        ${content.features.map((f: any) => `
          <div class="feature-card">
            <div class="icon">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services">
    <div class="container">
      <div class="section-header">
        <h2>Our Services</h2>
        <p>Comprehensive solutions tailored to your needs</p>
      </div>
      <div class="services-grid">
        ${content.services.map((s: any) => `
          <div class="service-card">
            <h3>${s.title}</h3>
            <p>${s.description}</p>
            ${s.price ? `<div class="price">${s.price}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  ${f.hasPricing && content.pricing?.length ? `
  <!-- Pricing Section -->
  <section id="pricing" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Simple, Transparent Pricing</h2>
        <p>Choose the plan that works for you</p>
      </div>
      <div class="pricing-grid">
        ${content.pricing.map((p: any) => `
          <div class="pricing-card ${p.highlighted ? 'highlighted' : ''}">
            <h3>${p.name}</h3>
            <div class="price">${p.price}</div>
            <ul>
              ${p.features.map((feat: string) => `<li>${feat}</li>`).join('')}
            </ul>
            <a href="#contact" class="btn-primary">Get Started</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Testimonials Section -->
  <section id="testimonials" ${!f.hasPricing ? 'class="section-alt"' : ''}>
    <div class="container">
      <div class="section-header">
        <h2>What Our Clients Say</h2>
        <p>Don't just take our word for it</p>
      </div>
      <div class="testimonials-grid">
        ${content.testimonials.map((t: any) => `
          <div class="testimonial-card">
            <div class="stars">${'★'.repeat(t.rating || 5)}</div>
            <p class="quote">"${t.content}"</p>
            <div class="author">
              <div class="author-avatar">${t.name.charAt(0)}</div>
              <div class="author-info">
                <h4>${t.name}</h4>
                <p>${t.role}${t.company ? `, ${t.company}` : ''}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  ${f.hasTeam && content.team?.length ? `
  <!-- Team Section -->
  <section id="team" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Meet Our Team</h2>
        <p>The people behind ${companyName}</p>
      </div>
      <div class="team-grid">
        ${content.team.map((m: any) => `
          <div class="team-card">
            <div class="avatar">${m.name.charAt(0)}</div>
            <h3>${m.name}</h3>
            <p class="role">${m.role}</p>
            <p>${m.bio}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${f.hasFAQ && content.faq?.length ? `
  <!-- FAQ Section -->
  <section id="faq">
    <div class="container">
      <div class="section-header">
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know</p>
      </div>
      <div class="faq-list">
        ${content.faq.map((q: any) => `
          <div class="faq-item">
            <h3>${q.question}</h3>
            <p>${q.answer}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${f.hasCTA && content.cta ? `
  <!-- CTA Section -->
  <section class="cta-section">
    <h2>${content.cta.headline}</h2>
    <p>${content.cta.subheadline}</p>
    <a href="#contact" class="btn-primary">${content.cta.buttonText} →</a>
  </section>
  ` : ''}

  <!-- Contact Section -->
  <section id="contact" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Get In Touch</h2>
        <p>Ready to get started? Contact us today.</p>
      </div>
      <form class="contact-form">
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Your Email" required>
        <textarea rows="5" placeholder="Your Message" required></textarea>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Send Message</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="nav-logo" style="margin-bottom: 16px;">
            <img src="${logoBase64}" alt="${companyName}" style="height: 40px;">
            <span>${companyName}</span>
          </div>
          <p>${content.about.description.substring(0, 150)}...</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <a href="#features">Features</a>
          <a href="#services">Services</a>
          ${f.hasPricing ? '<a href="#pricing">Pricing</a>' : ''}
          <a href="#contact">Contact</a>
        </div>
        <div class="footer-links">
          <h4>Company</h4>
          <a href="#about">About Us</a>
          ${f.hasTeam ? '<a href="#team">Our Team</a>' : ''}
          <a href="#">Careers</a>
          <a href="#">Blog</a>
        </div>
        <div class="footer-links">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateReact(companyName: string, data: any, logoBase64: string) {
  const { layout, colors, content } = data;
  const c = colors;
  const f = layout.features;
  const isDark = layout.style === 'creative-agency';

  return `import React from 'react';

const LandingPage = () => {
  const colors = {
    primary: '${c.primary}',
    secondary: '${c.secondary}',
    accent: '${c.accent}',
    background: '${c.background || '#ffffff'}',
    text: '${c.text || '#1f2937'}'
  };

  const layoutStyle = '${layout.style}';
  const isDark = layoutStyle === 'creative-agency';

  const styles = {
    body: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      lineHeight: 1.6,
      color: isDark ? '#ffffff' : colors.text,
      background: isDark ? '#0a0a0a' : '#ffffff',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
    },
    nav: {
      position: 'fixed' as const,
      top: '20px',
      left: '20px',
      right: '20px',
      zIndex: 100,
      background: isDark ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '100px',
      padding: '12px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hero: {
      background: '${layout.heroStyle === 'bold' ? `linear-gradient(135deg, ${c.primary}, ${c.secondary})` : isDark ? '#0a0a0a' : `linear-gradient(180deg, ${c.background || '#f8fafc'} 0%, #ffffff 100%)`}',
      color: '${layout.heroStyle === 'bold' ? 'white' : isDark ? '#ffffff' : c.text}',
      padding: '150px 20px 100px',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
    },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 800,
      marginBottom: '24px',
      lineHeight: 1.1,
      ${layout.heroStyle !== 'bold' ? `background: 'linear-gradient(135deg, ${c.primary}, ${c.secondary})', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',` : ''}
    },
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 32px',
      background: '${layout.heroStyle === 'bold' ? 'white' : c.primary}',
      color: '${layout.heroStyle === 'bold' ? c.primary : 'white'}',
      textDecoration: 'none',
      borderRadius: '12px',
      fontWeight: 600,
      fontSize: '1rem',
      border: 'none',
      cursor: 'pointer',
    },
    section: {
      padding: '100px 0',
    },
    sectionAlt: {
      padding: '100px 0',
      background: isDark ? '#111111' : '#f8fafc',
    },
    sectionHeader: {
      textAlign: 'center' as const,
      maxWidth: '700px',
      margin: '0 auto 60px',
    },
    card: {
      background: isDark ? '#1a1a1a' : 'white',
      padding: '32px',
      borderRadius: '16px',
      border: \`1px solid \${isDark ? '#2a2a2a' : '#e5e7eb'}\`,
    },
  };

  return (
    <div style={styles.body}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="${logoBase64}" alt="${companyName}" style={{ height: '40px' }} />
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>${companyName}</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#features" style={{ textDecoration: 'none', color: isDark ? '#e5e5e5' : '#4b5563', fontWeight: 500 }}>Features</a>
          <a href="#services" style={{ textDecoration: 'none', color: isDark ? '#e5e5e5' : '#4b5563', fontWeight: 500 }}>Services</a>
          <a href="#contact" style={{ textDecoration: 'none', color: isDark ? '#e5e5e5' : '#4b5563', fontWeight: 500 }}>Contact</a>
          <a href="#contact" style={{ ...styles.btnPrimary, padding: '10px 24px' }}>${content.hero.ctaText}</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={styles.heroTitle}>${content.hero.headline}</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '32px', opacity: 0.9, color: isDark ? '#a1a1aa' : '#6b7280' }}>
            ${content.hero.subheadline}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="#contact" style={styles.btnPrimary}>${content.hero.ctaText} →</a>
            ${content.hero.secondaryCta ? `<a href="#features" style={{ ...styles.btnPrimary, background: 'transparent', border: '2px solid ${c.primary}30', color: isDark ? 'white' : colors.text }}>${content.hero.secondaryCta}</a>` : ''}
          </div>
        </div>
      </section>

      ${f.hasStats && content.stats?.length ? `
      {/* Stats Section */}
      <section style={{ padding: '60px 0', background: isDark ? '#111' : '#f8fafc' }}>
        <div style={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
            ${content.stats.map((s: any) => `
              <div>
                <h3 style={{ fontSize: '3rem', fontWeight: 800, color: colors.primary, marginBottom: '8px' }}>${s.value}</h3>
                <p style={{ color: '#6b7280', fontWeight: 500 }}>${s.label}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      {/* Features Section */}
      <section id="features" style={styles.sectionAlt}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Why Choose ${companyName}</h2>
            <p style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: '1.1rem' }}>Discover what makes us different</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            ${content.features.map((feat: any) => `
              <div style={styles.card}>
                <div style={{ fontSize: '2.5rem', marginBottom: '20px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '${c.primary}15', borderRadius: '12px' }}>${feat.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>${feat.title}</h3>
                <p style={{ color: isDark ? '#a1a1aa' : '#6b7280', lineHeight: 1.7 }}>${feat.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Our Services</h2>
            <p style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: '1.1rem' }}>Comprehensive solutions tailored to your needs</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            ${content.services.map((s: any) => `
              <div style={{ ...styles.card, borderLeft: '4px solid ${c.primary}' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>${s.title}</h3>
                <p style={{ color: isDark ? '#a1a1aa' : '#6b7280' }}>${s.description}</p>
                ${s.price ? `<div style={{ marginTop: '16px', fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>${s.price}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={styles.sectionAlt}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>What Our Clients Say</h2>
            <p style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: '1.1rem' }}>Don't just take our word for it</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            ${content.testimonials.map((t: any) => `
              <div style={styles.card}>
                <div style={{ color: '#fbbf24', fontSize: '1.25rem', marginBottom: '16px' }}>${'★'.repeat(t.rating || 5)}</div>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '24px', fontStyle: 'italic' }}>"${t.content}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '${c.primary}20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: colors.primary }}>${t.name.charAt(0)}</div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>${t.name}</h4>
                    <p style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: '0.9rem' }}>${t.role}${t.company ? `, ${t.company}` : ''}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Get In Touch</h2>
            <p style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: '1.1rem' }}>Ready to get started? Contact us today.</p>
          </div>
          <form style={{ maxWidth: '500px', margin: '0 auto' }}>
            <input type="text" placeholder="Your Name" required style={{ width: '100%', padding: '16px', marginBottom: '16px', border: '2px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}', borderRadius: '12px', fontSize: '1rem', background: isDark ? '#1a1a1a' : 'white', color: isDark ? 'white' : colors.text }} />
            <input type="email" placeholder="Your Email" required style={{ width: '100%', padding: '16px', marginBottom: '16px', border: '2px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}', borderRadius: '12px', fontSize: '1rem', background: isDark ? '#1a1a1a' : 'white', color: isDark ? 'white' : colors.text }} />
            <textarea rows={5} placeholder="Your Message" required style={{ width: '100%', padding: '16px', marginBottom: '16px', border: '2px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}', borderRadius: '12px', fontSize: '1rem', resize: 'vertical', background: isDark ? '#1a1a1a' : 'white', color: isDark ? 'white' : colors.text }} />
            <button type="submit" style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }}>Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: isDark ? '#050505' : '#111827', color: 'white', padding: '60px 0 30px' }}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #374151', paddingTop: '30px' }}>
            <p style={{ color: '#9ca3af' }}>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;`;
}
