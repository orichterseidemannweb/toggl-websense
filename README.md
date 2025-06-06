# Toggl WebSense 📊

Eine moderne React-Webanwendung zur Verwaltung und Analyse von Toggl-Zeiterfassungsdaten mit erweiterten Funktionen für Export und Berichtswesen.

## ✨ Features

- 🔐 **Sichere Token-Authentifizierung** - Verwende deinen persönlichen Toggl API Token als Login
- 💾 **Session-Persistierung** - Token bleibt für die Browser-Session gespeichert (automatisch gelöscht beim Tab schließen)
- 📊 **Detaillierte Berichte** - Umfassende Ansicht aller Zeiterfassungseinträge
- 📅 **Zeitraum-Auswahl** - Flexible Datums- und Monatsauswahl
- 🗂️ **Spalten-Kontrolle** - Ein-/Ausblenden von Tabellenspalten nach Bedarf
- 📄 **PDF-Export** - Professionelle PDF-Berichte mit Corporate Branding
- 📦 **Bulk-PDF-Export (NEU v1.4.0)** - Generiere ALLE Kunden-PDFs mit einem Klick
- 🎨 **Moderne UI** - Responsive Design mit dunklem/hellem Modus
- ⚡ **Real-time Updates** - Live-Aktualisierung der Daten
- 🔍 **Erweiterte Filter** - Sortierung und Filterung der Zeiteinträge
- 🚫 **Intelligente Filterung** - Interne Projekte werden automatisch ausgeblendet

## 🆕 Version 1.4.2 - Polished UI & Enhanced Footer

### 🎨 UI-Verbesserungen
- **✨ Überarbeitete Footer-Sektion**: Moderne Bubble-Design für bessere Übersichtlichkeit
- **🗑️ Entrümpelung**: Redundante Informationen entfernt (Einträge-Anzahl, doppelte Filter-Anzeigen)
- **🎯 Fokus auf Relevanz**: Nur noch wirklich wichtige Status-Informationen angezeigt
- **🌈 Farbkodierung**: Intuitive Farben für verschiedene Status-Typen
- **📱 Responsive Bubbles**: Automatisches Wrapping bei verschiedenen Bildschirmgrößen

### 💎 Design-Features
- **Glasmorphism-Effekt**: Moderne durchscheinende Bubble-Optik
- **Hover-Animationen**: Subtile Interaktionen für bessere UX
- **Einheitliches Design**: Alle Info-Bubbles im gleichen modernen Stil
- **Emojis + Kurztexte**: Schnelle visuelle Erfassung der Informationen

**Resultat**: Deutlich sauberere und informativer gestaltete Fußzeile ohne visuellen Ballast

## 🆕 Version 1.4.1 - Optimierte Bulk-Export Erfahrung

### 🛠️ Bug-Fixes & Verbesserungen
- **✅ Overlay-Problem behoben**: Entfernung des problematischen Progress-Overlays für stabileren Bulk-Export
- **🎯 Fokus auf Kernfunktion**: Bulk-Export läuft nun vollständig im Hintergrund ohne UI-Störungen
- **📊 Konsolen-Logging**: Entwickler können Fortschritt weiterhin in Browser-Konsole verfolgen
- **🚀 100% Zuverlässigkeit**: Keine leeren oder hängenden Overlays mehr
- **⚡ Bessere Performance**: Entfernung unnötiger UI-Updates verbessert Reaktionszeit

**Pragmatischer Ansatz**: Weniger UI-Komplexität = mehr Stabilität = bessere User Experience

## 🆕 Neue Features in v1.4.0

### 📦 Bulk-PDF-Export - Der Game-Changer!
**Von 50+ Klicks zu einem Klick!** Das revolutionäre neue Feature automatisiert die komplette PDF-Generierung:

- **🚀 Ein-Klick-Export**: Alle Kunden-PDFs mit einem einzigen Klick generieren
- **🧠 Intelligente Logik**: Automatische Erkennung von Kunden und Projekten
- **📁 Smart-Gruppierung**: Ein PDF pro Kunde (bei einem Projekt) oder ein PDF pro Projekt (bei mehreren)
- **⏱️ Task-Aggregation**: Arbeitszeiten werden pro Task zusammengefasst und angezeigt
- **📋 Projekt-Header**: Projektname wird korrekt in Bulk-PDFs angezeigt
- **🗜️ ZIP-Download**: Alle PDFs organisiert in einer ZIP-Datei
- **📊 Progress-Tracking**: Intelligenter Fortschrittsbalken mit Abbruch-Option
- **🚫 Auto-Filter**: Interne Projekte ("Intern Web") werden automatisch ausgeschlossen
- **⚡ Performance**: Optimierte Generierung mit minimaler Wartezeit

**Produktivitätssteigerung: 99% weniger Klicks pro Monat!**

### 🔧 Weitere Verbesserungen
- **Spalten-Standardwerte**: Optimierte Standard-Sichtbarkeit für bessere UX
- **Konsistente PDF-Qualität**: Bulk-Export generiert identische PDFs wie Einzelexport
- **Verbesserte Fehlerbehandlung**: Robustere Token-Validierung und Datenverarbeitung

## 🔐 Sicherheits-Features

