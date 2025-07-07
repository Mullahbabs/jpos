// Initialize data
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let cart = [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [
  { username: "admin", password: "couturejadmin123", role: "admin" },
  { username: "user", password: "user757", role: "user" },
];
const currency = "₦";
let currentUser = null;

// DOM Elements
const loginSection = document.getElementById("loginSection");
const systemContent = document.getElementById("systemContent");
const currentUserDisplay = document.getElementById("currentUser");
const addProductBtn = document.getElementById("addProductBtn");
const inventoryActionsHeader = document.getElementById(
  "inventoryActionsHeader"
);
const historyActionsHeader = document.getElementById("historyActionsHeader");
const adminTab = document.getElementById("adminTab");
const modalAddProductBtn = document.getElementById("modalAddProductBtn");

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // Save default users if not exists
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Set up event listeners
  modalAddProductBtn.addEventListener("click", addProduct);
});

// Login function
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    loginSection.style.display = "none";
    systemContent.style.display = "block";
    currentUserDisplay.textContent = `Jantos Couture: ${user.username} (${user.role})`;

    // Update UI based on user role
    updateUIForUserRole();

    // Initialize system
    updateInventoryTable();
    updateProductSelect();
    updateSaleTable();
    updateTransactionHistory();
    updateUsersTable();
  } else {
    loginError.style.display = "block";
  }
}

// Logout function
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  loginSection.style.display = "block";
  systemContent.style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").style.display = "none";
}

// Check if user is logged in on page load
function checkLogin() {
  const savedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (savedUser) {
    currentUser = savedUser;
    loginSection.style.display = "none";
    systemContent.style.display = "block";
    currentUserDisplay.textContent = `Logged in as: ${currentUser.username} (${currentUser.role})`;
    updateUIForUserRole();
    updateInventoryTable();
    updateProductSelect();
    updateSaleTable();
    updateTransactionHistory();
    updateUsersTable();
  }
}

// Update UI based on user role
function updateUIForUserRole() {
  if (currentUser.role === "admin") {
    addProductBtn.style.display = "block";
    inventoryActionsHeader.style.display = "table-cell";
    historyActionsHeader.style.display = "table-cell";
    adminTab.style.display = "block";
  } else {
    addProductBtn.style.display = "none";
    inventoryActionsHeader.style.display = "none";
    historyActionsHeader.style.display = "none";
    adminTab.style.display = "none";
  }
}

// Add Product function
function addProduct() {
  const name = document.getElementById("productName").value.trim();
  const sku = document.getElementById("productSKU").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const size = document.getElementById("productSize").value.trim();
  const color = document.getElementById("productColor").value.trim();
  const quantity = parseInt(document.getElementById("productQuantity").value);

  // Validation
  if (!name || !sku || isNaN(price) || isNaN(quantity)) {
    alert("Please fill all required fields with valid values");
    return;
  }

  if (price <= 0) {
    alert("Price must be greater than 0");
    return;
  }

  if (quantity < 0) {
    alert("Quantity cannot be negative");
    return;
  }

  if (inventory.some((item) => item.sku === sku)) {
    alert("Product with this SKU already exists");
    return;
  }

  // Add product to inventory
  inventory.push({ name, sku, price, size, color, quantity });
  localStorage.setItem("inventory", JSON.stringify(inventory));

  // Update UI
  updateInventoryTable();
  updateProductSelect();

  // Close modal and reset form
  bootstrap.Modal.getInstance(
    document.getElementById("addProductModal")
  ).hide();
  clearModalInputs();

  // Show success message
  alert("Product added successfully!");
}

// Edit Product functions
function editProduct(index) {
  const product = inventory[index];
  document.getElementById("editProductIndex").value = index;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductSKU").value = product.sku;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductSize").value = product.size || "";
  document.getElementById("editProductColor").value = product.color || "";
  document.getElementById("editProductQuantity").value = product.quantity;

  const modal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  modal.show();
}

