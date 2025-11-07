import React, { useState, useEffect } from 'react';
import { Search, MapPin, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset, Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [currentCity, setCurrentCity] = useState('London');

  // OpenWeatherMap API key (you'll need to get your own free API key)
  const API_KEY = 'demo_mode'; // Replace with your actual API key
  const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Get weather data
  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    
    // Demo mode - show sample data
    if (API_KEY === 'demo_mode') {
      setTimeout(() => {
        const demoData = {
          name: city,
          sys: { country: 'Demo', sunrise: 1640995200, sunset: 1641038400 },
          main: {
            temp: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40°C
            feels_like: Math.floor(Math.random() * 30) + 10,
            temp_min: Math.floor(Math.random() * 20) + 5,
            temp_max: Math.floor(Math.random() * 20) + 25,
            humidity: Math.floor(Math.random() * 50) + 30,
            pressure: Math.floor(Math.random() * 200) + 1000
          },
          weather: [
            {
              main: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
              description: ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'shower rain', 'rain', 'thunderstorm', 'snow'][Math.floor(Math.random() * 8)]
            }
          ],
          wind: { speed: Math.floor(Math.random() * 10) + 1 },
          visibility: Math.floor(Math.random() * 5000) + 5000
        };
        setWeatherData(demoData);
        setCurrentCity(city);
        setLoading(false);
      }, 1000);
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setCurrentCity(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location weather
  const getCurrentLocationWeather = () => {
    // Demo mode - just show London weather
    if (API_KEY === 'demo_mode') {
      fetchWeatherData('London');
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default city
          fetchWeatherData('London');
        }
      );
    } else {
      fetchWeatherData('London');
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setCurrentCity(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherData(searchCity.trim());
      setSearchCity('');
    }
  };

  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case 'Clear':
        return <Sun className="w-16 h-16 text-yellow-400" />;
      case 'Clouds':
        return <Cloud className="w-16 h-16 text-gray-400" />;
      case 'Rain':
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      case 'Snow':
        return <CloudSnow className="w-16 h-16 text-blue-200" />;
      default:
        return <Cloud className="w-16 h-16 text-gray-400" />;
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load weather data on component mount
  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Weather App</h1>
          <p className="text-white/80">Get real-time weather information</p>
        </div>

        {/* Search Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter city name..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors duration-200 font-medium"
            >
              Search
            </button>
            <button
              type="button"
              onClick={getCurrentLocationWeather}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors duration-200 font-medium"
            >
              My Location
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading weather data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && !loading && (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">{weatherData.name}</h2>
                  <span className="text-white/80">{weatherData.sys.country}</span>
                </div>
                <div className="text-right">
                  <p className="text-white/80">{new Date().toLocaleDateString()}</p>
                  <p className="text-white/80">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {getWeatherIcon(weatherData.weather[0].main)}
                  <div>
                    <h3 className="text-6xl font-bold text-white">
                      {Math.round(weatherData.main.temp)}°C
                    </h3>
                    <p className="text-xl text-white/80 capitalize">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80">
                    Feels like {Math.round(weatherData.main.feels_like)}°C
                  </p>
                  <p className="text-white/80">
                    Humidity: {weatherData.main.humidity}%
                  </p>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Temperature Range */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Thermometer className="w-6 h-6 text-white" />
                  <h4 className="text-white font-semibold">Temperature</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-white/80">High: {Math.round(weatherData.main.temp_max)}°C</p>
                  <p className="text-white/80">Low: {Math.round(weatherData.main.temp_min)}°C</p>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Droplets className="w-6 h-6 text-white" />
                  <h4 className="text-white font-semibold">Humidity</h4>
                </div>
                <p className="text-2xl font-bold text-white">{weatherData.main.humidity}%</p>
              </div>

              {/* Wind Speed */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Wind className="w-6 h-6 text-white" />
                  <h4 className="text-white font-semibold">Wind</h4>
                </div>
                <p className="text-2xl font-bold text-white">{weatherData.wind.speed} m/s</p>
              </div>

              {/* Visibility */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-6 h-6 text-white" />
                  <h4 className="text-white font-semibold">Visibility</h4>
                </div>
                <p className="text-2xl font-bold text-white">
                  {weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) : 'N/A'} km
                </p>
              </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4">Sunrise & Sunset</h4>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <Sunrise className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white/80">Sunrise</p>
                  <p className="text-white font-semibold">
                    {formatTime(weatherData.sys.sunrise)}
                  </p>
                </div>
                <div className="text-center">
                  <Sunset className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-white/80">Sunset</p>
                  <p className="text-white font-semibold">
                    {formatTime(weatherData.sys.sunset)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Key Notice */}
        <div className="mt-8 bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 text-center">
          <p className="text-yellow-200 text-sm">
            🌤️ <strong>Demo Mode:</strong> This weather app is currently running in demo mode with sample data. 
            To get real weather data, get a free API key from{' '}
            <a 
              href="https://openweathermap.org/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-yellow-100"
            >
              OpenWeatherMap
            </a>
            {' '}and replace 'demo_mode' with your actual API key in WeatherApp.jsx.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
