const products = {
  red: {
    kicker: "Full body recovery",
    title: "KRYON Red",
    copy: "A full-body red light panel designed for recovery days, soreness, tissue warmth, and cellular energy rituals.",
    price: 1280,
    rating: "4.9 / 5",
    reviews: "218 reviews",
    signal: "Red + near infrared",
    use: "Full body sessions",
    ritual: "Morning or post-training",
    render: "panel-device",
    aura: "rgba(195, 58, 47, 0.24)"
  },
  portable: {
    kicker: "Targeted recovery",
    title: "KRYON Red Portable",
    copy: "A compact light device for travel, desk-side resets, and targeted zones that need extra attention.",
    price: 420,
    rating: "4.8 / 5",
    reviews: "164 reviews",
    signal: "Focused red light",
    use: "Shoulders, knees, back",
    ritual: "Anytime touch-ups",
    render: "portable-device",
    aura: "rgba(195, 58, 47, 0.2)"
  },
  align: {
    kicker: "Body reset",
    title: "KRYON Align",
    copy: "A guided alignment layer for posture, mobility, and restoring a cleaner sense of physical balance.",
    price: 260,
    rating: "4.7 / 5",
    reviews: "126 reviews",
    signal: "Movement + posture cues",
    use: "Alignment sessions",
    ritual: "Pre-work or evening",
    render: "align-device",
    aura: "rgba(143, 164, 155, 0.34)"
  },
  sleep: {
    kicker: "Nervous system downshift",
    title: "KRYON Sleep",
    copy: "A quiet night ritual that reduces stimulation and gives the body a softer bridge into sleep.",
    price: 340,
    rating: "4.9 / 5",
    reviews: "192 reviews",
    signal: "Low-stimulation calm",
    use: "Bedside ritual",
    ritual: "30 minutes before rest",
    render: "sleep-device",
    aura: "rgba(143, 164, 155, 0.32)"
  }
};

const goals = {
  energy: {
    title: "KRYON Red",
    copy: "Begin with a full-body red light session to support circulation, warmth, and daily cellular energy.",
    product: "red"
  },
  tension: {
    title: "KRYON Align",
    copy: "Move through a cleaner body reset when posture, stiffness, or repeated desk tension needs attention.",
    product: "align"
  },
  travel: {
    title: "KRYON Red Portable",
    copy: "Keep targeted light recovery close when you are moving between work, training, and travel.",
    product: "portable"
  },
  sleep: {
    title: "KRYON Sleep",
    copy: "Use a lower-stimulation evening ritual to help the nervous system shift toward rest.",
    product: "sleep"
  }
};

const currencyRates = {
  USD: { symbol: "$", rate: 1, locale: "en-US" },
  EGP: { symbol: "EGP ", rate: 48.5, locale: "en-US" },
  EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.79, locale: "en-GB" }
};

const storageKeys = {
  profile: "kryonProfile",
  orders: "kryonOrders",
  theme: "kryonTheme",
  session: "kryonSession",
  cart: "kryonCart"
};

const defaultProfile = {
  name: "",
  email: "",
  countryCode: "+20",
  phone: "",
  address: "",
  country: "",
  language: "en",
  currency: "USD",
  theme: "light",
  emailConfirmations: true
};

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target?.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

const productView = document.querySelector(".product-view");
const progressBar = document.querySelector(".progress");
const productRender = document.querySelector(".product-render");
const productAura = document.querySelector(".product-aura");
const cartView = document.querySelector(".cart-view");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartNote = document.getElementById("cart-note");
const profileView = document.querySelector(".profile-view");
const profileForm = document.getElementById("profile-form");
const profileLabel = document.getElementById("profile-label");
const profileStatus = document.getElementById("profile-status");
const checkoutView = document.querySelector(".checkout-view");
const checkoutForm = document.getElementById("checkout-form");
const checkoutItems = document.getElementById("checkout-items");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutNote = document.getElementById("checkout-note");
const cardFields = document.querySelector("[data-card-fields]");
const authFields = document.querySelector("[data-auth-fields]");
const passwordField = document.querySelector("[data-password-field]");
const confirmationView = document.querySelector(".confirmation-view");
const confirmationItems = document.getElementById("confirmation-items");
const confirmationId = document.getElementById("confirmation-id");
const confirmationTotal = document.getElementById("confirmation-total");
const confirmationCopy = document.getElementById("confirmation-copy");
const otpPanel = document.getElementById("otp-panel");
const otpStatus = document.getElementById("otp-status");

