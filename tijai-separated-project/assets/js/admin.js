const supportMessageKey = 'tijaiSupportMessages';
function renderSupportMessages() {
  const body = document.getElementById('supportMessagesTable');
  if (!body) return;
  let messages = [];
  try {
    messages = JSON.parse(localStorage.getItem(supportMessageKey) || '[]');
  } catch {}
  body.replaceChildren();
  messages
    .slice()
    .reverse()
    .forEach((message) => {
      const row = document.createElement('tr');
      [
        new Date(message.sentAt).toLocaleString(),
        message.name,
        message.email,
        message.subject,
        message.message,
      ].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  document.getElementById('emptySupportMessages').hidden = messages.length > 0;
}
renderSupportMessages();
window.addEventListener('storage', (event) => {
  if (event.key === supportMessageKey) renderSupportMessages();
});
document
  .querySelectorAll('#adminNav a[data-view="messages"]')
  .forEach((link) => link.addEventListener('click', renderSupportMessages));

const customerOrderKey = 'tijaiCustomerOrders';
function renderCustomerRequests() {
  const body = document.getElementById('customerRequestsTable');
  if (!body) return;
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(customerOrderKey) || '[]');
  } catch {}
  body.replaceChildren();
  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const row = document.createElement('tr');
      const values = [
        order.id,
        order.pickupName + ' · ' + order.pickupPhone,
        order.description + ' · ' + order.service,
        order.pickupTown + ', ' + order.pickupAddress,
        order.deliveryTown + ', ' + order.deliveryAddress,
        order.recipientPhone,
      ];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 0) cell.className = 'orderid';
        row.appendChild(cell);
      });
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      const current = order.status || 'Pending admin approval';
      status.className =
        'status ' +
        (current === 'Approved'
          ? 's-approved'
          : current === 'Rejected'
            ? 's-rejected'
            : current === 'Picked up'
              ? 's-pickup'
              : current === 'Delivered'
                ? 's-delivered'
                : 's-pending');
      status.textContent = current;
      statusCell.appendChild(status);
      row.appendChild(statusCell);
      const actions = document.createElement('td');
      let choices = [];
      if (current === 'Pending admin approval')
        choices = [
          ['Approve', 'Approved'],
          ['Reject', 'Rejected'],
        ];
      else if (current === 'Approved') choices = [['Mark picked up', 'Picked up']];
      else if (current === 'Picked up') choices = [['Mark delivered', 'Delivered']];
      if (choices.length) {
        choices.forEach(([label, nextStatus]) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className =
            label === 'Reject' ? 'decisionButton rejectButton' : 'decisionButton approveButton';
          button.textContent = label;
          button.addEventListener('click', () => {
            let latest = [];
            try {
              latest = JSON.parse(localStorage.getItem(customerOrderKey) || '[]');
            } catch {}
            const target = latest.find((item) => item.id === order.id);
            if (!target) return;
            target.status = nextStatus;
            target.updatedAt = new Date().toISOString();
            target.events = target.events || [];
            const message =
              nextStatus === 'Approved'
                ? 'Your request was approved. TijAl will arrange a rider.'
                : nextStatus === 'Rejected'
                  ? 'Your request was declined. Contact support if you need help.'
                  : nextStatus === 'Picked up'
                    ? 'The rider collected your item in ' +
                      target.pickupTown +
                      ' and is taking it to ' +
                      target.deliveryTown +
                      '.'
                    : 'Your item was delivered to ' + target.recipientName + '.';
            target.events.push({
              id: target.id + '-' + nextStatus.replaceAll(' ', '-'),
              status: nextStatus,
              message,
              createdAt: target.updatedAt,
            });
            localStorage.setItem(customerOrderKey, JSON.stringify(latest));
            renderCustomerRequests();
          });
          actions.appendChild(button);
        });
      } else
        actions.textContent = current === 'Rejected' ? 'Request declined' : 'Delivery complete';
      row.appendChild(actions);
      body.appendChild(row);
    });
  document.getElementById('emptyCustomerRequests').hidden = orders.length > 0;
}
renderCustomerRequests();
document
  .querySelectorAll('#adminNav a[data-view="orders"]')
  .forEach((link) => link.addEventListener('click', renderCustomerRequests));
window.addEventListener('storage', (event) => {
  if (event.key === customerOrderKey) renderCustomerRequests();
});

