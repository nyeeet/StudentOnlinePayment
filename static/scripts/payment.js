// // payments.js - Connected version that integrates all functionality
// document.addEventListener('DOMContentLoaded', function() {
//     const currentUserJSON = localStorage.getItem('currentUser');
//     if (!currentUserJSON) {
//         alert("No user session found. Please log in.");
//         window.location.href = "index.html";
//         return;
//     }
    
//     // Parse user data
//     const currentUser = JSON.parse(currentUserJSON);
    
//     // Setup user profile display
//     setupUserProfile(currentUser);
    
//     // Check if exam was selected from calendar or load full tuition data
//     const selectedExam = localStorage.getItem('selectedExam');
//     const selectedExamAmount = localStorage.getItem('selectedExamAmount');
    
//     if (selectedExam) {
//         // Pass both exam type and amount if available
//         setupExamPayment(selectedExam, currentUser, selectedExamAmount);
//     } else {
//         setupFullTuitionPayment(currentUser);
//     }
    
//     // Setup navigation and payment method selection
//     setupNavigation();
//     setupPaymentMethodSelection();

//     // Update exam statuses
//     updateExamStatusFromStorage();

//     console.log("Payment script loaded successfully with student course:", currentUser.course);
// });

// /**
//  * Sets up user profile display with user data
//  */
// function setupUserProfile(currentUser) {
//     const firstName = currentUser.firstName || 'Student';
//     const lastName = currentUser.lastName || 'User';
//     const fullName = `${firstName} ${lastName}`;
//     const initials = firstName.charAt(0) + lastName.charAt(0);
    
//     // Set user name and initials in header
//     document.getElementById('userName').textContent = fullName;
//     document.getElementById('userInitials').textContent = initials;
    
//     console.log("User profile loaded successfully:", { fullName, course: currentUser.course });
// }

// /**
//  * Calculate exam fee based on tuition
//  * Each exam fee is calculated as a percentage of the total tuition
//  * This is used as a fallback if no specific amount is provided
//  */
// function calculateExamFee(tuition) {
//     return Math.round(tuition / 8);
// }

// /**
//  * Sets up payment for a specific exam
//  * @param {string} selectedExam - The type of exam (prelim, midterm, etc.)
//  * @param {object} currentUser - The current user data
//  * @param {string|null} selectedExamAmount - The amount from the calendar event (if available)
//  */
// function setupExamPayment(selectedExam, currentUser, selectedExamAmount) {
//     // Clear localStorage after reading it
//     localStorage.removeItem('selectedExam');
//     localStorage.removeItem('selectedExamAmount');
    
//     // Calculate exam fee based on the student's tuition
//     const tuition = currentUser.tuition || 20000; // Default to 20000 if not set
    
//     // Use the amount from calendar if available, otherwise calculate based on tuition
//     let examFee;
//     if (selectedExamAmount) {
//         // Parse the amount from the calendar (convert string to number)
//         examFee = parseFloat(selectedExamAmount.replace(/[^0-9.]/g, ''));
//         console.log(`Using exam fee from calendar: ${examFee}`);
//     } else {
//         // Fallback to calculated value
//         examFee = calculateExamFee(tuition);
//         console.log(`Using calculated exam fee: ${examFee}`);
//     }
    
//     // Set exam title and date based on selected exam
//     let examTitle = '';
//     let examDate = '';
    
//     switch (selectedExam) {
//         case 'prelim':
//             examTitle = 'Prelim Examination Fee';
//             examDate = 'January 15, 2025';
//             break;
//         case 'midterm':
//             examTitle = 'Midterm Examination Fee';
//             examDate = 'February 15, 2025';
//             break;
//         case 'prefinal':
//             examTitle = 'Pre-Final Examination Fee';
//             examDate = 'April 15, 2025';
//             break;
//         case 'final':
//             examTitle = 'Final Examination Fee';
//             examDate = 'May 15, 2025';
//             break;
//         default:
//             examTitle = 'Examination Fee';
//             examDate = 'Due Date';
//     }
    
