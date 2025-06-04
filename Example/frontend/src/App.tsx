import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {type WeatherForecastReadable, WeatherForecastService} from "./generated/client";

function App() {
  const [count, setCount] = useState(0)
  const [weather, setWeather] = useState<WeatherForecastReadable[]>([]);

  useEffect(() => {
      WeatherForecastService.getWeatherForecast().then(x => {
          if (x.error) {
            console.log(x.error);
          } else if (x.data) {
            setWeather(x.data);
          }
      })
  }, [])

  if (weather.length > 0) {
    return (
        <table>
            <thead>
            <tr>
                <th>Date</th>
                <th>Summary</th>
                <th>Temp (C)</th>
            </tr>
            </thead>
            <tbody>
            {weather.map(x => (
                <tr key={x.date}>
                    <td>{x.date}</td>
                    <td>{x.summary || '-'}</td>
                    <td>{x.temperatureC}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App