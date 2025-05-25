using System;
using System.ComponentModel.DataAnnotations;

namespace EtkinlikAPI.Models
{
    public class Event
    {
        public int Id { get; set; }

        [Required] public string Title { get; set; } = string.Empty;
        [Required] public string Category { get; set; } = string.Empty;
        [Required] public string City { get; set; } = string.Empty;
        [Required] public string Venue { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }       // <— artık DateTime

        [Required]
        [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$",
            ErrorMessage = "Saat HH:mm formatında olmalı.")]
        public string Time { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }
        public string? SeatImageUrl { get; set; }

        [Required] public int Price { get; set; }

    }
}