//     // Update page title with exam name
//     const pageTitles = document.querySelectorAll('.card-title');
//     pageTitles.forEach(title => {
//         if (title.textContent.includes('Spring Semester') || title.textContent.includes('Payment Details')) {
//             // Update the card title with SVG icon and semester info
//             title.innerHTML = `
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                     <line x1="16" y1="2" x2="16" y2="6"></line>
//                     <line x1="8" y1="2" x2="8" y2="6"></line>
//                     <line x1="3" y1="10" x2="21" y2="10"></line>
//                 </svg>
//                 ${examTitle} - Due ${examDate}
//             `;
//         }
//     });
    
//     // Update payment details
//     updatePaymentSummary(examFee);
    
//     console.log(`Loaded ${examTitle} payment details for ${formatCurrency(examFee)}`);
// }

// /**
//  * Sets up payment for full tuition
//  */
// function setupFullTuitionPayment(currentUser) {
//     // Get the actual tuition from the user data
//     const tuition = currentUser.tuition || 20000; // Default if not set
    
//     // Update payment summary
//     updatePaymentSummary(tuition);
    
//     console.log("Full tuition payment setup successfully:", { tuition });
// }

// /**
//  * Updates payment summary tables with fee breakdown
//  */
// function updatePaymentSummary(totalAmount) {
//     // Calculate fee breakdown based on percentages of the total amount
//     const tuitionFee = Math.round(totalAmount * 0.875);   // Main tuition component (87.5%)
//     const technologyFee = Math.round(totalAmount * 0.06);  // Technology fee (6%)
//     const libraryFee = Math.round(totalAmount * 0.025);    // Library fee (2.5%)
//     const activityFee = Math.round(totalAmount * 0.04);    // Student activity fee (4%)
    
//     // Update payment summary tables
//     const paymentSummaryTables = document.querySelectorAll('.payment-summary');
//     paymentSummaryTables.forEach(table => {
//         const rows = table.querySelectorAll('tbody tr');
        
//         // Update tuition fee
//         if (rows[0]) {
//             const amountCell = rows[0].querySelector('td:last-child');
//             if (amountCell) amountCell.textContent = formatCurrency(tuitionFee);
//         }
        
//         // Update technology fee
//         if (rows[1]) {
//             const amountCell = rows[1].querySelector('td:last-child');
//             if (amountCell) amountCell.textContent = formatCurrency(technologyFee);
//         }
        
//         // Update library fee
//         if (rows[2]) {
//             const amountCell = rows[2].querySelector('td:last-child');
//             if (amountCell) amountCell.textContent = formatCurrency(libraryFee);
//         }
        
//         // Update activity fee
//         if (rows[3]) {
//             const amountCell = rows[3].querySelector('td:last-child');
//             if (amountCell) amountCell.textContent = formatCurrency(activityFee);
//         }
        
//         // Update total amount in footer
//         const footerRow = table.querySelector('tfoot tr');
//         if (footerRow) {
//             const totalCell = footerRow.querySelector('td:last-child');
//             if (totalCell) totalCell.textContent = formatCurrency(totalAmount);
//         }
//     });
// }

// /**
//  * Format currency with ₱ symbol and thousands separator
//  */
// function formatCurrency(amount) {
//     return `₱${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
// }

// /**
//  * Sets up step navigation between payment screens
//  */
// function setupNavigation() {
//     // Step elements
//     const step1 = document.getElementById('step1');
//     const step2 = document.getElementById('step2');
//     const step3 = document.getElementById('step3');
    
//     // Content sections
//     const step1Content = document.getElementById('step1-content');
//     const step2Content = document.getElementById('step2-content');
//     const step3Content = document.getElementById('step3-content');
//     const successContent = document.getElementById('success-content');
    
