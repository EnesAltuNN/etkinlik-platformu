document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cartItems");
  const subtotalEl    = document.getElementById("subtotal");
  const taxEl         = document.getElementById("tax");
  const feeEl         = document.getElementById("fee");
  const totalEl       = document.getElementById("totalPrice");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Her ürüne default quantity ver
  cart = cart.map(item => ({
    ...item,
    quantity: item.quantity || 1
  }));

  console.log("Sepetteki öğeler:", cart);

  renderCart();

  function renderCart() {
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Sepetiniz boş. <a href='home.html'>Etkinliklere dön</a></p>";
      subtotalEl.textContent = "";
      taxEl.textContent = "";
      feeEl.textContent = "";
      totalEl.textContent = "";
      return;
    }

    cartContainer.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "cart-item";

      const toplam = item.price * item.quantity;
      subtotal += toplam;

      // Resim için önce imageUrl, yoksa default:
      const DEFAULT_IMG = "img/default.jpg";
      const img = document.createElement("img");
      img.src       = item.imageUrl && item.imageUrl.trim() !== ""
                      ? item.imageUrl
                      : DEFAULT_IMG;
      img.alt       = item.title;
      img.className = "cart-item-img";

      const info = document.createElement("div");
      info.className = "cart-info";
      info.innerHTML = `
        <h4 data-id="${item.id}">${item.title}</h4>
        <p class="total-price">${toplam} TL</p>
        <label>Adet:</label>
        <select class="quantity-select" data-index="${index}">
          ${[1,2,3,4,5].map(n =>
            `<option value="${n}" ${n === item.quantity ? "selected":""}>${n}</option>`
          ).join("")}
        </select>
      `;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Sil";
      removeBtn.className   = "remove-btn";
      removeBtn.dataset.index = index;

      div.appendChild(img);
      div.appendChild(info);
      div.appendChild(removeBtn);
      cartContainer.appendChild(div);
    });

    const tax   = Math.round(subtotal * 0.20);
    const fee   = 10;
    const total = subtotal + tax + fee;

    subtotalEl.textContent = `Ara Toplam: ${subtotal} TL`;
    taxEl.textContent      = `KDV (%20): ${tax} TL`;
    feeEl.textContent      = `Katkı Payı: ${fee} TL`;
    totalEl.textContent    = `Genel Toplam: ${total} TL`;

    // Sil butonu
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = parseInt(e.target.dataset.index, 10);
        cart.splice(idx, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });

    // Adet güncelleme
    document.querySelectorAll(".quantity-select").forEach(select => {
      select.addEventListener("change", e => {
        const idx   = parseInt(e.target.dataset.index, 10);
        const newQty = parseInt(e.target.value, 10);
        cart[idx].quantity = newQty;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });

    // Başlığa tıklayınca detay sayfasına git
    document.querySelectorAll(".cart-info h4").forEach(title => {
      title.addEventListener("click", () => {
        const id = title.dataset.id;
        window.location.href = `etkinlik.html?id=${id}`;
      });
    });
  }

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    window.location.href = "odeme.html";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userNameElement = document.getElementById("userName");

  if (userNameElement && (user.fullName || user.name)) {
    userNameElement.textContent = user.fullName || user.name;
  }
});
