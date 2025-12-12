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

    // First, generate a color palette based on the company description
    const colorPrompt = `Based on this company description, suggest a professional color palette that matches their brand identity and industry.

COMPANY: ${companyName}
DESCRIPTION: ${companyDescription}

Consider:
- Industry conventions (e.g., blue for finance/trust, green for eco/health, orange for energy/creativity)
- The mood and personality suggested by the description
- Professional appeal and readability

Return ONLY a JSON object with these exact hex color codes:
{
  "primary": "#hexcode",
  "secondary": "#hexcode", 
  "accent": "#hexcode",
  "reasoning": "Brief explanation of why these colors fit"
}

Choose colors that work well together and create a cohesive, professional look. Return ONLY valid JSON, no markdown.`;

    // Make parallel requests for colors and content
    const [colorResponse, contentResponse] = await Promise.all([
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a professional brand designer. Return only valid JSON.' },
            { role: 'user', content: colorPrompt }
          ],
        }),
      }),
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'You are a professional landing page content creator. Always return valid JSON only, no markdown code blocks.'
            },
            {
              role: 'user',
              content: `Generate professional landing page content for a company named "${companyName}".

COMPANY DESCRIPTION:
${companyDescription}

Based on this description, create highly relevant and tailored content that accurately represents what this company does. The content should reflect the company's actual services, products, and value proposition.

Return a JSON object with the following structure:
{
  "hero": {
    "headline": "main headline (under 60 characters, compelling and specific to the company)",
    "subheadline": "compelling subheadline (under 160 characters, highlighting key value proposition)",
    "ctaText": "call to action button text"
  },
  "about": {
    "title": "section title",
    "description": "2-3 sentences about the company value proposition based on the description provided"
  },
  "features": [
    {
      "title": "feature name (relevant to the company)",
      "description": "feature description (1-2 sentences)",
      "icon": "emoji that represents this feature"
    }
  ],
  "services": [
    {
      "title": "service name (based on what the company actually offers)",
      "description": "service description (1-2 sentences)"
    }
  ],
  "testimonials": [
    {
      "name": "realistic person name",
      "role": "job title relevant to the company's target audience",
      "content": "testimonial quote that reflects the company's value",
      "rating": 5
    }
  ]
}

Generate 4-6 features, 3-4 services, and 3 testimonials. Make everything highly relevant to the company description provided. Return ONLY valid JSON, no markdown formatting.`
            }
          ],
        }),
      })
    ]);

    if (!colorResponse.ok || !contentResponse.ok) {
      const errorText = !colorResponse.ok ? await colorResponse.text() : await contentResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error('AI API error');
    }

    const [colorData, contentData] = await Promise.all([
      colorResponse.json(),
      contentResponse.json()
    ]);

    // Parse color response
    let extractedColors = {
      primary: '#9b87f5',
      secondary: '#0EA5E9',
      accent: '#06b6d4',
    };
    
    try {
      const colorText = colorData.choices[0].message.content;
      const cleanedColorText = colorText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const colorResult = JSON.parse(cleanedColorText);
      extractedColors = {
        primary: colorResult.primary || extractedColors.primary,
        secondary: colorResult.secondary || extractedColors.secondary,
        accent: colorResult.accent || extractedColors.accent,
      };
      console.log('Generated colors:', extractedColors, 'Reasoning:', colorResult.reasoning);
    } catch (colorError) {
      console.error('Color parse error, using defaults:', colorError);
    }

    // Parse content response
    const contentText = contentData.choices[0].message.content;
    let content;
    try {
      const cleanedContent = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      content = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Content:', contentText);
      throw new Error('Failed to parse AI response');
    }

    console.log('Generated content:', JSON.stringify(content).substring(0, 200));

    // Generate HTML
    const html = generateHTML(companyName, content, logoBase64, extractedColors);
    
    // Generate React
    const react = generateReact(companyName, content, logoBase64, extractedColors);

    return new Response(
      JSON.stringify({
        html,
        react,
        content,
        colors: extractedColors,
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

function generateHTML(companyName: string, content: any, logoBase64: string, colors: any) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - ${content.hero.headline}</title>
  <meta name="description" content="${content.hero.subheadline}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Hero Section */
    .hero { 
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      color: white;
      padding: 100px 0;
      text-align: center;
    }
    .hero img { max-width: 150px; margin-bottom: 30px; }
    .hero h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 700; }
    .hero p { font-size: 1.25rem; margin-bottom: 30px; opacity: 0.95; }
    .cta-button {
      display: inline-block;
      padding: 15px 40px;
      background: white;
      color: ${colors.primary};
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      transition: transform 0.3s;
    }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    
    /* Section Styles */
    section { padding: 80px 0; }
    h2 { font-size: 2.5rem; text-align: center; margin-bottom: 50px; color: ${colors.primary}; }
    
    /* About Section */
    .about { background: #f9fafb; }
    .about p { text-align: center; max-width: 800px; margin: 0 auto; font-size: 1.1rem; }
    
    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    .feature-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s;
    }
    .feature-card:hover { transform: translateY(-5px); box-shadow: 0 5px 20px rgba(0,0,0,0.15); }
    .feature-card .icon { font-size: 3rem; margin-bottom: 15px; }
    .feature-card h3 { color: ${colors.secondary}; margin-bottom: 10px; }
    
    /* Services */
    .services { background: #f9fafb; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .service-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      border-left: 4px solid ${colors.accent};
    }
    
    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .testimonial-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .testimonial-card .stars { color: #fbbf24; margin-bottom: 15px; }
    .testimonial-card .author { margin-top: 15px; font-weight: 600; color: ${colors.primary}; }
    
    /* Contact Form */
    .contact { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; }
    .contact form { max-width: 500px; margin: 0 auto; }
    .contact input, .contact textarea {
      width: 100%;
      padding: 15px;
      margin-bottom: 15px;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
    }
    .contact button {
      width: 100%;
      padding: 15px;
      background: white;
      color: ${colors.primary};
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    
    /* Footer */
    footer { background: #1f2937; color: white; padding: 30px 0; text-align: center; }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      h2 { font-size: 1.75rem; }
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <img src="${logoBase64}" alt="${companyName} Logo">
      <h1>${content.hero.headline}</h1>
      <p>${content.hero.subheadline}</p>
      <a href="#contact" class="cta-button">${content.hero.ctaText}</a>
    </div>
  </section>

  <!-- About Section -->
  <section class="about">
    <div class="container">
      <h2>${content.about.title}</h2>
      <p>${content.about.description}</p>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features">
    <div class="container">
      <h2>Our Features</h2>
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
  <section class="services">
    <div class="container">
      <h2>Our Services</h2>
      <div class="services-grid">
        ${content.services.map((s: any) => `
          <div class="service-card">
            <h3>${s.title}</h3>
            <p>${s.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="testimonials">
    <div class="container">
      <h2>What Our Clients Say</h2>
      <div class="testimonials-grid">
        ${content.testimonials.map((t: any) => `
          <div class="testimonial-card">
            <div class="stars">${'★'.repeat(t.rating)}</div>
            <p>"${t.content}"</p>
            <div class="author">
              <div>${t.name}</div>
              <div style="font-weight: normal; opacity: 0.8;">${t.role}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section class="contact" id="contact">
    <div class="container">
      <h2 style="color: white;">Get In Touch</h2>
      <form>
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Your Email" required>
        <textarea rows="4" placeholder="Your Message" required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

function generateReact(companyName: string, content: any, logoBase64: string, colors: any) {
  return `import React from 'react';

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: \`linear-gradient(135deg, ${colors.primary}, ${colors.secondary})\`,
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center'
      }}>
        <img src="${logoBase64}" alt="${companyName}" style={{ maxWidth: '150px', marginBottom: '30px' }} />
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>${content.hero.headline}</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '30px' }}>${content.hero.subheadline}</p>
        <a href="#contact" style={{
          display: 'inline-block',
          padding: '15px 40px',
          background: 'white',
          color: '${colors.primary}',
          textDecoration: 'none',
          borderRadius: '50px',
          fontWeight: 600
        }}>
          ${content.hero.ctaText}
        </a>
      </section>

      {/* About Section */}
      <section style={{ padding: '80px 20px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '50px', color: '${colors.primary}' }}>
            ${content.about.title}
          </h2>
          <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem' }}>
            ${content.about.description}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '50px', color: '${colors.primary}' }}>
            Our Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            ${content.features.map((f: any) => `
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>${f.icon}</div>
                <h3 style={{ color: '${colors.secondary}', marginBottom: '10px' }}>${f.title}</h3>
                <p>${f.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1f2937', color: 'white', padding: '30px 20px', textAlign: 'center' }}>
        <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;`;
}
