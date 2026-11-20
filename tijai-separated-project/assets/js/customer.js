const root = document.documentElement;
const themeButton = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const moonIcon = '<path d="M20.2 15.5A8.3 8.3 0 0 1 8.5 3.8 8.6 8.6 0 1 0 20.2 15.5Z"/>';
const sunIcon =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>';
themeButton.addEventListener('click', () => {
  const isDark = root.dataset.theme !== 'dark';
  root.dataset.theme = isDark ? 'dark' : 'light';
  localStorage.setItem('tijaiTheme', root.dataset.theme);
  themeIcon.innerHTML = isDark ? sunIcon : moonIcon;
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
});
const savedTheme = localStorage.getItem('tijaiTheme');
if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
themeIcon.innerHTML = root.dataset.theme === 'dark' ? sunIcon : moonIcon;
const orderStorageKey = 'tijaiCustomerOrders';
function readCustomerOrders() {
  try {
    return JSON.parse(localStorage.getItem(orderStorageKey) || '[]');
  } catch {
    return [];
  }
}
function renderCustomerOrders() {
  const holder = document.getElementById('customerOrdersList');
  if (!holder) return;
  const orders = readCustomerOrders();
  holder.replaceChildren();
  holder.hidden = orders.length === 0;
  const empty = document.querySelector('#page-orders .emptyState');
  if (empty) empty.hidden = orders.length > 0;
  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const card = document.createElement('article');
      card.className = 'customerOrderCard';
      const header = document.createElement('header');
      const title = document.createElement('h3');
      title.textContent = order.service + ' · ' + order.description;
      const status = document.createElement('span');
      status.className =
        'status ' +
        (order.status === 'Approved'
          ? 's-approved'
          : order.status === 'Rejected'
            ? 's-rejected'
            : order.status === 'Picked up'
              ? 's-pickup'
              : order.status === 'Delivered'
                ? 's-delivered'
                : 's-pending');
      status.textContent = order.status || 'Request saved';
      header.append(title, status);
      const route = document.createElement('p');
      route.textContent =
        order.pickupTown + ' → ' + order.deliveryTown + ' · ' + order.recipientName;
      const code = document.createElement('div');
      code.className = 'trackCode';
      code.textContent = 'Tracking number: ' + order.id;
      const track = document.createElement('button');
      track.className = 'trackAction';
      track.type = 'button';
      track.textContent = 'Track this request';
      track.addEventListener('click', () => {
        document.getElementById('trackingCode').value = order.id;
        showPage('track');
        document.getElementById('trackButton').click();
      });
      card.append(header, route, code, track);
      holder.appendChild(card);
    });
}
document.querySelectorAll('.orderLink').forEach((link) =>
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('orderService').value = link.dataset.orderService;
    document.getElementById('orderConfirmation').hidden = true;
    showPage('order');
  })
);
document.querySelectorAll('.cat[data-order-service]').forEach((card) =>
  card.addEventListener('click', () => {
    document.getElementById('orderService').value = card.dataset.orderService;
    document.getElementById('orderConfirmation').hidden = true;
    showPage('order');
  })
);
document.getElementById('deliveryOrderForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const id = 'TJA-' + Date.now().toString().slice(-6);
  const order = {
    id,
    service: document.getElementById('orderService').value,
    description: document.getElementById('orderDescription').value.trim(),
    pickupName: document.getElementById('pickupName').value.trim(),
    pickupPhone: document.getElementById('pickupPhone').value.trim(),
    pickupTown: document.getElementById('pickupTown').value,
    pickupAddress: document.getElementById('pickupAddress').value.trim(),
    recipientName: document.getElementById('recipientName').value.trim(),
    recipientPhone: document.getElementById('recipientPhone').value.trim(),
    deliveryTown: document.getElementById('deliveryTown').value,
    deliveryAddress: document.getElementById('deliveryAddress').value.trim(),
    notes: document.getElementById('orderNotes').value.trim(),
    createdAt: new Date().toISOString(),
    status: 'Pending admin approval',
    events: [
      {
        id: id + '-submitted',
        status: 'Request submitted',
        message: 'Your delivery request is waiting for admin approval.',
        createdAt: new Date().toISOString(),
      },
    ],
    demo: true,
  };
  const orders = readCustomerOrders();
  orders.push(order);
  localStorage.setItem(orderStorageKey, JSON.stringify(orders));
  const confirmation = document.getElementById('orderConfirmation');
  confirmation.innerHTML =
    '<strong>Request saved: ' +
    id +
    '</strong><p>Your tracking number is ' +
    id +
    '. Your request is pending admin approval. This demo has not been sent to a rider.</p><button class="primaryLink" type="button" id="viewMyOrders">View My Orders</button>';
  confirmation.hidden = false;
  document.getElementById('viewMyOrders').addEventListener('click', () => {
    renderCustomerOrders();
    showPage('orders');
  });
  event.currentTarget.reset();
  renderCustomerOrders();
});
document
  .querySelectorAll('[data-page-link="orders"]')
  .forEach((link) => link.addEventListener('click', renderCustomerOrders));
