document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const container = document.getElementById("eventDetail");
  loadCities();

  if (!eventId) {
    container.innerHTML = "<p>Etkinlik ID’si eksik.</p>";
    return;
  }

  // Etkinlik bilgisi API'den alınır
  fetch(`http://localhost:5031/api/event/${eventId}`)
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(ev => {
      const date = ev.date.split("T")[0];
      const time = ev.time;

      container.innerHTML = `
        <div class="event-detail">
          <img src="${ev.imageUrl || 'img/default.jpg'}"
               alt="${ev.title}"
               class="event-image">
          <div class="event-info">
            <h1>${ev.title}</h1>
            <p><strong>Şehir:</strong> ${ev.city}</p>
            <p><strong>Mekan:</strong> ${ev.venue}</p>
            <p><strong>Tarih:</strong> ${date}</p>
            <p><strong>Saat:</strong> ${time}</p>
            <p class="price">${ev.price} TL</p>
            <button id="addToCart">Sepete Ekle</button>

            <div class="seating-plan">
              <h3>Oturma Planı</h3>
              <img src="${ev.seatImageUrl || 'img/default-seat.jpg'}"
                   alt="Oturma Planı"
                   id="seatImage"
                   class="seat-thumb">
            </div>
          </div>
        </div>

        <div class="event-full">
          <div class="rules">
            <h3>Etkinlik Hakkında Bilmeniz Gerekenler</h3>
            <ul>
              <li><strong>Satın alınan biletlerde iptal, iade ve değişiklik yapılamaz.</strong></li>
              <li>Etkinlik saatinden 30 dakika önce giriş yapın.</li>
              <li>Girişte bilet kontrolü yapılacaktır.</li>
              <li>Yiyecek-içecek sokmak yasaktır.</li>
              <li>16 yaş altı aile eşliğinde gelebilir.</li>
              <li>E-bilet mail ve SMS ile iletilir, çıktı gerekmez.</li>
              <li>Oturma düzenine uymak zorunludur.</li>
              <li>Etkinlik Epizot Yapım tarafından düzenlenir.</li>
            </ul>
          </div>
        </div>
      `;

      // Sepete Ekle
      document.getElementById("addToCart")
        .addEventListener("click", () => {
          const cart = JSON.parse(localStorage.getItem("cart")) || [];

          const already = cart.find(e => e.id === ev.id);
          if (already) {
            alert("Bu etkinlik zaten sepete eklenmiş.");
            return;
          }

          cart.push(ev);
          localStorage.setItem("cart", JSON.stringify(cart));
          alert("Etkinlik sepete eklendi!");
        });

      // Oturma planını büyüt
      document.getElementById("seatImage")
        .addEventListener("click", () => {
          const modal = document.createElement("div");
          modal.className = "modal";
          modal.innerHTML = `
            <div class="modal-content">
              <span class="close">&times;</span>
              <img src="${ev.seatImageUrl || 'img/default-seat.jpg'}"
                   alt="Büyük Oturma Planı"
                   class="modal-img">
            </div>
          `;
          document.body.appendChild(modal);
          modal.querySelector(".close")
               .addEventListener("click", () => modal.remove());
        });
    })
    .catch(err => {
      console.error("Etkinlik yüklenirken hata:", err);
      container.innerHTML = "<p>Veri alınırken hata oluştu.</p>";
    });
});

function loadCities() {
  fetch("cities.json")
    .then(res => res.json())
    .then(cities => {
      const select = document.getElementById("citySelect");
      if (!select) return;
      cities.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        select.appendChild(opt);
      });
    })
    .catch(err => console.warn("Şehir yükleme hatası:", err));
}
