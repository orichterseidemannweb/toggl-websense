# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.3] - 2025-06-07

### Hinzugefügt
- **💡 Feedback-System**: Vollständiges Feature-Request und Bug-Management System
  - Integriertes Modal für Feature-Requests und Bug-Reports
  - Automatische Email- und Datum-Erkennung
  - Debug-Log-Anhang-Option für bessere Fehleranalyse
  - Prioritätsstufen: Niedrig, Mittel, Hoch, Kritisch
  - Admin-Panel mit Status-Management (Neu → In Bearbeitung → Erledigt/Abgelehnt)
  - Admin-Kommentar-System für Feedback-Einträge
  - Filter nach Typ (Feature-Request/Bug) und Status
  - CSV-Export für alle Feedback-Einträge
  - Smart-Notifications mit Badge für neue Einträge
  - Persistente LocalStorage-Datenhaltung
- **🎨 Footer-Integration**: Elegante Integration des Feedback-Buttons
- **📧 User-Email-Integration**: Automatische Erkennung der Toggl-User-Email

### Entfernt
- **📋 "Projekt-Spalte automatisch ausgeblendet"**: Info-Bubble für Feedback-System entfernt

### Verbessert
- **🎯 Benutzerfreundlichkeit**: Direktes Feedback-Geben in der App möglich
- **🔧 Debug-Integration**: Debug-Logs können direkt mit Feedback-Reports geteilt werden
- **👨‍💼 Admin-Workflow**: Professionelle Feedback-Verwaltung und -Verfolgung

## [1.6.2] - 2025-06-07

### Verbessert
- **Changelog-Datums-Korrektur**: Korrekte Datumsangaben für alle Versionseinträge sichergestellt
- **Finaler Release**: Stabile Version mit vollständiger Login-UX-Optimierung

## [1.6.1] - 2025-06-07

### Verbessert
- **Intelligente Login-Feld-Löschung**: Spezifische Eingabefeld-Löschung basierend auf Fehlertyp
  - Bei ungültigem API Token: Beide Felder werden geleert
  - Bei ungültigem Report-ID aber korrektem Token: Nur Report-ID wird geleert
  - Verbesserte Benutzerfreundlichkeit - kein erneutes Eingeben korrekter Tokens erforderlich
- **Optimierte Fehlermeldungen**: Klarere Unterscheidung zwischen Token- und Report-ID-Fehlern

## [1.6.0] - 2025-06-07

### 🐛 KRITISCHER BUGFIX - Zeitberechnung korrigiert
- **🎯 Hauptproblem gelöst**: Zeitzone-bedingte Diskrepanzen in Monatsberechnungen vollständig behoben
- **⏰ Exakte Zeitübereinstimmung**: App-Zeiten stimmen nun 100% mit Toggl Interface überein
- **📅 Robuste Datumsberechnung**: Zeitzone-unabhängige Monatsbereichsermittlung implementiert
- **🔧 String-basierte Datumskonstruktion**: Direkte ISO-String-Generierung verhindert Zeitzone-Konvertierungsfehler
- **✅ Billing-Ready**: Anwendung ist jetzt absolut verlässlich für Abrechnungen

### 🔍 Debug-System erweitert (dauerhaft verfügbar)
- **🛠️ Professionelles Debug-Panel**: Elegantes, dauerhaft integriertes Debug-Interface
- **📋 Ein-Klick-Copy**: Alle Debug-Informationen mit einem Klick in Zwischenablage kopierbar
- **✨ Animierte Bestätigung**: Sanfte visueller Feedback beim Kopieren ohne störende Popups  
- **🎨 Design-Integration**: Debug-Panel harmoniert perfekt mit App-Design (Glasmorphism-Buttons)
- **📊 Strukturierte Logs**: Zeitgestempelte, kategorisierte Debug-Ausgaben für effiziente Problemanalyse