//     // Navigation buttons
//     const proceedToPaymentMethod = document.getElementById('proceed-to-payment-method');
//     const backToDetails = document.getElementById('back-to-details');
//     const proceedToConfirmation = document.getElementById('proceed-to-confirmation');
//     const backToPaymentMethod = document.getElementById('back-to-payment-method');
//     const confirmPayment = document.getElementById('confirm-payment');
//     const backToDashboard = document.getElementById('back-to-dashboard');
    
//     // Step 1 -> Step 2
//     if (proceedToPaymentMethod) {
//         proceedToPaymentMethod.addEventListener('click', function() {
//             step1Content.style.display = 'none';
//             step2Content.style.display = 'block';
            
//             step1.classList.remove('active');
//             step1.classList.add('completed');
//             step2.classList.add('active');
            
//             // Update step-line for step 1
//             const step1Line = step1.querySelector('.step-line');
//             if (step1Line) {
//                 step1Line.style.backgroundColor = 'var(--success)';
//             }
//         });
//     }
    
//     if (backToDetails) {
//         backToDetails.addEventListener('click', function() {
//             step2Content.style.display = 'none';
//             step1Content.style.display = 'block';
            
//             step2.classList.remove('active');
//             step1.classList.remove('completed');
//             step1.classList.add('active');
            
//             // Reset step-line for step 1
//             const step1Line = step1.querySelector('.step-line');
//             if (step1Line) {
//                 step1Line.style.backgroundColor = '';
//             }
//         });
//     }
    
//     // Step 2 -> Step 3
//     if (proceedToConfirmation) {
//         proceedToConfirmation.addEventListener('click', function() {
//             // Form validation
//             if (!validatePaymentForm()) {
//                 alert("Please fill in all required fields correctly.");
//                 return;
//             }
            
//             // Update confirmation details based on selected payment method
//             updateConfirmationDetails();
            
//             step2Content.style.display = 'none';
//             step3Content.style.display = 'block';
            
//             step2.classList.remove('active');
//             step2.classList.add('completed');
//             step3.classList.add('active');
            
//             // Update step-line for step 2
//             const step2Line = step2.querySelector('.step-line');
//             if (step2Line) {
//                 step2Line.style.backgroundColor = 'var(--success)';
//             }
//         });
//     }
    
//     // Step 3 -> Step 2
//     if (backToPaymentMethod) {
//         backToPaymentMethod.addEventListener('click', function() {
//             step3Content.style.display = 'none';
//             step2Content.style.display = 'block';
            
//             step3.classList.remove('active');
//             step2.classList.remove('completed');
//             step2.classList.add('active');
            
//             // Reset step-line for step 2
//             const step2Line = step2.querySelector('.step-line');
//             if (step2Line) {
//                 step2Line.style.backgroundColor = '';
//             }
//         });
//     }
    
//     // Complete payment
//     if (confirmPayment) {
//         confirmPayment.addEventListener('click', function() {
//             // Get total amount from the table
//             const totalCell = document.querySelector('.payment-summary tfoot td:last-child');
//             const totalAmountText = totalCell ? totalCell.textContent : '₱0.00';
//             const totalAmount = parseFloat(totalAmountText.replace(/[^0-9.]/g, '')) || 0;

//             // Determine which exam is being paid
//             const cardTitle = document.querySelector('.card-title');
//             const titleText = cardTitle ? cardTitle.textContent : '';
//             let examType = null;
            
//             if (titleText.includes('Prelim')) examType = 'prelim';
//             else if (titleText.includes('Midterm')) examType = 'midterm';
//             else if (titleText.includes('Pre-Final')) examType = 'prefinal';
//             else if (titleText.includes('Final')) examType = 'final';
            
//             step3Content.style.display = 'none';
//             successContent.style.display = 'block';
            
//             step3.classList.remove('active');
//             step3.classList.add('completed');
            
