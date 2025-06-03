import { useEffect, useState } from "react";
import { type WeatherForecastReadable, WeatherForecastService } from "../generated/client";
import "../App.css";
import { useAuth } from "../App.tsx";

const Weather = () => {
  const [weather, setWeather] = useState<WeatherForecastReadable[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, logout } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated) {
      setLoading(true);
      WeatherForecastService.getWeatherForecast().then(x => {
        if (x.error) {
          console.log(x.error);
        } else if (x.data) {
          setWeather(x.data);
        }
        setLoading(false);
      });
    }
  }, [state.isAuthenticated]);

  if (loading) {
    return <div style={{ color: "#333333" }}>Loading weather data...</div>;
  }

  return (
    <div className="weather-container" style={{ color: "#333333" }}>
      <h2 style={{ color: "#333333" }}>Weather Forecast</h2>

      <div className="user-info">
        <h3 style={{ color: "#333333" }}>User Information</h3>
        <p><strong style={{ color: "#333333" }}>Email:</strong> <span style={{ color: "#333333" }}>{state.user?.email}</span></p>
        <p><strong style={{ color: "#333333" }}>Email Confirmed:</strong> <span style={{ color: "#333333" }}>{state.user?.isEmailConfirmed ? "Yes" : "No"}</span></p>
      </div>

      {weather.length > 0 ? (
        <table className="weather-table">
          <thead>
            <tr>
              <th style={{ color: "#333333" }}>Date</th>
              <th style={{ color: "#333333" }}>Summary</th>
              <th style={{ color: "#333333" }}>Temp (C)</th>
            </tr>
          </thead>
          <tbody>
            {weather.map(x => (
              <tr key={x.date}>
                <td style={{ color: "#333333" }}>{x.date}</td>
                <td style={{ color: "#333333" }}>{x.summary || "-"}</td>
                <td style={{ color: "#333333" }}>{x.temperatureC}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#333333" }}>No weather data available</p>
      )}

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Weather;