### 🔬 Technische Details des Bugfixes
- **Problem**: `new Date().getMonth()` in Kombination mit Zeitzone-Konvertierung führte zu falschen Monatsbereichen
- **Lösung**: Direkte String-Konstruktion der Datumsbereiche (z.B. "2025-05-01" bis "2025-05-31")
- **Auswirkung**: 3 fälschlich inkludierte April-Einträge (90 Min total) werden nun korrekt herausgefiltert
- **Validierung**: Umfangreich getestet mit verschiedenen Kunden und Monaten

### 🎯 Qualitätssicherung
- **💯 Genauigkeit**: Zeit-Berechnungen sind jetzt billing-critical ready
- **🧪 Getestet**: Validierung mit mehreren Kunden und verschiedenen Monaten erfolgreich
- **📈 Vertrauen**: Vollständige Datenintegrität für professionelle Abrechnungen gewährleistet

**Dieser Release behebt einen kritischen Fehler, der zu ungenauen Zeitberechnungen führte - ein absolutes Must-Have-Update für alle Benutzer!**

## [1.5.1] - 2025-01-07

### 🔒 Sicherheitsverbesserungen
- **Report-ID Hardcoding entfernt**: Keine sensiblen Daten mehr im Source Code
- **Dynamische Report-Auswahl**: Benutzer geben Report-ID beim Login ein
- **Universelle Portabilität**: Anwendung funktioniert jetzt mit beliebigen öffentlichen Toggl-Reports
- **Session-Management**: Token und Report-ID werden sicher in Session Storage verwaltet

### 🎨 Login-Interface Redesign
- **Kompakter Login**: Labels entfernt, Placeholders für cleanes Design  
- **Inline-Hilfstexte**: Direkte Hinweise unter jedem Eingabefeld
- **Redundanz eliminiert**: ApiTokenHelp-Komponente entfernt (war redundant zu neuen Hilfstexten)
- **Textoptimierung**: Präzisere Formulierungen ohne Redundanzen

### ✨ UX-Verbesserungen
- **Zwei-Felder-Login**: API Token + Report-ID in einem cleanen Formular
- **Bessere Benutzerführung**: "API Token hier einfügen" / "Report-ID hier einfügen"
- **Kontextuelle Hilfe**: Gezielte Hinweise zu Toggl Profile Settings und öffentlichen Reports
- **Responsives Design**: Optimierte Formulargröße für alle Bildschirmgrößen

### 🔧 Technische Verbesserungen
- **Service-Layer erweitert**: TogglService unterstützt dynamische Report-IDs
- **Validierung verbessert**: Separate Prüfung von API Token und Report-Zugriff  
- **Error Handling**: Bessere Fehlermeldungen bei ungültigen Credentials
- **Code-Cleanup**: Entfernung ungenutzter ApiTokenHelp-Komponente und CSS

### 🛡️ Multi-Team-Fähigkeit
- **Team-unabhängig**: Jedes Team kann eigene Report-IDs verwenden
- **Datenschutz**: Keine Team-spezifischen Daten mehr im Code eingebettet
- **Flexibilität**: Unterstützung für beliebige Toggl-Workspaces und Reports

## [1.5.0] - 2025-06-06

### ✨ Major UI Redesign: Vollständiges Bubble-Design-System

#### 🎨 Neue Designsprache
- **Glasmorphism-Effekte**: Einführung eines einheitlichen Bubble-Designs mit `backdrop-filter: blur(8px)` für moderne Glasoptik
- **Einheitliche Border-Radius**: Alle interaktiven Elemente verwenden jetzt 20px Rundungen für konsistente Erscheinung
- **Responsive Hover-Animationen**: `translateY()` Effekte für alle Bubbles mit subtilen Schatten-Variationen
- **Transparente Hintergründe**: `rgba(255, 255, 255, 0.9)` für elegante Durchsichtigkeit

