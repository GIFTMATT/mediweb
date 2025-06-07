// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components with mobile-friendly settings
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus', // Works for both touch and hover
            boundary: 'window' // Prevent overflow issues on mobile
        });
    });
    
    // Initialize modals with mobile-friendly settings
    const addContactModal = new bootstrap.Modal(document.getElementById('addContactModal'), {
        backdrop: 'static', // Prevent closing when clicking outside on mobile
        keyboard: false // Prevent closing with ESC key on mobile
    });
    
    const addDoctorModal = new bootstrap.Modal(document.getElementById('addDoctorModal'), {
        backdrop: 'static',
        keyboard: false
    });
    
    const documentViewerModal = new bootstrap.Modal(document.getElementById('documentViewerModal'), {
        backdrop: 'static',
        keyboard: false
    });

    // User data storage (in a real app, this would be server-side)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = null;
    let userData = JSON.parse(localStorage.getItem('userData')) || {};
    let currentViewingDocument = null;
    
    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const registerScreen = document.getElementById('registerScreen');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Mobile-specific adjustments
    if (isMobile) {
        // Adjust modal sizes for mobile
        document.querySelectorAll('.modal-dialog').forEach(modal => {
            if (!modal.classList.contains('modal-xl')) {
                modal.classList.add('modal-fullscreen-sm-down');
            }
        });
        
        // Increase tap targets for mobile
        document.querySelectorAll('button, a, input[type="submit"]').forEach(el => {
            el.style.minHeight = '44px'; // Apple's recommended minimum tap target size
        });
        
        // Adjust form inputs for mobile
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.style.fontSize = '16px'; // Prevent iOS zoom on focus
        });
    }
    
    // Profile Tab Elements
    const profileImage = document.getElementById('profileImage');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageUpload = document.getElementById('imageUpload');
    const personalInfoForm = document.getElementById('personalInfoForm');
    
    // Emergency Contacts Elements
    const emergencyContactsTable = document.getElementById('emergencyContactsTable').getElementsByTagName('tbody')[0];
    const addContactBtn = document.getElementById('addContactBtn');
    const contactForm = document.getElementById('contactForm');
    
    // Health Status Elements
    const healthStatusForm = document.getElementById('healthStatusForm');
    const healthStatusUpload = document.getElementById('healthStatusUpload');
    const uploadHealthDocBtn = document.getElementById('uploadHealthDocBtn');
    const healthStatusTable = document.getElementById('healthStatusTable').getElementsByTagName('tbody')[0];
    const healthStatusFilesPreview = document.getElementById('healthStatusFilesPreview');
    
    // Medical History Elements
    const medicalHistoryForm = document.getElementById('medicalHistoryForm');
    const medicalHistoryUpload = document.getElementById('medicalHistoryUpload');
    const uploadHistoryDocBtn = document.getElementById('uploadHistoryDocBtn');
    const medicalHistoryTable = document.getElementById('medicalHistoryTable').getElementsByTagName('tbody')[0];
    const medicalHistoryFilesPreview = document.getElementById('medicalHistoryFilesPreview');
    
    // Doctors Elements
    const doctorsTable = document.getElementById('doctorsTable').getElementsByTagName('tbody')[0];
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    const doctorForm = document.getElementById('doctorForm');
    
    // Reports Elements
    const medicalReportUpload = document.getElementById('medicalReportUpload');
    const uploadReportBtn = document.getElementById('uploadReportBtn');
    const reportsTable = document.getElementById('reportsTable').getElementsByTagName('tbody')[0];
    const reportsFilesPreview = document.getElementById('reportsFilesPreview');
    
    // Document Viewer Elements
    const modalDocumentViewer = document.getElementById('modalDocumentViewer');
    const documentViewerTitle = document.getElementById('documentViewerTitle');
    const downloadDocumentBtn = document.getElementById('downloadDocumentBtn');
    
    // Mobile-specific table adjustments
    function setupMobileTables() {
        if (!isMobile) return;
        
        const tables = [
            emergencyContactsTable.closest('table'),
            healthStatusTable.closest('table'),
            medicalHistoryTable.closest('table'),
            reportsTable.closest('table'),
            doctorsTable.closest('table')
        ];
        
        tables.forEach(table => {
            if (table) {
                table.classList.add('table-responsive');
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }
    
    // Mobile-friendly file upload handling
    function setupMobileFileUploads() {
        if (!isMobile) return;
        
        const fileInputs = [
            imageUpload,
            healthStatusUpload,
            medicalHistoryUpload,
            medicalReportUpload
        ];
        
        fileInputs.forEach(input => {
            if (input) {
                input.removeAttribute('multiple'); // Disable multiple on mobile for better UX
                input.setAttribute('capture', 'camera'); // Allow camera access on mobile
                input.setAttribute('accept', 'image/*'); // Default to images on mobile
            }
        });
    }
    
    // Initialize mobile-specific setups
    setupMobileTables();
    setupMobileFileUploads();
    
    // Toggle between login and register screens
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginScreen.style.display = 'none';
        registerScreen.style.display = 'block';
    });
    
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    });
    
    // Login form submission with mobile-friendly validation
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Mobile-friendly validation
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        // Find user in storage
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = username;
            
            // Initialize user data if it doesn't exist
            if (!userData[currentUser]) {
                userData[currentUser] = {
                    profile: {},
                    emergencyContacts: [],
                    doctors: [],
                    reports: [],
                    healthStatus: {
                        documents: []
                    },
                    medicalHistory: {
                        documents: []
                    }
                };
                saveUserData();
            }
            
            // Load user data and show app
            loadUserData();
            loginScreen.style.display = 'none';
            appContainer.style.display = 'block';
            
            // Mobile-specific adjustment after login
            if (isMobile) {
                document.querySelector('.navbar-toggler').click(); // Close mobile menu if open
                window.scrollTo(0, 0); // Scroll to top on mobile
            }
        } else {
            alert('Invalid username or password');
        }
    });
    
    // Register form submission with mobile-friendly validation
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const email = document.getElementById('regEmail').value;
        
        // Mobile-friendly validation
        if (!username || !password || !confirmPassword || !email) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Check if username already exists
        if (users.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        
        // Add new user
        users.push({ username, password, email });
        localStorage.setItem('users', JSON.stringify(users));
        
        // Initialize user data
        userData[username] = {
            profile: {},
            profileImage: [],
            emergencyContacts: [],
            reports: [],
            healthStatus: {
                documents: []
            },
            medicalHistory: {
                documents: []
            }
        };
        saveUserData();
        
        alert('Registration successful! Please login.');
        registerScreen.style.display = 'none';
        loginScreen.style.display = 'block';
        loginForm.reset();
    });
    
    // Logout button with mobile consideration
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        appContainer.style.display = 'none';
        loginScreen.style.display = 'block';
        loginForm.reset();
        
        if (isMobile) {
            window.scrollTo(0, 0); // Scroll to top on mobile after logout
        }
    });
    
    // Profile image upload with mobile camera support
    uploadImageBtn.addEventListener('click', function() {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
                userData[currentUser].profile.image = e.target.result;
                saveUserData();
                
                // Mobile-specific feedback
                if (isMobile) {
                    alert('Profile image updated successfully!');
                }
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Personal info form with mobile adjustments
    personalInfoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        userData[currentUser].profile = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            dob: document.getElementById('dob').value,
            bloodType: document.getElementById('bloodType').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            image: userData[currentUser].profile.image || profileImage.src
        };
        
        saveUserData();
        showMobileAlert('Personal information saved successfully!');
    });
    
    // Emergency contacts with mobile-friendly UI
    addContactBtn.addEventListener('click', function() {
        document.getElementById('contactForm').reset();
        delete contactForm.dataset.editIndex;
        addContactModal.show();
    });
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newContact = {
            name: document.getElementById('contactName').value,
            relationship: document.getElementById('contactRelationship').value,
            phone: document.getElementById('contactPhone').value,
            notes: document.getElementById('contactNotes').value
        };
        
        // Check if we're editing an existing contact
        if (contactForm.dataset.editIndex) {
            userData[currentUser].emergencyContacts[contactForm.dataset.editIndex] = newContact;
        } else {
            userData[currentUser].emergencyContacts.push(newContact);
        }
        
        saveUserData();
        renderEmergencyContacts();
        addContactModal.hide();
        contactForm.reset();
        delete contactForm.dataset.editIndex;
        
        showMobileAlert('Contact saved successfully!');
    });
    
    // Health status form
    healthStatusForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        userData[currentUser].healthStatus = {
            ...userData[currentUser].healthStatus,
            currentConditions: document.getElementById('currentConditions').value,
            currentMedications: document.getElementById('currentMedications').value,
            allergies: document.getElementById('allergies').value
        };
        
        saveUserData();
        showMobileAlert('Health status updated successfully!');
    });
    
    // Health status document upload with mobile support
    uploadHealthDocBtn.addEventListener('click', function() {
        const files = healthStatusUpload.files;
        const docType = document.getElementById('healthDocType').value;
        const docDate = document.getElementById('healthDocDate').value || new Date().toISOString().split('T')[0];
        
        if (files.length === 0) {
            alert('Please select a file to upload');
            return;
        }
        
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const newDoc = {
                id: Date.now(),
                date: docDate,
                type: docType,
                name: file.name,
                size: file.size,
                file: e.target.result,
                fileType: file.type
            };
            
            userData[currentUser].healthStatus.documents.push(newDoc);
            saveUserData();
            renderHealthStatusDocuments();
            healthStatusUpload.value = '';
            
            showMobileAlert('Health document uploaded successfully!');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Medical history form
    medicalHistoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        userData[currentUser].medicalHistory = {
            ...userData[currentUser].medicalHistory,
            pastSurgeries: document.getElementById('pastSurgeries').value,
            hospitalizations: document.getElementById('hospitalizations').value,
            familyHistory: document.getElementById('familyHistory').value
        };
        
        saveUserData();
        showMobileAlert('Medical history updated successfully!');
    });
    
    // Medical history document upload with mobile support
    uploadHistoryDocBtn.addEventListener('click', function() {
        const files = medicalHistoryUpload.files;
        const docType = document.getElementById('historyDocType').value;
        const docDate = document.getElementById('historyDocDate').value || new Date().toISOString().split('T')[0];
        
        if (files.length === 0) {
            alert('Please select a file to upload');
            return;
        }
        
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const newDoc = {
                id: Date.now(),
                date: docDate,
                type: docType,
                name: file.name,
                size: file.size,
                file: e.target.result,
                fileType: file.type
            };
            
            userData[currentUser].medicalHistory.documents.push(newDoc);
            saveUserData();
            renderMedicalHistoryDocuments();
            medicalHistoryUpload.value = '';
            
            showMobileAlert('Medical history document uploaded successfully!');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Doctors with mobile-friendly UI
    addDoctorBtn.addEventListener('click', function() {
        document.getElementById('doctorForm').reset();
        delete doctorForm.dataset.editIndex;
        addDoctorModal.show();
    });
    
    doctorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newDoctor = {
            name: document.getElementById('doctorName').value,
            specialty: document.getElementById('doctorSpecialty').value,
            phone: document.getElementById('doctorPhone').value,
            email: document.getElementById('doctorEmail').value,
            address: document.getElementById('doctorAddress').value
        };
        
        // Check if we're editing an existing doctor
        if (doctorForm.dataset.editIndex) {
            userData[currentUser].doctors[doctorForm.dataset.editIndex] = newDoctor;
        } else {
            userData[currentUser].doctors.push(newDoctor);
        }
        
        saveUserData();
        renderDoctors();
        addDoctorModal.hide();
        doctorForm.reset();
        delete doctorForm.dataset.editIndex;
        
        showMobileAlert('Healthcare provider saved successfully!');
    });
    
    // Medical reports with mobile support
    uploadReportBtn.addEventListener('click', function() {
        const files = medicalReportUpload.files;
        const reportType = document.getElementById('reportType').value;
        const reportDate = document.getElementById('reportDate').value || new Date().toISOString().split('T')[0];
        
        if (files.length === 0) {
            alert('Please select a file to upload');
            return;
        }
        
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const newReport = {
                id: Date.now(),
                date: reportDate,
                type: reportType,
                name: file.name,
                size: file.size,
                file: e.target.result,
                fileType: file.type
            };
            
            userData[currentUser].reports.push(newReport);
            saveUserData();
            renderReports();
            medicalReportUpload.value = '';
            
            showMobileAlert('Report uploaded successfully!');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Document viewer with mobile support
    downloadDocumentBtn.addEventListener('click', function() {
        if (currentViewingDocument) {
            const link = document.createElement('a');
            link.href = currentViewingDocument.file;
            link.download = currentViewingDocument.name;
            
            // Mobile-specific handling
            if (isMobile) {
                link.target = '_blank';
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                link.dispatchEvent(clickEvent);
            } else {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    });
    
    // Helper Functions
    
    function saveUserData() {
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    function loadUserData() {
        if (!currentUser || !userData[currentUser]) return;
        
        const data = userData[currentUser];
        
        // Load profile
        if (data.profile) {
            if (data.profile.image) profileImage.src = data.profile.image;
            document.getElementById('firstName').value = data.profile.firstName || '';
            document.getElementById('lastName').value = data.profile.lastName || '';
            document.getElementById('dob').value = data.profile.dob || '';
            document.getElementById('bloodType').value = data.profile.bloodType || '';
            document.getElementById('phone').value = data.profile.phone || '';
            document.getElementById('email').value = data.profile.email || '';
            document.getElementById('address').value = data.profile.address || '';
        }
        
        // Load health status
        if (data.healthStatus) {
            document.getElementById('currentConditions').value = data.healthStatus.currentConditions || '';
            document.getElementById('currentMedications').value = data.healthStatus.currentMedications || '';
            document.getElementById('allergies').value = data.healthStatus.allergies || '';
        }
        
        // Load medical history
        if (data.medicalHistory) {
            document.getElementById('pastSurgeries').value = data.medicalHistory.pastSurgeries || '';
            document.getElementById('hospitalizations').value = data.medicalHistory.hospitalizations || '';
            document.getElementById('familyHistory').value = data.medicalHistory.familyHistory || '';
        }
        
        // Render lists
        renderEmergencyContacts();
        renderDoctors();
        renderReports();
        renderHealthStatusDocuments();
        renderMedicalHistoryDocuments();
    }
    
    function renderEmergencyContacts() {
        emergencyContactsTable.innerHTML = '';
        
        if (!userData[currentUser]?.emergencyContacts) return;
        
        userData[currentUser].emergencyContacts.forEach((contact, index) => {
            const row = emergencyContactsTable.insertRow();
            
            // Mobile-friendly rendering
            if (isMobile) {
                row.innerHTML = `
                    <td>
                        <strong>${contact.name}</strong><br>
                        <small>${contact.relationship}</small><br>
                        <small>${contact.phone}</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary edit-contact" data-index="${index}">Edit</button>
                            <button class="btn btn-danger delete-contact" data-index="${index}">Delete</button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${contact.name}</td>
                    <td>${contact.relationship}</td>
                    <td>${contact.phone}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-contact" data-index="${index}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-contact" data-index="${index}">Delete</button>
                    </td>
                `;
            }
        });
        
        // Add event listeners to new buttons
        document.querySelectorAll('.edit-contact').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                editEmergencyContact(index);
            });
        });
        
        document.querySelectorAll('.delete-contact').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteEmergencyContact(index);
            });
        });
    }
    
    function editEmergencyContact(index) {
        const contact = userData[currentUser].emergencyContacts[index];
        
        document.getElementById('contactName').value = contact.name;
        document.getElementById('contactRelationship').value = contact.relationship;
        document.getElementById('contactPhone').value = contact.phone;
        document.getElementById('contactNotes').value = contact.notes || '';
        
        // Store the index in the form for reference when saving
        contactForm.dataset.editIndex = index;
        addContactModal.show();
    }
    
    function deleteEmergencyContact(index) {
        if (confirm('Are you sure you want to delete this contact?')) {
            userData[currentUser].emergencyContacts.splice(index, 1);
            saveUserData();
            renderEmergencyContacts();
        }
    }
    
    function renderDoctors() {
        doctorsTable.innerHTML = '';
        
        if (!userData[currentUser]?.doctors) return;
        
        userData[currentUser].doctors.forEach((doctor, index) => {
            const row = doctorsTable.insertRow();
            
            // Mobile-friendly rendering
            if (isMobile) {
                row.innerHTML = `
                    <td>
                        <strong>${doctor.name}</strong><br>
                        <small>${doctor.specialty}</small><br>
                        <small>${doctor.phone}</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary edit-doctor" data-index="${index}">Edit</button>
                            <button class="btn btn-danger delete-doctor" data-index="${index}">Delete</button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${doctor.name}</td>
                    <td>${doctor.specialty}</td>
                    <td>${doctor.phone}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-doctor" data-index="${index}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-doctor" data-index="${index}">Delete</button>
                    </td>
                `;
            }
        });
        
        // Add event listeners to new buttons
        document.querySelectorAll('.edit-doctor').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                editDoctor(index);
            });
        });
        
        document.querySelectorAll('.delete-doctor').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteDoctor(index);
            });
        });
    }
    
    function editDoctor(index) {
        const doctor = userData[currentUser].doctors[index];
        
        document.getElementById('doctorName').value = doctor.name;
        document.getElementById('doctorSpecialty').value = doctor.specialty;
        document.getElementById('doctorPhone').value = doctor.phone;
        document.getElementById('doctorEmail').value = doctor.email || '';
        document.getElementById('doctorAddress').value = doctor.address || '';
        
        // Store the index in the form for reference when saving
        doctorForm.dataset.editIndex = index;
        addDoctorModal.show();
    }
    
    function deleteDoctor(index) {
        if (confirm('Are you sure you want to delete this doctor?')) {
            userData[currentUser].doctors.splice(index, 1);
            saveUserData();
            renderDoctors();
        }
    }
    
    function renderReports() {
        reportsTable.innerHTML = '';
        reportsFilesPreview.innerHTML = '';
        
        if (!userData[currentUser]?.reports) return;
        
        // Sort reports by date (newest first)
        const sortedReports = [...userData[currentUser].reports].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedReports.forEach((report, index) => {
            const originalIndex = userData[currentUser].reports.findIndex(r => r.id === report.id);
            const row = reportsTable.insertRow();
            
            // Mobile-friendly rendering
            if (isMobile) {
                row.innerHTML = `
                    <td>
                        <strong>${report.date}</strong><br>
                        <small>${report.type}</small><br>
                        <small>${report.name} (${formatFileSize(report.size)})</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary view-report" data-index="${originalIndex}">View</button>
                            <button class="btn btn-danger delete-report" data-index="${originalIndex}">Delete</button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${report.date}</td>
                    <td>${report.type}</td>
                    <td>${report.name} (${formatFileSize(report.size)})</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-report" data-index="${originalIndex}">View</button>
                        <button class="btn btn-sm btn-danger delete-report" data-index="${originalIndex}">Delete</button>
                    </td>
                `;
            }

            // Create file preview
            if (report.fileType.startsWith('image/')) {
                const preview = document.createElement('img');
                preview.src = report.file;
                preview.className = 'file-preview';
                preview.setAttribute('data-index', originalIndex);
                preview.addEventListener('click', function() {
                    viewReport(this.getAttribute('data-index'));
                });
                reportsFilesPreview.appendChild(preview);
            }
        });
        
        // Add event listeners to new buttons
        document.querySelectorAll('.view-report').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                viewReport(index);
            });
        });
        
        document.querySelectorAll('.delete-report').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteReport(index);
            });
        });
    }
    
    function renderHealthStatusDocuments() {
        healthStatusTable.innerHTML = '';
        healthStatusFilesPreview.innerHTML = '';
        
        if (!userData[currentUser]?.healthStatus?.documents) return;
        
        // Sort documents by date (newest first)
        const sortedDocs = [...userData[currentUser].healthStatus.documents].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedDocs.forEach((doc, index) => {
            const originalIndex = userData[currentUser].healthStatus.documents.findIndex(d => d.id === doc.id);
            const row = healthStatusTable.insertRow();
            
            // Mobile-friendly rendering
            if (isMobile) {
                row.innerHTML = `
                    <td>
                        <strong>${doc.date}</strong><br>
                        <small>${doc.type}</small><br>
                        <small>${doc.name} (${formatFileSize(doc.size)})</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary view-health-doc" data-index="${originalIndex}">View</button>
                            <button class="btn btn-danger delete-health-doc" data-index="${originalIndex}">Delete</button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${doc.date}</td>
                    <td>${doc.type}</td>
                    <td>${doc.name} (${formatFileSize(doc.size)})</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-health-doc" data-index="${originalIndex}">View</button>
                        <button class="btn btn-sm btn-danger delete-health-doc" data-index="${originalIndex}">Delete</button>
                    </td>
                `;
            }

            // Create file preview
            if (doc.fileType.startsWith('image/')) {
                const preview = document.createElement('img');
                preview.src = doc.file;
                preview.className = 'file-preview';
                preview.setAttribute('data-index', originalIndex);
                preview.addEventListener('click', function() {
                    viewHealthDocument(this.getAttribute('data-index'));
                });
                healthStatusFilesPreview.appendChild(preview);
            }
        });
        
        // Add event listeners to new buttons
        document.querySelectorAll('.view-health-doc').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                viewHealthDocument(index);
            });
        });
        
        document.querySelectorAll('.delete-health-doc').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteHealthDocument(index);
            });
        });
    }
    
    function renderMedicalHistoryDocuments() {
        medicalHistoryTable.innerHTML = '';
        medicalHistoryFilesPreview.innerHTML = '';
        
        if (!userData[currentUser]?.medicalHistory?.documents) return;
        
        // Sort documents by date (newest first)
        const sortedDocs = [...userData[currentUser].medicalHistory.documents].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedDocs.forEach((doc, index) => {
            const originalIndex = userData[currentUser].medicalHistory.documents.findIndex(d => d.id === doc.id);
            const row = medicalHistoryTable.insertRow();
            
            // Mobile-friendly rendering
            if (isMobile) {
                row.innerHTML = `
                    <td>
                        <strong>${doc.date}</strong><br>
                        <small>${doc.type}</small><br>
                        <small>${doc.name} (${formatFileSize(doc.size)})</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary view-history-doc" data-index="${originalIndex}">View</button>
                            <button class="btn btn-danger delete-history-doc" data-index="${originalIndex}">Delete</button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${doc.date}</td>
                    <td>${doc.type}</td>
                    <td>${doc.name} (${formatFileSize(doc.size)})</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-history-doc" data-index="${originalIndex}">View</button>
                        <button class="btn btn-sm btn-danger delete-history-doc" data-index="${originalIndex}">Delete</button>
                    </td>
                `;
            }

            // Create file preview
            if (doc.fileType.startsWith('image/')) {
                const preview = document.createElement('img');
                preview.src = doc.file;
                preview.className = 'file-preview';
                preview.setAttribute('data-index', originalIndex);
                preview.addEventListener('click', function() {
                    viewMedicalHistoryDocument(this.getAttribute('data-index'));
                });
                medicalHistoryFilesPreview.appendChild(preview);
            }
        });
        
        // Add event listeners to new buttons
        document.querySelectorAll('.view-history-doc').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                viewMedicalHistoryDocument(index);
            });
        });
        
        document.querySelectorAll('.delete-history-doc').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteMedicalHistoryDocument(index);
            });
        });
    }
    
    function viewReport(index) {
        const report = userData[currentUser].reports[index];
        currentViewingDocument = report;
        
        documentViewerTitle.textContent = `Viewing: ${report.name}`;
        modalDocumentViewer.src = report.file;
        documentViewerModal.show();
    }
    
    function viewHealthDocument(index) {
        const doc = userData[currentUser].healthStatus.documents[index];
        currentViewingDocument = doc;
        
        documentViewerTitle.textContent = `Viewing: ${doc.name}`;
        modalDocumentViewer.src = doc.file;
        documentViewerModal.show();
    }
    
    function viewMedicalHistoryDocument(index) {
        const doc = userData[currentUser].medicalHistory.documents[index];
        currentViewingDocument = doc;
        
        documentViewerTitle.textContent = `Viewing: ${doc.name}`;
        modalDocumentViewer.src = doc.file;
        documentViewerModal.show();
    }
    
    function deleteReport(index) {
        if (confirm('Are you sure you want to delete this report?')) {
            userData[currentUser].reports.splice(index, 1);
            saveUserData();
            renderReports();
        }
    }
    
    function deleteHealthDocument(index) {
        if (confirm('Are you sure you want to delete this health document?')) {
            userData[currentUser].healthStatus.documents.splice(index, 1);
            saveUserData();
            renderHealthStatusDocuments();
        }
    }
    
    function deleteMedicalHistoryDocument(index) {
        if (confirm('Are you sure you want to delete this medical history document?')) {
            userData[currentUser].medicalHistory.documents.splice(index, 1);
            saveUserData();
            renderMedicalHistoryDocuments();
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Mobile-friendly alert/notification
    function showMobileAlert(message) {
        if (isMobile) {
            // Create a mobile-friendly toast notification
            const toast = document.createElement('div');
            toast.className = 'mobile-toast';
            toast.textContent = message;
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '5px';
            toast.style.zIndex = '9999';
            toast.style.maxWidth = '90%';
            toast.style.textAlign = 'center';
            toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 500);
            }, 3000);
        } else {
            alert(message);
        }
    }
    
    // Initialize the app
    if (currentUser) {
        loginScreen.style.display = 'none';
        appContainer.style.display = 'block';
        loadUserData();
    } else {
        loginScreen.style.display = 'block';
        appContainer.style.display = 'none';
    }
    
    // Mobile-specific event listeners
    if (isMobile) {
        // Prevent zooming on input focus
        document.addEventListener('focusin', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                window.setTimeout(function() {
                    document.activeElement.scrollIntoViewIfNeeded(true);
                }, 100);
            }
        });
        
        // Handle virtual keyboard appearance
        window.addEventListener('resize', function() {
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
});