const serviceKey = 'tijaiAdminServices';
const defaultServices = [
  {
    id: 'service-1',
    name: 'Food delivery',
    icon: '🍲',
    description: 'Restaurants and kitchens',
  },
  {
    id: 'service-2',
    name: 'Groceries',
    icon: '🛒',
    description: 'Local markets',
  },
  {
    id: 'service-3',
    name: 'Parcel delivery',
    icon: '📦',
    description: 'Same-city delivery',
  },
  {
    id: 'service-4',
    name: 'Pharmacy pickup',
    icon: '💊',
    description: 'Everyday essentials',
  },
  {
    id: 'service-5',
    name: 'Local errands',
    icon: '🏃',
    description: 'Pickup and drop-off',
  },
];
function loadServices() {
  try {
    const saved = localStorage.getItem(serviceKey);
    if (saved !== null) return JSON.parse(saved);
  } catch {}
  try {
    localStorage.setItem(serviceKey, JSON.stringify(defaultServices));
  } catch {}
  return defaultServices;
}
let services = loadServices();
function renderServices() {
  const list = document.getElementById('serviceList');
  list.replaceChildren();
  services.forEach((service) => {
    const row = document.createElement('div');
    row.className = 'rider serviceRow';
    const icon = document.createElement('div');
    icon.className = 'rideravatar';
    icon.textContent = service.icon;
    const info = document.createElement('div');
    info.className = 'riderinfo';
    const name = document.createElement('strong');
    name.textContent = service.name;
    const description = document.createElement('small');
    description.textContent = service.description;
    info.append(name, description);
    const enabled = document.createElement('span');
    enabled.className = 'online';
    enabled.textContent = 'Enabled';
    const remove = document.createElement('button');
    remove.className = 'removeItem';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove ' + service.name);
    remove.addEventListener('click', () => {
      services = services.filter((current) => current.id !== service.id);
      localStorage.setItem(serviceKey, JSON.stringify(services));
      renderServices();
    });
    row.append(icon, info, enabled, remove);
    list.appendChild(row);
  });
  document.getElementById('serviceCount').textContent =
    services.length + (services.length === 1 ? ' service' : ' services');
  document.getElementById('emptyServices').hidden = services.length > 0;
}
document.getElementById('serviceForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('serviceName').value.trim();
  const icon = document.getElementById('serviceIcon').value;
  const description = document.getElementById('serviceDescription').value.trim();
  if (!name || !description) return;
  services.unshift({ id: Date.now().toString(), name, icon, description });
  localStorage.setItem(serviceKey, JSON.stringify(services));
  event.currentTarget.reset();
  renderServices();
});
renderServices();

const itemKey = 'tijaiAdminItems';
const starterItems = [
  { id: 'seed-1', name: 'Bottled water', category: 'Groceries', price: 500 },
  { id: 'seed-2', name: 'Rice (5 kg)', category: 'Groceries', price: 8500 },
  {
    id: 'seed-3',
    name: 'Standard parcel delivery',
    category: 'Parcel service',
    price: 2500,
  },
];
function loadItems() {
  try {
    const saved = localStorage.getItem(itemKey);
    if (saved !== null) return JSON.parse(saved);
  } catch {}
  try {
    localStorage.setItem(itemKey, JSON.stringify(starterItems));
  } catch {}
  return starterItems;
}
let items = loadItems();
const itemTable = document.getElementById('itemTable');
function renderItems() {
  const query = document.getElementById('itemSearch').value.trim().toLowerCase();
  itemTable.replaceChildren();
  const visibleItems = items.filter((item) =>
    (item.name + ' ' + item.category).toLowerCase().includes(query)
  );
  visibleItems.forEach((item) => {
    const row = document.createElement('tr');
    [item.name, item.category, '₦' + Number(item.price).toLocaleString('en-NG')].forEach(
      (value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }
    );
    const action = document.createElement('td');
    const remove = document.createElement('button');
    remove.className = 'removeItem';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove ' + item.name);
    remove.addEventListener('click', () => {
      items = items.filter((current) => current.id !== item.id);
      localStorage.setItem(itemKey, JSON.stringify(items));
      renderItems();
    });
    action.appendChild(remove);
    row.appendChild(action);
    itemTable.appendChild(row);
  });
  document.getElementById('itemCount').textContent =
    items.length + (items.length === 1 ? ' item' : ' items');
  document.getElementById('emptyItems').hidden = visibleItems.length > 0;
}
document.getElementById('itemForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('itemCategory').value;
  const price = Number(document.getElementById('itemPrice').value);
  if (!name || !Number.isFinite(price) || price < 0) return;
  items.unshift({ id: Date.now().toString(), name, category, price });
  localStorage.setItem(itemKey, JSON.stringify(items));
  event.currentTarget.reset();
  renderItems();
});
document.getElementById('itemSearch').addEventListener('input', renderItems);
renderItems();

