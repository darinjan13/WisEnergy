# WisEnergy

A React Native (Expo) mobile application for monitoring and managing home energy consumption, budgets, and smart devices.

## Features

- **Dashboard**: Real-time energy consumption overview with AI-powered insights and usage trends
- **Device Management**: Connect and monitor smart appliances
- **Budget Tracking**: Set and track monthly energy budgets with rate calculations
- **Reports**: Detailed consumption analytics with daily, weekly, and monthly charts
- **Notifications**: Push notifications for budget alerts and device status updates
- **Authentication**: Email/password auth with password reset functionality
- **Settings**: Profile management, privacy policy, terms of service, subscription management

## Tech Stack

- **Framework**: Expo SDK 54 (React Native 0.81)
- **Routing**: Expo Router (file-based routing)
- **UI**: NativeWind (TailwindCSS for React Native)
- **Backend**: Firebase (Auth, Realtime Database, Firestore)
- **State Management**: Zustand
- **Charts**: react-native-gifted-charts
- **Notifications**: expo-notifications
- **Storage**: @react-native-async-storage/async-storage

## Project Structure

```
app/                    # Expo Router pages and layouts
├── (auth)/            # Authentication screens
├── (tabs)/            # Main tab navigation
│   ├── appliances/    # Appliance detail screens
│   ├── budget.jsx     # Budget tracking
│   ├── dashboard.jsx  # Home dashboard
│   ├── devices.jsx    # Device management
│   ├── notifications.jsx
│   └── reports.jsx    # Usage reports
├── (settings)/       # Settings screens
│   └── contactSupport/
├── _layout.jsx       # Root layout
├── index.jsx         # Entry point
├── onboarding.jsx     # Onboarding flow
├── payment-failed.jsx
└── payment-success.jsx

components/              # Reusable UI components
├── ai/                # AI insights components
├── budget/            # Budget-related components
├── reports/           # Charts and reports
└── ui/               # Base UI components

firebase/              # Firebase configuration
hooks/                # Custom React hooks
services/             # API and Firebase services
store/                # Zustand state stores
utils/                # Utility functions
assets/               # Images and fonts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on web
npx expo start --web
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Firebase Configuration

The app uses Firebase for:
- **Authentication**: Email/password user authentication
- **Realtime Database**: Device data, usage metrics
- **Firestore**: User profiles, settings
- **Cloud Messaging**: Push notifications

Configure your Firebase credentials in `firebase/firebaseConfig.jsx`.

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Entry point (redirects to auth or tabs) |
| `/onboarding` | First-time user onboarding |
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/(tabs)/dashboard` | Main dashboard |
| `/(tabs)/devices` | Device list |
| `/(tabs)/budget` | Budget management |
| `/(tabs)/reports` | Usage reports |
| `/(tabs)/notifications` | Notification center |
| `/(settings)/settings` | App settings |
| `/(settings)/editProfile` | Profile editing |
| `/(settings)/subscription` | Subscription management |

## Dependencies

Key dependencies include:
- `@react-navigation/native` - Navigation framework
- `firebase` - Backend services
- `zustand` - State management
- `react-native-gifted-charts` - Data visualization
- `nativewind` - Tailwind styling
- `expo-router` - File-based routing
- `expo-notifications` - Push notifications

## License

Private - All rights reserved