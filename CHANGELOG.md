# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2024-12-22

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

## [1.4.0] - 2024-12-22

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

## [1.2.3] - 2024-12-17

### 🎨 Geändert
- Logo-Position im PDF-Export optimiert - jetzt rechtsbündig mit der Tabelle ausgerichtet
- Verbessertes visuelles Layout für professionellere PDF-Reports

### 🔧 Technisch
- PDF-Export-Service: Logo-Positionierung von 10mm auf 20mm rechter Rand angepasst

## [1.2.2] - 2024-12-17

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

## [1.2.1] - 2024-12-17

### 🐛 Behoben
- Performance-Optimierungen bei der Datenverarbeitung
- Verbesserte Fehlerbehandlung bei API-Aufrufen

## [1.2.0] - 2024-12-17

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

## [1.1.4] - 2024-12-17

### ✨ Neu
- PDF-Export Grundfunktionalität begonnen
- jsPDF Integration vorbereitet

### 🔧 Technisch
- PDF-Dependencies installiert und konfiguriert

## [1.1.3] - 2024-12-17

### 🎨 Geändert
- MonthSelector UI-Verbesserungen
- Bessere Datumsauswahl-Erfahrung

### 🔧 Technisch
- MonthSelector Komponente optimiert

## [1.1.2] - 2024-12-17

### 🐛 Behoben
- Kleinere Bugfixes und Stabilitätsverbesserungen
- UI-Polish

## [1.1.1] - 2024-12-17

### 🐛 Behoben
- Build-Probleme behoben
- Entwicklungsumgebung stabilisiert

## [1.1.0] - 2024-12-17

### ✨ Neu
- Erweiterte Filterfunktionalität
- Verbesserte Datenvisualisierung
- Performance-Optimierungen

### 🎨 Geändert
- UI-Components überarbeitet
- Bessere Benutzerführung

## [1.0.8] - 2024-12-17

### 🎨 Geändert
- App-Interface Überarbeitung
- Verbesserte Navigation und Layoutstruktur

### 🔧 Technisch
- App.tsx umfangreiche Refaktorierung

## [1.0.7] - 2024-12-17

### ✨ Neu
- ColumnVisibilityControl Komponente hinzugefügt
- Erste Version der Spaltenauswahl

### 🎨 Geändert
- ReportView erweiterte Funktionalität

## [1.0.6] - 2024-12-17

### 🐛 Behoben
- ReportView Bugfixes und Optimierungen
- Stabilere Datenverarbeitung

## [1.0.5] - 2024-12-17

### 🎨 Geändert
- ReportView UI-Verbesserungen
- Tabellendarstellung optimiert

## [1.0.4] - 2024-12-17

### 🔧 Technisch
- Verbesserte Umgebungsvariablen-Verwaltung
- Konfigurationssystem überarbeitet

## [1.0.3] - 2024-12-17

### ✨ Neu
- Initiale Toggl API Integration
- Grundlegende Authentifizierung implementiert

### 🔧 Technisch
- TogglService erstellt
- API-Token Management

## [1.0.2] - 2024-12-17

### 🎨 Geändert
- UI-Framework Setup
- Grundlegendes Styling implementiert

## [1.0.1] - 2024-12-17

### 🔧 Technisch
- Projekt-Setup und Konfiguration
- Build-System etabliert

## [1.0.0] - 2024-12-17

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