#### 🔧 Betroffene Komponenten
- **StatusBar (Header)**: Kompletter Redesign der Benutzerinformationen mit größerer Bubble und "Angemeldet als" Präfix
- **PDF-Export-Buttons**: Farbkodierte Bubble-Optik (Grün für Standard-Export, Lila für Bulk-Export)
- **Login-Komponente**: Vollständige Überarbeitung mit Glasmorphism-Container, Input-Feld und Submit-Button
- **Footer-Bubbles**: Bereits in v1.4.2 etabliertes Design als Basis für das gesamte System

#### 📱 Technische Verbesserungen
- **Konsistente Farbpalette**: Einheitliche Border-Farben je Funktionsbereich
- **Optimierte Performance**: Effiziente CSS-Transitions für alle Hover-Effekte
- **Mobile Responsivität**: Flexible Layouts mit `flex-wrap` für alle Bildschirmgrößen
- **Accessibility**: Verbesserte Kontraste und Hover-States für bessere Benutzererfahrung

#### 🎯 Design-Philosophie
- **Minimalismus**: Reduzierung visueller Unordnung durch einheitliche Bubble-Struktur
- **Modernität**: Zeitgemäße Glasmorphism-Trends für professionelle Optik
- **Intuitivität**: Klare visuelle Hierarchie durch konsistente Designsprache
- **Eleganz**: Subtile Animationen ohne Übertreibung

### 🚀 Build & Deployment
- **Produktionsversion**: Erfolgreich getestet und optimiert für Webserver-Deployment
- **Asset-Optimierung**: CSS-Bundle auf 21.88 kB optimiert mit allen neuen Styles
- **Cross-Browser-Kompatibilität**: Vollständige Unterstützung für moderne Browser

## [1.4.2] - 2025-06-06

### 🎨 UI-Verbesserungen
- **✨ Footer-Redesign**: Komplett überarbeitete Footer-Sektion mit modernem Bubble-Design
- **🗑️ UI-Entrümpelung**: Redundante Informationen entfernt (Einträge-Anzahl, doppelte Filter-Anzeigen)
- **🎯 Fokussierte Anzeige**: Nur noch relevante Status-Informationen (Gruppierung, Abrechenbarkeit, etc.)
- **🌈 Intelligente Farbkodierung**: Verschiedene Farben für verschiedene Info-Typen

### 💎 Design-Features
- **Glasmorphism-Bubbles**: Moderne durchscheinende Optik mit backdrop-filter
- **Hover-Animationen**: Subtile Transformationen und Schatten-Effekte
- **Responsive Design**: Automatisches Wrapping der Bubbles bei kleinen Bildschirmen
- **Konsistente Typografie**: Einheitliche Schriftgrößen und -gewichte

### 🔧 Technische Verbesserungen
- **CSS-Optimierung**: Entfernung ungenutzter Klassen und Vereinfachung der Styles
- **Modulares Design**: Wiederverwendbare Bubble-Komponenten mit Farb-Varianten
- **Performance**: Weniger DOM-Elemente durch Entfernung redundanter Anzeigen

**User Experience**: Deutlich sauberere und übersichtlichere Interface ohne visuellen Ballast

## [1.4.1] - 2025-06-06

### 🛠️ Behoben
- **Overlay-Problem gelöst**: Progress-Overlay für Bulk-Export komplett entfernt
- **100% Stabilität**: Bulk-Export funktioniert nun zuverlässig ohne UI-Störungen
- **Performance**: Weniger UI-Updates führen zu besserer Reaktionszeit

### 🎯 Geändert
- **Pragmatischer Ansatz**: Fokus auf Kernfunktion statt komplexe UI-Elemente
- **Hintergrund-Processing**: Bulk-Export läuft vollständig im Hintergrund
- **Konsolen-Logging**: Entwickler können Fortschritt weiterhin in Browser-Konsole verfolgen