function saveEditedProduct() {
  const index = document.getElementById("editProductIndex").value;
  const name = document.getElementById("editProductName").value.trim();
  const sku = document.getElementById("editProductSKU").value.trim();
  const price = parseFloat(document.getElementById("editProductPrice").value);
  const size = document.getElementById("editProductSize").value.trim();
  const color = document.getElementById("editProductColor").value.trim();
  const quantity = parseInt(
    document.getElementById("editProductQuantity").value
  );

  // Validation
  if (!name || !sku || isNaN(price) || isNaN(quantity)) {
    alert("Please fill all required fields with valid values");
    return;
  }

  if (price <= 0) {
    alert("Price must be greater than 0");
    return;
  }

  if (quantity < 0) {
    alert("Quantity cannot be negative");
    return;
  }

  // Check if SKU is being changed to one that already exists
  const originalProduct = inventory[index];
  if (
    originalProduct.sku !== sku &&
    inventory.some((item, i) => i !== parseInt(index) && item.sku === sku)
  ) {
    alert("Product with this SKU already exists");
    return;
  }

  // Update product
  inventory[index] = { name, sku, price, size, color, quantity };
  localStorage.setItem("inventory", JSON.stringify(inventory));

  // Update UI
  updateInventoryTable();
  updateProductSelect();

  // Close modal
  bootstrap.Modal.getInstance(
    document.getElementById("editProductModal")
  ).hide();

  // Show success message
  alert("Product updated successfully!");
}

// Delete Product function
function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    inventory.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    updateInventoryTable();
    updateProductSelect();
  }
}

// Update Inventory Table
function updateInventoryTable() {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";

  if (inventory.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="8" class="text-center">No products found.</td>`;
    tbody.appendChild(row);
    return;
  }

  inventory.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.sku}</td>
          <td>${currency}${item.price.toFixed(2)}</td>
          <td>${item.size || "-"}</td>
          <td>${item.color || "-"}</td>
          <td>${item.quantity}</td>
          <td>
            <div class="barcode-container">
              <canvas id="barcode-${index}" class="barcode"></canvas>
              <div class="barcode-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="showBarcodeModal('${
                  item.sku
                }', '${item.name}')">
                  Print Barcode
                </button>
              </div>
            </div>
          </td>
          ${
            currentUser?.role === "admin"
              ? `
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-sm" onclick="editProduct(${index})">
                Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">
                Delete
              </button>
            </div>
          </td>
          `
              : ""
          }
        `;
    tbody.appendChild(row);

    // Generate barcode
    JsBarcode(`#barcode-${index}`, item.sku, {
      format: "CODE128",
      height: 40,
      displayValue: true,
      lineColor: "#2e59d9",
      width: 2,
    });
  });
}

// Barcode functions
function showBarcodeModal(sku, name) {
  const modalContent = document.getElementById("barcodePrintContent");
  modalContent.innerHTML = `
        <div class="text-center mb-3">
          <h5>${name}</h5>
          <p>SKU: ${sku}</p>
        </div>
        <div class="text-center">
          <canvas id="printBarcodeCanvas" data-barcode="${sku}"></canvas>
        </div>
      `;

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("barcodePrintModal")
  );
  modal.show();

  // Generate barcode after modal is shown
  setTimeout(() => {
    JsBarcode("#printBarcodeCanvas", sku, {
      format: "CODE128",
      height: 60,
      displayValue: true,
      lineColor: "#000000",
      width: 2,
    });
  }, 100);
}

