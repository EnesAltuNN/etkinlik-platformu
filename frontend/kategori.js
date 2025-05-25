document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userNameElement = document.getElementById("userName");
  if (userNameElement && user.fullName) {
    userNameElement.textContent = user.fullName;
  }

  const params = new URLSearchParams(window.location.search);
  const kategori = (params.get("kategori") || "").toLowerCase();
  const baslik = document.getElementById("kategoriBaslik");
  const sehirSec = document.getElementById("citySelect");
  const siralamaSec = document.getElementById("sortSelect");
  const liste = document.getElementById("etkinlikListesi");

  baslik.textContent = kategori.charAt(0).toUpperCase() + kategori.slice(1) + " Etkinlikleri";

  fetch("http://localhost:5031/api/event")
    .then(res => res.json())
    .then(data => {
      const filteredByKategori = data.filter(e => e.category.toLowerCase() === kategori);

      const sehirler = [...new Set(filteredByKategori.map(e => e.city))];
      sehirler.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        sehirSec.appendChild(option);
      });

      let aktifListe = filteredByKategori;

      function render() {
        const secilenSehir = sehirSec.value;
        let listele = [...aktifListe];

        if (secilenSehir) {
          listele = listele.filter(e => e.city === secilenSehir);
        }

        const sortBy = siralamaSec.value;
        if (sortBy === "fiyat") {
          listele.sort((a, b) => a.price - b.price);
        } else if (sortBy === "tarih") {
          listele.sort((a, b) => {
            const aDate = new Date(a.datetime || (a.date + 'T' + a.time));
            const bDate = new Date(b.datetime || (b.date + 'T' + b.time));
            return aDate - bDate;
          });
        }

        liste.innerHTML = "";
        if (listele.length === 0) {
          liste.innerHTML = "<p>Bu kritere uygun etkinlik bulunamadı.</p>";
          return;
        }

        listele.forEach(e => {
          const card = document.createElement("div");
          card.className = "event-card";
          card.innerHTML = `
            <a href="etkinlik.html?id=${e.id}">
              <img src="${e.imageUrl?.startsWith('data:image') ? e.imageUrl : (e.imageUrl || 'img/placeholder.png')}" alt="${e.title}">
              <div class="event-info">
                <h3>${e.title}</h3>
                <p>${e.venue}</p>
                <p>${e.date || e.datetime?.split("T")[0]} - ${e.time || e.datetime?.split("T")[1]}</p>
                <p class="price">${e.price} TL</p>
                <button onclick="addToCart(${e.id})">Sepete Ekle</button>
              </div>
            </a>
          `;
          liste.appendChild(card);
        });
      }

      render();
      sehirSec.addEventListener("change", render);
      siralamaSec.addEventListener("change", render);
    });
});

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
