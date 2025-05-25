using Microsoft.AspNetCore.Mvc;

namespace EtkinlikAPI.Controllers
{

    [ApiController]
    // Route�ta tam metni �Hava Durumu Tahmini� olacak �ekilde ayarl�yoruz
    [Route("Hava Durumu Tahmini")]
    // Swagger UI�da bu controller�� bu isimle gruplayal�m
    [ApiExplorerSettings(GroupName = "Hava Durumu Tahmini")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing","Bracing","Chilly","Cool","Mild",
            "Warm","Balmy","Hot","Sweltering","Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;
        public WeatherForecastController(ILogger<WeatherForecastController> logger) =>
            _logger = logger;

        // GET /Hava Durumu Tahmini
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
    }
}
