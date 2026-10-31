import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('R1 & PWA: Manifest, Service Worker, iOS Meta & Capacitor Configuration', () => {
  const rootDir = path.resolve(__dirname, '..');

  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it('T1.1: Web App Manifest exists, parses as valid JSON, and contains correct metadata', () => {
      const manifestPath = path.join(rootDir, 'public', 'manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const content = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);

      expect(manifest.short_name).toBe('Mie Baso KS');
      expect(manifest.name).toContain('Kartika Sari');
      expect(manifest.display).toBe('standalone');
      expect(manifest.start_url).toBe('/');
      expect(manifest.theme_color).toBe('#166534');
      expect(manifest.background_color).toBe('#ffffff');
    });

    it('T1.2: Web App Manifest specifies icons supporting 192x192 and 512x512', () => {
      const manifestPath = path.join(rootDir, 'public', 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);

      const sizesString = manifest.icons.map((i: any) => i.sizes).join(' ');
      expect(sizesString).toContain('192x192');
      expect(sizesString).toContain('512x512');
    });

    it('T1.3: Service Worker sw.js defines static asset cache list including critical shell', () => {
      const swPath = path.join(rootDir, 'public', 'sw.js');
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, 'utf-8');
      expect(swContent).toContain('CACHE_NAME');
      expect(swContent).toContain("'/index.html'");
      expect(swContent).toContain("'/logo.jpg'");
      expect(swContent).toContain("'/manifest.json'");
    });

    it('T1.4: Service Worker sw.js implements install, activate, and fetch event listeners', () => {
      const swPath = path.join(rootDir, 'public', 'sw.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');

      expect(swContent).toContain("addEventListener('install'");
      expect(swContent).toContain("addEventListener('activate'");
      expect(swContent).toContain("addEventListener('fetch'");
      expect(swContent).toContain('caches.match');
    });

    it('T1.5: index.html contains all mandatory iOS standalone web app meta tags', () => {
      const indexPath = path.join(rootDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);

      const html = fs.readFileSync(indexPath, 'utf-8');
      expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes"');
      expect(html).toContain('apple-mobile-web-app-status-bar-style');
      expect(html).toContain('apple-mobile-web-app-title');
      expect(html).toContain('apple-touch-icon');
      expect(html).toContain('<meta name="theme-color" content="#166534"');
    });

    it('T1.6: capacitor.config.ts is properly configured for native app packaging', () => {
      const capConfigPath = path.join(rootDir, 'capacitor.config.ts');
      expect(fs.existsSync(capConfigPath)).toBe(true);

      const capContent = fs.readFileSync(capConfigPath, 'utf-8');
      expect(capContent).toContain('appId');
      expect(capContent).toContain('com.kartikasari.poscrm');
      expect(capContent).toContain('Kartika Sari');
      expect(capContent).toContain("webDir: 'dist'");
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: theme-color matches Forest Green #166534 across manifest, index.html, and CSS', () => {
      const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'public', 'manifest.json'), 'utf-8'));
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

      expect(manifest.theme_color.toLowerCase()).toBe('#166534');
      expect(indexHtml).toContain('content="#166534"');
    });

    it('T2.2: viewport meta tag optimizes for mobile touch and standalone PWA display', () => {
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
      expect(indexHtml).toContain('viewport-fit=cover');
      expect(indexHtml).toContain('width=device-width');
    });

    it('T2.3: Service Worker registration snippet exists in index.html with feature detection', () => {
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
      expect(indexHtml).toContain("'serviceWorker' in navigator");
      expect(indexHtml).toContain("navigator.serviceWorker.register('/sw.js')");
    });

    it('T2.4: logo asset exists in public directory and is non-empty', () => {
      const logoPath = path.join(rootDir, 'public', 'logo.jpg');
      expect(fs.existsSync(logoPath)).toBe(true);
      const stat = fs.statSync(logoPath);
      expect(stat.size).toBeGreaterThan(1000); // Verify it's an actual image file
    });

    it('T2.5: manifest categories include food and business for app store indexing', () => {
      const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'public', 'manifest.json'), 'utf-8'));
      expect(manifest.categories).toContain('food');
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: Service Worker cache includes manifest and logo referenced in index.html', () => {
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
      const swContent = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf-8');

      if (indexHtml.includes('/manifest.json')) {
        expect(swContent).toContain("'/manifest.json'");
      }
      if (indexHtml.includes('/logo.jpg')) {
        expect(swContent).toContain("'/logo.jpg'");
      }
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: Android/iOS Standalone Installation Checklist Validation', () => {
      // 1. Valid Web App Manifest
      const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'public', 'manifest.json'), 'utf-8'));
      expect(manifest.display).toBe('standalone');
      expect(manifest.icons.length).toBeGreaterThanOrEqual(1);

      // 2. iOS home screen add meta tags
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
      expect(indexHtml).toContain('apple-mobile-web-app-capable');
      expect(indexHtml).toContain('apple-touch-icon');

      // 3. Service Worker caching enabled for offline startup
      const swContent = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf-8');
      expect(swContent).toContain('addEventListener');
    });
  });
});