const cart = JSON.parse(localStorage.getItem(storageKeys.cart) || "{}");

let checkoutMode = "guest";
let otpCode = "";
let otpSent = false;
let otpCreatedAt = 0;

function saveCart() {
  localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
}
function loadProfile() {
  return {
    ...defaultProfile,
    ...JSON.parse(localStorage.getItem(storageKeys.profile) || "{}")
  };
}

let profile = loadProfile();

function saveProfile(nextProfile) {
  profile = {
    ...defaultProfile,
    ...nextProfile
  };

  localStorage.setItem(
    storageKeys.profile,
    JSON.stringify(profile)
  );

  localStorage.setItem(
    storageKeys.session,
    profile.email ? "active" : "guest"
  );
  applyProfile();
}

function formatPrice(value, currency = profile.currency) {
  const config = currencyRates[currency] || currencyRates.USD;

  const converted = value * config.rate;

  const rounded = Math.round(converted);

  return `${config.symbol}${rounded.toLocaleString(config.locale)}`;
}

function getCartEntries() {
  return Object.entries(cart).filter(([, quantity]) => quantity > 0);
}

function getCartTotal(entries = getCartEntries()) {
  return entries.reduce(
    (sum, [key, quantity]) =>
      sum + products[key].price * quantity,
    0
  );
}

function createOrderId() {
  const stamp = Date.now().toString().slice(-6);

  const suffix = Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase();

  return `KRYON-${stamp}-${suffix}`;
}

function saveOrder(order) {
  const existing = JSON.parse(
    localStorage.getItem(storageKeys.orders) || "[]"
  );

  existing.unshift(order);

  localStorage.setItem(
    storageKeys.orders,
    JSON.stringify(existing.slice(0, 12))
  );
}

function transition(work) {
  if (document.startViewTransition) {
    document.startViewTransition(work);
    return;
  }

  document.body?.classList.add("transitioning");

  work();

  window.setTimeout(() => {
    document.body.classList.remove("transitioning");
  }, 420);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  localStorage.setItem(storageKeys.theme, theme);
}

function fillForm(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements[key];

    if (!field) return;

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }
    field.value = value || "";
  });
}

function applyProfile() {
  if (profileLabel) {
    profileLabel.textContent = profile.name
      ? profile.name.split(" ")[0]
      : "Sign in";
  }

  if (profileForm) {
    fillForm(profileForm, profile);
  }

  if (checkoutForm) {
    fillForm(checkoutForm, {
      name: profile.name,
      countryCode: profile.countryCode,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      language: profile.language,
      currency: profile.currency,
      theme: profile.theme,
      emailConfirmations:
        profile.emailConfirmations,
      emailConfirmation:
        profile.emailConfirmations,
      authEmail: profile.email
    });
  }

  document.documentElement.lang =
    profile.language || "en";

  applyTheme(
    profile.theme ||
      localStorage.getItem(
        storageKeys.theme
      ) ||
      "light"
    );

  updateAllPrices();
}

function updateAllPrices() {
  document.querySelectorAll("[data-product-price]").forEach(node => {
    const key = node.dataset.productPrice;
    if (products[key]) node.textContent = formatPrice(products[key].price);
  });
  const modalPrice = document.getElementById("product-price");
  if (modalPrice) {
    const activeKey =
    document.getElementById("modal-add-cart")?.dataset.addCart;
    if (products[activeKey]) {
      modalPrice.textContent =
      formatPrice(products[activeKey].price);
    }
  }
  updateCart();
  updateCheckoutSummary();
}



