using EtkinlikAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5031");
// 1) CORS politikasý (tüm origin, header ve method’lara izin verir)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2) EF Core: SQL Server baðlantýsý (appsettings.json’daki DefaultConnection kullanýlýyor)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// 3) Controller’larý ekle
builder.Services.AddControllers();

// 4) Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EtkinlikAPI",
        Version = "v1",
        Description = "Etkinlik yönetim sistemi API"
    });
});

var app = builder.Build();

// 5) Geliþtirme ortamýndaysa Swagger UI’i aç
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EtkinlikAPI v1");
        // Eðer Swagger’ý direkt kök dizinde görmek istersen, aþaðýdakinin yorumunu kaldýr:
        //      c.RoutePrefix = string.Empty;
    });
}

// 6) HTTPS yönlendirmesi (opsiyonel)
// app.UseHttpsRedirection();

// 7) CORS’u etkinleþtir
app.UseCors("AllowAll");

// 8) Yetkilendirme (Authentication eklemediyseniz, bu satýr þu an sadece yer tutar)
app.UseAuthorization();

// 9) Tüm controller rotalarýný eþleþtir
app.MapControllers();

// 10) Uygulamayý çalýþtýr
app.Run();