//             // Update success message with correct amount
//             const successMessage = document.querySelector('.confirmation-message p:first-of-type');
//             if (successMessage) {
//                 successMessage.textContent = `Your payment of ${formatCurrency(totalAmount)} has been processed successfully.`;
//             }
            
//             // Store payment information in localStorage
//             savePaymentData(totalAmount, examType);
//         });
//     }
    
//     // Return to dashboard
//     if (backToDashboard) {
//         backToDashboard.addEventListener('click', function() {
//             window.location.href = 'UIhomepage.html';
//         });
//     }
// }

// /**
//  * Validates the payment form based on the selected method
//  */
// function validatePaymentForm() {
//     const selectedForm = document.querySelector(`.payment-form:not([style*="display: none"])`);
//     if (!selectedForm) return true;
    
//     // Check each required field in the visible form
//     const requiredFields = selectedForm.querySelectorAll('[required]');
//     for (let field of requiredFields) {
//         if (!field.value.trim()) {
//             field.focus();
//             return false;
//         }
        
//         // Credit card specific validations
//         if (field.id === 'cardNumber' && !/^\d{13,19}$/.test(field.value.replace(/\D/g, ''))) {
//             field.focus();
//             return false;
//         }
        
//         if (field.id === 'expiryDate' && !/^\d{2}\/\d{2}$/.test(field.value)) {
//             field.focus();
//             return false;
//         }
        
//         if (field.id === 'cvv' && !/^\d{3,4}$/.test(field.value)) {
//             field.focus();
//             return false;
//         }
        
//         // Email validation for digital wallet
//         if (field.id === 'walletEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
//             field.focus();
//             return false;
//         }
//     }
    
//     return true;
// }

// /**
//  * Sets up payment method selection and form display
//  */
// function setupPaymentMethodSelection() {
//     const paymentMethods = document.querySelectorAll('.payment-method');
//     window.selectedPaymentMethod = 'credit-card';
    
//     paymentMethods.forEach(method => {
//         method.addEventListener('click', function() {
//             // Remove active class from all payment methods
//             paymentMethods.forEach(m => m.classList.remove('active'));
            
//             // Add active class to clicked payment method
//             this.classList.add('active');
            
//             // Update selected payment method
//             window.selectedPaymentMethod = this.getAttribute('data-method');
        
//             // Hide all payment forms
//             document.querySelectorAll('.payment-form').forEach(form => {
//                 form.style.display = 'none';
//             });
        
//             // Show selected payment form
//             document.getElementById(`${window.selectedPaymentMethod}-form`).style.display = 'block';
//         });
//     });
    
//     // Add input formatting
//     setupInputFormatting();
// }

// /**
//  * Set up formatting for payment form inputs
//  */
// function setupInputFormatting() {
//     // Format credit card number with spaces
//     const cardNumberInput = document.getElementById('cardNumber');
//     if (cardNumberInput) {
//         cardNumberInput.addEventListener('input', function(e) {
//             let value = e.target.value.replace(/\D/g, '');
//             if (value.length > 16) value = value.substr(0, 16);
            
//             // Add spaces after every 4 digits
//             let formattedValue = '';
//             for (let i = 0; i < value.length; i++) {
//                 if (i > 0 && i % 4 === 0) formattedValue += ' ';
//                 formattedValue += value[i];
//             }
            
//             e.target.value = formattedValue;
//         });
//     }
    
//     // Format expiry date
//     const expiryDateInput = document.getElementById('expiryDate');
//     if (expiryDateInput) {
//         expiryDateInput.addEventListener('input', function(e) {
//             let value = e.target.value.replace(/\D/g, '');
//             if (value.length > 4) value = value.substr(0, 4);
            
//             if (value.length > 2) {
//                 e.target.value = value.substr(0, 2) + '/' + value.substr(2);
//             } else {
//                 e.target.value = value;
//             }
//         });
//     }
    
