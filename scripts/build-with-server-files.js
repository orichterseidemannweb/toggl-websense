#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Starte Build-Prozess...');

try {
  // 1. Normalen Build ausführen
  console.log('📦 Führe npm run build aus...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Template-Dateien kopieren
  console.log('📋 Kopiere Server-Dateien...');
  
  const templatesDir = path.join(__dirname, '..', 'build-templates');
  const distDir = path.join(__dirname, '..', 'dist');
  
  // .htaccess kopieren
  const htaccessSource = path.join(templatesDir, '.htaccess');
  const htaccessDest = path.join(distDir, '.htaccess');
  
  if (fs.existsSync(htaccessSource)) {
    fs.copyFileSync(htaccessSource, htaccessDest);
    console.log('✅ .htaccess kopiert');
  } else {
    console.warn('⚠️  .htaccess Template nicht gefunden');
  }
  
  // api-proxy.php kopieren
  const phpSource = path.join(templatesDir, 'api-proxy.php');
  const phpDest = path.join(distDir, 'api-proxy.php');
  
  if (fs.existsSync(phpSource)) {
    fs.copyFileSync(phpSource, phpDest);
    console.log('✅ api-proxy.php kopiert');
  } else {
    console.warn('⚠️  api-proxy.php Template nicht gefunden');
  }
  
  console.log('');
  console.log('🎉 Build abgeschlossen!');
  console.log('📁 Bereit für Upload: dist/ Ordner');
  console.log('');
  console.log('📋 Enthält:');
  console.log('   ✅ Vite-generierte Dateien (HTML, CSS, JS)');
  console.log('   ✅ .htaccess (Apache-Konfiguration)');
  console.log('   ✅ api-proxy.php (CORS-Proxy)');
  
} catch (error) {
  console.error('❌ Build-Fehler:', error.message);
  process.exit(1);
} 