# 🚀 Webserver-Deployment für Toggl WebSense

## 📦 **Was hochladen?**

Lade **NUR den Inhalt des `dist/` Ordners** auf deinen Webserver hoch:

```
dein-webroot/
├── index.html          ← Hauptdatei
├── assets/             ← JavaScript & CSS
│   ├── index-*.css
│   ├── index-*.js
│   └── *.js
├── logo.png            ← Logo-Datei  
└── vite.svg           ← Icon
```

## 🌐 **CORS-Proxy Konfiguration**

Da die App Toggl APIs aufruft, brauchst du einen **Proxy** auf deinem Server:

### **Apache (.htaccess)**
Erstelle eine `.htaccess` Datei im Web-Root:

```apache
# Toggl API Proxy
RewriteEngine On

# Proxy für Toggl Reports API
RewriteRule ^toggl-api/reports/(.*)$ https://api.track.toggl.com/reports/$1 [P,L]

# Proxy für Toggl API  
RewriteRule ^toggl-api/api/(.*)$ https://api.track.toggl.com/api/$1 [P,L]

# Single Page Application - alle Routes zu index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Sicherheits-Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### **Nginx (nginx.conf)**
```nginx
server {
    listen 80;
    server_name deine-domain.de;
    root /pfad/zum/webroot;
    index index.html;

    # Toggl API Proxy
    location /toggl-api/ {
        proxy_pass https://api.track.toggl.com/;
        proxy_set_header Host api.track.toggl.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_ssl_verify off;
    }

    # Single Page Application
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Sicherheits-Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## 🔧 **Deployment-Schritte**

### **1. Build erstellen**
```bash
npm run build
```

### **2. Per SFTP hochladen**
- **FileZilla/WinSCP**: Verbinde zu deinem Server
- **Ziel**: `/public_html/` oder `/htdocs/` oder dein Web-Root
- **Upload**: Alles aus `dist/` → Web-Root

### **3. Proxy konfigurieren**
- **Apache**: `.htaccess` Datei ins Web-Root
- **Nginx**: Server-Block in nginx.conf

### **4. Testen**
- Öffne: `https://deine-domain.de`
- Login mit Toggl API Token
- PDF-Export testen

## ✅ **Checkliste**

- [ ] `dist/` Inhalt hochgeladen
- [ ] `.htaccess` oder Nginx-Config erstellt  
- [ ] App lädt im Browser
- [ ] Login mit Token funktioniert
- [ ] PDF-Export funktioniert
- [ ] Keine Console-Errors

## 🆘 **Troubleshooting**

**App lädt nicht:**
- Überprüfe ob `index.html` im Root liegt
- Überprüfe Pfade in Browser DevTools

**API-Fehler:**
- Überprüfe Proxy-Konfiguration
- Teste: `https://deine-domain.de/toggl-api/api/v9/me`

**CORS-Fehler:**
- Proxy fehlt oder falsch konfiguriert
- Überprüfe Apache/Nginx Logs

## 🎯 **Fertig!**

Deine App läuft jetzt auf: `https://deine-domain.de`
- ✅ Sicher (kein Token im Code)
- ✅ Produktionsbereit  
- ✅ Traditionell deploybar 