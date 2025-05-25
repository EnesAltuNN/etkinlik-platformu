const eventForm = document.getElementById("eventForm");
const eventTableBody = document.querySelector("#eventTable tbody");
const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal");
const openAddEventModal = document.getElementById("openAddEventModal");
const modalTitle = document.getElementById("modalTitle");
const searchInput = document.getElementById("searchInput");

const apiBase = "http://localhost:5031/api/event"; 

let editingEventId = null;
document.addEventListener("DOMContentLoaded", () => {
   // currentUser localStorage’dan alınıyor
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (user.fullName || user.FullName) {
    // HTML’de <span id="adminName"></span> olmalı
    document.getElementById("adminName").textContent =
      user.fullName || user.FullName;
  }
  // bütün section’ları seç
  const sections = document.querySelectorAll("main.admin-main > section");
  // sidebar link’leri seç
  const links    = document.querySelectorAll(".admin-sidebar nav ul li a");

  // Helper: önce hepsini gizle, sonra verdiğin id’li section’ı aç
  function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  const selected = document.getElementById(id);
  if (selected) selected.classList.add("active");
}


  // Link’lere click handler ata
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      // href="#istatistikler" => "istatistikler"
      const id = link.getAttribute("href").substring(1);
      showSection(id);
    });
  });

  // Sayfa ilk yüklendiğinde default gösterecek bölüm:
  showSection("istatistikler");
});

function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Sol menü navigasyon (admin-sidebar için)
const sidebarLinks = document.querySelectorAll(".admin-sidebar nav ul li a");
sidebarLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("data-target"); // örn: "kullanicilar"

    // önce hepsini gizle
    document.querySelectorAll("main section").forEach(section => {
      section.style.display = "none";
    });

    // sonra sadece tıklananı göster
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.style.display = "block";
    }
  });
});


// Etkinlikleri yükle
async function loadEvents() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) {
      // Sunucu hata kodu dönmüşse, hata mesajını konsola yaz
      const text = await res.text();
      console.error("API GET /event HATASI:", res.status, text);
      return;
    }
    const data = await res.json();

    eventTableBody.innerHTML = "";
    data.forEach(ev => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ev.title}</td>
        <td>${ev.city}</td>
        <td>${ev.category}</td>
        <td>${ev.date.split("T")[0]}</td>
        <td>
          <button onclick="editEvent(${ev.id})">Düzenle</button>
          <button onclick="deleteEvent(${ev.id})">Sil</button>
        </td>
      `;
      eventTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("loadEvents() yakalanan hata:", err);
  }
}
//Etkinlik ekleme / düzeltme
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1) payload’ı oluştur
  const payload = {
    title:        eventForm.title.value.trim(),
    category:     eventForm.category.value.trim(),
    city:         eventForm.city.value.trim(),
    venue:        eventForm.venue.value.trim(),
    date:         new Date(eventForm.date.value).toISOString(),
    time:         eventForm.time.value.trim(),
    price:        parseInt(eventForm.price.value, 10),
    imageUrl:     eventForm.imageUrl.value.trim(),
    seatImageUrl: eventForm.seatImageUrl.value.trim()
  };

  // 2) Düzenleme modundaysak id ekle
  if (editingEventId != null) {
    payload.id = editingEventId;
  }

  console.log("Giden payload:", payload);

  // 3) Basit validasyon
  if (
    !payload.title ||
    !payload.category ||
    !payload.city ||
    !payload.venue ||
    !payload.date ||
    !payload.time ||
    isNaN(payload.price)
  ) {
    alert("Lütfen tüm zorunlu alanları doldurunuz.");
    return;
  }

  // 4) Fetch isteği
  const url    = editingEventId ? `${apiBase}/${editingEventId}` : apiBase;
  const method = editingEventId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // 5) Hata kontrolü
  if (!res.ok) {
    const text = await res.text();
    console.error(`API HATASI (${res.status}):`, text);
    alert("Sunucudan hata döndü, konsolu kontrol et.");
    return;
  }

  // 6) Başarılıysa yenile
  alert("Etkinlik başarıyla kaydedildi.");
  loadEvents();
  eventForm.reset();
  eventModal.style.display = "none";
  editingEventId = null;
});


// Etkinlik düzenleme
window.editEvent = async (id) => {
  const res = await fetch(`${apiBase}/${id}`);
  const event = await res.json();

  editingEventId = id;
  modalTitle.textContent = "Etkinlik Güncelle";

  eventForm.title.value = event.title;
  eventForm.category.value = event.category;
  eventForm.city.value = event.city;
  eventForm.venue.value = event.venue;
  eventForm.date.value = event.date?.split("T")[0];
  eventForm.time.value = event.time;
  eventForm.price.value = event.price;
  eventForm.imageUrl.value = event.imageUrl;
  eventForm.seatImageUrl.value = event.seatImageUrl;

  eventModal.style.display = "flex";
};

// Etkinlik silme
window.deleteEvent = async (id) => {
  if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;

  const res = await fetch(`${apiBase}/${id}`, {
    method: "DELETE"
  });

  if (res.ok) loadEvents();
};

// Modal aç/kapa
openAddEventModal.addEventListener("click", () => {
  editingEventId = null;
  modalTitle.textContent = "Etkinlik Ekle";
  eventForm.reset();
  eventModal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  eventModal.style.display = "none";
});

// Sayfa yüklenince
loadEvents();

// ===================== DUYURULAR =====================

const announcementForm = document.getElementById("announcementForm");
const announcementList = document.getElementById("announcementList");

announcementForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("announcementTitle").value.trim();
  const content = document.getElementById("announcementContent").value.trim();

  if (!title || !content) return;

  fetch("http://localhost:5031/api/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: title,
      content: content,
      date: new Date().toISOString()
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("API hatası");
    return res.json();
  })
  .then(data => {
  alert("Duyuru başarıyla eklendi!");
  announcementForm.reset();
  renderAnnouncements(); // ← Eklendikten sonra tekrar listele
})
  .catch(err => {
    console.error("API gönderme hatası:", err);
    alert("Duyuru API'ye gönderilemedi.");
  });
});

function renderAnnouncements() {
  fetch("http://localhost:5031/api/announcements")
    .then(res => {
      if (!res.ok) throw new Error("API hatası");
      return res.json();
    })
    .then(data => {
      announcementList.innerHTML = "";
      data.forEach((a) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${a.title}</strong><br>
          <small>${new Date(a.date).toLocaleString("tr-TR")}</small><br>
          <p>${a.content}</p>
          <button onclick="deleteAnnouncement(${a.id})">Sil</button>
        `;
        li.style.borderBottom = "1px solid #ccc";
        li.style.padding = "10px 0";
        announcementList.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Duyuru çekme hatası:", err);
      announcementList.innerHTML = "<li>Veri alınamadı.</li>";
    });
}

