using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EtkinlikAPI.Data;       // DbContext'in namespace'i
using EtkinlikAPI.Models;     // LoginDto ve User modellerinin namespace'i
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Linq;

namespace EtkinlikAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AuthController(AppDbContext db) => _db = db;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var hash = HashPassword(dto.Password);
            var user = await _db.Users
                .SingleOrDefaultAsync(u => u.Email == dto.Email && u.PasswordHash == hash);

            if (user == null)
                return Unauthorized("Geçersiz e-posta veya şifre");

            if (!user.IsApproved)
                return Forbid("Onay bekleniyor");

            if (user.MustChangePassword)
                return StatusCode(428, new
                { // 428 Precondition Required
                    user.Id,
                    user.FullName,
                    user.Email,
                    mustChange = true
                });

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.IsAdmin  // ✅ eklendi!
            });

        }

        private static string HashPassword(string pwd)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(pwd));
            return Convert.ToHexString(bytes);
        }
    }
}
