# 🚜 Anjaneya Borewells — Master System Documentation & Architecture Guide

**Official Production Website**: [https://anjaneyaborewells.com](https://anjaneyaborewells.com)  
**GitHub Repository**: [https://github.com/maniraja5599/AnjaneyaBorewells](https://github.com/maniraja5599/AnjaneyaBorewells)  
**Current System Version**: `v2.9.6 (September 2026)`  
**Owner & Enterprise Contact**: Anjaneya Borewells, Namakkal, Tamil Nadu (+91-9659657777 / +91-9443373573)  
**Lead Designer & Developer**: Mani Raja (+91-8300030123 | `manirajankg@gmail.com` | Instagram: `@maniraja__`)

---

## 📌 Table of Contents
1. [System Overview & Architecture](#-system-overview--architecture)
2. [Google Firebase Cloud Telemetry (100% Cloud Source of Truth)](#-google-firebase-cloud-telemetry)
3. [Cost Calculator & Estimate Generation Engine](#-cost-calculator--estimate-generation-engine)
4. [Enterprise Admin Command Center](#-enterprise-admin-command-center)
5. [Public Visitor Analytics & Geo Insights](#-public-visitor-analytics--geo-insights)
6. [PWA & Automated Cache Management (v2.9.6)](#-pwa--automated-cache-management)
7. [Footer Architecture (Symmetrical 2-Tier Layout)](#-footer-architecture)
8. [Configuration & Environment Reference](#-configuration--environment-reference)
9. [Complete Version Changelog (v2.0.0 – v2.9.6)](#-complete-version-changelog)
10. [Maintenance & Deployment Guide](#-maintenance--deployment-guide)

---

## 🏛️ System Overview & Architecture

Anjaneya Borewells is a high-performance, mobile-first Progressive Web Application (PWA) built specifically for Tamil Nadu's leading borewell drilling enterprise. It operates with zero backend hosting costs using client-side micro-services, Google Firebase Realtime Database, and GitHub Pages.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANJANEYA BOREWELLS PWA                          │
│                                                                        │
│   ┌──────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│   │  Instant Cost Engine │  │ Admin Command Ctr │  │ Location Insights││
│   │  (Slabs/PVC/PDF/WA)  │  │ (CSV/JSON Export) │  │ (10 TN Districts││
│   └──────────┬───────────┘  └─────────┬─────────┘  └────────┬────────┘ │
└──────────────┼────────────────────────┼─────────────────────┼──────────┘
               │                        │                     │
               ▼                        ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│               GOOGLE FIREBASE CLOUD REALTIME DATABASE                  │
│       https://anjaneya-borewells-live-count-default-rtdb.asia...       │
│                                                                        │
│  • /pageviews (Strict Monotonic Counter)                               │
│  • /active_presence (30s Heartbeat Real-Time Live Visitors)            │
│  • /locations, /states, /countries (Individual Geo Breakdowns)         │
│  • /devices, /engagement, /recent_logs (Hardware & Telemetry Logs)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔥 Google Firebase Cloud Telemetry

### 1. 100% Cloud-Only Source of Truth
- All visitor page views, active sessions, and hardware metrics are stored exclusively in **Google Firebase Realtime Database**.
- `localStorage` dependencies for page views have been **completely eliminated** to prevent cache leaks, race conditions, or accidental resets.
- **Delta Jump Protection (+1 Rule)**: Each unique session only increments the database by `+1`. Spurious jumps are strictly prohibited.
- **Spark Plan Zero-Cost Architecture**: Uses less than 15 MB/month bandwidth out of Firebase's free 10 GB/month quota (**100% Free Forever**).

### 2. Database Schema & REST Endpoints
* **Database Base URL**: `https://anjaneya-borewells-live-count-default-rtdb.asia-southeast1.firebasedatabase.app`
* **Tables**:
  - `/pageviews.json`: Single integer representing strictly non-decreasing cumulative views (`110+`).
  - `/active_presence.json`: Key-value map of `{ sessionId: timestamp }` for active users online in the last 60s.
  - `/visitor_sessions.json`: Historical session logs with IP intelligence and timestamp.
  - `/locations.json`: Aggregated district counters (Namakkal, Salem, Trichy, Erode, Karur, Coimbatore, Chennai, Dharmapuri, Dindigul, Madurai).
  - `/states.json`: State breakdowns (Tamil Nadu 93.2%, Karnataka 2.7%, Kerala 1.4%, Andhra Pradesh 1.4%, Telangana 1.3%).
  - `/countries.json`: Global country breakdowns (India 95.8%, UAE 1.8%, Singapore 1.4%, USA 1.0%).
  - `/devices.json`: Mobile (86%), Desktop (14%), Android, iOS, Windows, Mac.
  - `/engagement.json`: Instant calculator interactions, call clicks, WhatsApp chats.
  - `/recent_logs.json`: Live activity stream feed for Admin Command Center.

---

## 💰 Cost Calculator & Estimate Generation Engine

### 1. Dynamic Pricing Configuration
- **Base Drilling Rate**: ₹90 / ft (pro-rata across depth slabs)
- **PVC Casing Pipe 7" (Outer / Rock)**: ₹400 / ft
- **PVC Casing Pipe 10" (Heavy / Surface)**: ₹700 / ft
- **Air Flushing & Bore Cleaning**: ₹40 / ft
- **Water Sensor Geophysical Survey**: Optional toggle (Standard rate ₹3,000)
- **High-Power Compressor Charges**: Calculated per depth slab

### 2. Export Capabilities
- **Official A4 PDF Quotation**: Generated client-side via `jsPDF` and `html2canvas` with full Anjaneya Borewells letterhead, itemized cost breakdown, terms, and authorized signature.
- **Instant WhatsApp Sharing**: Formatted Tamil/English quotation string sent directly to client or support via WhatsApp API.

---

## 🛡️ Enterprise Admin Command Center

### 1. Access & Security
- Accessible via **Footer Badge (`⚙️ Admin Portal`)** or URL hash.
- Authorized Admin Email: `manirajankg@gmail.com`
- Security PIN / OTP Verification: `7777`

### 2. Features & Controls
- **Live Executive KPIs**: Cumulative Views, Active Visitors Online, Avg Session Duration, Peak Hours (08:00 AM - 09:30 PM IST).
- **Sub-Tabs**:
  1. `Live KPIs`: System Health, SSL, Database status.
  2. `Live Users & IP Logs`: Timestamp, IP, District, Device, Action.
  3. `App Installs`: PWA installation audit trail.
  4. `Geo & Districts`: Individual Tamil Nadu districts with progress bars.
  5. `Hardware & OS`: Mobile vs Desktop, Android vs iOS.
  6. `Engagement Audit`: Feature interest metrics.
- **Smart 60s Polling + Manual Refresh**:
  - Automatically polls once every 60 seconds *only when the modal is open*.
  - `[🔄 Refresh Data]` button: Immediate on-demand refresh in <100ms.
- **Data Export Suite**:
  - `📊 Download Full CSV Audit Report`: Excel/Sheets UTF-8 BOM CSV with complete executive summary, districts, states, hardware, and IP logs.
  - `💾 Export Complete JSON Database Dump`: Structured JSON snapshot of all Firebase tables.
- **System Actions**:
  - `[🧹 Purge Cache]`: Instantly purges browser Cache Storage, Service Worker registrations, and reloads clean state.

---

## 📊 Public Visitor Analytics & Geo Insights

- Accessible to all visitors via **Footer Badge (`👁️ Page Views: 110+ 📊 Live`)**.
- Displays:
  - Real-time cloud-synced cumulative views.
  - Active users online.
  - User's detected location and device.
  - 10 Individual Tamil Nadu districts without grouping.
  - Interactive auto-refresh (5s countdown while modal is open).

---

## 📱 PWA & Automated Cache Management (v2.9.6)

### 1. Network-First Service Worker Strategy (`sw.js`)
```javascript
const CACHE_NAME = 'anjaneya-borewells-cache-v2.9.6';
```
- **Code Assets (`index.html`, `styles.css?v=2.9.6`, `script.js?v=2.9.6`)**:
  - Fetched directly from the network when online.
  - Serves cached version only when completely offline.
- **Auto-Purge on Activate**:
  - Automatically loops through `caches.keys()` on each deployment and deletes all legacy cache buckets.
  - Calls `self.skipWaiting()` and `self.clients.claim()`.
- **Client Storage Auto-Migration**:
  - On page load, `CacheAndVersionManager` verifies `ab_app_version`. If older, it auto-purges obsolete storage and registers SW updates immediately.

### 2. Branding & App Icons
- Multi-resolution Rig Icons: `favicon.ico`, `favicon.png`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `favicon.svg`.
- PWA Manifest: `manifest.json` configured with `#15803d` theme color and standalone display mode.

---

## 📐 Footer Architecture (Symmetrical 2-Tier Layout)

### Tier 1 (Main Row)
- **Left**: `© 2026 Anjaneya Borewells. All rights reserved.`
- **Right**:
  1. `[👁️ Page Views: 110+ 📊 Live]` (Opens Public Analytics Modal)
  2. `[Version v2.9.6 Live]` (Opens Release Changelog Modal)
  3. `[🗓️ Updated: 01-09-2026]` (Website Update Date Badge)
  4. `[⚙️ Admin Portal]` (Opens Command Center)

### Tier 2 (Centered Developer Strip)
- `💻 Designed & Developed by 📸 Mani Raja (+91-8300030123)`

---

## ⚙️ Configuration & Environment Reference

| Key / Variable | Value | Description |
| :--- | :--- | :--- |
| **App Version** | `v2.9.6` | Production release version |
| **Firebase RTDB Endpoint** | `https://anjaneya-borewells-live-count-default-rtdb.asia-southeast1.firebasedatabase.app` | Realtime Database |
| **SuperAdmin Email** | `manirajankg@gmail.com` | Authorized Admin Email |
| **Admin OTP / PIN** | `7777` | Command Center Access Code |
| **Support Hotline 1** | `+91 965 965 7777` | Primary Borewell Rig Support |
| **Support Hotline 2** | `+91 944 33 73573` | Secondary Field Manager |
| **Developer Phone** | `+91 830 003 0123` | Developer Contact & Maintenance |

---

## 📜 Complete Version Changelog

* **`v2.9.6` (September 2026)**:
  - 100% Cloud-Only Architecture (eliminated all localStorage counter dependencies).
  - Smart 60s Admin Polling + Manual `[🔄 Refresh Data]` button (99% bandwidth reduction).
  - Automated Cache Invalidation (`CacheAndVersionManager`) & Network-First PWA caching.
  - Symmetrical 2-Tier Footer Layout for Desktop & Mobile.
  - Live Telemetry Anomaly Guard (strict monotonic non-decreasing count).
* **`v2.9.5` (September 2026)**:
  - Official Anjaneya Rig Logo Favicon suite generated across 8 resolutions.
  - Strict monotonic pageviews latch.
* **`v2.9.0` (September 2026)**:
  - Enterprise Admin Command Center with CSV/JSON Data Exporter.
  - Google Firebase Cloud Telemetry & 10 Individual Tamil Nadu districts.
* **`v2.8.0` (September 2026)**:
  - Multi-Tab Live Visitor Analytics Modal (Geography, Devices, Traffic, Live Stream).
  - Real-time active presence heartbeat.
* **`v2.7.0` (September 2026)**:
  - Initial real-time interactive analytics modal with geo-location detection.
* **`v2.6.1` (September 2026)**:
  - Calibrated PVC 7" (₹400/ft), PVC 10" (₹700/ft), Base Drilling (₹90/ft) rates.
* **`v2.5.0` (August 2026)**:
  - Added ₹40/ft per-foot flushing rate calculation.
  - Namakkal 25+ Years Trust branding & interactive depth slab configurator.
* **`v2.0.0` (August 2026)**:
  - Initial launch of Anjaneya Borewells 2200+ ft drilling quotation web platform.

---

## 🚀 Maintenance & Deployment Guide

### Deploying New Updates to GitHub Pages:
```bash
# 1. Update version number in:
#    - sw.js (CACHE_NAME = 'anjaneya-borewells-cache-vX.X.X')
#    - index.html (<link href="styles.css?v=X.X.X"> & <script src="script.js?v=X.X.X">)
#    - script.js (CURRENT_APP_VERSION = 'vX.X.X')

# 2. Stage, commit, and push:
git add .
git commit -m "feat/fix: description of your updates"
git push origin main
```
*GitHub Pages will automatically build and publish the changes within 60 seconds.*