- **Kein Token im Code** - API-Token wird nur zur Laufzeit eingegeben
- **Session-basierte Speicherung** - Token wird nur im sessionStorage gespeichert (nicht persistent)
- **Automatische Token-Validierung** - Ungültige Tokens werden automatisch gelöscht
- **Sichere Übertragung** - Alle API-Calls über HTTPS
- **Logout-Funktionalität** - Token wird vollständig aus Memory und Storage gelöscht

## 🚀 Installation

### Voraussetzungen
- Node.js 16+ und npm
- Toggl Track Account mit API-Token

### Setup
```bash
git clone https://github.com/orichterseidemannweb/toggl-websense.git
cd toggl-websense
npm install
npm run dev
```

## 🔑 Konfiguration

### Toggl API Token
1. Logge dich in [Toggl Track](https://track.toggl.com) ein
2. Gehe zu **Profile Settings** → **API Token**
3. Kopiere deinen persönlichen API Token
4. Beim ersten Start der App gibst du diesen Token ein
5. **Der Token wird für die Session gespeichert** - du musst ihn nicht bei jedem Reload neu eingeben

### Session-Verhalten
- **Token bleibt aktiv**: Während der Browser-Session (Tab offen)
- **Automatische Löschung**: Beim Schließen des Browser-Tabs
- **Logout**: Manuell über den Logout-Button in der StatusBar
- **Validierung**: Bei jedem App-Start wird die Token-Gültigkeit geprüft

## 📋 Voraussetzungen

- Node.js (>= 16.0.0)
- npm oder yarn
- Toggl Track Account mit API-Token

## 🛠 Installation

```bash
# Repository klonen
git clone https://github.com/orichterseidemannweb/toggl-websense.git

# In das Projektverzeichnis wechseln
cd toggl-websense

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 🔧 Konfiguration

### Toggl API-Token

1. Melde dich bei [Toggl Track](https://track.toggl.com) an
2. Gehe zu **Profile Settings** → **API Token**
3. Kopiere deinen API-Token
4. Füge den Token beim ersten Start der Anwendung ein

### Umgebungsvariablen

Erstelle eine `.env` Datei im Projektroot (optional):

```env
VITE_TOGGL_API_BASE_URL=https://api.track.toggl.com/api/v9
```

## 🎯 Verwendung

### 1. Anmeldung
- Starte die Anwendung mit `npm run dev`
- Öffne http://localhost:5173
- Gib deinen Toggl API-Token ein

### 2. Daten filtern
- **Zeitraum**: Wähle Jahr und Monat über den Monatsselektor
- **Kunde**: Filtere nach spezifischen Kunden oder zeige alle an
- **Projekt**: Filtere nach Projekten (automatisch basierend auf Kundenauswahl)

### 3. Spalten anpassen
- Klicke auf das Spalten-Symbol (☰) um die Spaltenauswahl zu öffnen
- Aktiviere/deaktiviere gewünschte Spalten
- Die Auswahl wird automatisch gespeichert

### 4. PDF-Export
- Klicke auf den "PDF Export" Button
- Der Report wird automatisch heruntergeladen
- Enthält Firmenlogo und professionelle Formatierung

## 🏗 Projektstruktur

```
src/
├── components/           # React-Komponenten
│   ├── ApiStatus.tsx    # API-Verbindungsstatus
│   ├── ClientFilter.tsx # Kundenfilter
│   ├── ColumnVisibilityControl.tsx # Spaltenauswahl
│   ├── DateRangePicker.tsx # Datumsauswahl
│   ├── DebugInfo.tsx    # Debug-Informationen
│   ├── FilterOptions.tsx # Filteroptionen
│   ├── Login.tsx        # Anmeldekomponente
│   ├── MonthSelector.tsx # Monatsauswahl
│   ├── ProjectFilter.tsx # Projektfilter
│   ├── ReportView.tsx   # Hauptreport-Ansicht
│   ├── StatusBar.tsx    # Statusanzeige
│   ├── TimeReport.tsx   # Zeitreport-Tabelle
│   └── TokenTester.tsx  # Token-Validierung
├── services/            # Business-Logic
│   ├── togglService.ts  # Toggl API-Integration
│   └── pdfExportService.ts # PDF-Generierung
├── config/              # Konfigurationsdateien
├── assets/              # Statische Assets
└── tests/              # Unit-Tests
```

## 🧪 Tests

```bash
# Alle Tests ausführen
npm test

# Tests mit Coverage
npm run test:coverage

# Tests im Watch-Modus
npm test -- --watch
```

## 🔨 Build & Deployment

```bash
# Produktions-Build erstellen (mit Server-Dateien)
npm run build:deploy

# Build lokal testen
npm run preview
```

**Wichtig**: Das `dist/` Verzeichnis wird **nicht** ins Repository gepusht (steht in .gitignore). 
Nur der Source-Code wird versioniert - der Build wird bei Bedarf generiert.

### Deployment auf Vercel/Netlify

1. Verknüpfe dein GitHub-Repository
2. Setze Build-Kommando: `npm run build`
3. Setze Output-Verzeichnis: `dist`
4. Deploy!

## 🎨 Anpassungen

### Logo ändern
- Ersetze `