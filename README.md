# 🌍 2100 – Expérience climatique interactive

**2100** est une expérience immersive et interactive autour des enjeux climatiques. Les actions effectuées sur une application mobile influencent en temps réel une scène 3D affichée sur le web, simulant l'évolution du climat jusqu'en 2100.

Le projet est composé de 3 applications synchronisées via WebSockets :

- une app mobile (configurateur)
- une app web (scène 3D du biome)
- un serveur WebSocket

## 🗂 Structure du projet

À la racine du projet :

```
/
├─ mobile/   → Application mobile (React Native / Expo)
├─ web/      → Application web (Nuxt + Three.js)
└─ server/   → Serveur WebSocket
```

## ⚠️ Prérequis importants

- Tous les appareils doivent être sur la même connexion réseau (WiFi ou partage de connexion 4G/5G)
- L'adresse IP locale de la machine qui lance le serveur doit être renseignée dans les 3 apps

## 🔧 Configuration de l'IP (obligatoire)

Avant de lancer les applications, modifie l'IP du serveur dans les fichiers suivants :

### 📱 Mobile

`mobile/index.tsx`

```javascript
const SOCKET_URL = "http://172.20.10.4:4000/";
```

### 🖥 Server

`server/useSocket.ts`

```typescript
const SOCKET_URL: string = "http://172.20.10.4:4000";
```

### 🌐 Web

`web/useSocket.ts`

```typescript
const SOCKET_URL: string = "http://172.20.10.4:4000/";
```

**👉 Remplacer `172.20.10.4` par l'IP locale de la machine.**

## 🚀 Lancer le projet

### 1️⃣ Lancer le serveur

```bash
cd server
npm install
npm run dev
```

Le serveur WebSocket écoute sur le port 4000.

### 2️⃣ Lancer l'application mobile

```bash
cd mobile
npm install
npx expo start
```

- Installer l'application Expo Go sur le téléphone
- Scanner le QR code
- Le téléphone doit être sur le même réseau que le serveur

**Note** : Ce projet nécessite `expo-file-system@18.1.11` (pas la dernière) pour que les assets GLB fonctionnent correctement avec `@react-three/drei`.

### 3️⃣ Lancer l'application web

```bash
cd web
npm install
npm run dev
```

- Ouvrir l'app web sur un second écran ou en plein écran
- Cette app affiche la scène 3D du biome, qui réagit aux données reçues

## 🔁 Fonctionnement global

- Les actions de l'utilisateur sur l'app mobile sont envoyées au serveur
- Le serveur diffuse les données via WebSockets
- L'application web reçoit ces données et met à jour :
  - l'ambiance
  - la pollution
  - les états visuels de la scène 3D
- L'évolution se fait au fil des années jusqu'en 2100