document.getElementById('trackButton').addEventListener('click', () => {
  const code = document.getElementById('trackingCode').value.trim().toUpperCase();
  const match = readCustomerOrders().find((order) => order.id.toUpperCase() === code);
  document.getElementById('trackResult').textContent = !code
    ? 'Enter your tracking number to check a delivery.'
    : match
      ? 'Demo request found: ' +
        match.service +
        ' from ' +
        match.pickupTown +
        ' to ' +
        match.deliveryTown +
        '. Status: ' +
        match.status +
        '.'
      : 'We could not find that tracking number in this browser.';
});
renderCustomerOrders();
window.addEventListener('storage', (event) => {
  if (event.key === orderStorageKey) {
    renderCustomerOrders();
    renderNotifications();
  }
});
const supportMessageKey = 'tijaiSupportMessages';
document.getElementById('contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const messages = (() => {
    try {
      return JSON.parse(localStorage.getItem(supportMessageKey) || '[]');
    } catch {
      return [];
    }
  })();
  messages.push({
    id: 'MSG-' + Date.now().toString().slice(-6),
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    subject: document.getElementById('contactSubject').value.trim(),
    message: document.getElementById('contactMessage').value.trim(),
    sentAt: new Date().toISOString(),
  });
  localStorage.setItem(supportMessageKey, JSON.stringify(messages));
  document.getElementById('contactStatus').textContent =
    'Message saved in this browser. It has not been emailed to support.';
  event.currentTarget.reset();
  window.dispatchEvent(new CustomEvent('tijai-demo-message-saved'));
});
const pageLinks = document.querySelectorAll('[data-page-link]');
const pageViews = document.querySelectorAll('.page[data-page]');
const navLinks = document.querySelectorAll('.headnav [data-page-link]');
let currentPage = 'home';
const pageHistory = [];
function showPage(name, fromBack = false) {
  if (name === currentPage) return;
  if (!fromBack) pageHistory.push(currentPage);
  currentPage = name;
  pageViews.forEach((page) => {
    page.hidden = page.dataset.page !== name;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.pageLink === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function goBack() {
  showPage(pageHistory.pop() || 'home', true);
}
document.querySelectorAll('.page:not(#page-home) .pagehead').forEach((head) => {
  const button = document.createElement('button');
  button.className = 'backButton';
  button.type = 'button';
  button.setAttribute('aria-label', 'Go back');
  button.title = 'Go back';
  button.textContent = '←';
  button.addEventListener('click', goBack);
  head.prepend(button);
});
pageLinks.forEach((link) =>
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
  })
);
document.getElementById('profileButton').addEventListener('click', () => showPage('profile'));
document.getElementById('trackButton').addEventListener('click', () => {
  const code = document.getElementById('trackingCode').value.trim();
  document.getElementById('trackResult').textContent = code
    ? 'Tracking lookup is ready to connect to live order data. No delivery is linked to this preview.'
    : 'Enter your tracking number to check a delivery.';
});
function renderNotifications() {
  const list = document.getElementById('notificationList');
  const badge = document.getElementById('notificationBadge');
  if (!list || !badge) return;
  const orders = readCustomerOrders();
  const notifications = orders
    .flatMap((order) =>
      (order.events || []).map((event) => ({
        ...event,
        orderId: order.id,
        description: order.description,
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  let readIds = [];
  try {
    readIds = JSON.parse(localStorage.getItem('tijaiReadNotifications') || '[]');
  } catch {}
  list.replaceChildren();
  if (!notifications.length) {
    const empty = document.createElement('div');
    empty.className = 'notificationItem';
    empty.innerHTML =
      '<span class="notificationDot" hidden></span><div><strong>No delivery updates yet</strong><p>Updates appear after you submit a request.</p><small>For this browser</small></div>';
    list.appendChild(empty);
  }
  notifications.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'notificationItem' + (readIds.includes(item.id) ? '' : ' isUnread');
    const dot = document.createElement('span');
    dot.className = 'notificationDot';
    if (readIds.includes(item.id)) dot.hidden = true;
    const content = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.orderId + ' · ' + item.status;
    const message = document.createElement('p');
    message.textContent = item.message;
    const time = document.createElement('small');
    time.textContent = new Date(item.createdAt).toLocaleString();
    content.append(title, message, time);
    row.append(dot, content);
    list.appendChild(row);
  });
  const unread = notifications.filter((item) => !readIds.includes(item.id)).length;
  badge.textContent = unread > 9 ? '9+' : String(unread);
  badge.hidden = unread === 0;
}
const notificationsButton = document.getElementById('notificationsButton');
const notificationPanel = document.getElementById('notificationPanel');
notificationsButton.addEventListener('click', (event) => {
  event.stopPropagation();
  notificationPanel.hidden = !notificationPanel.hidden;
  renderNotifications();
});
document.addEventListener('click', (event) => {
  if (!notificationPanel.contains(event.target) && !notificationsButton.contains(event.target))
    notificationPanel.hidden = true;
});
document.getElementById('markReadButton').addEventListener('click', () => {
  const ids = readCustomerOrders().flatMap((order) =>
    (order.events || []).map((event) => event.id)
  );
  localStorage.setItem('tijaiReadNotifications', JSON.stringify(ids));
  renderNotifications();
});
const authCard = document.getElementById('authCard');
const authModeToggle = document.getElementById('authModeToggle');
const authTitle = document.getElementById('authTitle');
const authIntro = document.getElementById('authIntro');
const authSubmit = document.getElementById('authSubmit');
const nameField = document.getElementById('nameField');
const authSwitchText = document.getElementById('authSwitchText');
let signupMode = false;
document.getElementById('signInButton').addEventListener('click', () => {
  authCard.hidden = !authCard.hidden;
  authCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
authModeToggle.addEventListener('click', () => {
  signupMode = !signupMode;
  nameField.hidden = !signupMode;
  authTitle.textContent = signupMode ? 'Create your account' : 'Sign in to TijAI';
  authIntro.textContent = signupMode
    ? 'Register to save your details and manage deliveries.'
    : 'Access your orders and saved delivery details.';
  authSubmit.textContent = signupMode ? 'Create account' : 'Sign in';
  authModeToggle.textContent = signupMode ? 'Sign in instead' : 'Create an account';
  authSwitchText.textContent = signupMode ? 'Already have an account?' : 'New to TijAI?';
  document.getElementById('fullName').required = signupMode;
  document.getElementById('authStatus').textContent = '';
});
document.getElementById('authForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const status = document.getElementById('authStatus');
  const email = document.querySelector('#authForm input[type="email"]').value.trim().toLowerCase();
  const name = document.getElementById('fullName').value.trim();
  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem('tijaiDemoAccounts') || '[]');
  } catch {}
  if (signupMode) {
    if (accounts.some((account) => account.email === email)) {
      status.textContent = 'A demo profile with that email already exists in this browser.';
      return;
    }
    const account = { name, email };
    accounts.push(account);
    localStorage.setItem('tijaiDemoAccounts', JSON.stringify(accounts));
    localStorage.setItem('tijaiDemoSession', email);
    document.querySelector('.profileCard h2').textContent = 'Welcome, ' + name.split(' ')[0];
    document.querySelector('.profileCard p').textContent =
      'Demo profile saved in this browser. Passwords are not saved or verified.';
    document.querySelector('.profileAvatar').textContent = name.charAt(0).toUpperCase();
    status.textContent = 'Demo profile created. It is saved only in this browser.';
  } else {
    const account = accounts.find((item) => item.email === email);
    if (!account) {
      status.textContent =
        'No demo profile found for this email in this browser. Choose Create an account to register.';
      return;
    }
    localStorage.setItem('tijaiDemoSession', email);
    document.querySelector('.profileCard h2').textContent =
      'Welcome, ' + account.name.split(' ')[0];
    document.querySelector('.profileCard p').textContent =
      'Demo profile loaded. This preview does not verify passwords.';
    document.querySelector('.profileAvatar').textContent = account.name.charAt(0).toUpperCase();
    status.textContent = 'Demo profile loaded in this browser.';
  }
});
const searchInput = document.querySelector('.search input');
const searchButton = document.querySelector('.search button');
const searchStatus = document.getElementById('searchStatus');
function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const items = [
    ...document.querySelectorAll('.page:not([hidden]) .cat, .page:not([hidden]) .service'),
  ];
  let matches = 0;
  items.forEach((item) => {
    const found = !query || item.textContent.toLowerCase().includes(query);
    item.hidden = !found;
    if (found && query) matches++;
  });
  searchStatus.textContent = !query
    ? ''
    : matches
      ? 'Found ' + matches + ' matching option' + (matches === 1 ? '' : 's') + ' below.'
      : 'No matching delivery options. Try food, parcels, groceries or errands.';
  if (query && document.getElementById('page-home') && !document.getElementById('page-home').hidden)
    document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
searchButton.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    runSearch();
  }
});
