// login.js
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msgEl    = document.getElementById("loginMessage");

  if (!email || !password) {
    msgEl.style.color = "red";
    msgEl.textContent = "E-posta ve şifre boş bırakılamaz.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5031/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password })
    });

    if (res.status === 401) {
      msgEl.style.color = "red";
      msgEl.textContent = "Geçersiz e-posta veya şifre.";
      return;
    }
    if (res.status === 403) {
      msgEl.style.color = "orange";
      msgEl.textContent = "Hesabınız onay bekleniyor.";
      return;
    }
    // 428: Precondition Required (ilk girişte şifre değiştir)
    if (res.status === 428) {
      const data = await res.json();
      // currentUser kaydet
      localStorage.setItem("currentUser", JSON.stringify({
        id:                data.id,
        fullName:          data.fullName,
        email:             data.email,
        mustChangePassword: true
      }));
      // şifre değiştirme sayfasına yönlendir
      window.location.href = "change-password.html";
      return;
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    // Normal login akışı
    const apiUser = await res.json();
localStorage.setItem("currentUser", JSON.stringify({
  id:       apiUser.id,
  fullName: apiUser.fullName,
  email:    apiUser.email,
  isAdmin:  apiUser.isAdmin,
  mustChangePassword: false
}));

if (apiUser.isAdmin) {
  window.location.href = "../admin/admin.html";
} else {
  window.location.href = "home.html";
}


  } catch (err) {
    console.error("Login hatası:", err);
    msgEl.style.color = "red";
    msgEl.textContent = "Sunucu hatası, lütfen tekrar deneyin.";
  }
});

// Şifre göster/gizle fonksiyonu:
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
// Şifre sıfırlama popup açma
function openForgotPassword() {
  document.getElementById("forgotPasswordPopup").style.display = "flex";
}

// Şifre sıfırlama popup kapama
function closeForgotPassword() {
  document.getElementById("forgotPasswordPopup").style.display = "none";
}

// Şifre sıfırlama simülasyonu
function resetPassword() {
  const email = document.getElementById("forgotEmail").value.trim();
  const msg   = document.getElementById("forgotMessage");

  if (!email) {
    msg.textContent = "Lütfen e-posta giriniz.";
    msg.style.color = "red";
    return;
  }

  // Burada gerçek API isteği yerine örnek mesaj yazıyoruz
  msg.textContent = `${email} adresine şifre sıfırlama bağlantısı gönderildi.`;
  msg.style.color = "lightgreen";

  setTimeout(() => {
    closeForgotPassword();
    msg.textContent = ""; // temizle
    document.getElementById("forgotEmail").value = ""; // input sıfırla
  }, 3000);
}
