document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName  = document.getElementById("registerLastName").value.trim();
    const email     = document.getElementById("registerEmail").value.trim();
    const password  = document.getElementById("registerPassword").value;
    const confirm   = document.getElementById("registerConfirm").value;
    const msgEl     = document.getElementById("registerMessage");

    if (!firstName || !lastName || !email || !password || !confirm) {
      msgEl.style.color = "red";
      msgEl.textContent = "Lütfen tüm alanları doldurun.";
      return;
    }
    if (password !== confirm) {
      msgEl.style.color = "red";
      msgEl.textContent = "Şifreler uyuşmuyor.";
      return;
    }

    // DTO’ya uygun payload
    const newUser = {
      firstName,
      lastName,
      email,
      password
    };

    try {
      const res = await fetch("http://localhost:5031/api/users", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newUser)
      });

      if (res.status === 409) {
        msgEl.style.color = "red";
        msgEl.textContent = "Bu e-posta zaten kayıtlı.";
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        msgEl.style.color = "red";
        msgEl.textContent = "Kayıt başarısız: " + text;
        return;
      }

      msgEl.style.color = "green";
      msgEl.textContent = "Kayıt başarılı! Yönetici onayı bekleniyor.";
      this.reset();
      setTimeout(() => (window.location.href = "login.html"), 2000);

    } catch (err) {
      console.error("Kayıt hatası:", err);
      msgEl.style.color = "red";
      msgEl.textContent = "Sunucuya bağlanırken hata oluştu.";
    }
  });
function togglePassword(inputId, eyeIcon) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}