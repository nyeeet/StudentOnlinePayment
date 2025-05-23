// Calendar data
const calendarData = {
    months: [
        {
            name: 'January 2025',
            days: 31,
            firstDay: 3, // 0 = Sunday, 1 = Monday, etc.
            events: [
                { day: 15, type: 'due', name: 'Prelim Examination Fee', amount: '₱12,500', status: 'Due Today' }
            ]
        },
        {
            name: 'February 2025',
            days: 28,
            firstDay: 6,
            events: [
                { day: 15, type: 'upcoming', name: 'Midterm Examination Fee', amount: '₱12,500', status: 'Upcoming' }
            ]
        },
        {
            name: 'April 2025',
            days: 30,
            firstDay: 2,
            events: [
                { day: 15, type: 'upcoming', name: 'Pre-Final Examination Fee', amount: '₱12,500', status: 'Upcoming' }
            ]
        },
        {
            name: 'May 2025',
            days: 31,
            firstDay: 4,
            events: [
                { day: 15, type: 'upcoming', name: 'Final Examination Fee', amount: '₱12,500', status: 'Upcoming' }
            ]
        }
    ]
};

let currentMonthIndex = 0;
const today = new Date();

// Function to generate calendar
function generateCalendar(monthIndex) {
    const month = calendarData.months[monthIndex];
    const calendarContainer = document.getElementById('calendarContainer');
    const paymentDetails = document.getElementById('paymentDetails');
    
    // Update month title
    document.getElementById('monthTitle').textContent = month.name;
    
    // Generate calendar grid
    let calendarHTML = '<div class="calendar-grid">';
    
    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        calendarHTML += `<div class="weekday">${day}</div>`;
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < month.firstDay; i++) {
        calendarHTML += '<div class="calendar-day other-month"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= month.days; day++) {
        const hasEvent = month.events.some(event => event.day === day);
        const isToday = today.getDate() === day && 
                       (month.name.includes('January') && today.getMonth() === 0) ||
                       (month.name.includes('February') && today.getMonth() === 1) ||
                       (month.name.includes('April') && today.getMonth() === 3) ||
                       (month.name.includes('May') && today.getMonth() === 4);
        
        let dayClass = 'calendar-day';
        if (hasEvent) dayClass += ' has-event';
        if (isToday) dayClass += ' today';
        
        if (hasEvent) {
            const event = month.events.find(event => event.day === day);
            calendarHTML += `
                <div class="${dayClass}" data-day="${day}" data-has-event="true">
                    <span class="day-number">${day}</span>
                    <div class="event-indicator event-type-${event.type}"></div>
                </div>
            `;
        } else {
            calendarHTML += `<div class="${dayClass}" data-day="${day}" data-has-event="false">${day}</div>`;
        }
    }
    
    // Add empty cells for days after the last day of the month to complete the grid
    const totalDaysShown = month.firstDay + month.days;
    const rowsNeeded = Math.ceil(totalDaysShown / 7);
    const totalCells = rowsNeeded * 7;
    const cellsToAdd = totalCells - totalDaysShown;
    
    for (let i = 0; i < cellsToAdd; i++) {
        calendarHTML += '<div class="calendar-day other-month"></div>';
    }
    
    calendarHTML += '</div>';
    calendarContainer.innerHTML = calendarHTML;
    
    // Generate payment details
    let paymentsHTML = '<div class="payment-details">';
    
    month.events.forEach(event => {
        const statusClass = event.status === 'Due Today' ? 'status-due' : 
                           event.status === 'Paid' ? 'status-paid' : 'status-upcoming';
        
        const itemClass = event.status === 'Due Today' ? 'payment-item due-today' : 
                         event.status === 'Paid' ? 'payment-item paid' : 'payment-item upcoming';
        
        paymentsHTML += `
            <div class="${itemClass}" data-day="${event.day}">
                <div class="payment-info">
                    <div class="payment-icon">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                        <div class="payment-name">${event.name}</div>
                        <div class="payment-date">${month.name.split(' ')[0]} ${event.day}, ${month.name.split(' ')[1]}</div>
                    </div>
                </div>
                <div class="payment-amount">${event.amount}</div>
                <div class="payment-status ${statusClass}">${event.status}</div>
                <div class="payment-actions">
                    <a href="javascript:void(0)" onclick="goToPayment('${event.name}', '${event.amount}')" class="pay-now-btn">Pay Now</a>
                </div>
            </div>
        `;
    });
    
    paymentsHTML += '</div>';
    paymentDetails.innerHTML = paymentsHTML;
    
    // Add event listeners to calendar days
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            const dayNumber = parseInt(this.getAttribute('data-day'));
            const hasEvent = this.getAttribute('data-has-event') === 'true';
            if (!isNaN(dayNumber)) {
                highlightDay(dayNumber, hasEvent);
            }
        });
    });

    // Auto-highlight relevant day (January 15 if it's the first month)
    if (monthIndex === 0) {
        setTimeout(() => {
            highlightDay(15, true); // January 15 has an event
        }, 100);
    }
}