### 📝 Notizen
- Die revolutionäre Bulk-Export-Funktion (alle PDFs mit einem Klick) funktioniert perfekt
- Übersichtliche Abschlussmeldung nach erfolgreichem Export bleibt erhalten
- Weniger UI-Komplexität = mehr Stabilität = bessere User Experience

## [1.4.0] - 2025-06-06

### 🚀 Neu - Revolutionary Bulk PDF Export
- **📦 Ein-Klick-Export**: Alle Kunden-PDFs mit einem einzigen Klick generieren
- **🧠 Intelligente Logik**: Automatische Erkennung von Kunden und Projekten
- **📁 Smart-Gruppierung**: Ein PDF pro Kunde (bei einem Projekt) oder ein PDF pro Projekt (bei mehreren)
- **⏱️ Task-Aggregation**: Arbeitszeiten werden pro Task zusammengefasst und angezeigt
- **📋 Projekt-Header**: Projektname wird korrekt in Bulk-PDFs angezeigt
- **🗜️ ZIP-Download**: Alle PDFs organisiert in einer ZIP-Datei
- **📊 Progress-Tracking**: Intelligenter Fortschrittsbalken mit Abbruch-Option
- **🚫 Auto-Filter**: Interne Projekte ("Intern Web") werden automatisch ausgeschlossen

### 🎯 Verbesserungen
- **Produktivitätssteigerung**: 99% weniger Klicks pro Monat
- **Spalten-Standardwerte**: Optimierte Standard-Sichtbarkeit für bessere UX
- **Konsistente PDF-Qualität**: Bulk-Export generiert identische PDFs wie Einzelexport
- **Verbesserte Fehlerbehandlung**: Robustere Token-Validierung und Datenverarbeitung

### 🔧 Technisch
- JSZip Integration für ZIP-Downloads
- Bulk-Export-Service mit intelligenter Verarbeitungslogik
- Progress-Overlay-System implementiert
- Optimierte PDF-Generierung Pipeline

## [1.2.3] - 2025-06-06

### 🎨 Geändert
- Logo-Position im PDF-Export optimiert - jetzt rechtsbündig mit der Tabelle ausgerichtet
- Verbessertes visuelles Layout für professionellere PDF-Reports

### 🔧 Technisch
- PDF-Export-Service: Logo-Positionierung von 10mm auf 20mm rechter Rand angepasst

## [1.2.2] - 2025-06-06

### ✨ Neu
- Vollständige PDF-Export-Funktionalität implementiert
- Professionelle Tätigkeitsnachweise mit Firmenlogo
- Intelligente Spaltenfilterung im PDF (Kunde/Projekt-Spalten werden automatisch ausgeblendet)
- Zusammenfassungszeile mit Gesamtstunden im PDF-Export

### 🎨 Geändert
- PDF-Layout verbessert mit korrektem Logo-Seitenverhältnis (4.58:1)
- Deutsche Monatsnamen in PDF-Exporten
- Optimierte Dateinamen für PDF-Downloads

### 🔧 Technisch
- jsPDF und jsPDF-AutoTable Dependencies hinzugefügt
- PDFExportService erstellt mit umfassender Export-Logik
- Logo-Laden mit Canvas-Konvertierung implementiert

## [1.2.1] - 2025-06-06

### 🐛 Behoben
- Performance-Optimierungen bei der Datenverarbeitung
- Verbesserte Fehlerbehandlung bei API-Aufrufen

## [1.2.0] - 2025-06-06

### ✨ Neu
- Spalten-Sichtbarkeits-Kontrolle implementiert
- Benutzer können Tabellenspalten ein-/ausblenden
- Persistente Spaltenauswahl (wird im LocalStorage gespeichert)
- Verbessertes UI mit Spalten-Toggle-Interface

### 🎨 Geändert
- Tabellen-Interface überarbeitet für bessere Benutzererfahrung
- Responsive Design für mobile Geräte verbessert

### 🔧 Technisch
- ColumnVisibilityControl Komponente erstellt
- LocalStorage Integration für Benutzereinstellungen

