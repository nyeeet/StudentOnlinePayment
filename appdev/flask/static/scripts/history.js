document.addEventListener('DOMContentLoaded', function() {
    // Load user data from localStorage
    const currentUserJSON = localStorage.getItem('currentUser');
    if (!currentUserJSON) {
        console.warn("No user session found. User data will not be displayed.");
        // Redirect to login if no user is found
        window.location.href = "login.html"; // Adjust path as needed
        return;
    } else {
        // Parse user data and setup user profile
        const currentUser = JSON.parse(currentUserJSON);
        setupUserProfile(currentUser);
    }
    
    // Load payment history from localStorage for the current user
    loadPaymentHistory();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Sets up user profile display with user data
 */
function setupUserProfile(currentUser) {
    const firstName = currentUser.firstName || 'John';
    const lastName = currentUser.lastName || 'Smith';
    const fullName = `${firstName} ${lastName}`;
    const initials = firstName.charAt(0) + lastName.charAt(0);
    
    // Set user name and initials in header
    document.querySelector('.user-name').textContent = fullName;
    document.querySelector('.user-avatar').textContent = initials;
    
    console.log("User profile loaded successfully:", { fullName });
}

/**
 * Loads payment history from localStorage for the current user and displays it in the history table
 */
function loadPaymentHistory() {
    // Get current user
    const currentUserJSON = localStorage.getItem('currentUser');
    if (!currentUserJSON) {
        console.error("Cannot load payment history: No user logged in");
        return;
    }
    
    const currentUser = JSON.parse(currentUserJSON);
    const studentId = currentUser.studentId;
    
    // Get user-specific payments from localStorage using the studentId as part of the key
    const paymentsKey = `payments_${studentId}`;
    const payments = JSON.parse(localStorage.getItem(paymentsKey) || '[]');
    
    // Sort payments by date (newest first)
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update payment summary cards
    updatePaymentSummary(payments);
    
    // Setup pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(payments.length / itemsPerPage) || 1;
    setupPagination(totalPages);
    
    // Display payments for the first page
    displayPaymentsForPage(payments, 1, itemsPerPage);
}

/**
 * Updates the payment summary cards with calculated values
 */
function updatePaymentSummary(payments) {
    // Update total transactions
    const totalTransactions = payments.length;
    document.getElementById('total-transactions').textContent = totalTransactions;
    
    // Calculate and update total amount paid
    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
    
    // Update last payment date
    if (payments.length > 0) {
        const lastPaymentDate = new Date(payments[0].date);
        document.getElementById('last-payment').textContent = formatDate(lastPaymentDate);
    } else {
        document.getElementById('last-payment').textContent = 'N/A';
    }
}

/**
 * Sets up pagination controls based on total pages
 */
function setupPagination(totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.disabled = true;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute('data-action', 'prev');
    paginationContainer.appendChild(prevBtn);
    
    // Page buttons (max 5 visible pages)
    const maxVisiblePages = Math.min(5, totalPages);
    for (let i = 1; i <= maxVisiblePages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = i === 1 ? 'pagination-btn active' : 'pagination-btn';
        pageBtn.textContent = i;
        pageBtn.setAttribute('data-page', i);
        paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.disabled = totalPages <= 1;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute('data-action', 'next');
    paginationContainer.appendChild(nextBtn);
    
    // Store total pages as a data attribute
    paginationContainer.setAttribute('data-total-pages', totalPages);
    paginationContainer.setAttribute('data-current-page', 1);
}

/**
 * Displays payments for the specified page
 */
function displayPaymentsForPage(payments, pageNumber, itemsPerPage) {
    // Calculate start and end indices
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, payments.length);
    
    // Get the subset of payments for this page
    const paymentsForPage = payments.slice(startIndex, endIndex);
    
    // Get the table body
    const tableBody = document.querySelector('.history-table tbody');
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // If no payments, display a message
    if (paymentsForPage.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="empty-table">No payment history found</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add each payment to the table
    paymentsForPage.forEach((payment, index) => {
        const row = document.createElement('tr');
        
        // Generate a reference ID based on date and index
        const paymentDate = new Date(payment.date);
        const refId = generateReferenceId(paymentDate, startIndex + index);
        
        // Format date as 'MMM DD, YYYY'
        const formattedDate = formatDate(paymentDate);
        
        // Determine payment description based on amount
        let description = 'Tuition Payment';
        
        // Get payment method details
        const methodDetails = getPaymentMethodDetails(payment.method);
        
        // Create table row
        row.innerHTML = `
            <td class="ref-id">${refId}</td>
            <td>${formattedDate}</td>
            <td>${description}</td>
            <td>
                <div class="payment-method">
                    <i class="${methodDetails.icon}"></i>
                    <span>${methodDetails.name}</span>
                </div>
            </td>
            <td class="amount">${formatCurrency(payment.amount)}</td>
            <td><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Handles pagination navigation
 */
function handlePagination(event) {
    const paginationContainer = document.querySelector('.pagination');
    const totalPages = parseInt(paginationContainer.getAttribute('data-total-pages'));
    let currentPage = parseInt(paginationContainer.getAttribute('data-current-page'));
    
    // Get current user
    const currentUserJSON = localStorage.getItem('currentUser');
    if (!currentUserJSON) {
        console.error("Cannot handle pagination: No user logged in");
        return;
    }
    
    const currentUser = JSON.parse(currentUserJSON);
    const studentId = currentUser.studentId;
    
    // Get user-specific payments
    const paymentsKey = `payments_${studentId}`;
    const payments = JSON.parse(localStorage.getItem(paymentsKey) || '[]');
    const itemsPerPage = 10;
    
    let newPage = currentPage;
    
    // Check if it's a page number button
    if (event.target.hasAttribute('data-page')) {
        newPage = parseInt(event.target.getAttribute('data-page'));
    } 
    // Check if it's a navigation button (prev/next)
    else if (event.target.hasAttribute('data-action') || 
             event.target.parentElement.hasAttribute('data-action')) {
        const action = event.target.hasAttribute('data-action') ? 
                      event.target.getAttribute('data-action') : 
                      event.target.parentElement.getAttribute('data-action');
        
        if (action === 'prev' && currentPage > 1) {
            newPage = currentPage - 1;
        } else if (action === 'next' && currentPage < totalPages) {
            newPage = currentPage + 1;
        }
    }
    
    // Do nothing if page didn't change
    if (newPage === currentPage) return;
    
    // Update current page
    paginationContainer.setAttribute('data-current-page', newPage);
    
    // Update active button
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        if (btn.hasAttribute('data-page')) {
            btn.classList.remove('active');
            if (parseInt(btn.getAttribute('data-page')) === newPage) {
                btn.classList.add('active');
            }
        }
    });
    
    // Update prev/next button states
    const prevBtn = document.querySelector('.pagination-btn[data-action="prev"]');
    const nextBtn = document.querySelector('.pagination-btn[data-action="next"]');
    
    if (prevBtn) prevBtn.disabled = newPage <= 1;
    if (nextBtn) nextBtn.disabled = newPage >= totalPages;
    
    // Display payments for the new page
    displayPaymentsForPage(payments, newPage, itemsPerPage);
}

/**
 * Generates a unique reference ID based on date and index
 */
function generateReferenceId(date, index) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(index + 1).padStart(2, '0');
    
    return `#PAY-${year}${month}${day}${sequence}`;
}

/**
 * Formats a date as 'MMM DD, YYYY'
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a number as currency
 */
function formatCurrency(amount) {
    return `₱${parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
}

/**
 * Gets payment method details based on method type
 */
function getPaymentMethodDetails(method) {
    switch (method) {
        case 'credit-card':
            return {
                name: 'Credit Card',
                icon: 'fab fa-cc-visa'
            };
        case 'bank-transfer':
            return {
                name: 'Bank Transfer',
                icon: 'fas fa-university'
            };
        case 'digital-wallet':
            return {
                name: 'Digital Wallet',
                icon: 'fas fa-wallet'
            };
        default:
            return {
                name: 'Other',
                icon: 'fas fa-money-bill-alt'
            };
    }
}

/**
 * Sets up event listeners for buttons in the history page
 */
function setupEventListeners() {
    // Export button
    const exportBtn = document.querySelector('.btn-outline');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportPaymentHistory);
    }
    
    // Filter button
    const filterBtn = document.querySelector('.btn-primary');
    if (filterBtn) {
        filterBtn.addEventListener('click', toggleFilterOptions);
    }
    
    // Sort button
    const sortBtn = document.querySelector('.card-action');
    if (sortBtn) {
        sortBtn.addEventListener('click', sortPaymentHistory);
    }
    
    // Pagination buttons
    document.querySelector('.pagination').addEventListener('click', function(event) {
        // Check if clicked element or its parent is a pagination button
        if (event.target.classList.contains('pagination-btn') || 
            event.target.parentElement.classList.contains('pagination-btn')) {
            handlePagination(event);
        }
    });
}

/**
 * Handles view receipt button click
 */
function viewReceipt(refId) {
    console.log('View receipt for:', refId);
    alert(`Receipt view for ${refId} will be implemented in a future update.`);
}

/**
 * Handles download receipt button click
 */
function downloadReceipt(refId) {
    console.log('Download receipt for:', refId);
    alert(`Receipt download for ${refId} will be implemented in a future update.`);
}

/**
 * Handles export button click
 */
function exportPaymentHistory() {
    console.log('Export payment history');
    alert('Export feature will be implemented in a future update.');
}

/**
 * Toggles filter options display
 */
function toggleFilterOptions() {
    console.log('Toggle filter options');
    alert('Filter options will be implemented in a future update.');
}

/**
 * Handles sort button click
 */
function sortPaymentHistory() {
    console.log('Sort payment history');
    alert('Sort feature will be implemented in a future update.');
}

// Add a function to generate test data for the current logged in user
function generateTestData() {
    // Get current user
    const currentUserJSON = localStorage.getItem('currentUser');
    if (!currentUserJSON) {
        console.error("Cannot generate test data: No user logged in");
        alert("Please log in first to generate test data");
        return;
    }
    
    const currentUser = JSON.parse(currentUserJSON);
    const studentId = currentUser.studentId;
    
    // Create payments key specific to this user
    const paymentsKey = `payments_${studentId}`;
    
    // Clear existing payments for this user
    localStorage.removeItem(paymentsKey);
    
    // Generate 25 random payments for this user
    const payments = [];
    const paymentMethods = ['credit-card', 'bank-transfer', 'digital-wallet'];
    const statuses = ['Completed', 'Pending', 'Failed'];
    
    for (let i = 0; i < 25; i++) {
        // Generate a random date within the last 6 months
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
        date.setDate(Math.floor(Math.random() * 28) + 1); // Random day between 1-28
        
        // Generate a random amount between 1000 and 10000
        const amount = Math.floor(Math.random() * 9000) + 1000;
        
        // Create the payment object
        payments.push({
            date: date.toISOString(),
            amount: amount,
            method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }
    
    // Store in localStorage with the user-specific key
    localStorage.setItem(paymentsKey, JSON.stringify(payments));
    console.log('Test data generated for user:', studentId, payments.length, 'payments');
    
    // Reload the page to display the new data
    location.reload();
}

// Add a function to add a payment for the current user (can be used in payment forms)
function addPayment(paymentDetails) {
    // Get current user
    const currentUserJSON = localStorage.getItem('currentUser');
    if (!currentUserJSON) {
        console.error("Cannot add payment: No user logged in");
        return false;
    }
    
    const currentUser = JSON.parse(currentUserJSON);
    const studentId = currentUser.studentId;
    
    // Get existing payments for this user
    const paymentsKey = `payments_${studentId}`;
    const existingPayments = JSON.parse(localStorage.getItem(paymentsKey) || '[]');
    
    // Add the new payment
    existingPayments.push({
        date: new Date().toISOString(),
        amount: paymentDetails.amount,
        method: paymentDetails.method,
        status: paymentDetails.status || 'Completed'
    });
    
    // Save back to localStorage
    localStorage.setItem(paymentsKey, JSON.stringify(existingPayments));
    console.log('Payment added for user:', studentId);
    
    return true;
}

// Make functions available globally
window.viewReceipt = viewReceipt;
window.downloadReceipt = downloadReceipt;
window.generateTestData = generateTestData;
window.addPayment = addPayment;