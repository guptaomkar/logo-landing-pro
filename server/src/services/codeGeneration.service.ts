import type { GeneratedLandingPage } from '../types';

export class CodeGenerationService {
  generateHTML(companyName: string, data: GeneratedLandingPage, logoBase64: string, contactInfo: { email: string; phone: string; address: string }, theme: 'light' | 'dark' = 'light'): string {
    const { layout, colors, content } = data;
    const c = colors;
    const f = layout.features;

    const isDark = theme === 'dark' || layout.style === 'creative-agency';
    const bgColor = isDark ? '#0a0a0a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : c.text || '#1f2937';
    const mutedText = isDark ? '#a1a1aa' : '#6b7280';

    // Generate sections based on layout features
    const statsSection = f.hasStats ? this.generateStatsSection(content.stats, c, isDark) : '';
    const pricingSection = f.hasPricing ? this.generatePricingSection(content.pricing, c, isDark) : '';
    const teamSection = f.hasTeam ? this.generateTeamSection(content.team, c, isDark, companyName) : '';
    const faqSection = f.hasFAQ ? this.generateFAQSection(content.faq, c, isDark) : '';
    const newsletterSection = f.hasNewsletter ? this.generateNewsletterSection(c, isDark) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - ${content.hero.headline}</title>
  <meta name="description" content="${content.hero.subheadline}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: ${textColor};
      background: ${bgColor};
      overflow-x: hidden;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: ${layout.navStyle === 'transparent' ? 'rgba(255, 255, 255, 0.95)' : isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
      backdrop-filter: blur(12px);
      border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
      transition: all 0.3s ease;
    }
    
    nav .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 700;
      color: ${textColor};
      text-decoration: none;
    }
    
    .logo-img {
      height: 40px;
      width: auto;
      max-width: 150px;
      object-fit: contain;
    }
    
    .nav-links {
      display: flex;
      gap: 32px;
      list-style: none;
      align-items: center;
    }
    
    .nav-links a {
      color: ${textColor};
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
      font-size: 0.95rem;
    }
    
    .nav-links a:hover {
      color: ${c.primary};
    }
    
    .nav-cta {
      background: ${c.primary};
      color: white !important;
      padding: 10px 24px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .nav-cta:hover {
      background: ${c.secondary};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: ${textColor};
      cursor: pointer;
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: ${layout.heroStyle === 'centered' ? 'center' : 'left'};
      padding: 120px 24px 80px;
      position: relative;
      overflow: hidden;
      ${this.getHeroBackground(layout.heroStyle, c, isDark)}
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${layout.heroStyle === 'bold' ? 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)' : 'none'};
      pointer-events: none;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: ${layout.heroStyle === 'centered' ? '800px' : '600px'};
      ${layout.heroStyle === 'split' ? 'flex: 1;' : ''}
    }
    
    .hero-logo {
      height: 80px;
      width: auto;
      max-width: 200px;
      margin-bottom: 32px;
      object-fit: contain;
      ${layout.heroStyle === 'centered' ? 'margin-left: auto; margin-right: auto;' : ''}
    }
    
    .hero h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 24px;
      color: ${layout.heroStyle === 'bold' ? 'white' : textColor};
      letter-spacing: -0.02em;
    }
    
    .hero p {
      font-size: clamp(1.1rem, 2vw, 1.35rem);
      margin-bottom: 40px;
      color: ${layout.heroStyle === 'bold' ? 'rgba(255,255,255,0.95)' : mutedText};
      line-height: 1.7;
    }
    
    .hero-buttons {
      display: flex;
      gap: 16px;
      ${layout.heroStyle === 'centered' ? 'justify-content: center;' : ''}
      flex-wrap: wrap;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 16px 32px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
    }
    
    .btn-primary {
      background: ${layout.heroStyle === 'bold' ? 'white' : c.primary};
      color: ${layout.heroStyle === 'bold' ? c.primary : 'white'};
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    .btn-secondary {
      background: ${layout.heroStyle === 'bold' ? 'rgba(255,255,255,0.2)' : 'transparent'};
      color: ${layout.heroStyle === 'bold' ? 'white' : textColor};
      border: 2px solid ${layout.heroStyle === 'bold' ? 'white' : c.primary};
    }
    
    .btn-secondary:hover {
      background: ${layout.heroStyle === 'bold' ? 'rgba(255,255,255,0.3)' : c.primary};
      color: white;
    }
    
    /* Section Styles */
    section {
      padding: 100px 0;
    }
    
    .section-alt {
      background: ${isDark ? '#111111' : '#f8fafc'};
    }
    
    .section-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 60px;
    }
    
