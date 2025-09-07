    // Data state
    let orders = [];
    let customerName = '';
    let discount = 0;
    let shippingCost = 0;
    let salesHistory = JSON.parse(localStorage.getItem('monaschoSales')) || [];

    // Elemen DOM
    const productButtons = document.querySelectorAll('.product-btn');
    const orderListEl = document.getElementById('orderList');
    const subtotalEl = document.getElementById('subtotal');
    const discountValueEl = document.getElementById('discountValue');
    const shippingValueEl = document.getElementById('shippingValue');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const customerNameInput = document.getElementById('customerName');
    const discountInput = document.getElementById('discount');
    const shippingInput = document.getElementById('shippingCost');
    const receiptModal = document.getElementById('receiptModal');
    const closeModal = document.getElementById('closeModal');
    const receiptContent = document.getElementById('receiptContent');
    const printReceiptBtn = document.getElementById('printReceipt');
    const reportModal = document.getElementById('reportModal');
    const showReportBtn = document.getElementById('showReportBtn');
    const closeReportModal = document.getElementById('closeReportModal');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const printReportBtn = document.getElementById('printReportBtn');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const totalSalesEl = document.getElementById('totalSales');
    const totalTransactionsEl = document.getElementById('totalTransactions');
    const bestSellerEl = document.getElementById('bestSeller');
    const salesTableBody = document.getElementById('salesTableBody');

    // Inisialisasi aplikasi
    function initApp() {
        // Set default dates for report (current month)
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        startDateInput.value = formatDateForInput(firstDayOfMonth);
        endDateInput.value = formatDateForInput(lastDayOfMonth);
        
        // Setup event listeners
        setupEventListeners();
        
        // Render initial state
        renderOrders();
    }

    // Setup semua event listeners
    function setupEventListeners() {
        // Event listeners untuk product buttons
        productButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productName = e.currentTarget.dataset.name;
                const productPrice = parseInt(e.currentTarget.dataset.price);
                addOrder(productName, productPrice);
            });
        });

        // Event listeners untuk input changes
        discountInput.addEventListener('input', updateSummary);
        shippingInput.addEventListener('input', updateSummary);
        customerNameInput.addEventListener('input', () => {
            customerName = customerNameInput.value;
        });

        // Checkout button
        checkoutBtn.addEventListener('click', checkout);
        
        // Modal event listeners
        closeModal.addEventListener('click', () => {
            receiptModal.style.display = 'none';
        });
        
        printReceiptBtn.addEventListener('click', () => {
            window.print();
        });
        
        // Report modal event listeners
        showReportBtn.addEventListener('click', () => {
            reportModal.style.display = 'flex';
        });
        
        closeReportModal.addEventListener('click', () => {
            reportModal.style.display = 'none';
        });
        
        generateReportBtn.addEventListener('click', generateSalesReport);
        
        printReportBtn.addEventListener('click', () => {
            window.print();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === receiptModal) {
                receiptModal.style.display = 'none';
            }
            if (event.target === reportModal) {
                reportModal.style.display = 'none';
            }
        });
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    }

    // Format date for input field (YYYY-MM-DD)
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Tambah pesanan
    function addOrder(productName, productPrice) {
        // Cek apakah produk sudah ada di keranjang
        const existingOrderIndex = orders.findIndex(order => order.name === productName);
        
        if (existingOrderIndex !== -1) {
            // Jika sudah ada, tambah quantity
            orders[existingOrderIndex].quantity += 1;
            orders[existingOrderIndex].total = orders[existingOrderIndex].quantity * orders[existingOrderIndex].price;
        } else {
            // Jika belum ada, tambah order baru
            orders.push({
                id: Date.now(),
                name: productName,
                price: productPrice,
                quantity: 1,
                total: productPrice
            });
        }
        
        renderOrders();
    }

    // Hapus pesanan
    function removeOrder(orderId) {
        orders = orders.filter(order => order.id !== orderId);
        renderOrders();
    }

    // Render daftar pesanan
    function renderOrders() {
        if (orders.length === 0) {
            orderListEl.innerHTML = `
                <li class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Belum ada pesanan</p>
                </li>
            `;
            checkoutBtn.disabled = true;
            return;
        }
        
        orderListEl.innerHTML = '';
        checkoutBtn.disabled = false;
        
        orders.forEach(order => {
            const orderItem = document.createElement('li');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-details">
                    <div class="order-name">${order.name}</div>
                    <div class="order-meta">${order.quantity} x ${formatCurrency(order.price)}</div>
                </div>
                <div class="order-price">${formatCurrency(order.total)}</div>
                <div class="order-actions">
                    <button class="action-btn delete-btn" data-id="${order.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            orderListEl.appendChild(orderItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                removeOrder(parseInt(button.dataset.id));
            });
        });
        
        updateSummary();
    }

    // Update ringkasan pesanan
    function updateSummary() {
        const subtotal = orders.reduce((sum, order) => sum + order.total, 0);
        discount = parseInt(discountInput.value) || 0;
        shippingCost = parseInt(shippingInput.value) || 0;
        const total = Math.max(0, subtotal - discount + shippingCost);
        
        subtotalEl.textContent = formatCurrency(subtotal);
        discountValueEl.textContent = `- ${formatCurrency(discount)}`;
        shippingValueEl.textContent = formatCurrency(shippingCost);
        totalEl.textContent = formatCurrency(total);
    }

    // Generate receipt content
    function generateReceipt() {
        const subtotal = orders.reduce((sum, order) => sum + order.total, 0);
        discount = parseInt(discountInput.value) || 0;
        shippingCost = parseInt(shippingInput.value) || 0;
        const total = Math.max(0, subtotal - discount + shippingCost);
        customerName = customerNameInput.value || 'Pelanggan';
        
        // Generate order number (YYYYMMDD-HHMMSS)
        const now = new Date();
        const orderNumber = `MNSC-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        
        return `
            <div class="receipt-header">
                <h2>MONASCHO HERBAL</h2>
                <p>Sehatkan Badanmu dengan Monascho</p>
            </div>
            
            <div class="receipt-details">
                <div class="receipt-item">
                    <span>No. Transaksi:</span>
                    <span>${orderNumber}</span>
                </div>
                <div class="receipt-item">
                    <span>Tanggal:</span>
                    <span>${now.toLocaleString('id-ID')}</span>
                </div>
                <div class="receipt-item">
                    <span>Nama Pembeli:</span>
                    <span>${customerName}</span>
                </div>
            </div>
            
            <div class="receipt-items">
                ${orders.map(order => `
                    <div class="receipt-item">
                        <span>${order.quantity}x ${order.name}</span>
                        <span>${formatCurrency(order.total)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="receipt-totals">
                <div class="receipt-item">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="receipt-item">
                    <span>Diskon:</span>
                    <span>- ${formatCurrency(discount)}</span>
                </div>
                <div class="receipt-item">
                    <span>Biaya Ongkir:</span>
                    <span>${formatCurrency(shippingCost)}</span>
                </div>
                <div class="receipt-item" style="font-weight: bold;">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p>Terima kasih telah berbelanja di MONASCHO!</p>
                <p>*** Semoga Sehat Selalu ***</p>
            </div>
        `;
    }

    // Show receipt modal
    function showReceipt() {
        receiptContent.innerHTML = generateReceipt();
        receiptModal.style.display = 'flex';
    }

    // Save sales data to localStorage
    function saveSalesData() {
        const subtotal = orders.reduce((sum, order) => sum + order.total, 0);
        discount = parseInt(discountInput.value) || 0;
        shippingCost = parseInt(shippingInput.value) || 0;
        const total = Math.max(0, subtotal - discount + shippingCost);
        customerName = customerNameInput.value || 'Pelanggan';
        
        const saleRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            customer: customerName,
            items: [...orders],
            subtotal: subtotal,
            discount: discount,
            shipping: shippingCost,
            total: total
        };
        
        salesHistory.push(saleRecord);
        localStorage.setItem('monaschoSales', JSON.stringify(salesHistory));
    }

    // Checkout
    function checkout() {
        if (orders.length === 0) return;
        
        // Save sales data
        saveSalesData();
        
        // Tampilkan struk
        showReceipt();
        
        // Reset orders
        orders = [];
        customerNameInput.value = '';
        discountInput.value = '0';
        shippingInput.value = '0';
        renderOrders();
    }

    // Generate sales report
    function generateSalesReport() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Filter sales data by date range
        const filteredSales = salesHistory.filter(sale => {
            return sale.date >= startDate && sale.date <= endDate;
        });
        
        // Calculate summary
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalTransactions = filteredSales.length;
        const productSales = {};
        
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = { quantity: 0, total: 0 };
                }
                productSales[item.name].quantity += item.quantity;
                productSales[item.name].total += item.total;
            });
        });
        
        // Determine best seller
        let bestSeller = '-';
        let maxSold = 0;
        for (const [productName, data] of Object.entries(productSales)) {
            if (data.quantity > maxSold) {
                maxSold = data.quantity;
                bestSeller = productName;
            }
        }
        
        // Update summary display
        totalSalesEl.textContent = formatCurrency(totalSales);
        totalTransactionsEl.textContent = totalTransactions;
        bestSellerEl.textContent = bestSeller;
        
        // Populate sales table
        salesTableBody.innerHTML = '';
        for (const [productName, data] of Object.entries(productSales)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${productName}</td>
                <td>${data.quantity}</td>
                <td>${formatCurrency(data.total)}</td>
            `;
            salesTableBody.appendChild(row);
        }
    }

    // Jalankan aplikasi saat halaman dimuat
    document.addEventListener('DOMContentLoaded', initApp);