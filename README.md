# CitySense 🌆

A real-time community sentiment analysis platform for Sydney suburbs, combining weather data, pollution monitoring, and AI-powered mood analysis to provide insights into community well-being.

## 🚀 Features

- **Interactive Sydney Suburb Map** with real-time sentiment visualization
- **AI-Powered Analysis** of community feedback and complaints
- **Weather & Pollution Integration** for comprehensive environmental monitoring
- **Mood Tracking System** for community sentiment analysis
- **Real-time Dashboard** with live data updates
- **Responsive Design** for desktop and mobile devices

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express.js and SQLite
- **AI Services**: OpenAI integration for sentiment analysis
- **Maps**: Google Maps API for interactive suburb visualization
- **Database**: SQLite for local data storage

## 📋 Prerequisites

Before running this project, you'll need:

- Node.js (v18 or higher)
- npm or yarn package manager
- Google Maps API key
- OpenAI API key
- Weather API key

## 🔑 API Keys Setup

**⚠️ IMPORTANT: All API keys are stored in our secure Google Docs**

Please refer to our [API Keys Documentation](https://docs.google.com/document/d/1xEV0cf333prRZT4mSJ1ds78Yp9i_yD-Ae7kCq9Q4ijA/edit?usp=sharing) for:
- Google Maps API key
- OpenAI API key  
- Weather API key
- Any additional service credentials

**Never commit API keys directly to the repository!**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/aaronta635/citysense.git
cd citysense
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```bash
cd ../backend
touch .env
```

Add the following environment variables (get actual values from our [API Keys Documentation](https://docs.google.com/document/d/1xEV0cf333prRZT4mSJ1ds78Yp9i_yD-Ae7kCq9Q4ijA/edit?usp=sharing)):

```env
NODE_ENV=development
PORT=3000
WEATHER_API_KEY=your_weather_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 4. Google Maps API Key

Update the Google Maps API key in `frontend/app/main-page/config.ts`:

```typescript
export const GOOGLE_MAPS_API_KEY = 'your_google_maps_api_key_here';
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3001`

## 📁 Project Structure

```
CitySense/
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── controllers/    # API route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── ai/                 # AI analysis modules
│   └── citysense.db        # SQLite database
├── frontend/                # Next.js frontend application
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   └── services/           # API service functions
└── README.md               # This file
```

## 🔧 Configuration

### Backend Configuration
- Database: SQLite (automatically initialized)
- Port: 3000 (configurable via environment)
- CORS: Enabled for frontend communication

### Frontend Configuration
- Maps API: Google Maps with Sydney bounds
- API Endpoints: Backend server communication
- Responsive breakpoints: Mobile-first design

## 📊 API Endpoints

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login

### CitySense Data
- `GET /v1/citysense/data/combined` - Combined suburb data
- `POST /v1/citysense/mood` - Submit mood feedback
- `GET /v1/citysense/weather` - Weather data
- `GET /v1/citysense/pollution` - Pollution data

### AI Analysis
- `GET /v1/citysense/analysis` - AI sentiment analysis
- `POST /v1/citysense/analyze` - Trigger new analysis

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For API key access and technical support:
- **API Keys**: [Google Docs](https://docs.google.com/document/d/1xEV0cf333prRZT4mSJ1ds78Yp9i_yD-Ae7kCq9Q4ijA/edit?usp=sharing)
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the code comments and this README

## 🙏 Acknowledgments

- Google Maps API for mapping services
- OpenAI for AI analysis capabilities
- Weather API providers for environmental data
- The Sydney community for feedback and testing

---

**Remember**: Keep your API keys secure and never share them publicly! 🔐