// Function to navigate between months
function navigateMonth(direction) {
    currentMonthIndex = (currentMonthIndex + direction + calendarData.months.length) % calendarData.months.length;
    generateCalendar(currentMonthIndex);
}

// Function to highlight selected day and display associated events
function highlightDay(day, hasEvent) {
    const month = calendarData.months[currentMonthIndex];
    
    // Remove highlight from all days
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add highlight to selected day
    const selectedDay = document.querySelector(`.calendar-day[data-day="${day}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
        selectedDay.style.backgroundColor = '#e0e0ff';
    }
    
    // Show payment details for this day if there's an event
    const allPaymentItems = document.querySelectorAll('.payment-item');
    allPaymentItems.forEach(item => {
        item.style.display = 'none';
    });
    
    const dayPaymentItem = document.querySelector(`.payment-item[data-day="${day}"]`);
    if (dayPaymentItem) {
        dayPaymentItem.style.display = 'flex';
    }
}

// Function to go to payment page with the selected exam
function goToPayment(eventName, eventAmount) {
    // Get current user ID to ensure data consistency
    const currentUserJSON = localStorage.getItem('currentUser');
    // if (!currentUserJSON) {
    //     alert("No user session found. Please log in.");
    //     window.location.href = "index.html";
    //     return;
    // }
    
    const currentUser = JSON.parse(currentUserJSON);
    const userId = currentUser.id || currentUser.studentId || currentUser.email;
    
    // Store exam type in localStorage based on event name
    let examType = '';
    
    if (eventName.includes('Prelim')) {
        examType = 'prelim';
    } else if (eventName.includes('Midterm')) {
        examType = 'midterm';
    } else if (eventName.includes('Pre-Final')) {
        examType = 'prefinal';
    } else if (eventName.includes('Final')) {
        examType = 'final';
    }
    
    localStorage.setItem('selectedExam', examType);
    localStorage.setItem('selectedUserId', userId); // Store user ID for payment page
    
    // Also store the payment amount to ensure consistency
    localStorage.setItem('selectedExamAmount', eventAmount);
    
    // Navigate to payment page
    window.location.href = 'paymentui.html';
}

// Function to export schedule (placeholder for future functionality)
function exportSchedule() {
    alert('Schedule exported successfully!');
    // In a real implementation, this would generate a PDF or CSV file
}

// Function to toggle full view of calendar
function toggleFullView() {
    const calendarContainer = document.getElementById('calendarContainer');
    calendarContainer.style.height = calendarContainer.style.height === '600px' ? 'auto' : '600px';
}

// Calculate the examination fee based on tuition amount
function calculateExaminationFee(tuition) {
    // Base formula: Remaining balance after downpayment divided by 4 for each exam period
    const downpayment = Math.round(tuition * 0.05); // 5% downpayment
    const remainingBalance = tuition - downpayment;
    return Math.round(remainingBalance / 4); // Divided equally among 4 exam periods
}

// Format currency with peso sign and thousands separator
function formatCurrency(amount) {
    return `₱${amount.toLocaleString()}`;
}

// Update exam status from localStorage - now user-specific
function updateExamStatusFromStorage(userId) {
    // Get exam statuses from localStorage with user-specific key
    const examStatuses = JSON.parse(localStorage.getItem(`examStatuses_${userId}`) || '{}');
    
    // Update calendar data with paid statuses
    calendarData.months.forEach(month => {
        month.events.forEach(event => {
            let examType = null;
            
            if (event.name.includes('Prelim')) examType = 'prelim';
            else if (event.name.includes('Midterm')) examType = 'midterm';
            else if (event.name.includes('Pre-Final')) examType = 'prefinal';
            else if (event.name.includes('Final')) examType = 'final';
            
            if (examType && examStatuses[examType] === 'paid') {
                event.status = 'Paid';
                event.type = 'paid';
            }
        });
    });
}

// Initialize calendar with first month and load user data
document.addEventListener('DOMContentLoaded', function() {
    // Try to load user data from localStorage first
    const currentUserJSON = sessionStorage.getItem('currentUser');
    
    if (currentUserJSON) {
        const currentUser = JSON.parse(currentUserJSON);
        
        // Get user ID to ensure data consistency across pages
        const userId = currentUser.id || currentUser.studentId || currentUser.email;
        
        // Update user profile display with actual user data
        const firstName = currentUser.firstName;
        const lastName = currentUser.lastName;
        const fullName = `${firstName} ${lastName}`;
        const initials = firstName.charAt(0) + lastName.charAt(0);
        const tuition = currentUser.tuition || 50000; // Use actual tuition or default to 50,000
        
        // Set user information in header
        document.getElementById('userInitials').textContent = initials;
        document.getElementById('userName').textContent = fullName;
        
        // Calculate financial information
        const downpaymentPercentage = 0.05; // 5% downpayment
        const downpayment = Math.round(tuition * downpaymentPercentage);
        
        // Check if we have payment summary in localStorage - now user-specific
        const paymentSummaryJSON = localStorage.getItem(`paymentSummary_${userId}`);
        let amountPaid, remainingBalance;
        
        if (paymentSummaryJSON) {
            // Use stored payment data if available
            const paymentSummary = JSON.parse(paymentSummaryJSON);
            amountPaid = paymentSummary.paid;
            remainingBalance = paymentSummary.balance;
        } else {
            // Calculate based on downpayment only
            amountPaid = downpayment;
            remainingBalance = tuition - downpayment;
            
            // Initialize the payment summary for this user
            const newPaymentSummary = {
                paid: amountPaid,
                balance: remainingBalance
            };
            localStorage.setItem(`paymentSummary_${userId}`, JSON.stringify(newPaymentSummary));
        }
        
        // Calculate payment per exam (divide remaining balance by 4)
        const paymentPerExam = Math.round(remainingBalance / 4);
        
        // Update the payment summary in the UI
        document.getElementById('totalFees').textContent = formatCurrency(tuition);
        document.getElementById('paidAmount').textContent = formatCurrency(amountPaid);
        document.getElementById('balanceAmount').textContent = formatCurrency(remainingBalance);
        
        // Determine next payment date based on paid exams
        const examStatuses = JSON.parse(localStorage.getItem(`examStatuses_${userId}`) || '{}');
        let nextPaymentMonth = 'Jan';
        let nextPaymentDay = 15;
        
        if (examStatuses.prelim === 'paid') {
            nextPaymentMonth = 'Feb';
        }
        if (examStatuses.prelim === 'paid' && examStatuses.midterm === 'paid') {
            nextPaymentMonth = 'Apr';
        }
        if (examStatuses.prelim === 'paid' && examStatuses.midterm === 'paid' && examStatuses.prefinal === 'paid') {
            nextPaymentMonth = 'May';
        }
        
        document.getElementById('nextPaymentDate').textContent = `${nextPaymentMonth} ${nextPaymentDay}`;
        
        // Update event amounts in calendar data with correct payment amounts
        calendarData.months.forEach(month => {
            month.events.forEach(event => {
                event.amount = formatCurrency(paymentPerExam);
            });
        });
        
        console.log("User data loaded successfully in schedule page:", { 
            fullName, 
            userId,
            tuition, 
            paymentPerExam,
            downpayment,
            amountPaid,
            remainingBalance
        });
        
        // Check for exam payment statuses and update calendar accordingly - now user-specific
        updateExamStatusFromStorage(userId);
    }

    else {
        console.log("No user data found, redirecting to login");
        alert("No user session found. Please log in.");
        window.location.href = "index.html";
    }
    
    // Initialize calendar
    generateCalendar(currentMonthIndex);
});