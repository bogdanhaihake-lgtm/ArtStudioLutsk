const TELEGRAM_USERNAME = "blymz";
const ADMIN_PASSWORD = "ART2026"; // ДЕМО-пароль. Для реального сайту потрібна серверна авторизація.

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Williams Racing FW14B",
    price: 1395,
    image: "images/williams-2.jpg",
    gallery: [
      "images/williams-1.jpg",
      "images/williams-2.jpg",
      "images/williams-3.jpg",
      "images/williams-4.jpg"
    ],
    description: "Арт Тримач Рамка на Стіну 50х30 см.\nдля Вашого Конструктора LEGO Icons Williams Racing\nFW14B Nigel Mansell (10353) з додатковим кріпленням для міні-фігурки та таблички\n\n• Ціна - 1395.00 Грн\n\n* Конструктор Lego в комплект не входить, ми займаємося виготовленням рамок ваших Зібраних наборів.\n\n✓ У комплекті ви отримаєте повністю готову підставку, спеціально адаптовану під вашу модель, з урахуванням усіх найменших деталей конструктора.\n✓ Рамка виготовлена з міцного алюмінієвого профілю.\n✓ Укріплена металевими внутрішніми зʼєднаннями для максимальної міцності та естетики.\n• Габарити: 50×30 см\n• Матеріали: алюмінієвий профіль, оргскло товщиною 3 мм (висока прозорість), задня частина — з ДВП\n• Дизайн: всередині розміщено професійно надруковане зображення, спеціально підібране під конструкцію\n• Кріплення до стіни: встановлені тримачі з тильного боку\n• Кріплення моделі: у комплекті вертикальне кріплення для надійної фіксації конструктора на Рамці (отвір вже просвердлений, ваша модель буде розташована точно по центру) + в комплекті додатковий спеціальний тримач для таблички та мініфігурки як на фото.\n• Упакування — фірмова коробка з надійним захистом: пінопласт з обох боків. Ми самі покриваємо вартість пакування."
  }
];

let products = JSON.parse(localStorage.getItem("artStudioProducts")) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem("artStudioCart")) || [];
let currentProduct = null;
let currentPhoto = 0;

const $ = id => document.getElementById(id);
const productsEl = $("products");
const productModal = $("productModal");
const adminModal = $("adminModal");
const cartEl = $("cart");
const overlay = $("overlay");
const toast = $("toast");

