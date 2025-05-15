// Add this script at the bottom of your schedule.html file, replacing the existing DOMContentLoaded event listener

document.addEventListener('DOMContentLoaded', function() {
    console.log("Schedule page loaded, checking for user data...");
    
    // Try to load user data from localStorage first
    const currentUserJSON = localStorage.getItem('currentUser');
    
    if (currentUserJSON) {
        try {
            const currentUser = JSON.parse(currentUserJSON);
            console.log("Retrieved user data:", currentUser);
            
            // Check if required properties exist before using them
            const firstName = currentUser.firstName || "User";
            const lastName = currentUser.lastName || "";
            const fullName = `${firstName} ${lastName}`;
            const initials = firstName.charAt(0) + (lastName ? lastName.charAt(0) : "");
            
            // Verify tuition exists and is a number
            const tuition = typeof currentUser.tuition === 'number' ? currentUser.tuition : 50000; // Default to 50000 if not set
            
            console.log("Processed user data:", { firstName, lastName, fullName, initials, tuition });
            
            // Update user display elements
            const userInitialsEl = document.getElementById('userInitials');
            if (userInitialsEl) {
                userInitialsEl.textContent = initials;
                console.log("Updated userInitials:", initials);
            } else {
                console.error("Element with ID 'userInitials' not found");
            }
            
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = fullName;
                console.log("Updated userName:", fullName);
            } else {
                console.error("Element with ID 'userName' not found");
            }
            
            // Calculate payments for each exam period (divide tuition by 4)
            const paymentPerExam = tuition / 4;
            
            // Update the payment summary
            const totalFeesEl = document.getElementById('totalFees');
            if (totalFeesEl) {
                totalFeesEl.textContent = `₱${tuition.toLocaleString()}`;
                console.log("Updated totalFees:", tuition);
            } else {
                console.error("Element with ID 'totalFees' not found");
            }
            
            const paidAmountEl = document.getElementById('paidAmount');
            if (paidAmountEl) {
                paidAmountEl.textContent = `₱0`; // Assuming no payments yet
            }
            
            const balanceAmountEl = document.getElementById('balanceAmount');
            if (balanceAmountEl) {
                balanceAmountEl.textContent = `₱${tuition.toLocaleString()}`;
            }
            
            // Update event amounts in calendar data
            if (typeof calendarData !== 'undefined' && calendarData.months) {
                calendarData.months.forEach(month => {
                    if (month.events) {
                        month.events.forEach(event => {
                            event.amount = `₱${paymentPerExam.toLocaleString()}`;
                        });
                    }
                });
            }
            
            console.log("User data loaded successfully in schedule page");
        } catch (error) {
            console.error("Error processing user data:", error);
            // If error, use default values
            document.getElementById('userInitials').textContent = "JS";
            document.getElementById('userName').textContent = "John Smith";
        }
    } else {
        console.log("No user data found in localStorage, using default values");
        // You might want to redirect to login page or just use default values
        // window.location.href = "index.html";
    }
    
    // Generate calendar with first month
    if (typeof generateCalendar === 'function' && typeof currentMonthIndex !== 'undefined') {
        generateCalendar(currentMonthIndex);
    } else {
        console.error("Calendar functions not available");
    }
});