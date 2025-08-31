# CalScan - Food Nutrition Scanner

This is a simple food nutrition scanner app built with Expo. It uses your device's camera to scan food product labels and provides nutritional analysis using Google's Gemini 2.0 AI.

<p align="center">
  <img src="image.png" alt="Download QR Code" width="200" />
</p>

## Download

Scan the QR code above or visit the link below to download the APK:
[Download CalScan APK](https://expo.dev/accounts/bisht/projects/calscan/builds/44849850-cc64-477c-9641-a5e5b3503787)

## App Preview

<p align="center">
  <img src="home.jpeg" alt="Home Screen" width="200" />
  <img src="camera.jpeg" alt="Camera Screen" width="200" />
</p>

## Setup for Development

1. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm start
   ```

## Features

- Camera-based food label scanning
- AI-powered nutritional analysis with Gemini 2.0
- Simple and intuitive interface
- Instant nutritional ratings and ingredient warnings