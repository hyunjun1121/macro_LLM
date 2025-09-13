// Create Event specific JavaScript
// Handles event creation form, validation, and submission

class CreateEventController {
    constructor() {
        this.form = document.getElementById('createEventForm');
        this.previewUpdateDebounced = DOMUtils.debounce(this.updatePreview.bind(this), 300);
        this.currentEventId = null; // For editing existing events
        this.isEditing = false;
        
        this.init();
    }

    init() {
        this.setupFormListeners();
        this.initializeFormDefaults();
        this.setupValidation();
        this.loadURLParameters();
        this.initializePreview();
    }

    setupFormListeners() {
        // Form submission
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Real-time preview updates
        this.form.addEventListener('input', this.previewUpdateDebounced);
        this.form.addEventListener('change', this.previewUpdateDebounced);
        
        // Character counting
        const descriptionField = document.getElementById('eventDescription');
        const descriptionCount = document.getElementById('descriptionCount');
        
        if (descriptionField && descriptionCount) {
            descriptionField.addEventListener('input', (e) => {
                const count = e.target.value.length;
                descriptionCount.textContent = `${count}/500`;
                
                if (count > 450) {
                    descriptionCount.style.color = '#ef4444';
                } else if (count > 400) {
                    descriptionCount.style.color = '#f59e0b';
                } else {
                    descriptionCount.style.color = '#6b7280';
                }
            });
        }

        // Event code generation and validation
        const eventCodeField = document.getElementById('eventCode');
        const generateCodeBtn = document.getElementById('generateCodeBtn');
        
        if (generateCodeBtn) {
            generateCodeBtn.addEventListener('click', this.generateEventCode.bind(this));
        }
        
        if (eventCodeField) {
            eventCodeField.addEventListener('input', (e) => {
                // Auto-format to uppercase and remove invalid characters
                e.target.value = ValidationUtils.sanitizeEventCode(e.target.value);
                this.validateEventCode(e.target.value);
            });
        }

        // Date range presets
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyDatePreset(preset);
                
                // Visual feedback
                presetButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                setTimeout(() => e.target.classList.remove('active'), 2000);
            });
        });

        // Date validation
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) {
            startDate.addEventListener('change', () => {
                this.validateDateRange();
                this.updateEndDateMin();
            });
        }
        
        if (endDate) {
            endDate.addEventListener('change', () => {
                this.validateDateRange();
            });
        }

        // Time validation
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        
        if (startTime) {
            startTime.addEventListener('change', this.validateTimeRange.bind(this));
        }
        
        if (endTime) {
            endTime.addEventListener('change', this.validateTimeRange.bind(this));
        }

        // Participant email parsing
        const participantEmails = document.getElementById('participantEmails');
        if (participantEmails) {
            participantEmails.addEventListener('input', 
                DOMUtils.debounce(this.parseParticipantEmails.bind(this), 500)
            );
        }

        // Save as draft
        const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
        if (saveAsDraftBtn) {
            saveAsDraftBtn.addEventListener('click', this.saveAsDraft.bind(this));
        }

        // Auto-save functionality
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.autoSave();
            }
        }, 30000); // Auto-save every 30 seconds

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    initializeFormDefaults() {
        // Set default timezone to user's timezone
        const timezoneSelect = document.getElementById('eventTimezone');
        if (timezoneSelect) {
            // Populate timezone options
            const timezones = TimezoneUtils.getTimezones();
            timezones.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz.value;
                option.textContent = tz.label;
                timezoneSelect.appendChild(option);
            });
            
            // Set default to user's timezone
            const userTz = TimezoneUtils.getUserTimezone();
            const defaultTz = timezones.find(tz => tz.value === userTz) || timezones[0];
            timezoneSelect.value = defaultTz.value;
        }

        // Set default dates (next week)
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate && !startDate.value) {
            startDate.value = DateUtils.formatDate(nextWeek, 'iso');
        }
        
        if (endDate && !endDate.value) {
            const endOfWeek = new Date(nextWeek);
            endOfWeek.setDate(nextWeek.getDate() + 6);
            endDate.value = DateUtils.formatDate(endOfWeek, 'iso');
        }

        // Set minimum date to today
        if (startDate) {
            startDate.min = DateUtils.formatDate(today, 'iso');
        }
        
        this.updateEndDateMin();
    }

    updateEndDateMin() {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate && endDate && startDate.value) {
            endDate.min = startDate.value;
        }
    }

    setupValidation() {
        // Real-time validation
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                // Clear error on input
                this.clearFieldError(field);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Specific field validations
        switch (field.id) {
            case 'eventTitle':
                if (value && value.length < 3) {
                    isValid = false;
                    errorMessage = 'Title must be at least 3 characters long';
                }
                break;
                
            case 'eventCode':
                if (value && !this.validateEventCode(value)) {
                    isValid = false;
                    errorMessage = 'Event code must be unique and contain only letters and numbers';
                }
                break;
                
            case 'startDate':
            case 'endDate':
                if (value && new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                    isValid = false;
                    errorMessage = 'Date cannot be in the past';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const errorId = field.id + 'Error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'form-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Associate error with field for screen readers
        field.setAttribute('aria-describedby', errorId);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        
        const errorId = field.id + 'Error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    validateEventCode(code) {
        if (!code) return true; // Empty is valid (will be auto-generated)
        
        // Check if code already exists
        const existingEvent = findEventByCode(code);
        if (existingEvent && existingEvent.id !== this.currentEventId) {
            return false;
        }
        
        return true;
    }

    validateDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
            if (!ValidationUtils.isValidDateRange(startDate, endDate)) {
                this.showFieldError(
                    document.getElementById('endDate'),
                    'End date must be after start date'
                );
                return false;
            }
        }
        
        return true;
    }

    validateTimeRange() {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        
        if (startTime && endTime) {
            if (!ValidationUtils.isValidTimeRange(startTime, endTime)) {
                this.showFieldError(
                    document.getElementById('endTime'),
                    'End time must be after start time'
                );
                return false;
            }
        }
        
        return true;
    }

    generateEventCode() {
        // Generate a random 6-character code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (findEventByCode(code)); // Ensure uniqueness
        
        document.getElementById('eventCode').value = code;
        this.updatePreview();
        
        // Visual feedback
        const btn = document.getElementById('generateCodeBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Generated!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }

    applyDatePreset(preset) {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const today = new Date();
        
        let start, end;
        
        switch (preset) {
            case 'thisWeek':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                start = startOfWeek;
                end = endOfWeek;
                break;
                
            case 'nextWeek':
                const nextWeekStart = new Date(today);
                nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
                const nextWeekEnd = new Date(nextWeekStart);
                nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                
                start = nextWeekStart;
                end = nextWeekEnd;
                break;
                
            case 'next2Weeks':
                start = new Date(today);
                start.setDate(today.getDate() + 1);
                end = new Date(start);
                end.setDate(start.getDate() + 13);
                break;
                
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
        }
        
        if (start && end) {
            startDate.value = DateUtils.formatDate(start, 'iso');
            endDate.value = DateUtils.formatDate(end, 'iso');
            
            this.validateDateRange();
            this.updatePreview();
        }
    }

    parseParticipantEmails() {
        const textarea = document.getElementById('participantEmails');
        const preview = document.getElementById('participantPreview');
        const emails = textarea.value.split(',').map(email => email.trim()).filter(email => email);
        
        // Clear existing participant items (except current user)
        const existingParticipants = preview.querySelectorAll('.participant-item:not(.current-user)');
        existingParticipants.forEach(item => item.remove());
        
        // Add new participants
        emails.forEach(email => {
            const isValid = ValidationUtils.isEmail(email);
            const participantItem = DOMUtils.createElement('div', {
                className: `participant-item ${isValid ? 'valid' : 'invalid'}`
            });
            
            participantItem.innerHTML = `
                <div class="participant-avatar">${email[0].toUpperCase()}</div>
                <span class="participant-name">${email}</span>
                <span class="participant-status">${isValid ? 'Valid' : 'Invalid email'}</span>
                <button type="button" class="remove-participant" onclick="this.parentElement.remove()">×</button>
            `;
            
            preview.appendChild(participantItem);
        });
    }

    loadURLParameters() {
        const params = new URLSearchParams(window.location.search);
        
        // Pre-fill title from search
        const title = params.get('title');
        if (title) {
            document.getElementById('eventTitle').value = decodeURIComponent(title);
        }
        
        // Load event for editing
        const editId = params.get('edit');
        if (editId) {
            this.loadEventForEditing(editId);
        }
    }

    loadEventForEditing(eventId) {
        const event = getEventById(eventId);
        if (!event) {
            app.showNotification('Event not found', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        if (event.creator !== getCurrentUser().id) {
            app.showNotification('You can only edit events you created', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        this.isEditing = true;
        this.currentEventId = eventId;
        
        // Update page title and header
        document.title = 'Edit Event - When2Meet';
        document.querySelector('.create-header h2').textContent = 'Edit Event';
        document.querySelector('.create-header p').textContent = 'Update your event details and settings';
        document.getElementById('createEventBtn').innerHTML = `
            <span class="btn-text">Update Event</span>
            <span class="btn-loading" style="display: none;">Updating...</span>
        `;
        
        // Populate form with event data
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventCode').value = event.eventCode || '';
        document.getElementById('eventTags').value = event.tags ? event.tags.join(', ') : '';
        document.getElementById('eventTimezone').value = event.timezone;
        document.getElementById('startDate').value = event.dateRange.start;
        document.getElementById('endDate').value = event.dateRange.end;
        document.getElementById('startTime').value = event.timeRange.start;
        document.getElementById('endTime').value = event.timeRange.end;
        document.getElementById('slotDuration').value = event.timeSlotDuration.toString();
        
        // Set checkboxes
        document.getElementById('isPublic').checked = event.isPublic || false;
        document.getElementById('allowMaybe').checked = event.settings?.allowMaybe !== false;
        document.getElementById('showParticipantNames').checked = event.settings?.showParticipantNames !== false;
        document.getElementById('requireAuth').checked = event.settings?.requireAuth || false;
        document.getElementById('autoReminders').checked = event.settings?.autoReminders !== false;
        
        // Update character count
        const descriptionCount = document.getElementById('descriptionCount');
        if (descriptionCount) {
            const count = (event.description || '').length;
            descriptionCount.textContent = `${count}/500`;
        }
        
        this.updatePreview();
    }

    initializePreview() {
        this.updatePreview();
    }

    updatePreview() {
        const title = document.getElementById('eventTitle').value || 'Event Title';
        const description = document.getElementById('eventDescription').value || 'Event description will appear here...';
        const code = document.getElementById('eventCode').value || 'AUTO';
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const duration = document.getElementById('eventDuration').value;
        const timezone = document.getElementById('eventTimezone').value;
        
        // Update preview elements
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewDescription').textContent = description;
        document.getElementById('previewCode').textContent = code;
        
        // Format dates
        if (startDate && endDate) {
            const start = DateUtils.formatDate(startDate, 'short');
            const end = DateUtils.formatDate(endDate, 'short');
            document.getElementById('previewDates').textContent = 
                startDate === endDate ? start : `${start} - ${end}`;
        } else {
            document.getElementById('previewDates').textContent = 'Select dates';
        }
        
        // Format times
        if (startTime && endTime) {
            const start = DateUtils.formatTime(startTime);
            const end = DateUtils.formatTime(endTime);
            document.getElementById('previewTimes').textContent = `${start} - ${end}`;
        } else {
            document.getElementById('previewTimes').textContent = 'Select times';
        }
        
        // Format duration
        if (duration) {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            let durationText = '';
            
            if (hours > 0) {
                durationText += `${hours} hour${hours > 1 ? 's' : ''}`;
            }
            if (minutes > 0) {
                if (hours > 0) durationText += ' ';
                durationText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
            
            document.getElementById('previewDuration').textContent = durationText;
        } else {
            document.getElementById('previewDuration').textContent = 'Not specified';
        }
        
        // Format timezone
        if (timezone) {
            const tz = TimezoneUtils.getTimezones().find(t => t.value === timezone);
            document.getElementById('previewTimezone').textContent = tz ? tz.label : timezone;
        } else {
            document.getElementById('previewTimezone').textContent = 'Select timezone';
        }
    }

    validateForm() {
        let isValid = true;
        const errors = [];
        
        // Validate required fields
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                errors.push(`${field.labels[0]?.textContent || field.name} is required`);
            }
        });
        
        // Additional validation
        const eventData = this.collectFormData();
        const validationErrors = ValidationUtils.validateEventData(eventData);
        
        if (validationErrors.length > 0) {
            isValid = false;
            errors.push(...validationErrors);
        }
        
        if (!isValid) {
            app.showNotification(errors[0], 'error');
            
            // Focus first invalid field
            const firstInvalidField = this.form.querySelector('.error, [aria-invalid="true"]');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
        
        return isValid;
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Handle checkboxes
        data.isPublic = document.getElementById('isPublic').checked;
        data.allowMaybe = document.getElementById('allowMaybe').checked;
        data.showParticipantNames = document.getElementById('showParticipantNames').checked;
        data.requireAuth = document.getElementById('requireAuth').checked;
        data.autoReminders = document.getElementById('autoReminders').checked;
        
        // Parse tags
        if (data.tags) {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        
        // Parse participant emails
        if (data.participantEmails) {
            data.participantEmails = data.participantEmails
                .split(',')
                .map(email => email.trim())
                .filter(email => email && ValidationUtils.isEmail(email));
        }
        
        return data;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const btn = document.getElementById('createEventBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        // Show loading state
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        
        try {
            const formData = this.collectFormData();
            const eventData = await this.createOrUpdateEvent(formData);
            
            // Clear auto-save data
            this.clearAutoSaveData();
            
            // Show success modal
            this.showSuccessModal(eventData);
            
        } catch (error) {
            console.error('Error creating event:', error);
            app.showNotification('Failed to create event. Please try again.', 'error');
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    async createOrUpdateEvent(formData) {
        const eventId = this.isEditing ? this.currentEventId : 'event_' + Date.now();
        const currentUser = getCurrentUser();
        
        const eventData = {
            id: eventId,
            title: formData.title,
            description: formData.description || '',
            creator: currentUser.id,
            createdAt: this.isEditing ? getEventById(eventId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            isPublic: formData.isPublic,
            eventCode: formData.eventCode || this.generateUniqueCode(),
            dateRange: {
                start: formData.startDate,
                end: formData.endDate
            },
            timeRange: {
                start: formData.startTime,
                end: formData.endTime
            },
            timeSlotDuration: parseInt(formData.slotDuration),
            expectedDuration: formData.eventDuration ? parseInt(formData.eventDuration) : null,
            timezone: formData.timezone,
            participants: this.isEditing ? 
                getEventById(eventId).participants : 
                [currentUser.id, ...(formData.participantEmails || [])],
            responses: this.isEditing ? getEventById(eventId).responses : {},
            tags: formData.tags || [],
            settings: {
                allowMaybe: formData.allowMaybe,
                showParticipantNames: formData.showParticipantNames,
                requireAuth: formData.requireAuth,
                autoReminders: formData.autoReminders
            }
        };
        
        // Save to storage and global data
        StorageUtils.set(`event_${eventId}`, eventData);
        events[eventId] = eventData;
        
        return eventData;
    }

    generateUniqueCode() {
        let code;
        do {
            code = Math.random().toString(36).substr(2, 6).toUpperCase();
        } while (findEventByCode(code));
        return code;
    }

    showSuccessModal(eventData) {
        const modal = document.getElementById('successModal');
        const shareLink = `${window.location.origin}${window.location.pathname.replace('create.html', 'event.html')}?id=${eventData.id}`;
        
        document.getElementById('successEventTitle').textContent = eventData.title;
        document.getElementById('successEventCode').textContent = eventData.eventCode;
        document.getElementById('successShareLink').value = shareLink;
        
        modal.style.display = 'block';
        
        // Store data for success modal functions
        window.createdEventData = eventData;
        
        A11yUtils.trapFocus(modal);
        A11yUtils.announceToScreenReader(`Event "${eventData.title}" created successfully`);
    }

    saveAsDraft() {
        const formData = this.collectFormData();
        const draftData = {
            ...formData,
            isDraft: true,
            savedAt: new Date().toISOString()
        };
        
        StorageUtils.set('eventDraft', draftData);
        app.showNotification('Draft saved successfully', 'success');
    }

    autoSave() {
        if (this.hasUnsavedChanges()) {
            const formData = this.collectFormData();
            const autoSaveData = {
                ...formData,
                isAutoSave: true,
                savedAt: new Date().toISOString()
            };
            
            StorageUtils.set('eventAutoSave', autoSaveData);
            
            // Show subtle feedback
            const indicator = document.createElement('div');
            indicator.textContent = 'Auto-saved';
            indicator.className = 'auto-save-indicator';
            document.body.appendChild(indicator);
            
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 2000);
        }
    }

    hasUnsavedChanges() {
        // Compare current form data with last saved data
        const currentData = this.collectFormData();
        const lastSaved = StorageUtils.get('lastSavedEventData', {});
        
        return JSON.stringify(currentData) !== JSON.stringify(lastSaved);
    }

    clearAutoSaveData() {
        StorageUtils.remove('eventDraft');
        StorageUtils.remove('eventAutoSave');
        
        const currentData = this.collectFormData();
        StorageUtils.set('lastSavedEventData', currentData);
    }
}

// Success modal functions (global scope for onclick handlers)
function copyEventCode() {
    const codeElement = document.getElementById('successEventCode');
    navigator.clipboard.writeText(codeElement.textContent).then(() => {
        app.showNotification('Event code copied!', 'success');
    });
}

function copyShareLink() {
    const linkInput = document.getElementById('successShareLink');
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value).then(() => {
        app.showNotification('Share link copied!', 'success');
    });
}

function createAnotherEvent() {
    window.location.href = 'create.html';
}

function viewCreatedEvent() {
    if (window.createdEventData) {
        window.location.href = `event.html?id=${window.createdEventData.id}`;
    }
}

// Initialize create event controller
let createController;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createController = new CreateEventController();
    });
} else {
    createController = new CreateEventController();
}
