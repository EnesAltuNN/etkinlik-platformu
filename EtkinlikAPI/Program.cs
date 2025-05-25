using EtkinlikAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5031");
// 1) CORS politikas� (t�m origin, header ve method�lara izin verir)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2) EF Core: SQL Server ba�lant�s� (appsettings.json�daki DefaultConnection kullan�l�yor)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// 3) Controller�lar� ekle
builder.Services.AddControllers();

// 4) Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EtkinlikAPI",
        Version = "v1",
        Description = "Etkinlik y�netim sistemi API"
    });
});

var app = builder.Build();

// 5) Geli�tirme ortam�ndaysa Swagger UI�i a�
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EtkinlikAPI v1");
        // E�er Swagger�� direkt k�k dizinde g�rmek istersen, a�a��dakinin yorumunu kald�r:
        //      c.RoutePrefix = string.Empty;
    });
}

// 6) HTTPS y�nlendirmesi (opsiyonel)
// app.UseHttpsRedirection();

// 7) CORS�u etkinle�tir
app.UseCors("AllowAll");

// 8) Yetkilendirme (Authentication eklemediyseniz, bu sat�r �u an sadece yer tutar)
app.UseAuthorization();

// 9) T�m controller rotalar�n� e�le�tir
app.MapControllers();

// 10) Uygulamay� �al��t�r
app.Run();
