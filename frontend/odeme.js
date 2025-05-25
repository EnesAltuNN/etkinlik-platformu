document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const paymentMethod = document.getElementById("paymentMethod");
  const cardFields = document.getElementById("cardFields");
  const havaleInfo = document.getElementById("havaleInfo");
  const mobilInfo = document.getElementById("mobilInfo");

  // Tüm ödeme alanlarını gizle
  function hideAllPaymentSections() {
    cardFields.style.display = "none";
    havaleInfo.style.display = "none";
    mobilInfo.style.display = "none";
  }

  // Sayfa yüklendiğinde gizle
  hideAllPaymentSections();

  // Seçime göre alanları göster
  paymentMethod.addEventListener("change", () => {
    hideAllPaymentSections();
    const selected = paymentMethod.value;
    if (selected === "card") cardFields.style.display = "block";
    else if (selected === "havale") havaleInfo.style.display = "block";
    else if (selected === "mobil") mobilInfo.style.display = "block";
  });

  // Form gönderimi
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Her etkinlik için kontenjanı azalt
    for (const item of cart) {
      try {
        await fetch(`http://localhost:5031/api/event/${item.id}/reduce-capacity?amount=${item.quantity || 1}`, {
          method: "PUT"
        });
      } catch (err) {
        console.error(`Kapasite azaltılamadı: ${item.title}`, err);
      }
    }

    alert("Ödemeniz başarıyla tamamlandı. Teşekkür ederiz!");
    
cart.forEach(item => {
  fetch(`http://localhost:5031/api/event/${item.id}`)
    .then(res => res.json())
    .then(event => {
      if (event.capacity > 0) {
        event.capacity -= 1;
        fetch(`http://localhost:5031/api/event/${event.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(event)
        });
      }
    })
    .catch(err => console.error("Kapasite güncellenemedi:", err));
});

    localStorage.removeItem("cart");
    window.location.href = "home.html";
  });
});