const settingsKey = 'tijaiAdminSettings';
const defaultSettings = {
  area: 'Yola, Adamawa',
  fee: 500,
  min: 25,
  max: 45,
  accepting: true,
};
const settingsForm = document.getElementById('settingsForm');
function readSettings() {
  try {
    const saved = localStorage.getItem(settingsKey);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}
function fillSettings(settings) {
  document.getElementById('settingArea').value = settings.area;
  document.getElementById('settingFee').value = settings.fee;
  document.getElementById('settingMin').value = settings.min;
  document.getElementById('settingMax').value = settings.max;
  document.getElementById('settingAccepting').checked = settings.accepting;
}
fillSettings(readSettings());
settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = {
    area: document.getElementById('settingArea').value.trim(),
    fee: Number(document.getElementById('settingFee').value),
    min: Number(document.getElementById('settingMin').value),
    max: Number(document.getElementById('settingMax').value),
    accepting: document.getElementById('settingAccepting').checked,
  };
  if (!values.area || values.fee < 0 || values.min < 1 || values.max < values.min) {
    document.getElementById('settingsStatus').textContent =
      'Check the area, fee, and delivery time values.';
    return;
  }
  localStorage.setItem(settingsKey, JSON.stringify(values));
  document.getElementById('settingsStatus').textContent = 'Settings saved in this browser.';
});
document.getElementById('resetSettings').addEventListener('click', () => {
  fillSettings(defaultSettings);
  localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
  document.getElementById('settingsStatus').textContent = 'Demo defaults restored.';
});

const nav = document.querySelectorAll('#adminNav a[data-view]');
const views = document.querySelectorAll('.pageview');
const title = document.getElementById('pageTitle');
let currentAdminView = 'overview';
const adminHistory = [];
function show(name, fromBack = false) {
  if (name === currentAdminView) return;
  if (!fromBack) adminHistory.push(currentAdminView);
  currentAdminView = name;
  views.forEach((view) => {
    view.hidden = view.dataset.page !== name;
  });
  nav.forEach((link) => link.classList.toggle('active', link.dataset.view === name));
  title.textContent = name[0].toUpperCase() + name.slice(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function goAdminBack() {
  show(adminHistory.pop() || 'overview', true);
}
document.querySelectorAll('.pageview:not([data-page="overview"]) .pageintro').forEach((intro) => {
  const button = document.createElement('button');
  button.className = 'backButton';
  button.type = 'button';
  button.setAttribute('aria-label', 'Go back');
  button.title = 'Go back';
  button.textContent = '←';
  button.addEventListener('click', goAdminBack);
  intro.prepend(button);
});
nav.forEach((link) =>
  link.addEventListener('click', (event) => {
    event.preventDefault();
    show(link.dataset.view);
  })
);
document.querySelectorAll('[data-view]').forEach((link) => {
  if (!link.closest('#adminNav'))
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show(link.dataset.view);
    });
});
const adminThemeButton = document.getElementById('adminTheme');
const savedAdminTheme = localStorage.getItem('tijaiTheme');
if (savedAdminTheme === 'dark' || savedAdminTheme === 'light')
  document.documentElement.dataset.theme = savedAdminTheme;
adminThemeButton.textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾';
adminThemeButton.addEventListener('click', (event) => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('tijaiTheme', document.documentElement.dataset.theme);
  event.currentTarget.textContent = dark ? '☀' : '☾';
});
document.getElementById('adminSearch').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  document.querySelectorAll('#ordersTable tr, .allOrders tr').forEach((row) => {
    row.hidden = !row.textContent.toLowerCase().includes(query);
  });
});
document.querySelectorAll('.filter[data-filter]').forEach((button) =>
  button.addEventListener('click', () => {
    document
      .querySelectorAll('.filter[data-filter]')
      .forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('.allOrders tr').forEach((row) => {
      row.hidden = button.dataset.filter !== 'all' && row.dataset.status !== button.dataset.filter;
    });
  })
);