function getFullPhone(data) {
  const code = data.get ? data.get("countryCode") : data.countryCode;
  const phone = data.get ? data.get("phone") : data.phone;
  return `${code || profile.countryCode} ${String(phone || "").replace(/\D/g, "")}`.trim();
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  return digitsOnly(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnCheck(number) {
  const digits = digitsOnly(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value) {
  const match = String(value || "").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiry = new Date(year, month, 0, 23, 59, 59);
  return expiry >= new Date();
}

function resetOtp() {
  otpCode = "";
  otpSent = false;
  otpCreatedAt = 0;

  if (checkoutForm?.elements?.otp) {
    checkoutForm.elements.otp.value = "";

    checkoutForm.elements.otp.disabled = true;
  }

  if (otpPanel) {
    otpPanel.classList.remove("active");
  }

  if (otpStatus) {
    otpStatus.textContent =
      "Add card details to request a verification code.";
  }
}

function validateCardFields() {
  const cardholder = checkoutForm.elements.cardholder.value.trim();
  const cardNumber = checkoutForm.elements.cardNumber.value;
  const expiry = checkoutForm.elements.expiry.value;
  const cvv = digitsOnly(checkoutForm.elements.cvv.value);

  if (cardholder.length < 2) return "Enter the cardholder name.";
  if (!luhnCheck(cardNumber)) return "Enter a realistic card number. Test example: 4242 4242 4242 4242.";
  if (!isValidExpiry(expiry)) return "Enter a valid expiry date like 02/30.";
  if (!/^\d{3,4}$/.test(cvv)) return "Enter a valid 3 or 4 digit CVV.";
  return "";
}

function sendOtp() {

  const validationError = validateCardFields();
  if (validationError) {
    checkoutNote.textContent = validationError;
    return false;
  }
  if (
    otpSent &&
    Date.now() - otpCreatedAt < 30000
  ) {
    checkoutNote.textContent =
    "Please wait before requesting another OTP.";
    return false;
  }

  otpCode = String(Math.floor(100000 + Math.random() * 900000));
  otpSent = true;
  otpCreatedAt = Date.now();
  checkoutForm.elements.otp.disabled = false;
  checkoutForm.elements.otp.focus();
  otpPanel?.classList.add("active");
  otpStatus.textContent = `OTP sent to ${getFullPhone(new FormData(checkoutForm)) || "your phone"}. Prototype code: ${otpCode}`;
  checkoutNote.textContent = "Enter the 6-digit security code to confirm card payment.";
  return true;
}

function openProduct(key) {
  const product = products[key];
  if (!product) return;

  transition(() => {
    document.getElementById("product-kicker").textContent = product.kicker;
    document.getElementById("product-title").textContent = product.title;
    document.getElementById("product-price").textContent = formatPrice(product.price);
    document.getElementById("product-rating").textContent = `${product.rating} from ${product.reviews}`;
    document.getElementById("product-copy").textContent = product.copy;
    document.getElementById("product-signal").textContent = product.signal;
    document.getElementById("product-use").textContent = product.use;
    document.getElementById("product-ritual").textContent = product.ritual;
    document.getElementById("modal-add-cart").dataset.addCart = key;
    productRender.className = `product-render ${product.render}`;
    productAura.style.background = `radial-gradient(circle, ${product.aura}, transparent 62%)`;
    productView?.classList.add("active");
    productView.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
}

function closeProduct() {
  transition(() => {
    productView.classList.remove("active");
    productView.setAttribute("aria-hidden", "true");
    if (!cartView.classList.contains("active") && !checkoutView.classList.contains("active")) {
      document.body.style.removeProperty("overflow");
    }
  });
}

function updateCart() {
  const entries = getCartEntries();
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = getCartTotal(entries);

  if (cartCount) {
    cartCount.textContent = count;
  }
  if (cartTotal) {
    cartTotal.textContent =
    formatPrice(total);
  }
  if (cartNote) {
    cartNote.textContent =
    entries.length === 0
    ? "Add a product to reserve your suite."
    : "";
  }
  const checkoutButton = document.querySelector("[data-open-checkout]");
  if (checkoutButton) {
    checkoutButton.disabled = false;
  }

  if (entries.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is ready for a recovery ritual.</p>';
    return;
  }

  cartItems.innerHTML = entries
    .map(([key, quantity]) => {
      const product = products[key];
      return `
        <article class="cart-item">
          <div class="cart-item-copy">
            <strong>${product.title}</strong>
            <span>${product.rating} &middot; ${product.reviews}</span>
          </div>
          <div class="cart-item-actions">
            <button type="button" data-cart-decrease="${key}" aria-label="Remove one ${product.title}">-</button>
            <span>${quantity}</span>
            <button type="button" data-add-cart="${key}" aria-label="Add one ${product.title}">+</button>
          </div>
          <strong>${formatPrice(product.price * quantity)}</strong>
        </article>
      `;
    })
    .join("");
}

function updateCheckoutSummary() {
  const entries = getCartEntries();
  checkoutTotal.textContent = formatPrice(getCartTotal(entries));

  if (entries.length === 0) {
    checkoutItems.innerHTML = '<p class="empty-cart">No items selected yet.</p>';
    return;
  }

  checkoutItems.innerHTML = entries
    .map(([key, quantity]) => {
      const product = products[key];
      return `
        <article class="checkout-item">
          <span>${quantity} x ${product.title}</span>
          <strong>${formatPrice(product.price * quantity)}</strong>
        </article>
      `;
    })
    .join("");
}

function updateCheckoutSummary() {
  const entries = getCartEntries();

  if (checkoutTotal) {
    checkoutTotal.textContent =
      formatPrice(getCartTotal(entries));
  }

  if (!checkoutItems) return;

  if (entries.length === 0) {
    checkoutItems.innerHTML =
      '<p class="empty-cart">No items selected yet.</p>';

    return;
  }

  checkoutItems.innerHTML = entries
    .map(([key, quantity]) => {
      const product = products[key];

      return `
        <article class="checkout-item">
          <span>${quantity} x ${product.title}</span>
          <strong>
            ${formatPrice(
              product.price * quantity
            )}
          </strong>
        </article>
      `;
    })
    .join("");
}

function addToCart(key) {
  if (!products[key]) return;

  cart[key] = (cart[key] || 0) + 1;

  saveCart();

  updateCart();
  updateCheckoutSummary();

  productView.classList.remove("active");

  productView.setAttribute("aria-hidden", "true");

  openCart();
}

function decreaseCart(key) {
  if (!cart[key]) return;

  cart[key] -= 1;

  if (cart[key] <= 0) {
    delete cart[key];
  }

  saveCart();

  updateCart();
  updateCheckoutSummary();
}

function openCart() {
  cartView?.classList.add("active");
  cartView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartView.classList.remove("active");
  cartView.setAttribute("aria-hidden", "true");
  if (!productView.classList.contains("active") && !checkoutView.classList.contains("active") && !confirmationView.classList.contains("active")) {
    document.body.style.removeProperty("overflow");
  }
}

function openProfile() {
  fillForm(profileForm, profile);
  profileView?.classList.add("active");
  profileView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProfile() {
  profileView.classList.remove("active");
  profileView.setAttribute("aria-hidden", "true");
  if (!cartView.classList.contains("active") && !checkoutView.classList.contains("active")) {
    document.body.style.removeProperty("overflow");
  }
}

function setCheckoutMode(mode) {
  checkoutMode = mode;

  document
    .querySelectorAll(".mode-option")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );
    });

  if (authFields) {
    authFields.classList.toggle(
      "visible",
      mode !== "guest"
    );
  }

  if (passwordField) {
    passwordField.style.display =
      mode === "guest"
        ? "none"
        : "grid";
  }

  if (checkoutNote) {
    checkoutNote.textContent =
      mode === "guest"
        ? "Fast guest checkout. You can save a profile later."
        : "Your customer details will be saved locally for this prototype.";
  }
}

function openCheckout() {
  if (getCartEntries().length === 0) {
    cartNote.textContent = "Add a product to reserve your suite.";
    return;
  }
  fillForm(checkoutForm, {
    name: profile.name,
    countryCode: profile.countryCode,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    language: profile.language,
    currency: profile.currency,
    emailConfirmation: profile.emailConfirmations,
    authEmail: profile.email
  });
  setCheckoutMode(localStorage.getItem(storageKeys.session) === "active" ? "signin" : "guest");
  updateCheckoutSummary();
  resetOtp();
  closeCart();
  checkoutView?.classList.add("active");
  checkoutView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  checkoutView.classList.remove("active");
  checkoutView.setAttribute("aria-hidden", "true");
  if (!cartView.classList.contains("active") && !confirmationView.classList.contains("active")) {
    document.body.style.removeProperty("overflow");
  }
}

function updatePaymentState() {
  if (!checkoutForm) return;

  const payment =
    new FormData(checkoutForm).get("payment") ||
    "card";

  if (cardFields) {
    cardFields.classList.toggle(
      "hidden",
      payment !== "card"
    );
  }

  if (otpPanel) {
    otpPanel.classList.toggle(
      "hidden",
      payment !== "card"
    );
  }

  if (payment !== "card") {
    resetOtp();
  }

  document
    .querySelectorAll(".payment-option")
    .forEach(option => {
      const input =
        option.querySelector("input");

      option.classList.toggle(
        "active",
        input?.checked
      );
    });
}

function openConfirmation(order) {
  confirmationId.textContent = order.id;

  confirmationTotal.textContent =
    formatPrice(order.total, order.currency);

  confirmationCopy.textContent =
    `Order confirmed on ${order.createdAt}. Payment method: ${order.paymentLabel}.`;

  confirmationItems.innerHTML = order.items
    .map(item => `
      <article class="confirmation-item">
        <span>${item.quantity} x ${item.title}</span>
        <strong>${formatPrice(item.subtotal, order.currency)}</strong>
      </article>
    `)
    .join("");

  confirmationView?.classList.add("active");

  confirmationView.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeConfirmation() {
  confirmationView.classList.remove("active");
  confirmationView.setAttribute("aria-hidden", "true");
  if (!cartView.classList.contains("active") && !productView.classList.contains("active") && !checkoutView.classList.contains("active")) {
    document.body.style.removeProperty("overflow");
  }
}

function checkout(formData) {
  const entries = getCartEntries();
  if (entries.length === 0) {
    checkoutNote.textContent = "Add a product before confirming checkout.";
    return;
  }

  const customer = {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    countryCode: formData.get("countryCode"),
    phone: digitsOnly(formData.get("phone")),
    fullPhone: getFullPhone(formData),
    address: formData.get("address").trim(),
    language: formData.get("language"),
    currency: formData.get("currency"),
    emailConfirmation: formData.get("emailConfirmation") === "on"
  };
  if (
    !customer.name ||
    !customer.email ||
    !customer.phone ||
    !customer.address
  ) {
    checkoutNote.textContent =
    "Please complete all required fields.";
    return;
  }

  const payment = formData.get("payment") || "card";
  if (payment === "card") {
    const validationError = validateCardFields();
    if (validationError) {
      checkoutNote.textContent = validationError;
      return;
    }
    if (!otpSent) {
      sendOtp();
      checkoutNote.textContent =
      "Verification code sent. Enter the OTP to continue.";
      return;
    }
    if (Date.now() - otpCreatedAt > 120000) {
      checkoutNote.textContent =
      "OTP expired. Request a new code.";
      resetOtp();
      return;
    }
    if (digitsOnly(formData.get("otp")) !== otpCode) {
      checkoutNote.textContent = "The OTP code does not match. Check the security code and try again.";
      return;
    }
  }

  if (checkoutMode !== "guest") {
    saveProfile({ ...profile, ...customer, country: profile.country });
  } else {
    profile = { ...profile, language: customer.language, currency: customer.currency, emailConfirmations: customer.emailConfirmation };
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    applyProfile();
  }

  const paymentLabels = {
    card: "Debit / Credit",
    paypal: "PayPal",
    cod: "Cash on delivery"
  };

  const order = {
    id: createOrderId(),
    createdAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    mode: checkoutMode,
    customer,
    payment,
    paymentLabel: paymentLabels[payment],
    currency: customer.currency,
    cardLast4: payment === "card" ? digitsOnly(formData.get("cardNumber")).slice(-4) : "",
    emailConfirmation: customer.emailConfirmation,
    items: entries.map(([key, quantity]) => ({
      key,
      quantity,
      title: products[key].title,
      price: products[key].price,
      subtotal: products[key].price * quantity
    })),
    total: getCartTotal(entries)
  };

  saveOrder(order);
  Object.keys(cart).forEach(key => delete cart[key]);
  saveCart();
  updateCart();
  updateCheckoutSummary();
  resetOtp();
  closeCheckout();
  openConfirmation(order);
}

document.addEventListener("click", event => {
  const productButton = event.target.closest("[data-open-product]");
  const addButton = event.target.closest("[data-add-cart]");
  const decreaseButton = event.target.closest("[data-cart-decrease]");
  const jumpButton = event.target.closest("[data-jump]");
  const closeButton = event.target.closest("[data-close-product], .close-product");
  const openCartButton = event.target.closest("[data-open-cart]");
  const closeCartButton = event.target.closest("[data-close-cart], .close-cart");
  const openProfileButton = event.target.closest("[data-open-profile]");
  const closeProfileButton = event.target.closest("[data-close-profile]");
  const signOutButton = event.target.closest("[data-sign-out]");
  const openCheckoutButton = event.target.closest("[data-open-checkout]");
  const closeCheckoutButton = event.target.closest("[data-close-checkout]");
  const modeButton = event.target.closest("[data-mode]");
  const closeConfirmationButton = event.target.closest("[data-close-confirmation]");
  const resendOtpButton = event.target.closest("[data-resend-otp]");

  if (productButton) openProduct(productButton.dataset.openProduct);
  if (addButton) addToCart(addButton.dataset.addCart);
  if (decreaseButton) decreaseCart(decreaseButton.dataset.cartDecrease);

  if (jumpButton) {
    event.preventDefault();
    document.getElementById(jumpButton.dataset.jump)?.scrollIntoView({ behavior: "smooth" });
  }

  if (closeButton) closeProduct();
  if (openCartButton) openCart();
  if (closeCartButton) closeCart();
  if (openProfileButton) openProfile();
  if (closeProfileButton) closeProfile();
  if (openCheckoutButton) openCheckout();
  if (closeCheckoutButton) closeCheckout();
  if (modeButton) setCheckoutMode(modeButton.dataset.mode);
  if (closeConfirmationButton) closeConfirmation();
  if (resendOtpButton) sendOtp();
  if (signOutButton) {
    localStorage.setItem(storageKeys.session, "guest");
    profile = {
      ...defaultProfile
    };
    profileLabel.textContent = "Sign in";
    profileStatus.textContent =
    "Signed out for this prototype session.";
    closeProfile();
  }
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (productView.classList.contains("active")) closeProduct();
  if (cartView.classList.contains("active")) closeCart();
  if (profileView.classList.contains("active")) closeProfile();
  if (checkoutView.classList.contains("active")) closeCheckout();
  if (confirmationView.classList.contains("active")) closeConfirmation();
});

if (profileForm) {
  profileForm.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(profileForm);

    saveProfile({
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      countryCode: formData.get("countryCode"),
      phone: digitsOnly(formData.get("phone")),
      address: formData.get("address").trim(),
      country: formData.get("country").trim(),
      language: formData.get("language"),
      currency: formData.get("currency"),
      theme: formData.get("theme"),
      emailConfirmations:
        formData.get("emailConfirmations") === "on"
    });

    if (profileStatus) {
      profileStatus.textContent =
        "Profile, address, language, currency, email preference, and appearance saved.";
    }
  });
}



if (checkoutForm) {
  checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    checkout(new FormData(checkoutForm));
  });

  checkoutForm.addEventListener("change", event => {
    if (event.target.name === "payment") {
      updatePaymentState();
    }

    if (
      [
        "cardholder",
        "cardNumber",
        "expiry",
        "cvv",
        "phone"
      ].includes(event.target.name)
    ) {
      resetOtp();
    }

    if (event.target.name === "countryCode") {
      resetOtp();
    }

    if (
      event.target.name === "currency" ||
      event.target.name === "language"
    ) {
      profile = {
        ...profile,
        currency: checkoutForm.elements.currency.value,
        language: checkoutForm.elements.language.value
      };

      applyProfile();

      fillForm(checkoutForm, {
        ...Object.fromEntries(
          new FormData(checkoutForm).entries()
        ),
        currency: profile.currency,
        language: profile.language
      });
    }
  });

  checkoutForm.addEventListener("input", event => {
    if (event.target.name === "cardNumber") {
      event.target.value =
        formatCardNumber(event.target.value);

      resetOtp();
    }

    if (event.target.name === "expiry") {
      event.target.value =
        formatExpiry(event.target.value);

      resetOtp();
    }

    if (event.target.name === "cvv") {
      event.target.value =
        digitsOnly(event.target.value).slice(0, 4);

      resetOtp();
    }

    if (event.target.name === "otp") {
      event.target.value =
        digitsOnly(event.target.value).slice(0, 6);
    }

    if (event.target.name === "phone") {
      event.target.value =
        digitsOnly(event.target.value).slice(0, 14);
    }
  });
}

