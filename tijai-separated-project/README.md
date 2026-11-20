# TijAl Delivery Website

## Project structure
- index.html: customer website
- admin.html: admin dashboard
- assets/css/customer.css: customer page styling
- assets/js/customer.js: customer interactions and demo order flow
- assets/css/admin.css: admin dashboard styling
- assets/js/admin.js: admin actions and demo data management

## Open in VS Code
1. Extract this project folder.
2. In VS Code, choose File > Open Folder and select this folder.
3. Start a local HTTP server, such as the VS Code Live Server extension, from index.html.
4. Open admin.html from the same server address to use the admin dashboard.

Both pages must use the same local web origin for browser-storage demo orders and messages to be visible between them. Opening HTML files directly with file URLs may isolate their storage.

## Deploy a learning preview
Push the files and folders to a GitHub repository and enable Pages from the main branch root. The customer page is index.html; the admin preview is admin.html.

The current registration, order approvals, catalog, settings, and support inbox use browser storage. They are learning demos, not secure multi-user services. Add authentication and a shared backend before using the admin dashboard or taking live customer orders.
