using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EtkinlikAPI.Data;
using EtkinlikAPI.Models;

namespace EtkinlikAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        readonly AppDbContext _db;
        public EventController(AppDbContext db) => _db = db;

        // GET: api/event
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _db.Events.ToListAsync();
        }

        // GET: api/event/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var e = await _db.Events.FindAsync(id);
            if (e == null)
                return NotFound();
            return e;
        }

        // POST: api/event
        [HttpPost]
        public async Task<ActionResult<Event>> CreateEvent([FromBody] Event evnt)
        {
            _db.Events.Add(evnt);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = evnt.Id }, evnt);
        }

        // PUT: api/event/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] Event evnt)
        {
            if (id != evnt.Id)
                return BadRequest();

            _db.Entry(evnt).State = EntityState.Modified;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/event/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var e = await _db.Events.FindAsync(id);
            if (e == null)
                return NotFound();

            _db.Events.Remove(e);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