//     // Format CVV to only allow numbers
//     const cvvInput = document.getElementById('cvv');
//     if (cvvInput) {
//         cvvInput.addEventListener('input', function(e) {
//             let value = e.target.value.replace(/\D/g, '');
//             if (value.length > 4) value = value.substr(0, 4);
//             e.target.value = value;
//         });
//     }
    
//     // Format school ID
//     const schoolIdInput = document.getElementById('schoolID');
//     if (schoolIdInput) {
//         schoolIdInput.addEventListener('input', function(e) {
//             let value = e.target.value.replace(/\D/g, '');
//             if (value.length > 9) value = value.substr(0, 9);
            
//             // Format as XXX-XXX-XXX
//             if (value.length > 6) {
//                 e.target.value = value.substr(0, 3) + '-' + value.substr(3, 3) + '-' + value.substr(6);
//             } else if (value.length > 3) {
//                 e.target.value = value.substr(0, 3) + '-' + value.substr(3);
//             } else {
//                 e.target.value = value;
//             }
//         });
//     }
// }

// /**
//  * Update confirmation details based on selected payment method
//  */
// function updateConfirmationDetails() {
//     const confirmationDetails = document.getElementById('confirmation-method-details');
    
//     if (window.selectedPaymentMethod === 'credit-card') {
//         const cardName = document.getElementById('cardName').value || 'John Smith';
//         const cardNumber = document.getElementById('cardNumber').value || '**** **** **** 3456';
        
//         confirmationDetails.innerHTML = `
//             <p><strong>Payment Method:</strong> Credit Card</p>
//             <p><strong>Name on Card:</strong> ${cardName}</p>
//             <p><strong>Card Number:</strong> ${formatCardNumber(cardNumber)}</p>
//         `;
//     } else if (window.selectedPaymentMethod === 'bank-transfer') {
//         const accountName = document.getElementById('accountName').value || 'Full Name';
//         const accountNumber = document.getElementById('accountNumber').value || '1234-5678-9';
//         const bankName = document.getElementById('bankName').value || 'Bank of America';
        
//         confirmationDetails.innerHTML = `
//             <p><strong>Payment Method:</strong> Bank Transfer</p>
//             <p><strong>Account Holder:</strong> ${accountName}</p>
//             <p><strong>Account Number:</strong> ${maskAccountNumber(accountNumber)}</p>
//             <p><strong>Bank:</strong> ${bankName}</p>
//         `;
//     } else if (window.selectedPaymentMethod === 'digital-wallet') {
//         const walletEmail = document.getElementById('walletEmail').value || 'user@example.com';
//         const studentName = document.getElementById('studentName').value || 'Full Name';
//         const schoolID = document.getElementById('schoolID').value || '123-456-789';
//         const walletType = document.getElementById('walletType').value || 'PayPal';
        
//         confirmationDetails.innerHTML = `
//             <p><strong>School ID:</strong> ${schoolID}</p>
//             <p><strong>Payment Method:</strong> Digital Wallet (${walletType})</p>
//             <p><strong>Student Name:</strong> ${studentName}</p>
//             <p><strong>Email:</strong> ${maskEmail(walletEmail)}</p>
//         `;
//     }
// }

// /**
//  * Update exam statuses from localStorage
//  */
// function updateExamStatusFromStorage() {
//     // Get exam statuses from localStorage
//     const examStatuses = JSON.parse(localStorage.getItem('examStatuses') || '{}');
    
//     // Update calendar data with paid statuses
//     if (window.calendarData && window.calendarData.months) {
//         window.calendarData.months.forEach(month => {
//             month.events.forEach(event => {
//                 let examType = null;
                
//                 if (event.name.includes('Prelim')) examType = 'prelim';
//                 else if (event.name.includes('Midterm')) examType = 'midterm';
//                 else if (event.name.includes('Pre-Final')) examType = 'prefinal';
//                 else if (event.name.includes('Final')) examType = 'final';
                
//                 if (examType && examStatuses[examType] === 'paid') {
//                     event.status = 'Paid';
//                     event.type = 'paid';
//                 }
//             });
//         });
//     }
// }

