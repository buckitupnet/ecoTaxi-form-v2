// Main Application
import { I18n } from './i18n.js';
import { Vault } from './vault.js';
import { EcoTaxiAPI } from './ecoTaxiAPI.js';
import { MondayAPI } from './mondayAPI.js';

class App {
    constructor() {
        this.i18n = new I18n();
        this.vault = new Vault();
        this.ecoTaxiAPI = new EcoTaxiAPI(this.vault);
        this.mondayAPI = new MondayAPI();
        
        this.form = document.getElementById('orderForm');
        this.fileInput = document.querySelector('input[name="files"]');
        this.filePreview = document.getElementById('filePreview');
        this.selectedFiles = [];
    }

    async init() {
        console.log('🚀 Initializing Form v2.0...');
        
        // Initialize i18n
        this.i18n.init();
        
        // Initialize vault
        await this.vault.initialize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI based on auth state
        this.updateAuthUI();
        
        console.log('✅ App initialized');
    }

    setupEventListeners() {
        // Language selector
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.i18n.setLocale(e.target.value);
        });

        // Login/Logout buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        
        // Orders history
        document.getElementById('ordersBtn')?.addEventListener('click', () => this.showOrders());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());

        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleLogin() {
        try {
            this.showMessage('Authenticating...', 'info');
            
            await this.vault.login();
            
            this.updateAuthUI();
            this.showMessage('Login successful!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    handleLogout() {
        this.vault.logout();
        this.updateAuthUI();
        this.showMessage('Logged out successfully', 'info');
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const welcomeMsg = document.getElementById('welcomeMsg');
        const userName = document.getElementById('userName');

        if (this.vault.isAuthenticated) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            welcomeMsg.classList.remove('hidden');
            userName.textContent = this.vault.userData?.userName || 'User';
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            welcomeMsg.classList.add('hidden');
        }
    }

    handleFileSelect(e) {
        this.selectedFiles = Array.from(e.target.files);
        this.updateFilePreview();
    }

    updateFilePreview() {
        this.filePreview.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'relative border rounded p-2';
            
            // Create thumbnail if image
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'w-full h-24 object-cover rounded';
                img.src = URL.createObjectURL(file);
                div.appendChild(img);
            }
            
            // File name
            const name = document.createElement('p');
            name.className = 'text-xs mt-1 truncate';
            name.textContent = file.name;
            div.appendChild(name);
            
            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => {
                this.selectedFiles.splice(index, 1);
                this.updateFilePreview();
            };
            div.appendChild(removeBtn);
            
            this.filePreview.appendChild(div);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        console.log('📝 Form submitted');
        
        // Validate
        if (!this.validateForm()) {
            return;
        }

        // Check if user is logged in
        if (!this.vault.isAuthenticated) {
            this.showError('Please login first to submit the order');
            return;
        }

        try {
            // Disable submit button
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            const formData = new FormData(this.form);
            
            // Get selected dates
            const selectedDates = Array.from(document.querySelectorAll('input[name="date"]:checked'))
                .map(cb => cb.nextElementSibling?.textContent || cb.value);
            
            // Generate order text
            const orderText = this.mondayAPI.generateText(formData, selectedDates);
            
            // Step 0: Register user if first submission (matching original flow)
            const isFirstSubmission = !localStorage.getItem('eco-taxi-registered');
            if (isFirstSubmission) {
                const userName = formData.get('name') || 'User';
                console.log('🆕 First submission - registering user...');
                await this.ecoTaxiAPI.registerUser(userName);
                localStorage.setItem('eco-taxi-registered', 'true');
                console.log('✅ User registered');
            }
            
            // Step 1: Upload files if any
            if (this.selectedFiles.length > 0) {
                console.log(`📤 Uploading ${this.selectedFiles.length} file(s)...`);
                this.showProgress(true);
                
                await this.ecoTaxiAPI.uploadMultipleFiles(
                    this.selectedFiles,
                    (progress, fileName) => {
                        this.updateProgress(progress, `Uploading: ${fileName}`);
                    }
                );
                
                console.log('✅ All files uploaded');
            }
            
            // Step 2: Send text message to EcoTaxi
            console.log('📤 Sending order to eco-taxi.one...');
            await this.ecoTaxiAPI.sendTextMessage(orderText);
            console.log('✅ Order sent to eco-taxi.one');
            
            // Step 3: Create Monday.com item (DISABLED FOR TESTING)
            // await this.mondayAPI.createItem(formData, selectedDates);
            console.log('ℹ️  Monday.com integration disabled for testing');
            
            // Success!
            this.showProgress(false);
            this.showSuccess();
            this.resetForm();
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = this.i18n.t('submit');
            
        } catch (error) {
            console.error('❌ Submission error:', error);
            this.showError(`Failed to submit order: ${error.message}`);
            
            // Re-enable submit button
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = this.i18n.t('submit');
        }
    }

    validateForm() {
        // Check required fields
        const requiredFields = ['area', 'address', 'email', 'phone', 'tariff', 'payment'];
        for (const field of requiredFields) {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (!input || !input.value.trim()) {
                this.showError(this.i18n.t('error.required'));
                input?.focus();
                return false;
            }
        }

        // Check at least one date selected
        const dateChecked = this.form.querySelector('input[name="date"]:checked');
        if (!dateChecked) {
            this.showError(this.i18n.t('error.date'));
            return false;
        }

        return true;
    }

    showProgress(show) {
        const progressDiv = document.getElementById('uploadProgress');
        if (show) {
            progressDiv.classList.remove('hidden');
        } else {
            progressDiv.classList.add('hidden');
        }
    }

    updateProgress(percent, text) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${Math.round(percent)}% - ${text}`;
    }

    showError(message) {
        const errorMsg = document.getElementById('errorMsg');
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
        
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 5000);
    }

    showSuccess() {
        const successMsg = document.getElementById('successMsg');
        successMsg.classList.remove('hidden');
        
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 5000);
    }

    showMessage(message, type) {
        if (type === 'error') {
            this.showError(message);
        } else {
            console.log(`ℹ️  ${message}`);
        }
    }

    resetForm() {
        this.form.reset();
        this.selectedFiles = [];
        this.filePreview.innerHTML = '';
    }

    showOrders() {
        // TODO: Implement orders history
        const modal = document.getElementById('ordersModal');
        const content = document.getElementById('ordersContent');
        content.innerHTML = '<p class="text-gray-500">Orders history coming soon...</p>';
        modal.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('ordersModal').classList.add('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
    
    // Make app globally accessible for debugging
    window.app = app;
});