function printBarcode() {
  const printWindow = window.open("", "", "width=600,height=600");
  const sku = document
    .querySelector("#printBarcodeCanvas")
    .getAttribute("data-barcode");
  const name = document.querySelector("#barcodePrintContent h5").textContent;

  printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body { text-align: center; padding: 20px; font-family: Arial; }
              canvas { max-width: 100%; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h3>${name}</h3>
            <p>SKU: ${sku}</p>
            <canvas id="printBarcodeCanvas"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
            <script>
              window.onload = function() {
                JsBarcode('#printBarcodeCanvas', '${sku}', { 
                  format: "CODE128", 
                  height: 60, 
                  displayValue: true,
                  lineColor: "#000000",
                  width: 2
                });
                setTimeout(function() { window.print(); }, 200);
              }
            <\/script>
          </body>
        </html>
      `);
  printWindow.document.close();
}

// POS functions
function updateProductSelect() {
  const select = document.getElementById("productSelect");
  select.innerHTML = '<option value="">Select Product</option>';

  inventory.forEach((item) => {
    if (item.quantity > 0) {
      const option = document.createElement("option");
      option.value = item.sku;
      option.textContent = `${item.name} - ${currency}${item.price.toFixed(
        2
      )} (${item.quantity} available)`;
      select.appendChild(option);
    }
  });
}

function addToSale() {
  const sku = document.getElementById("productSelect").value;
  const quantityInput = document.getElementById("saleQuantity");
  const quantity = parseInt(quantityInput.value);

  if (!sku) {
    alert("Please select a product");
    return;
  }

  if (isNaN(quantity)) {
    alert("Please enter a valid quantity");
    return;
  }

  const product = inventory.find((item) => item.sku === sku);

  if (quantity <= 0) {
    alert("Quantity must be greater than 0");
    return;
  }

  if (quantity > product.quantity) {
    alert(`Only ${product.quantity} items available in stock`);
    return;
  }

  // Check if product already in cart
  const existingItemIndex = cart.findIndex((item) => item.sku === sku);
  if (existingItemIndex >= 0) {
    // Update existing item
    const newQuantity = cart[existingItemIndex].saleQuantity + quantity;
    if (newQuantity > product.quantity) {
      alert(`Cannot add more than available stock (${product.quantity})`);
      return;
    }
    cart[existingItemIndex].saleQuantity = newQuantity;
  } else {
    // Add new item to cart
    cart.push({ ...product, saleQuantity: quantity });
  }

  // Update inventory
  product.quantity -= quantity;
  localStorage.setItem("inventory", JSON.stringify(inventory));

  updateSaleTable();
  updateInventoryTable();
  updateProductSelect();
  quantityInput.value = "";
  quantityInput.focus();
}

function updateSaleTable() {
  const tbody = document.querySelector("#saleTable tbody");
  tbody.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="text-center">No items in sale. Add products to begin.</td>`;
    tbody.appendChild(row);
    document.getElementById("saleTotal").textContent = `${currency}0.00`;
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.saleQuantity;
    total += itemTotal;
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.saleQuantity}</td>
          <td>${currency}${item.price.toFixed(2)}</td>
          <td>${currency}${itemTotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="removeFromSale(${index})">
              Remove
            </button>
          </td>
        `;
    tbody.appendChild(row);
  });

  document.getElementById(
    "saleTotal"
  ).textContent = `${currency}${total.toFixed(2)}`;
}

function removeFromSale(index) {
  const item = cart[index];
  const product = inventory.find((p) => p.sku === item.sku);
  product.quantity += item.saleQuantity;
  cart.splice(index, 1);
  localStorage.setItem("inventory", JSON.stringify(inventory));
  updateSaleTable();
  updateInventoryTable();
  updateProductSelect();
}

function completeSale() {
  if (cart.length === 0) {
    alert("No items in the cart to complete sale");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.saleQuantity,
    0
  );
  const date = new Date();
  const transactionId = "TXN-" + date.getTime();
  const formattedDate = date.toLocaleString();

  transactions.push({
    id: transactionId,
    date: formattedDate,
    items: [...cart],
    total,
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Generate receipt
  generateReceipt(transactionId, formattedDate, total);

  // Reset cart
  cart = [];
  updateSaleTable();
  updateTransactionHistory();
}

// Transaction History functions
function updateTransactionHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="${
      currentUser?.role === "admin" ? 4 : 3
    }" class="text-center">No transactions yet.</td>`;
    tbody.appendChild(row);
    return;
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  sortedTransactions.forEach((transaction, index) => {
    const row = document.createElement("tr");
    const items = transaction.items
      .map(
        (item) =>
          `${item.name} (${item.saleQuantity} @ ${currency}${item.price.toFixed(
            2
          )})`
      )
      .join("<br>");

    row.innerHTML = `
          <td>${transaction.date}</td>
          <td>${items}</td>
          <td>${currency}${transaction.total.toFixed(2)}</td>
          ${
            currentUser?.role === "admin"
              ? `
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="printTransactionReceipt(${index})">
              Print Receipt
            </button>
          </td>
          `
              : ""
          }
        `;
    tbody.appendChild(row);
  });
}

function printTransactionReceipt(index) {
  const transaction = transactions[index];

  const receiptTable = document.querySelector("#receiptTable tbody");
  receiptTable.innerHTML = "";

  transaction.items.forEach((item) => {
    const itemTotal = item.price * item.saleQuantity;
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.saleQuantity}</td>
          <td>${currency}${item.price.toFixed(2)}</td>
          <td>${currency}${itemTotal.toFixed(2)}</td>
        `;
    receiptTable.appendChild(row);
  });

  document.getElementById(
    "receiptDate"
  ).textContent = `Date: ${transaction.date}`;
  document.getElementById(
    "receiptTotal"
  ).textContent = `${currency}${transaction.total.toFixed(2)}`;
  document.getElementById("receiptId").textContent = transaction.id;

  // Show and print receipt
  document.getElementById("receipt").style.display = "block";
  window.print();
  document.getElementById("receipt").style.display = "none";
}

function generateReceipt(transactionId, date, total) {
  const receiptTable = document.querySelector("#receiptTable tbody");
  receiptTable.innerHTML = "";

  cart.forEach((item) => {
    const itemTotal = item.price * item.saleQuantity;
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.saleQuantity}</td>
          <td>${currency}${item.price.toFixed(2)}</td>
          <td>${currency}${itemTotal.toFixed(2)}</td>
        `;
    receiptTable.appendChild(row);
  });

  document.getElementById("receiptDate").textContent = `Date: ${date}`;
  document.getElementById(
    "receiptTotal"
  ).textContent = `${currency}${total.toFixed(2)}`;
  document.getElementById("receiptId").textContent = transactionId;

  // Show and print receipt
  document.getElementById("receipt").style.display = "block";
  window.print();
  document.getElementById("receipt").style.display = "none";
}

// User Management functions
function updateUsersTable() {
  if (currentUser?.role !== "admin") return;

  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    if (user.username === "admin") return; // Don't show admin in the list for deletion

    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteUser(${index})">
              Delete
            </button>
          </td>
        `;
    tbody.appendChild(row);
  });
}

function addUser() {
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("userRole").value;

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  if (users.some((u) => u.username === username)) {
    alert("Username already exists");
    return;
  }

  users.push({ username, password, role });
  localStorage.setItem("users", JSON.stringify(users));

  // Update UI
  updateUsersTable();

  // Close modal and reset form
  bootstrap.Modal.getInstance(document.getElementById("addUserModal")).hide();
  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";

  // Show success message
  alert("User added successfully!");
}

function deleteUser(index) {
  if (confirm("Are you sure you want to delete this user?")) {
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    updateUsersTable();
  }
}

// Utility functions
function clearModalInputs() {
  document.getElementById("productName").value = "";
  document.getElementById("productSKU").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productSize").value = "";
  document.getElementById("productColor").value = "";
  document.getElementById("productQuantity").value = "";
}

// Check login status on page load
checkLogin();
