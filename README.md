# Calendar App with Google Integration 📅

A modern calendar application built with React Native and Expo that integrates with Google Calendar. This app allows users to view available time slots, book appointments, and sync with their Google Calendar.

## Features

- View available time slots in a clean, intuitive interface
- Google OAuth authentication
- Real-time availability from Google Calendar
- Responsive design that works on mobile and web
- Easy booking flow with confirmation

## Prerequisites

- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Authentication and Firestore enabled
- Google OAuth credentials (Web, Android, and iOS)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/calendar-app.git
   cd calendar-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase and Google OAuth credentials
   ```bash
   cp .env.example .env
   ```

4. **Configure Firebase**
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google Sign-In)
   - Get your Firebase config and update the `.env` file

5. **Set up Google OAuth**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials for Web, Android, and iOS
   - Add authorized redirect URIs and JavaScript origins
   - Update the `.env` file with your client IDs

6. **Start the development server**
   ```bash
   npx expo start
   ```

## Project Structure

```
calendar-app/
├── app/                  # App entry point and routes
├── assets/               # Images, fonts, and other static files
├── src/
│   ├── components/       # Reusable UI components
│   ├── config/           # Configuration files
│   ├── contexts/         # React contexts for state management
│   └── services/         # API services and utilities
├── .env.example          # Example environment variables
├── app.config.js         # Expo configuration
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start the development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