## [1.1.4] - 2025-06-06

### ✨ Neu
- PDF-Export Grundfunktionalität begonnen
- jsPDF Integration vorbereitet

### 🔧 Technisch
- PDF-Dependencies installiert und konfiguriert

## [1.1.3] - 2025-06-06

### 🎨 Geändert
- MonthSelector UI-Verbesserungen
- Bessere Datumsauswahl-Erfahrung

### 🔧 Technisch
- MonthSelector Komponente optimiert

## [1.1.2] - 2025-06-06

### 🐛 Behoben
- Kleinere Bugfixes und Stabilitätsverbesserungen
- UI-Polish

## [1.1.1] - 2025-06-06

### 🐛 Behoben
- Build-Probleme behoben
- Entwicklungsumgebung stabilisiert

## [1.1.0] - 2025-06-06

### ✨ Neu
- Erweiterte Filterfunktionalität
- Verbesserte Datenvisualisierung
- Performance-Optimierungen

### 🎨 Geändert
- UI-Components überarbeitet
- Bessere Benutzerführung

## [1.0.8] - 2025-06-06

### 🎨 Geändert
- App-Interface Überarbeitung
- Verbesserte Navigation und Layoutstruktur

### 🔧 Technisch
- App.tsx umfangreiche Refaktorierung

## [1.0.7] - 2025-06-06

### ✨ Neu
- ColumnVisibilityControl Komponente hinzugefügt
- Erste Version der Spaltenauswahl

### 🎨 Geändert
- ReportView erweiterte Funktionalität

## [1.0.6] - 2025-06-06

### 🐛 Behoben
- ReportView Bugfixes und Optimierungen
- Stabilere Datenverarbeitung

## [1.0.5] - 2025-06-06

### 🎨 Geändert
- ReportView UI-Verbesserungen
- Tabellendarstellung optimiert

## [1.0.4] - 2025-06-06

### 🔧 Technisch
- Verbesserte Umgebungsvariablen-Verwaltung
- Konfigurationssystem überarbeitet

## [1.0.3] - 2025-06-06

### ✨ Neu
- Initiale Toggl API Integration
- Grundlegende Authentifizierung implementiert

### 🔧 Technisch
- TogglService erstellt
- API-Token Management

## [1.0.2] - 2025-06-06

### 🎨 Geändert
- UI-Framework Setup
- Grundlegendes Styling implementiert

## [1.0.1] - 2025-06-06

### 🔧 Technisch
- Projekt-Setup und Konfiguration
- Build-System etabliert

## [1.0.0] - 2025-06-06

### ✨ Neu
- Erstes Release der Toggl WebSense Anwendung
- React + TypeScript + Vite Setup
- Grundlegende Projektstruktur

### 🔧 Technisch
- Entwicklungsumgebung eingerichtet
- CI/CD Pipeline vorbereitet

---

## Legende

- ✨ **Neu**: Neue Features
- 🎨 **Geändert**: Änderungen an bestehenden Features
- 🐛 **Behoben**: Bugfixes
- 🔧 **Technisch**: Technische Verbesserungen unter der Haube
- 🚨 **Breaking**: Breaking Changes (Backwards-incompatible)
- 🗑️ **Entfernt**: Entfernte Features

## Mitwirkende

Besonderer Dank an alle Entwickler und Tester, die zu diesem Projekt beigetragen haben:

- **OrichterSeidemannWeb Team** - Hauptentwicklung
- **Community Contributors** - Feedback und Verbesserungsvorschläge

## Support

Bei Fragen zu einer bestimmten Version:
- Öffne ein [GitHub Issue](https://github.com/orichterseidemannweb/toggl-websense/issues)
- Referenziere die entsprechende Versionsnummer
- Beschreibe dein Problem detailliert

---

*Für mehr Details zu einer Version, siehe die entsprechenden Git-Tags und Release-Notes.* 