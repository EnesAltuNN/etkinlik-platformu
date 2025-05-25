document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");
  const msgEl = document.getElementById("changePasswordMessage");
  const userJson = localStorage.getItem("currentUser");
console.log("change-password.js yüklendi!");

  if (!userJson) {
    msgEl.textContent = "Giriş yapılmamış.";
    return;
  }

  const user = JSON.parse(userJson);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const oldPwd = document.getElementById("oldPassword").value.trim();
    const newPwd = document.getElementById("newPassword").value.trim();
    const again  = document.getElementById("confirmPassword").value.trim();

    if (!oldPwd || !newPwd || !again) {
      msgEl.textContent = "Tüm alanlar zorunludur.";
      msgEl.style.color = "red";
      return;
    }

    if (newPwd !== again) {
      msgEl.textContent = "Yeni şifreler eşleşmiyor.";
      msgEl.style.color = "red";
      return;
    }

    try {
      const res = await fetch(`http://localhost:5031/api/users/${user.id}/change-password`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  },
 body: JSON.stringify({
  currentPassword: oldPwd,
  newPassword: newPwd,
  confirmPassword: again
})

});


      if (!res.ok) {
        const text = await res.text();
        msgEl.textContent = "Şifre değiştirilemedi: " + text;
        msgEl.style.color = "red";
        return;
      }

      // Şifre değiştiyse mustChangePwd alanını false olarak güncelle
      user.mustChangePassword = false;
      localStorage.setItem("currentUser", JSON.stringify(user));

      msgEl.textContent = "Şifreniz başarıyla değiştirildi.";
      msgEl.style.color = "green";

      setTimeout(() => window.location.href = "home.html", 1500);

    } catch (err) {
      msgEl.textContent = "Sunucu hatası.";
      msgEl.style.color = "red";
      console.error("Şifre güncelleme hatası:", err);
    }
  });
});