    .section-header h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      margin-bottom: 16px;
      color: ${textColor};
      letter-spacing: -0.02em;
    }
    
    .section-header p {
      font-size: 1.15rem;
      color: ${mutedText};
      line-height: 1.7;
    }
    
    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      margin-top: 60px;
    }
    
    .feature-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 40px;
      border-radius: 20px;
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${c.primary}, ${c.secondary});
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .feature-card:hover::before {
      transform: scaleX(1);
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 20px;
      display: block;
    }
    
    .feature-card h3 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: ${textColor};
    }
    
    .feature-card p {
      color: ${mutedText};
      line-height: 1.7;
    }
    
    /* Services Grid */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 32px;
      margin-top: 60px;
    }
    
    .service-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 40px;
      border-radius: 20px;
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
      transition: all 0.3s ease;
    }
    
    .service-card:hover {
      border-color: ${c.primary};
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }
    
    .service-card h3 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: ${textColor};
    }
    
    .service-card p {
      color: ${mutedText};
      margin-bottom: 16px;
      line-height: 1.7;
    }
    
    .service-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: ${c.primary};
    }
    
    /* Testimonials */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
      margin-top: 60px;
    }
    
    .testimonial-card {
      background: ${isDark ? '#1a1a1a' : 'white'};
      padding: 40px;
      border-radius: 20px;
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
      position: relative;
    }
    
    .testimonial-rating {
      color: #fbbf24;
      font-size: 1.2rem;
      margin-bottom: 16px;
    }
    
    .testimonial-content {
      font-size: 1.05rem;
      line-height: 1.7;
      color: ${textColor};
      margin-bottom: 24px;
      font-style: italic;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .testimonial-author-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: ${textColor};
    }
    
    .testimonial-author-info p {
      font-size: 0.9rem;
      color: ${mutedText};
    }
    
    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, ${c.primary}, ${c.secondary});
      color: white;
      text-align: center;
      padding: 100px 24px;
      border-radius: 24px;
      margin: 0 24px;
    }
    
    .cta-section h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      margin-bottom: 16px;
      color: white;
    }
    
    .cta-section p {
      font-size: 1.2rem;
      margin-bottom: 32px;
      opacity: 0.95;
    }
    
    .cta-section .btn {
      background: white;
      color: ${c.primary};
    }
    
    /* Footer */
    footer {
      background: ${isDark ? '#000000' : '#111827'};
      color: white;
      padding: 80px 0 30px;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 48px;
      margin-bottom: 48px;
    }
    
    .footer-logo-section {
      max-width: 300px;
    }
    
    .footer-logo {
      height: 40px;
      width: auto;
      max-width: 150px;
      margin-bottom: 16px;
      object-fit: contain;
    }
    
    .footer-logo-section p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
      margin-bottom: 20px;
    }
    
    .footer-section h4 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .footer-links {
      list-style: none;
    }
    
    .footer-links li {
      margin-bottom: 12px;
    }
    
    .footer-links a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    .footer-links a:hover {
      color: white;
    }
    
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 30px;
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .mobile-menu-btn {
        display: block;
      }
      
      .hero {
        padding: 100px 20px 60px;
        min-height: auto;
      }
      
      .hero-buttons {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
      
      section {
        padding: 60px 0;
      }
      
      .features-grid,
      .services-grid,
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-section {
        margin: 0 16px;
        padding: 60px 24px;
      }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <div class="container">
      <a href="#" class="logo-container">
        <img src="${logoBase64}" alt="${companyName} Logo" class="logo-img">
        <span>${companyName}</span>
      </a>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#services">Services</a></li>
        ${f.hasPricing ? '<li><a href="#pricing">Pricing</a></li>' : ''}
        ${f.hasTeam ? '<li><a href="#team">Team</a></li>' : ''}
        ${f.hasFAQ ? '<li><a href="#faq">FAQ</a></li>' : ''}
        <li><a href="#contact" class="nav-cta">${content.hero.ctaText}</a></li>
      </ul>
      <button class="mobile-menu-btn">☰</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero" id="home">
    <div class="container">
      <div class="hero-content">
        ${layout.heroStyle !== 'minimal' ? `<img src="${logoBase64}" alt="${companyName}" class="hero-logo">` : ''}
        <h1>${content.hero.headline}</h1>
        <p>${content.hero.subheadline}</p>
        <div class="hero-buttons">
          <a href="#contact" class="btn btn-primary">${content.hero.ctaText}</a>
          ${content.hero.secondaryCta ? `<a href="#features" class="btn btn-secondary">${content.hero.secondaryCta}</a>` : ''}
        </div>
      </div>
    </div>
  </section>

  ${statsSection}

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
        <p>Discover what makes us the perfect choice for your needs</p>
      </div>
      <div class="features-grid">
        ${content.features.map(feature => `
          <div class="feature-card">
            <span class="feature-icon">${feature.icon}</span>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
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
        ${content.services.map(service => `
          <div class="service-card">
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            ${service.price ? `<div class="service-price">${service.price}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  ${pricingSection}
  ${teamSection}

  <!-- Testimonials Section -->
  <section id="testimonials" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>What Our Clients Say</h2>
        <p>Don't just take our word for it</p>
      </div>
      <div class="testimonials-grid">
        ${content.testimonials.map(testimonial => `
          <div class="testimonial-card">
            <div class="testimonial-rating">${'★'.repeat(testimonial.rating || 5)}</div>
            <p class="testimonial-content">"${testimonial.content}"</p>
            <div class="testimonial-author">
              <div class="testimonial-author-info">
                <h4>${testimonial.name}</h4>
                <p>${testimonial.role}${testimonial.company ? ` at ${testimonial.company}` : ''}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  ${faqSection}
  ${newsletterSection}

  <!-- CTA Section -->
  ${f.hasCTA ? `
  <section style="padding: 100px 0;">
    <div class="cta-section">
      <h2>${content.cta.headline}</h2>
      <p>${content.cta.subheadline}</p>
      <a href="#contact" class="btn">${content.cta.buttonText}</a>
    </div>
  </section>
  ` : ''}

  <!-- Contact Section -->
  <section id="contact">
    <div class="container">
      <div class="section-header">
        <h2>Get In Touch</h2>
        <p>Ready to get started? Contact us today</p>
      </div>
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px; padding: 24px; background: ${isDark ? '#1a1a1a' : '#f8fafc'}; border-radius: 16px;">
          <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; color: ${textColor};">Contact Information</h3>
          <div style="display: flex; flex-direction: column; gap: 12px; color: ${mutedText};">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="font-size: 1.2rem;">📧</span>
              <a href="mailto:${contactInfo.email}" style="color: ${c.primary}; text-decoration: none;">${contactInfo.email}</a>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="font-size: 1.2rem;">📞</span>
              <a href="tel:${contactInfo.phone}" style="color: ${c.primary}; text-decoration: none;">${contactInfo.phone}</a>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="font-size: 1.2rem;">📍</span>
              <span>${contactInfo.address}</span>
            </div>
          </div>
        </div>
        <form style="display: flex; flex-direction: column; gap: 20px;">
          <input type="text" placeholder="Your Name" required style="padding: 16px; border: 2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}; border-radius: 12px; font-size: 1rem; background: ${isDark ? '#1a1a1a' : 'white'}; color: ${textColor};">
          <input type="email" placeholder="Your Email" required style="padding: 16px; border: 2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}; border-radius: 12px; font-size: 1rem; background: ${isDark ? '#1a1a1a' : 'white'}; color: ${textColor};">
          <textarea rows="5" placeholder="Your Message" required style="padding: 16px; border: 2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}; border-radius: 12px; font-size: 1rem; resize: vertical; background: ${isDark ? '#1a1a1a' : 'white'}; color: ${textColor};"></textarea>
          <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo-section">
          <img src="${logoBase64}" alt="${companyName}" class="footer-logo">
          <p>${content.about.description}</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#services">Services</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Services</h4>
          <ul class="footer-links">
            ${content.services.slice(0, 4).map(s => `<li><a href="#services">${s.title}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="mailto:${contactInfo.email}">${contactInfo.email}</a></li>
            <li><a href="tel:${contactInfo.phone}">${contactInfo.phone}</a></li>
            <li style="color: rgba(255, 255, 255, 0.7); cursor: default;">${contactInfo.address}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p style="margin-top: 8px; font-size: 0.85rem; opacity: 0.6;">Made by korevyn AI Landing Page Generator</p>
      </div>
    </div>
  </footer>

  <script>
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });

    // Form submission
    document.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for your message! We will get back to you soon.');
      e.target.reset();
    });
  </script>
</body>
</html>`;
  }

  private getHeroBackground(heroStyle: string, colors: any, isDark: boolean): string {
    switch (heroStyle) {
      case 'bold':
        return `background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);`;
      case 'minimal':
        return `background: ${isDark ? '#0a0a0a' : '#ffffff'};`;
      case 'split':
        return `background: linear-gradient(to right, ${colors.background || '#f8fafc'} 50%, ${isDark ? '#111111' : '#ffffff'} 50%);`;
      default:
        return `background: linear-gradient(180deg, ${colors.background || '#f8fafc'} 0%, ${isDark ? '#0a0a0a' : '#ffffff'} 100%);`;
    }
  }

  private generateStatsSection(stats: any[], colors: any, isDark: boolean): string {
    return `
  <!-- Stats Section -->
  <section class="section-alt" style="padding: 80px 0;">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 48px; text-align: center;">
        ${stats.map(stat => `
          <div>
            <div style="font-size: 3rem; font-weight: 900; color: ${colors.primary}; margin-bottom: 8px;">${stat.value}</div>
            <div style="font-size: 1.1rem; color: ${isDark ? '#a1a1aa' : '#6b7280'};">${stat.label}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
  }

  private generatePricingSection(pricing: any[], colors: any, isDark: boolean): string {
    return `
  <!-- Pricing Section -->
  <section id="pricing" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Simple, Transparent Pricing</h2>
        <p>Choose the plan that's right for you</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-top: 60px;">
        ${pricing.map(plan => `
          <div style="background: ${isDark ? '#1a1a1a' : 'white'}; padding: 48px; border-radius: 20px; border: ${plan.highlighted ? `3px solid ${colors.primary}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`}; position: relative; ${plan.highlighted ? `transform: scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.15);` : ''}">
            ${plan.highlighted ? `<div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: ${colors.primary}; color: white; padding: 6px 20px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">POPULAR</div>` : ''}
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; color: ${isDark ? 'white' : '#1f2937'};">${plan.name}</h3>
            <div style="font-size: 3rem; font-weight: 900; color: ${colors.primary}; margin-bottom: 24px;">${plan.price}</div>
            <ul style="list-style: none; margin-bottom: 32px;">
              ${plan.features.map((f: string) => `
                <li style="padding: 12px 0; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}; color: ${isDark ? '#a1a1aa' : '#6b7280'};">
                  <span style="color: ${colors.primary}; margin-right: 8px;">✓</span> ${f}
                </li>
              `).join('')}
            </ul>
            <a href="#contact" style="display: block; text-align: center; padding: 16px; background: ${plan.highlighted ? colors.primary : 'transparent'}; color: ${plan.highlighted ? 'white' : colors.primary}; border: 2px solid ${colors.primary}; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.3s ease;">Get Started</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
  }

  private generateTeamSection(team: any[], colors: any, isDark: boolean, companyName: string): string {
    return `
  <!-- Team Section -->
  <section id="team">
    <div class="container">
      <div class="section-header">
        <h2>Meet Our Team</h2>
        <p>The talented people behind ${companyName}</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-top: 60px;">
        ${team.map(member => `
          <div style="background: ${isDark ? '#1a1a1a' : 'white'}; padding: 40px; border-radius: 20px; border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}; text-align: center;">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; font-weight: 700;">${member.name.charAt(0)}</div>
            <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; color: ${isDark ? 'white' : '#1f2937'};">${member.name}</h3>
            <p style="color: ${colors.primary}; font-weight: 600; margin-bottom: 16px;">${member.role}</p>
            <p style="color: ${isDark ? '#a1a1aa' : '#6b7280'}; line-height: 1.7;">${member.bio}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
  }

  private generateFAQSection(faq: any[], colors: any, isDark: boolean): string {
    return `
  <!-- FAQ Section -->
  <section id="faq" class="section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions</p>
      </div>
      <div style="max-width: 800px; margin: 0 auto;">
        ${faq.map((item, index) => `
          <div class="faq-item" style="background: ${isDark ? '#1a1a1a' : 'white'}; margin-bottom: 16px; border-radius: 12px; border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}; overflow: hidden;">
            <div class="faq-question" style="padding: 24px; cursor: pointer; font-weight: 600; font-size: 1.1rem; color: ${isDark ? 'white' : '#1f2937'}; display: flex; justify-content: space-between; align-items: center;">
              ${item.question}
              <span style="font-size: 1.5rem; transition: transform 0.3s ease;">+</span>
            </div>
            <div class="faq-answer" style="padding: 0 24px; max-height: 0; overflow: hidden; transition: all 0.3s ease;">
              <p style="padding-bottom: 24px; color: ${isDark ? '#a1a1aa' : '#6b7280'}; line-height: 1.7;">${item.answer}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <style>
    .faq-item.active .faq-answer {
      max-height: 500px;
    }
    .faq-item.active .faq-question span {
      transform: rotate(45deg);
    }
  </style>`;
  }

  private generateNewsletterSection(colors: any, isDark: boolean): string {
    return `
  <!-- Newsletter Section -->
  <section style="padding: 80px 0;">
    <div class="container">
      <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); padding: 60px 40px; border-radius: 24px; text-align: center; color: white;">
        <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 16px;">Stay Updated</h2>
        <p style="font-size: 1.2rem; margin-bottom: 32px; opacity: 0.95;">Subscribe to our newsletter for the latest updates and insights</p>
        <form style="max-width: 500px; margin: 0 auto; display: flex; gap: 12px;">
          <input type="email" placeholder="Enter your email" required style="flex: 1; padding: 16px; border: none; border-radius: 12px; font-size: 1rem;">
          <button type="submit" style="padding: 16px 32px; background: white; color: ${colors.primary}; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;">Subscribe</button>
        </form>
      </div>
    </div>
  </section>`;
  }

  generateReact(companyName: string, data: GeneratedLandingPage, logoBase64: string, contactInfo: { email: string; phone: string; address: string }, theme: 'light' | 'dark' = 'light'): string {
    const { layout, colors, content } = data;
    const c = colors;

    return `import React, { useState } from 'react';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const colors = {
    primary: '${c.primary}',
    secondary: '${c.secondary}',
    accent: '${c.accent}',
    background: '${c.background || '#ffffff'}',
    text: '${c.text || '#1f2937'}'
  };

  const content = ${JSON.stringify(content, null, 2)};

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="${logoBase64}" alt="${companyName}" style={{ height: '40px' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${companyName}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        background: 'linear-gradient(135deg, ' + colors.primary + ', ' + colors.secondary + ')',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <img src="${logoBase64}" alt="${companyName}" style={{ height: '80px', marginBottom: '32px' }} />
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '24px' }}>
            {content.hero.headline}
          </h1>
          <p style={{ fontSize: '1.35rem', marginBottom: '40px', opacity: 0.95 }}>
            {content.hero.subheadline}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="#contact" style={{
              padding: '16px 32px',
              background: 'white',
              color: colors.primary,
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 600
            }}>
              {content.hero.ctaText}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 800, marginBottom: '60px' }}>
            Why Choose ${companyName}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {content.features.map((feature, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>Get In Touch</h2>
          <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '1.15rem' }}>
            Ready to get started? Contact us today
          </p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="text" placeholder="Your Name" required style={{
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1rem'
            }} />
            <input type="email" placeholder="Your Email" required style={{
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1rem'
            }} />
            <textarea rows={5} placeholder="Your Message" required style={{
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1rem',
              resize: 'vertical'
            }} />
            <button type="submit" style={{
              padding: '16px 32px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', color: 'white', padding: '80px 24px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <img src="${logoBase64}" alt="${companyName}" style={{ height: '40px', marginBottom: '16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '0.85rem' }}>
            Made by korevyn AI Landing Page Generator
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;`;
  }
}

export const codeGenerationService = new CodeGenerationService();
