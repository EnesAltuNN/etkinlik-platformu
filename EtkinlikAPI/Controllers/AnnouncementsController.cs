using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using EtkinlikAPI.Models;
using EtkinlikAPI.Data;

namespace EtkinlikAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnnouncementsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/announcements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Announcement>>> Get()
        {
            return await _context.Announcements
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }

        // POST: api/announcements
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Announcement duyuru)
        {
            if (duyuru == null || string.IsNullOrWhiteSpace(duyuru.Title) || string.IsNullOrWhiteSpace(duyuru.Content))
            {
                return BadRequest("Başlık ve içerik boş olamaz.");
            }

            duyuru.Date = DateTime.Now;

            _context.Announcements.Add(duyuru);
            await _context.SaveChangesAsync();

            return Ok(duyuru);
        }

        // DELETE: api/announcements/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
