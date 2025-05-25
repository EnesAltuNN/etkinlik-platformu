using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EtkinlikAPI.Data;
using EtkinlikAPI.Models;      // ← ChangePasswordDto burada
using System.Security.Cryptography;
using System.Text;

namespace EtkinlikAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UsersController(AppDbContext db) => _db = db;

        // GET /api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetUser(int id)
        {
            var u = await _db.Users.FindAsync(id);
            if (u == null)
                return NotFound();

            return Ok(new
            {
                id = u.Id,
                fullName = u.FullName,
                email = u.Email,
                isApproved = u.IsApproved,
                mustChange = u.MustChangePassword   // ← flag olarak dönüyoruz
            });
        }

        // GET /api/users?approved=true|false
        [HttpGet]
        public async Task<ActionResult> GetUsers([FromQuery] bool? approved)
        {
            var q = _db.Users.AsQueryable();
            if (approved.HasValue)
                q = q.Where(u => u.IsApproved == approved.Value);

            var list = await q
                .Select(u => new
                {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    isApproved = u.IsApproved,
                    mustChange = u.MustChangePassword
                })
                .ToListAsync();

            return Ok(list);
        }

        // POST /api/users
        [HttpPost]
        public async Task<ActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict("Bu e-posta zaten kayıtlı.");

            var user = new User
            {
                FullName = $"{dto.FirstName} {dto.LastName}".Trim(),
                Email = dto.Email,
                PasswordHash = HashPassword(dto.Password),
                IsApproved = false,
                MustChangePassword = true    // ← ilk girişte şifre değiştirsin
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                new
                {
                    user.Id,
                    fullName = user.FullName,
                    user.Email,
                    user.IsApproved,
                    mustChange = user.MustChangePassword
                }
            );
        }

        // PUT /api/users/{id}/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveUser(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsApproved = true;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PUT /api/users/{id}/change-password
        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            // 1) Eski şifre kontrolü
            var currHash = HashPassword(dto.CurrentPassword);
            if (currHash != user.PasswordHash)
                return BadRequest("Mevcut şifre yanlış.");

            // 2) Yeni şifre / onay kontrolü
            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest("Yeni şifreler eşleşmiyor.");

            // 3) Güncelle
            user.PasswordHash = HashPassword(dto.NewPassword);
            user.MustChangePassword = false;            // artık bir daha sormasın
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // SHA256 hash metodu
        private static string HashPassword(string pwd)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(pwd));
            return Convert.ToHexString(bytes);
        }
    }
}
