
document.addEventListener("DOMContentLoaded", () => {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) return;
  const user = JSON.parse(userJson);

  const nameInput  = document.getElementById("userNameInput");
  const emailInput = document.getElementById("userEmailInput");
  if (nameInput)  nameInput.value  = user.fullName || "";
  if (emailInput) emailInput.value = user.email    || "";
  if (typeof loadEventHistory === "function") {
    loadEventHistory();
  }
});


// Şifre güncelleme
document.getElementById("passwordForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("passwordMessage");

  const savedPassword = localStorage.getItem("registeredPassword");

  if (currentPassword !== savedPassword) {
    message.textContent = "Mevcut şifre hatalı.";
    message.style.color = "red";
    return;
  }

  if (newPassword !== confirmPassword) {
    message.textContent = "Yeni şifreler eşleşmiyor.";
    message.style.color = "red";
    return;
  }

  if (newPassword.length < 6) {
    message.textContent = "Şifre en az 6 karakter olmalı.";
    message.style.color = "red";
    return;
  }

  localStorage.setItem("registeredPassword", newPassword);
  message.textContent = "Şifreniz başarıyla güncellendi.";
  message.style.color = "green";

  document.getElementById("passwordForm").reset();
});


// Etkinlik geçmişi
function loadEventHistory() {
  const list = document.getElementById("eventHistory");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    list.innerHTML = "<li>Henüz hiç etkinlik satın alınmamış.</li>";
    return;
  }

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.title} - ${item.city} - ${item.price}₺`;
    list.appendChild(li);
  });
}

// Çıkış
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
});
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault(); // bağlantı çalışmadan önce logout işlemini yap
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("registeredEmail");
  localStorage.removeItem("registeredFirstName");
  localStorage.removeItem("registeredLastName");
  // Eğer başka şeyler varsa onları da temizleyebilirsin

  window.location.href = "../login.html"; // login sayfasına yönlendir
});
// Kullanıcı bilgilerini güncelleme
document.getElementById("userForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const updatedName  = document.getElementById("userNameInput").value.trim();
  const updatedEmail = document.getElementById("userEmailInput").value.trim();

  try {
    const res = await fetch(`http://localhost:5031/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: user.id,
        fullName: updatedName,
        email: updatedEmail
      })
    });

    if (!res.ok) throw new Error("Güncelleme başarısız");

    // localStorage'ı güncelle
    user.fullName = updatedName;
    user.email = updatedEmail;
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Bilgileriniz başarıyla güncellendi.");

  } catch (err) {
    console.error("Güncelleme hatası:", err);
    alert("Bir hata oluştu, tekrar deneyin.");
  }
});
