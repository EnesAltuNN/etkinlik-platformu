let allAnnouncements = JSON.parse(localStorage.getItem("announcements")) || [];
let announcementIndex = 4;
const OWM_API_KEY = "e816a678df91a40ed830cb90cbf0e21a";

document.addEventListener("DOMContentLoaded", () => {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) return;
  const user = JSON.parse(userJson);

  const userNameLink = document.getElementById("userNameLink");
  if (userNameLink && user.fullName) {
    userNameLink.textContent = user.fullName;
  }

  loadCities();
  loadEvents();
  renderAnnouncements();
  document.getElementById("showMoreBtn").addEventListener("click", showMoreAnnouncements);
  document.getElementById("citySelect").addEventListener("change", handleCityChange);
  setupFilterDropdown();
});

function loadCities() {
  fetch("cities.json")
    .then(res => res.json())
    .then(cities => {
      const select = document.getElementById("citySelect");
      cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
      });
    });
}

function handleCityChange() {
  const selectedCity = document.getElementById("citySelect").value;
  updateWeather(selectedCity);
  filterEventsByCity(selectedCity);
}

async function updateWeather(city) {
  const weatherBox = document.getElementById("weatherInfo");
  weatherBox.textContent = "Yükleniyor…";

  const url = `https://api.openweathermap.org/data/2.5/weather`
    + `?q=${encodeURIComponent(city)}`
    + `&units=metric&lang=tr`
    + `&appid=${OWM_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const temp = data.main.temp.toFixed(1);
    const descr = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherBox.innerHTML = `
      <img src="${iconUrl}" alt="${descr}" style="vertical-align:middle;width:40px">
      <strong>${temp}°C</strong> — ${descr}
    `;
  } catch (err) {
    console.error("Hava durumu güncellenirken hata:", err);
    weatherBox.textContent = "Veri alınamadı.";
  }
}

function filterEventsByCity(city) {
  const allCards = document.querySelectorAll(".event-card");
  allCards.forEach(card => {
    const cardCity = card.getAttribute("data-city") || "";
    card.style.display = city === "" || cardCity === city ? "block" : "none";
  });
}

function renderAnnouncements() {
  fetch("http://localhost:5031/api/announcements")
    .then(res => {
      if (!res.ok) throw new Error("API hatası");
      return res.json();
    })
    .then(data => {
      const container = document.getElementById("announcementList");
      container.innerHTML = "";

      data.slice(0, 4).forEach(duyuru => {
        const li = document.createElement("li");
        li.className = "announcement-item";

        const formattedDate = new Date(duyuru.date).toLocaleString("tr-TR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit"
        });

        li.innerHTML = `
          <strong>${duyuru.title}</strong><br/>
          <p>${duyuru.content}</p>
          <small>${formattedDate}</small>
        `;

        container.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Duyuru verisi alınamadı:", error);
      document.getElementById("announcementList").innerHTML = "<li>Veri alınamadı.</li>";
    });
}

function showMoreAnnouncements() {
  announcementIndex += 3;
  renderAnnouncements();
}

function setupFilterDropdown() {
  const toggle = document.getElementById("filterToggle");
  const options = document.getElementById("filterOptions");

  toggle.addEventListener("click", () => {
    options.style.display = options.style.display === "flex" ? "none" : "flex";
  });

  document.querySelectorAll("#filterOptions div").forEach(option => {
    option.addEventListener("click", () => {
      const criteria = option.getAttribute("data-sort");
      sortEvents(criteria);
      options.style.display = "none";
    });
  });
}

function sortEvents(criteria) {
  const grid = document.getElementById("eventGrid");
  const cards = Array.from(grid.children);

  cards.sort((a, b) => {
    const aPrice = parseFloat(a.querySelector(".price").textContent);
    const bPrice = parseFloat(b.querySelector(".price").textContent);
    const aDate = new Date(a.querySelector(".datetime").textContent);
    const bDate = new Date(b.querySelector(".datetime").textContent);

    if (criteria === "price") return aPrice - bPrice;
    if (criteria === "date") return aDate - bDate;
    return 0;
  });

  grid.innerHTML = "";
  cards.forEach(card => grid.appendChild(card));
}

const userName = localStorage.getItem("registeredFirstName") + " " + localStorage.getItem("registeredLastName");
const userNameLink = document.getElementById("userNameLink");
if (userNameLink) {
  userNameLink.textContent = userName || "Kullanıcı";
}

function loadEvents() {
  fetch("http://localhost:5031/api/event")
    .then(res => res.json())
    .then(events => {
      const grid = document.getElementById("eventGrid");
      grid.innerHTML = "";

      events
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(event => {
          const card = document.createElement("div");
          card.className = "event-card";
          card.setAttribute("data-city", event.city);

          let imgSrc;
          if (event.imageUrl?.startsWith("data:")) {
            imgSrc = event.imageUrl;
          } else if (event.imageUrl) {
            imgSrc = event.imageUrl;
          } else {
            imgSrc = "../img/default.jpg";
          }

          card.innerHTML = `
            <a href="etkinlik.html?id=${event.id}">
              <img src="${imgSrc}" alt="${event.title}" class="event-img"
                   onerror="this.onerror=null;this.src='../img/default.jpg';" />
            </a>
            <div class="event-info">
              <h3><a href="etkinlik.html?id=${event.id}">${event.title}</a></h3>
              <p>${event.venue}</p>
              <p class="datetime">${event.date.split("T")[0]} ${event.time}</p>
              <p class="price">${event.price} TL</p>
              <button onclick="addToCart(${event.id})">Sepete Ekle</button>
            </div>
          `;
          grid.appendChild(card);
        });
    })
    .catch(err => console.error("Etkinlikler yüklenemedi:", err));
}

function addToCart(eventId) {
  fetch(`http://localhost:5031/api/event/${eventId}`)
    .then(res => res.json())
    .then(event => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const already = cart.find(e => e.id === event.id);
      if (already) {
        alert("Bu etkinlik zaten sepette.");
        return;
      }

      cart.push(event);
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Etkinlik sepete eklendi.");
    })
    .catch(err => {
      console.error("Etkinlik alınamadı:", err);
      alert("Etkinlik bilgisi alınamadı.");
    });
}