// // Helper function to mask/format account numbers for privacy
// function maskAccountNumber(accountNum) {
//     if (accountNum.length <= 4) return accountNum;
//     return '*****' + accountNum.slice(-4);
// }

// // Helper function to mask email addresses for privacy
// function maskEmail(email) {
//     if (!email.includes('@')) return email;
//     const parts = email.split('@');
//     if (parts[0].length <= 2) return email;
//     return parts[0].substring(0, 2) + '***@' + parts[1];
// }

// // Helper function to format credit card numbers
// function formatCardNumber(cardNum) {
//     // Remove non-digits
//     const cleaned = cardNum.replace(/\D/g, '');
//     if (cleaned.length <= 4) return cleaned;
    
//     // Show only last 4 digits
//     return '**** **** **** ' + cleaned.slice(-4);
// }

// /**
//  * Save payment data to localStorage
//  */
// function savePaymentData(totalAmount, examType) {
//     // Default payment method detail
//     let paymentMethodDetail = 'Credit Card';
    
//     if (window.selectedPaymentMethod === 'digital-wallet') {
//         const walletType = document.getElementById('walletType').value || 'PayPal';
//         paymentMethodDetail = walletType;
//     } else if (window.selectedPaymentMethod === 'bank-transfer') {
//         const bankName = document.getElementById('bankName').value || 'Bank';
//         paymentMethodDetail = bankName;
//     }
    
//     // Get current date
//     const now = new Date();
//     const paymentDate = now.toISOString();

//     // Create payment info object
//     const paymentInfo = {
//         amount: totalAmount,
//         date: paymentDate,
//         method: window.selectedPaymentMethod,
//         methodDetail: paymentMethodDetail,
//         status: 'Completed',
//         description: examType ? `${examType.charAt(0).toUpperCase() + examType.slice(1)} Examination Fee` : 'Tuition Payment',
//         examType: examType
//     };
    
//     // Get existing payments or create new array
//     const payments = JSON.parse(localStorage.getItem('payments') || '[]');
//     payments.push(paymentInfo);
//     localStorage.setItem('payments', JSON.stringify(payments));
    
//     // Update payment summary data in localStorage
//     updatePaymentSummaryData(examType);
    
//     console.log('Payment saved:', paymentInfo);
// }

// /**
//  * Update payment summary data in localStorage
//  */
// function updatePaymentSummaryData(examType) {
//     // Get current user and their tuition
//     const currentUserJSON = localStorage.getItem('currentUser');
//     if (!currentUserJSON) return;
    
//     const currentUser = JSON.parse(currentUserJSON);
//     const tuition = currentUser.tuition || 20000; // Use actual tuition from user data
    
//     // Get all payments
//     const payments = JSON.parse(localStorage.getItem('payments') || '[]');
//     const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
//     // Add the initial downpayment of 5% of tuition to the calculated amount
//     const downpaymentPercentage = 0.05; // 5% of tuition
//     const downpayment = Math.round(tuition * downpaymentPercentage);
//     const finalTotalPaid = totalPaid + downpayment; 
    
//     // Calculate remaining balance
//     const balance = tuition - finalTotalPaid;
    
//     // Create payment summary object with updated values
//     const paymentSummary = {
//         totalFees: tuition,
//         paid: finalTotalPaid,
//         balance: balance,
//         lastUpdated: new Date().toISOString()
//     };
    
//     // Update exam status if applicable
//     if (examType) {
//         // Get existing exam statuses or create new
//         const examStatuses = JSON.parse(localStorage.getItem('examStatuses') || '{}');
//         examStatuses[examType] = 'paid';
//         localStorage.setItem('examStatuses', JSON.stringify(examStatuses));
//     }
    
//     // Save payment summary
//     localStorage.setItem('paymentSummary', JSON.stringify(paymentSummary));
    
//     console.log('Payment summary updated:', paymentSummary);
// }