function money(value) {
  return new Intl.NumberFormat("uk-UA", {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value) + " грн";
}

function saveProducts() {
  localStorage.setItem("artStudioProducts", JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem("artStudioCart", JSON.stringify(cart));
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderProducts() {
  productsEl.innerHTML = products.map((p, i) => `
    <article class="product" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-info">
        <span class="product-num">0${i + 1} / ART FRAME</span>
        <h3>${p.name}</h3>
        <p class="product-desc">${p.description.split("\n")[0]}</p>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="product-button" onclick="event.stopPropagation(); addToCart(${p.id})">У кошик</button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".product").forEach(card => {
    card.addEventListener("click", () => openProduct(Number(card.dataset.id)));
  });
}

function openProduct(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;
  currentPhoto = 0;
  $("modalTitle").textContent = currentProduct.name;
  $("modalPrice").textContent = money(currentProduct.price);
  $("modalDescription").textContent = currentProduct.description;

  const gallery = currentProduct.gallery?.length ? currentProduct.gallery : [currentProduct.image];
  $("modalImage").src = gallery[0];
  $("modalImage").alt = currentProduct.name;
  $("galleryCounter").textContent = `1 / ${gallery.length}`;

  $("thumbnails").innerHTML = gallery.map((src, i) => `
    <button class="thumb ${i === 0 ? "active" : ""}" onclick="setPhoto(${i})">
      <img src="${src}" alt="Фото ${i + 1}">
    </button>
  `).join("");

  const message = encodeURIComponent(
    `Вітаю! Хочу замовити: ${currentProduct.name} — ${money(currentProduct.price)}`
  );
  $("telegramOrder").href = `https://t.me/${TELEGRAM_USERNAME}?text=${message}`;

  productModal.classList.add("active");
  document.body.classList.add("no-scroll");
}

function setPhoto(index) {
  if (!currentProduct) return;
  const gallery = currentProduct.gallery?.length ? currentProduct.gallery : [currentProduct.image];
  currentPhoto = (index + gallery.length) % gallery.length;
  $("modalImage").src = gallery[currentPhoto];
  $("galleryCounter").textContent = `${currentPhoto + 1} / ${gallery.length}`;
  document.querySelectorAll(".thumb").forEach((t, i) => t.classList.toggle("active", i === currentPhoto));
}

$("prevPhoto").onclick = () => setPhoto(currentPhoto - 1);
$("nextPhoto").onclick = () => setPhoto(currentPhoto + 1);
$("closeProduct").onclick = () => { productModal.classList.remove("active"); document.body.classList.remove("no-scroll"); };
productModal.addEventListener("click", e => { if (e.target === productModal) $("closeProduct").click(); });

$("modalAddToCart").onclick = () => {
  if (currentProduct) {
    addToCart(currentProduct.id);
    showToast("Додано в кошик");
  }
};

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const item = cart.find(x => x.id === id);
  if (item) item.quantity++;
  else cart.push({id:p.id,name:p.name,price:p.price,image:p.image,quantity:1});
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
  renderCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function cartTotal() {
  return cart.reduce((sum,x) => sum + x.price * x.quantity, 0);
}

function renderCart() {
  $("cartCount").textContent = cart.reduce((s,x) => s + x.quantity, 0);
  $("cartTotal").textContent = money(cartTotal());

  if (!cart.length) {
    $("cartItems").innerHTML = '<div class="empty">Кошик порожній.</div>';
    return;
  }

  $("cartItems").innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>${money(item.price)}</p>
        <div class="qty" style="margin-top:8px">
          <button onclick="changeQuantity(${item.id},-1)">−</button>
          <b style="padding:0 8px">${item.quantity}</b>
          <button onclick="changeQuantity(${item.id},1)">+</button>
        </div>
        <button class="remove" onclick="removeFromCart(${item.id})">Видалити</button>
      </div>
      <b>${money(item.price * item.quantity)}</b>
    </div>
  `).join("");
}

function openCart() {
  cartEl.classList.add("active");
  overlay.classList.add("active");
}
function closeCart() {
  cartEl.classList.remove("active");
  overlay.classList.remove("active");
}
$("openCart").onclick = openCart;
$("closeCart").onclick = closeCart;
overlay.onclick = closeCart;

$("telegramCart").onclick = () => {
  if (!cart.length) {
    showToast("Кошик порожній");
    return;
  }
  const lines = cart.map(x => `• ${x.name} × ${x.quantity} — ${money(x.price * x.quantity)}`).join("\n");
  const text = encodeURIComponent(
    `Вітаю! Хочу оформити замовлення в ART STUDIO LUTSK:\n\n${lines}\n\nРазом: ${money(cartTotal())}`
  );
  window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${text}`, "_blank");
};

// ADMIN
$("openAdmin").onclick = () => {
  adminModal.classList.add("active");
  document.body.classList.add("no-scroll");
  $("adminPassword").focus();
};
$("closeAdmin").onclick = closeAdmin;
adminModal.addEventListener("click", e => { if (e.target === adminModal) closeAdmin(); });

function closeAdmin() {
  adminModal.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

$("loginAdmin").onclick = () => {
  if ($("adminPassword").value === ADMIN_PASSWORD) {
    $("adminLogin").classList.add("hidden");
    $("adminPanel").classList.remove("hidden");
    renderAdmin();
  } else {
    showToast("Неправильний пароль");
  }
};

$("adminPassword").addEventListener("keydown", e => {
  if (e.key === "Enter") $("loginAdmin").click();
});

$("logoutAdmin").onclick = () => {
  $("adminPanel").classList.add("hidden");
  $("adminLogin").classList.remove("hidden");
  $("adminPassword").value = "";
};

function renderAdmin() {
  $("adminProducts").innerHTML = products.map(p => `
    <div class="admin-row">
      <span><b>${p.name}</b><br><small>${money(p.price)}</small></span>
      <button class="delete" onclick="deleteProduct(${p.id})">Видалити</button>
    </div>
  `).join("");
}

function deleteProduct(id) {
  if (!confirm("Видалити цей товар?")) return;
  products = products.filter(p => p.id !== id);
  saveProducts();
  renderProducts();
  renderAdmin();
  showToast("Товар видалено");
}

$("addProductForm").addEventListener("submit", e => {
  e.preventDefault();

  const galleryText = $("newGallery").value.trim();
  const gallery = galleryText
    ? galleryText.split(",").map(x => x.trim()).filter(Boolean)
    : [$("newImage").value.trim()];

  const product = {
    id: Date.now(),
    name: $("newName").value.trim(),
    price: Number($("newPrice").value),
    image: $("newImage").value.trim(),
    gallery,
    description: $("newDescription").value.trim()
  };

  products.push(product);
  saveProducts();
  renderProducts();
  renderAdmin();
  e.target.reset();
  showToast("Новий товар додано");
});

// Mobile menu
$("mobileMenu").onclick = () => $("menu").classList.toggle("open");

// Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    productModal.classList.remove("active");
    adminModal.classList.remove("active");
    closeCart();
    document.body.classList.remove("no-scroll");
  }
});

renderProducts();
renderCart();