window.deleteAnnouncement = function (id) {
  if (!confirm("Bu duyuruyu silmek istediğine emin misin?")) return;

  fetch(`http://localhost:5031/api/announcements/${id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Silme başarısız");
      alert("Duyuru silindi.");
      renderAnnouncements(); // yeniden API'den duyuruları çek
    })
    .catch(err => {
      console.error("Silme hatası:", err);
      alert("Duyuru silinemedi.");
    });
};

document.getElementById("logoutLink").addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "../login.html";  // çünkü admin klasöründen çıkıyoruz
});

// ===================== KULLANICILAR =====================
const apiUsersBase   = "http://localhost:5031/api/users";  
const usersTableBody = document.querySelector("#usersTable tbody");
const usersSectionLink = document.querySelector('a[href="#kullanicilar"]');

// 1) Kullanıcıları çekip tabloya yaz
async function loadUsers() {
  try {
    const res = await fetch(apiUsersBase);
    if (!res.ok) throw new Error(res.status);
    const users = await res.json();
    usersTableBody.innerHTML = "";
    users.forEach(u => {
    usersTableBody.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.fullName || u.name || "-"}</td>    <!-- burayı fullName olarak değiştirin -->
        <td>${u.email}</td>
        <td>${u.isApproved ? "✅" : "❌"}</td>
        <td>
          ${!u.isApproved ? `<button class="approve-btn" data-id="${u.id}">Onayla</button>` : ""}
        </td>
      </tr>`;
  });
  } catch (err) {
    console.error("loadUsers Hatası:", err);
    alert("Kullanıcıları yüklerken hata oluştu. Konsolu kontrol et.");
  }
}

// 2) Onayla butonuna tıklanınca çağrı yap
usersTableBody.addEventListener("click", async e => {
  if (!e.target.matches(".approve-btn")) return;
  const id = e.target.dataset.id;
  if (!confirm("Bu kullanıcıyı onaylamak istediğinize emin misiniz?")) return;
  try {
    const res = await fetch(`${apiUsersBase}/${id}/approve`, { method: "PUT" });
    if (!res.ok) throw new Error(res.status);
    alert("Kullanıcı onaylandı.");
    loadUsers();
  } catch (err) {
    console.error("Onaylama hatası:", err);
    alert("Onaylama sırasında hata oluştu.");
  }
});

// 3) Menüde “Kullanıcılar” tıklanınca ilgili section’u aç ve veriyi yükle
usersSectionLink.addEventListener("click", e => {
  e.preventDefault();
  document.querySelectorAll("main.admin-main > section")
          .forEach(sec => sec.style.display = "none");
  document.getElementById("kullanicilar").style.display = "block";
  loadUsers();
});
