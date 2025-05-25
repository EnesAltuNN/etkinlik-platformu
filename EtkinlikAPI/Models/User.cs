using System.ComponentModel.DataAnnotations;

namespace EtkinlikAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        // Admin onayı
        public bool IsApproved { get; set; } = false;

        // İlk girişte şifre değişikliği zorunlu olsun
        public bool MustChangePassword { get; set; } = true;
        public bool IsAdmin { get; set; } = false;

    }
}
