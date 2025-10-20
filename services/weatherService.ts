export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  precipitation: number;
  cloudCover: number;
  windSpeed: number;
  pressure: number;
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
let defaultCity = 'London'; // Default city if geolocation fails

export const getWeatherData = async (lat?: number, lon?: number): Promise<WeatherData> => {
  try {
    const url = lat && lon
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      : `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&units=metric&appid=${API_KEY}`;

    console.log('🌤️ Fetching weather data from OpenWeatherMap:', { lat, lon, url: url.replace(API_KEY, 'API_KEY') });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('🌤️ OpenWeatherMap API Response:', {
      temp: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      weather_main: data.weather[0].main,
      clouds: data.clouds.all,
      rain_1h: data.rain?.['1h'] || 'not present',
      rain_3h: data.rain?.['3h'] || 'not present',
      snow_1h: data.snow?.['1h'] || 'not present',
      wind: data.wind.speed,
      pressure: data.main.pressure,
      location: data.name,
      raw_data: data
    });
    
    // Extract precipitation from rain or snow data
    // rain['1h'] = rainfall in last 1 hour (mm)
    // If no rain field, it means 0mm precipitation
    const rainAmount = data.rain?.['1h'] || data.rain?.['3h'] || 0;
    const snowAmount = data.snow?.['1h'] || data.snow?.['3h'] || 0;
    let precipitation = rainAmount + snowAmount;
    
    // Fallback: Estimate precipitation based on weather description if no data
    if (precipitation === 0) {
      const description = data.weather[0].description.toLowerCase();
      const mainWeather = data.weather[0].main.toLowerCase();
      
      if (description.includes('heavy rain') || mainWeather === 'thunderstorm') {
        precipitation = 10; // Heavy rain estimate
      } else if (description.includes('moderate rain')) {
        precipitation = 5; // Moderate rain estimate
      } else if (description.includes('light rain') || description.includes('drizzle')) {
        precipitation = 2; // Light rain estimate
      } else if (description.includes('rain') || mainWeather === 'rain') {
        precipitation = 3; // General rain estimate
      } else if (description.includes('snow')) {
        precipitation = 4; // Snow estimate
      }
    }
    
    console.log('💧 Precipitation calculation:', {
      rain_api: rainAmount,
      snow_api: snowAmount,
      estimated: precipitation,
      source: (rainAmount > 0 || snowAmount > 0) ? 'API data' : 'Weather description estimate',
      description: data.weather[0].description,
      note: precipitation === 0 ? 'No active precipitation' : `${precipitation}mm estimated`
    });
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      precipitation: Math.round(precipitation * 10) / 10, // Round to 1 decimal
      cloudCover: data.clouds.all, // Percentage 0-100
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      pressure: data.main.pressure
    };
  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    console.warn('⚠️ Using fallback weather data');
    // Return default values if API fails
    return {
      temperature: 24,
      humidity: 65,
      description: 'Clear sky',
      icon: '01d',
      precipitation: 0,
      cloudCover: 20,
      windSpeed: 3.5,
      pressure: 1013
    };
  }
};