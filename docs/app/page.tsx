import type { FC } from 'react'
import { Metadata } from "next";
import Link from 'next/link';
import './styles.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ClientCodeBlock from './components/code-block';

export const metadata: Metadata = {
    title: 'Zest - Build Fast and Efficient',
    description: 'The modern toolkit for rapid application development with seamless frontend and backend integration.',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

const IndexPage: FC = () => {
    return (
        <div className="landing-container">
            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="features-container">
                    <div className="features-header">
                        <div className="features-tag">
                            Zest 0.0.1 just released 🎉
                        </div>
                        <h2 className="features-title">
                            Fun. Fast. Safe.{' '}
                            <span className="gradient-text">
                                Choose three.
                            </span>
                        </h2>
                        <p className="features-description">
                            Zest connects .NET and React with end-to-end type safety, simplified authentication, and auto-generated API clients.
                        </p>
                        <div className="action-buttons">
                            <Link href="/docs/quickstart" className="action-button primary-button">
                                Get Started
                            </Link>
                            <Link href="/examples" className="action-button secondary-button">
                                View Examples
                            </Link>
                        </div>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <h3 className="feature-title">End-to-End Type Safety</h3>
                            <p className="feature-text">
                                Share types seamlessly between your .NET backend and React frontend. Catch errors at compile time, not runtime.
                            </p>
                        </div>

                        <div className="feature-card">
                            <h3 className="feature-title">One-Line Authentication</h3>
                            <p className="feature-text">
                                Add authentication with just a few lines of code. The boring JWT, tokens, and security stuff happens magically behind the scenes.
                            </p>
                        </div>

                        <div className="feature-card">
                            <h3 className="feature-title">Auto-Generated API Client</h3>
                            <p className="feature-text">
                                Call your .NET APIs directly from React with full IntelliSense support. No manual HTTP requests, no guessing.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="code-section">
                    <div className="code-container">
                        <div className="code-steps">
                            {/* Step 1 */}
                            <div className="code-step">
                                <div className="code-info">
                                    <h3 className="code-title">1. Create your C# models</h3>
                                    <p className="code-description">
                                        Define your data models in C# with standard properties and methods. Zest automatically generates TypeScript interfaces for seamless cross-platform data handling.
                                    </p>
                                </div>

                                <ClientCodeBlock language="csharp">
                                    {
                                        `public class WeatherForecast
{
    public DateOnly Date { get; set; }

    public int TemperatureC { get; set; }

    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

    public string? Summary { get; set; }
}`}
                                </ClientCodeBlock>
                            </div>

                            {/* Step 2 */}
                            <div className="code-step">
                                <div className="code-info">
                                    <h3 className="code-title">2. Write your C# controllers</h3>
                                    <p className="code-description">
                                        Create standard ASP.NET controllers. Zest handles type conversion and API generation.
                                    </p>
                                </div>
                                <ClientCodeBlock language="csharp">
                                    {`[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", 
        "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public IEnumerable<WeatherForecast> Get()
    {
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
    }
}`}
                                </ClientCodeBlock>
                            </div>

                            {/* Step 3 */}
                            <div className="code-step">
                                <div className="code-info">
                                    <h3 className="code-title">3. Use type-safe API client</h3>
                                    <p className="code-description">
                                        Call your backend APIs with full TypeScript type safety. Auto-generated client methods with complete IntelliSense support.
                                    </p>
                                </div>
                                <ClientCodeBlock language="typescript">
                                    {
`// Generated by Zest on build
export type WeatherForecastReadable = {
    date: string;
    temperatureC: number;
    readonly temperatureF: number;
    summary?: string | null;
};

// React component
const forecast = await WeatherForecastService.getWeatherForecast();
if (forecast.error) {
  // An error was thrown.
} else {
  // [{date, temperatureC, temperatureF, summary}]
}`}
                                </ClientCodeBlock>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
}

export default IndexPage