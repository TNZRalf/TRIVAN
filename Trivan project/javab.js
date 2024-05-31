// Menu button
let menu = document.querySelector('#menu-icon');
let navmenu = document.querySelector('.navmenu');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navmenu.classList.toggle('open');
};

// Submenu
let menuTimeout;
const subMenu = document.getElementById("subMenu");

function toggleMenu() {
    subMenu.classList.toggle('open-menu');
}

function startTimeout() {
    clearTimeout(menuTimeout);
    menuTimeout = setTimeout(() => {
        subMenu.classList.remove('open-menu');
    }, 500); // Adjust the timeout duration as needed
}

function cancelTimeout() {
    clearTimeout(menuTimeout);
}

// Cart and products
let products = [];
let cart = [];

// Selectors
const selectors = {
    products: document.querySelector(".products"),
    cartBtn: document.querySelector(".bx-cart-alt"),
    cartQty: document.querySelector(".cart-qty"),
    cartClose: document.querySelector(".cart-close"),
    cart: document.querySelector(".cart"),
    cartOverlay: document.querySelector(".cart-Overlay"),
    cartClear: document.querySelector(".cart-clear"),
    cartBody: document.querySelector(".cart-body"),
    cartTotal: document.querySelector(".cart-total"),
};

// Debugging: Ensure selectors are correctly identified
console.log(selectors);

// Event listeners
const setupListeners = () => {
    document.addEventListener("DOMContentLoaded", initStore);

    // Product event
    if (selectors.products) {
        selectors.products.addEventListener("click", addToCart);
    } else {
        console.error("Product selector not found");
    }

    // Cart events
    if (selectors.cartBtn) {
        selectors.cartBtn.addEventListener("click", showCart);
    } else {
        console.error("Cart button selector not found");
    }

    if (selectors.cartOverlay) {
        selectors.cartOverlay.addEventListener("click", hideCart);
    } else {
        console.error("Cart overlay selector not found");
    }

    if (selectors.cartClose) {
        selectors.cartClose.addEventListener("click", hideCart);
    } else {
        console.error("Cart close button selector not found");
    }

    if (selectors.cartBody) {
        selectors.cartBody.addEventListener("click", updateCart);
    } else {
        console.error("Cart body selector not found");
    }

    if (selectors.cartClear) {
        selectors.cartClear.addEventListener("click", clearCart);
    } else {
        console.error("Cart clear button selector not found");
    }
};

// Event handlers
const initStore = () => {
    loadCart();
    loadProducts("https://fakestoreapi.com/products")
        .then(renderProducts)
        .finally(renderCart);
};

const showCart = () => {
    console.log("Showing cart");
    selectors.cart.classList.add("show");
    selectors.cartOverlay.classList.add("show");
};

const hideCart = () => {
    console.log("Hiding cart");
    selectors.cart.classList.remove("show");
    selectors.cartOverlay.classList.remove("show");
};

const clearCart = () => {
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
    setTimeout(hideCart, 500);
};

const addToCart = (e) => {
    if (e.target.hasAttribute("data-id")) {
        const id = parseInt(e.target.dataset.id);
        const inCart = cart.find((x) => x.id === id);

        if (inCart) {
            alert("Item is already in cart.");
            return;
        }

        cart.push({ id, qty: 1 });
        saveCart();
        renderProducts();
        renderCart();
        showCart();
    }
};

const removeFromCart = (id) => {
    cart = cart.filter((x) => x.id !== id);

    if (cart.length === 0) setTimeout(hideCart, 500);

    renderProducts();
};

const increaseQty = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;

    item.qty++;
};

const decreaseQty = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;

    item.qty--;

    if (item.qty === 0) removeFromCart(id);
};

const updateCart = (e) => {
    if (e.target.hasAttribute("data-btn")) {
        const cartItem = e.target.closest(".cart-item");
        const id = parseInt(cartItem.dataset.id);
        const btn = e.target.dataset.btn;

        if (btn === "incr") increaseQty(id);
        if (btn === "decr") decreaseQty(id);

        saveCart();
        renderCart();
    }
};

const saveCart = () => {
    localStorage.setItem("online-store", JSON.stringify(cart));
};

const loadCart = () => {
    cart = JSON.parse(localStorage.getItem("online-store")) || [];
};

// Render functions
const renderCart = () => {
    const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);

    selectors.cartQty.textContent = cartQty;
    selectors.cartQty.classList.toggle("visible", cartQty);

    selectors.cartTotal.textContent = calculateTotal().format();

    if (cart.length === 0) {
        selectors.cartBody.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
        return;
    }

    selectors.cartBody.innerHTML = cart.map(({ id, qty }) => {
        const product = products.find((x) => x.id === id);
        const { title, image, price } = product;
        const amount = price * qty;

        return `
            <div class="cart-item" data-id="${id}">
                <img src="${image}" alt="${title}" />
                <div class="cart-item-detail">
                    <h3>${title}</h3>
                    <h5>${price.format()}</h5>
                    <div class="cart-item-amount">
                        <i class="bi bi-dash-lg" data-btn="decr"></i>
                        <span class="qty">${qty}</span>
                        <i class="bi bi-plus-lg" data-btn="incr"></i>
                        <span class="cart-item-price">${amount.format()}</span>
                    </div>
                </div>
            </div>`;
    }).join("");
};

const renderProducts = () => {
    selectors.products.innerHTML = products.map((product) => {
        const { id, title, image, price } = product;
        const inCart = cart.find((x) => x.id === id);
        const disabled = inCart ? "disabled" : "";
        const text = inCart ? "Added in Cart" : "Add to Cart";

        return `
            <div class="product">
                <img src="${image}" alt="${title}" />
                <h3>${title}</h3>
                <h5>${price.format()}</h5>
                <button ${disabled} data-id=${id}>${text}</button>
            </div>`;
    }).join("");
};

// API functions
const loadProducts = async (url) => {
    const response = await fetch(url);
    products = await response.json();
};

// Helper functions
const calculateTotal = () => {
    return cart.map(({ id, qty }) => {
        const { price } = products.find((x) => x.id === id);
        return qty * price;
    }).reduce((sum, number) => sum + number, 0);
};

Number.prototype.format = function () {
    return this.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
};

// Initialize
setupListeners();
