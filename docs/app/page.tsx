import type { FC } from 'react'
import { Metadata } from "next";
import Link from 'next/link';
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
        <div className="flex flex-col items-center min-h-screen overflow-y-auto w-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-zinc-950 dark:to-zinc-900">
            {/* Features Section */}
            <section id="features" className="p-8 md:py-8 md:px-0 w-full">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="text-center mb-12 px-4">
                        <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-sm hover:shadow-md transition-shadow duration-200 backdrop-blur-sm bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 text-yellow-700 dark:text-yellow-200 whitespace-normal text-center">
                            Zest just released 🎉
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
                            Fun. Fast. Safe.{' '}
                            <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent inline-block">
                                Choose three.
                            </span>
                        </h2>
                        <p className="text-base md:text-xl max-w-4xl mx-auto leading-7 text-gray-600 dark:text-gray-300">
                            Zest connects .NET and React with end-to-end type safety, simplified authentication, and auto-generated API clients.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 w-full max-w-sm sm:max-w-none mx-auto">
                            <Link href="/docs" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 w-full sm:w-auto bg-transparent border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 px-4">
                        <div className="rounded-2xl p-8 text-center transition-all duration-300 backdrop-blur-md w-full bg-white/60 dark:bg-white/2 border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-4 leading-snug text-gray-800 dark:text-white">End-to-End Type Safety</h3>
                            <p className="leading-relaxed text-sm text-gray-600 dark:text-gray-400">
                                Share types seamlessly between your .NET backend and React frontend. Catch errors at compile time, not runtime.
                            </p>
                        </div>

                        <div className="rounded-2xl p-8 text-center transition-all duration-300 backdrop-blur-md w-full bg-white/60 dark:bg-white/2 border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-4 leading-snug text-gray-800 dark:text-white">No Hassle Authentication</h3>
                            <p className="leading-relaxed text-sm text-gray-600 dark:text-gray-400">
                                Add authentication with just a few lines of code. Add authentication with just a few lines of code. No boilerplate, no hassle.
                            </p>
                        </div>

                        <div className="rounded-2xl p-8 text-center transition-all duration-300 backdrop-blur-md w-full bg-white/60 dark:bg-white/2 border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-4 leading-snug text-gray-800 dark:text-white">Auto-Generated API Client</h3>
                            <p className="leading-relaxed text-sm text-gray-600 dark:text-gray-400">
                                Call your .NET APIs directly from React with full IntelliSense support. No manual HTTP requests, no guessing.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="w-full max-w-7xl mx-auto mt-16 px-4">
                    <div className="w-full">
                        <div className="flex flex-col gap-12">
                            {/* Step 1 */}
                            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 w-full">
                                <div className="flex-none md:flex-1 md:max-w-[45%] p-0 md:p-0">
                                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">1. Create your C# models</h3>
                                    <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                        Define your data models in C# with standard properties and methods. Zest automatically generates TypeScript interfaces for seamless cross-platform data handling.
                                    </p>
                                </div>

                                <div className="w-full md:flex-none md:w-1/2 md:max-w-[50%]">
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
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 w-full">
                                <div className="flex-none md:flex-1 md:max-w-[45%] p-0 md:p-0">
                                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">2. Write your C# controllers</h3>
                                    <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                        Create standard ASP.NET controllers. Zest handles type conversion and API generation.
                                    </p>
                                </div>
                                <div className="w-full md:flex-none md:w-1/2 md:max-w-[50%]">
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
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 w-full">
                                <div className="flex-none md:flex-1 md:max-w-[45%] p-0 md:p-0">
                                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">3. Use type-safe API client</h3>
                                    <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                        Call your backend APIs with full TypeScript type safety. Auto-generated client methods with complete IntelliSense support.
                                    </p>
                                </div>
                                <div className="w-full md:flex-none md:w-1/2 md:max-w-[50%]">
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
                    </div>
                </section>
            </section>
        </div>
    );
}

export default IndexPage