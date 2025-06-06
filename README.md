# Toggl WebSense 📊

Eine moderne React-Webanwendung zur Verwaltung und Analyse von Toggl-Zeiterfassungsdaten mit erweiterten Funktionen für Export und Berichtswesen.

## ✨ Features

- 🔐 **Sichere Token-Authentifizierung** - Verwende deinen persönlichen Toggl API Token als Login
- 💾 **Session-Persistierung** - Token bleibt für die Browser-Session gespeichert (automatisch gelöscht beim Tab schließen)
- 📊 **Detaillierte Berichte** - Umfassende Ansicht aller Zeiterfassungseinträge
- 📅 **Zeitraum-Auswahl** - Flexible Datums- und Monatsauswahl
- 🗂️ **Spalten-Kontrolle** - Ein-/Ausblenden von Tabellenspalten nach Bedarf
- 📄 **PDF-Export** - Professionelle PDF-Berichte mit Corporate Branding
- 🎨 **Moderne UI** - Responsive Design mit dunklem/hellem Modus
- ⚡ **Real-time Updates** - Live-Aktualisierung der Daten
- 🔍 **Erweiterte Filter** - Sortierung und Filterung der Zeiteinträge

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
# Produktions-Build erstellen
npm run build

# Build lokal testen
npm run preview
```

### Deployment auf Vercel/Netlify

1. Verknüpfe dein GitHub-Repository
2. Setze Build-Kommando: `npm run build`
3. Setze Output-Verzeichnis: `dist`
4. Deploy!

## 🎨 Anpassungen

### Logo ändern
- Ersetze `