# Farm-E 🌾

A comprehensive agricultural intelligence platform built with React that empowers farmers with real-time crop management, market insights, and AI-powered advisory services. Farm-E helps farmers make data-driven decisions to maximize yield and profitability.

## 🌟 Features

- **Crop Management Dashboard**: Monitor crop health, growth stages, and farming activities
- **AI-Powered Advisory**: Get intelligent recommendations for crop care and pest management
- **Real-time Weather Tracking**: Temperature, humidity, wind speed, and rainfall monitoring
- **Market Price Intelligence**: Live crop market prices with trending analysis
- **Crop-Specific Tips**: Curated farming advice for different crops and growth stages
- **Farm Location Tracking**: Map-based farm management and location services
- **User Authentication**: Secure login/signup with Firebase authentication
- **Mobile-First Design**: Fully responsive design for desktop, tablet, and mobile devices
- **Cross-Platform Support**: Web app with native Android build support via Capacitor

## 🚀 Tech Stack

- **Frontend**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Styling**: Tailwind CSS 4.3.0
- **UI Components**: Lucide React icons
- **Authentication**: Firebase 12.13.0
- **HTTP Client**: Axios 1.16.1
- **Mobile**: Capacitor 8.3.4 (for Android native app)
- **Linting**: ESLint 10.3.0

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shreyaskumbhar4-hub/farm-e.git
   cd farm-e
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Configure your Firebase credentials and API endpoints

   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📚 Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the production-ready distribution
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
farm-e/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── firebase.js          # Firebase configuration
│   ├── index.css            # Global styles
│   ├── main.jsx             # Application entry point
│   └── assets/              # Static assets
├── public/                  # Public assets
├── android/                 # Android native app files (Capacitor)
├── index.html               # HTML template
├── capacitor.config.json    # Capacitor configuration
├── vite.config.js           # Vite configuration
├── package.json             # Project dependencies
└── eslint.config.js         # ESLint configuration
```

## 🎯 Key Features Explained

### Dashboard
The main dashboard displays:
- Real-time weather conditions for the farm
- Current crop status and growth stages
- Market prices for major crops
- Trending indicators for price movements

### Crop Advisory
AI-powered recommendations based on:
- Current crop growth stage
- Weather conditions
- Historical crop data
- Disease and pest risk assessment

### Farm Management
- Add and manage multiple crops
- Track planting dates and expected harvest
- Log farming activities
- Monitor soil and weather conditions

### Market Intelligence
- Real-time price updates for major crops
- Price trend analysis
- Market news and insights
- Export-friendly pricing information

## 🔐 Authentication

The app uses Firebase Authentication for secure user management:
- Email/password registration and login
- Session management
- Profile management
- Secure data storage

## 📱 Mobile Support

Farm-E is built with Capacitor for native mobile support:
- Android app builds
- Native access to device features (camera, location, etc.)

To build the Android app:
```bash
npx cap sync android
npx cap open android
```

## 🎨 Design System

The app features a nature-inspired color palette:
- **Soil**: `#2D1B00` - Earthy foundation
- **Leaf**: `#4A7C2F` - Growth and vitality
- **Sprout**: `#6BAF3D` - Fresh growth
- **Cream**: `#F5F0E8` - Clean backgrounds

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Security

For security vulnerabilities, please email instead of using the issue tracker. See [SECURITY.md](SECURITY.md) for more details.

## 📧 Contact & Support

For questions or support, please open an issue on GitHub or reach out to the project maintainers.

## 🙏 Acknowledgments

- Built with [React](https://react.dev) and [Vite](https://vitejs.dev)
- Icons from [Lucide React](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Authentication by [Firebase](https://firebase.google.com)
- Mobile support via [Capacitor](https://capacitorjs.com)

---

**Happy Farming! 🌾🌱**
