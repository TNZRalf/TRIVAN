  // Menu button 
let menu=document.querySelector('#menu-icon');
let body=document.querySelector('.body');
let navmenu=document.querySelector('.navmenu');

menu.onclick= () => {
  menu.classList.toggle('bx-x');
  navmenu.classList.toggle('open');
}





// Submenu 

let menuTimeout;
const subMenu = document.getElementById("subMenu");

// Function to toggle the menu visibility
function toggleMenu() {
    // Toggle the 'open-menu' class to show/hide the menu
    subMenu.classList.toggle('open-menu');
}

// Function to start the timeout when the mouse leaves the icon
function startTimeout() {
    // Clear any existing timeout
    clearTimeout(menuTimeout);
    // Set a new timeout to close the menu after a delay
    menuTimeout = setTimeout(() => {
        // Hide the menu
        subMenu.classList.remove('open-menu');
    }, 500); // Adjust the timeout duration (in milliseconds) as needed
}

// Function to cancel the timeout when the mouse re-enters the menu
function cancelTimeout() {
    // Clear the timeout to prevent closing the menu
    clearTimeout(menuTimeout);
}


// Pop up 
const popup =document.querySelector(".popup-overlay");
const closebtn =document.querySelector(".popup .close");
const signbtn=document.querySelector("popup .signpopup");
const createPopupCookie= ()=>{
    let expiresDays = 30;
    let date = new Date ();
    date.setTime(date.getTime()+expiresDays * 24 * 60 * 60 * 1000);
    let expires ="expires=" + date.toUTCString;
    document.cookie=`popupCookie=true; ${expires}; path=/;`;
}

closebtn.addEventListener("click",()=>{
    popup.classList.remove("active");
    createPopupCookie();  
})

window.addEventListener("scroll",() => {
    if (window.scrollY > 800) {
        popup.classList.add("active");
    }
});


if (!document.cookie.match(/^(.*;)?\s*popupCookie\s*=\s*[^;]+(.*)?$/)) {
    popup.classList.add("active");
}


/*CART*/

let products = [];
let cart = [];

//* selectors

const selectors = {
  products: document.querySelector(".products"),
  cartBtn: document.querySelector(".cart-btn "),
  cartQty: document.querySelector(".cart-qty"),
  cartClose: document.querySelector(".cart-close"),
  cart: document.querySelector(".cart"),
  cartOverlay: document.querySelector(".cart-Overlay "),
  cartClear: document.querySelector(".cart-clear"),
  cartBody: document.querySelector(".cart-body"),
  cartTotal: document.querySelector(".cart-total"),
};

//* event listeners

const setupListeners = () => {
  document.addEventListener("DOMContentLoaded", initStore);

  // product event
  selectors.products.addEventListener("click", addToCart);

  // cart events
  selectors.cartBtn.addEventListener("click", showCart);
  selectors.cartOverlay.addEventListener("click", hideCart);
  selectors.cartClose.addEventListener("click", hideCart);
  selectors.cartBody.addEventListener("click", updateCart);
  selectors.cartClear.addEventListener("click", clearCart);
};

//* event handlers

const initStore = () => {
  loadCart();
  loadProducts("https://fakestoreapi.com/products")
    .then(renderProducts)
    .finally(renderCart);
};

const showCart = () => {
  selectors.cart.classList.add("show");
  selectors.cartOverlay.classList.add("show");
};

const hideCart = () => {
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

  // if the last item is remove, close the cart
  cart.length === 0 && setTimeout(hideCart, 500);

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

    btn === "incr" && increaseQty(id);
    btn === "decr" && decreaseQty(id);

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

//* render functions

const renderCart = () => {
  // show cart qty in navbar
  const cartQty = cart.reduce((sum, item) => {
    return sum + item.qty;
  }, 0);

  selectors.cartQty.textContent = cartQty;
  selectors.cartQty.classList.toggle("visible", cartQty);

  // show cart total
  selectors.cartTotal.textContent = calculateTotal().format();

  // show empty cart
  if (cart.length === 0) {
    selectors.cartBody.innerHTML =
      '<div class="cart-empty">Your cart is empty.</div>';
    return;
  }

  // show cart items
  selectors.cartBody.innerHTML = cart
    .map(({ id, qty }) => {
      // get product info of each cart item
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

              <span class="cart-item-price">
                ${amount.format()}
              </span>
            </div>
          </div>
        </div>`;
    })
    .join("");
};

const renderProducts = () => {
  selectors.products.innerHTML = products
    .map((product) => {
      const { id, title, image, price } = product;

      // check if product is already in cart
      const inCart = cart.find((x) => x.id === id);

      // make the add to cart button disabled if already in cart
      const disabled = inCart ? "disabled" : "";

      // change the text if already in cart
      const text = inCart ? "Added in Cart" : "Add to Cart";

      return `
    <div class="product">
      <img src="${image}" alt="${title}" />
      <h3>${title}</h3>
      <h5>${price.format()}</h5>
      <button ${disabled} data-id=${id}>${text}</button>
    </div>
    `;
    })
    .join("");
};

//* api functions



//* helper functions

const calculateTotal = () => {
  return cart
    .map(({ id, qty }) => {
      const { price } = products.find((x) => x.id === id);

      return qty * price;
    })
    .reduce((sum, number) => {
      return sum + number;
    }, 0);
};

Number.prototype.format = function () {
  return this.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

//* initialize

setupListeners();