if (profileForm) {
  profileForm.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(profileForm);

    saveProfile({
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      countryCode: formData.get("countryCode"),
      phone: digitsOnly(formData.get("phone")),
      address: formData.get("address").trim(),
      country: formData.get("country").trim(),
      language: formData.get("language"),
      currency: formData.get("currency"),
      theme: formData.get("theme"),
      emailConfirmations:
        formData.get("emailConfirmations") === "on"
    });

    if (profileStatus) {
      profileStatus.textContent =
        "Profile, address, language, currency, email preference, and appearance saved.";
    }
  });

  profileForm.addEventListener("input", event => {
    if (event.target.name === "phone") {
      event.target.value =
        digitsOnly(event.target.value).slice(0, 14);
    }
  });
}

function updateProgress() {
  const max =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const progress =
    max > 0 ? window.scrollY / max : 0;

  if (progressBar) {
    progressBar.style.width =
      `${Math.min(progress * 100, 100)}%`;
  }
}
const finderRecommendations = {
  energy: {
    title: "KRYON Red",
    copy:
      "Begin with a full-body red light session to support circulation, warmth, and daily cellular energy.",
    product: "red"
  },

  tension: {
    title: "KRYON Align",
    copy:
      "Focus on posture correction, mobility flow, and guided alignment to reduce physical tension.",
    product: "align"
  },

  travel: {
    title: "KRYON Red Portable",
    copy:
      "Portable targeted recovery light designed for travel routines and smaller recovery zones.",
    product: "portable"
  },

  sleep: {
    title: "KRYON Sleep",
    copy:
      "Create a softer nighttime ritual to help the nervous system downshift before rest.",
    product: "sleep"
  }
};
const resultTitle =
document.getElementById("result-title");

const resultCopy =
document.getElementById("result-copy");

const resultButton =
document.getElementById("result-button");

document.querySelectorAll(".goal")
.forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".goal")
    .forEach(goal => {
      goal.classList.remove("active");
    });
    
    button.classList.add("active");
    const goal =
    button.dataset.goal;
    
    const recommendation =
    finderRecommendations[goal];
    
    if (!recommendation) return;
    resultTitle.textContent = recommendation.title;
    
    resultCopy.textContent = recommendation.copy;
    
    resultButton.dataset.openProduct = recommendation.product;
  });
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
profile.theme = profile.theme || localStorage.getItem(storageKeys.theme) || "light";
applyProfile();
setCheckoutMode("guest");
updatePaymentState();
updateCart();
updateProgress();
