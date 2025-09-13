// Main JavaScript for When2Meet clone
// Handles all interactions, event management, and UI updates

class When2MeetApp {
    constructor() {
        this.currentUser = getCurrentUser();
        this.currentEvent = null;
        this.selectedSlots = new Map(); // slot_id -> status
        this.isSelecting = false;
        this.selectionMode = 'available'; // 'available', 'maybe', 'unavailable'
        
        this.init();
    }

    init() {
        // Initialize the application
        this.setupEventListeners();
        this.loadPageContent();
        this.setupAccessibility();
        this.loadUserPreferences();
        
        // Show loading overlay briefly
        this.showLoading();
        setTimeout(() => this.hideLoading(), 800);
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Search functionality
        const searchInput = document.getElementById('eventSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', 
                DOMUtils.debounce(this.handleSearch.bind(this), 300)
            );
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Handle browser back/forward
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Save data before page unload
        window.addEventListener('beforeunload', this.saveUserData.bind(this));
        
        // Handle visibility changes for real-time updates
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    onDOMReady() {
        // Setup components that need DOM to be ready
        this.setupTooltips();
        this.setupAnimations();
        this.preloadCriticalData();
    }

    setupAccessibility() {
        // Add skip link
        A11yUtils.addSkipLink('main-content', 'Skip to main content');
        
        // Setup keyboard navigation for any time grids
        const timeGrids = document.querySelectorAll('.time-grid');
        timeGrids.forEach(grid => {
            A11yUtils.setupKeyboardNavigation(grid, '.time-slot');
        });
        
        // Announce page changes to screen readers
        const pageTitle = document.title;
        A11yUtils.announceToScreenReader(`Navigated to ${pageTitle}`);
    }

    loadUserPreferences() {
        const preferences = StorageUtils.get('userPreferences', {
            theme: 'light',
            timeFormat: '12h',
            notifications: true,
            autoSave: true
        });
        
        this.applyUserPreferences(preferences);
    }

    applyUserPreferences(preferences) {
        // Apply theme
        if (preferences.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        // Store preferences
        this.userPreferences = preferences;
    }

    loadPageContent() {
        const pathname = window.location.pathname;
        const page = pathname.substring(pathname.lastIndexOf('/') + 1) || 'index.html';
        
        switch (page) {
            case 'index.html':
            case '':
                this.loadHomePage();
                break;
            case 'create.html':
                this.loadCreatePage();
                break;
            case 'event.html':
                this.loadEventPage();
                break;
            case 'dashboard.html':
                this.loadDashboardPage();
                break;
        }
    }

    loadHomePage() {
        this.updateUserStats();
        this.loadRecentEvents();
        this.loadPublicEvents();
        this.setupSearchSuggestions();
    }

    updateUserStats() {
        const stats = getUserStats(this.currentUser.id);
        
        // Update stat cards
        const statElements = {
            eventsCreated: document.querySelector('.stat-card:nth-child(1) .stat-number'),
            totalParticipants: document.querySelector('.stat-card:nth-child(2) .stat-number'),
            activeEvents: document.querySelector('.stat-card:nth-child(3) .stat-number'),
            completedEvents: document.querySelector('.stat-card:nth-child(4) .stat-number')
        };

        Object.entries(statElements).forEach(([key, element]) => {
            if (element && stats[key] !== undefined) {
                this.animateNumber(element, parseInt(element.textContent), stats[key]);
            }
        });
    }

    animateNumber(element, from, to, duration = 1000) {
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(from + (to - from) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    loadRecentEvents() {
        const recentEvents = getRecentEvents(6);
        const container = document.getElementById('recentEventsGrid');
        
        if (container) {
            container.innerHTML = '';
            recentEvents.forEach(event => {
                const eventCard = this.createEventCard(event);
                container.appendChild(eventCard);
            });
        }
    }

    loadPublicEvents() {
        const publicEvents = getPublicEvents().slice(0, 6);
        const container = document.getElementById('publicEventsGrid');
        
        if (container) {
            container.innerHTML = '';
            publicEvents.forEach(event => {
                const eventCard = this.createEventCard(event, true);
                container.appendChild(eventCard);
            });
        }
    }

    createEventCard(event, isPublic = false) {
        const creator = getUserById(event.creator);
        const participantCount = event.participants ? event.participants.length : 0;
        
        const card = DOMUtils.createElement('div', {
            className: 'event-card',
            'data-event-id': event.id,
            tabindex: '0',
            role: 'button',
            'aria-label': `Event: ${event.title}. Click to view details.`
        });

        const statusClass = this.getStatusClass(event.status);
        const relativeDate = DateUtils.getRelativeTime(event.dateRange.start);
        
        card.innerHTML = `
            <div class="event-header">
                <div>
                    <h4 class="event-title">${this.escapeHtml(event.title)}</h4>
                    <p class="event-creator">by ${creator ? creator.username : 'Unknown'}</p>
                </div>
                <span class="event-status ${statusClass}">${event.status}</span>
            </div>
            <p class="event-description">${this.escapeHtml(event.description)}</p>
            <div class="event-meta">
                <div class="event-meta-item">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${relativeDate}</span>
                </div>
                <div class="event-meta-item">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                    </svg>
                    <span>${TimezoneUtils.formatTimezoneOffset(event.timezone)}</span>
                </div>
            </div>
            <div class="event-participants">
                <div class="participant-avatars">
                    ${this.generateParticipantAvatars(event.participants || [])}
                </div>
                <span class="participant-count">${participantCount} participant${participantCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="event-actions">
                <button class="btn btn-sm btn-primary" onclick="app.viewEvent('${event.id}')">
                    View
                </button>
                ${!isPublic ? `
                <button class="btn btn-sm btn-outline" onclick="app.editEvent('${event.id}')">
                    Edit
                </button>
                ` : `
                <button class="btn btn-sm btn-outline" onclick="app.joinEvent('${event.id}')">
                    Join
                </button>
                `}
            </div>
        `;

        // Add click handler
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.event-actions')) {
                this.viewEvent(event.id);
            }
        });

        // Add keyboard handler
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.viewEvent(event.id);
            }
        });

        return card;
    }

    generateParticipantAvatars(participants) {
        return participants.slice(0, 4).map(userId => {
            const user = getUserById(userId);
            if (!user) return '';
            
            return `
                <div class="participant-avatar" title="${user.username}">
                    ${user.username[0].toUpperCase()}
                </div>
            `;
        }).join('') + (participants.length > 4 ? `
            <div class="participant-avatar" title="+${participants.length - 4} more">
                +${participants.length - 4}
            </div>
        ` : '');
    }

    getStatusClass(status) {
        const statusMap = {
            'active': 'active',
            'completed': 'completed',
            'pending': 'pending',
            'cancelled': 'cancelled'
        };
        return statusMap[status] || 'pending';
    }

    setupSearchSuggestions() {
        const searchInput = document.getElementById('eventSearchInput');
        if (!searchInput) return;

        // Create suggestions dropdown
        const suggestionsContainer = DOMUtils.createElement('div', {
            className: 'search-suggestions',
            style: 'display: none;'
        });
        
        searchInput.parentNode.appendChild(suggestionsContainer);
        
        // Popular searches
        const popularSearches = ['team meeting', 'coffee chat', 'planning', 'standup', 'review'];
        
        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                this.showSearchSuggestions(suggestionsContainer, popularSearches, 'Popular searches:');
            }
        });
        
        searchInput.addEventListener('blur', () => {
            // Delay hiding to allow clicks on suggestions
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });
    }

    showSearchSuggestions(container, suggestions, title = '') {
        container.innerHTML = '';
        
        if (title) {
            const titleEl = DOMUtils.createElement('div', {
                className: 'suggestions-title',
                textContent: title
            });
            container.appendChild(titleEl);
        }
        
        suggestions.forEach(suggestion => {
            const item = DOMUtils.createElement('div', {
                className: 'suggestion-item',
                textContent: suggestion
            });
            
            item.addEventListener('click', () => {
                document.getElementById('eventSearchInput').value = suggestion;
                this.handleSearch({ target: { value: suggestion } });
                container.style.display = 'none';
            });
            
            container.appendChild(item);
        });
        
        container.style.display = 'block';
    }

    handleSearch(e) {
        const query = e.target.value.trim();
        const resultsContainer = document.getElementById('searchResults');
        
        if (!resultsContainer) return;
        
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        const results = searchEvents(query);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No events found for "${this.escapeHtml(query)}"</p>
                    <button class="btn btn-primary" onclick="app.createEventWithTitle('${this.escapeHtml(query)}')">
                        Create "${this.escapeHtml(query)}" Event
                    </button>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="search-results-header">
                    <h4>Found ${results.length} event${results.length !== 1 ? 's' : ''}</h4>
                </div>
                <div class="search-results-grid">
                    ${results.map(event => this.createSearchResultCard(event)).join('')}
                </div>
            `;
        }
        
        resultsContainer.style.display = 'block';
        A11yUtils.announceToScreenReader(`Found ${results.length} events for ${query}`);
    }

    createSearchResultCard(event) {
        const creator = getUserById(event.creator);
        return `
            <div class="search-result-card" onclick="app.viewEvent('${event.id}')">
                <h5>${this.escapeHtml(event.title)}</h5>
                <p class="result-creator">by ${creator ? creator.username : 'Unknown'}</p>
                <p class="result-description">${this.escapeHtml(event.description.substring(0, 100))}...</p>
                <div class="result-tags">
                    ${event.tags ? event.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `;
    }

    // Modal functions
    showJoinModal() {
        const modal = document.getElementById('joinModal');
        if (modal) {
            modal.style.display = 'block';
            A11yUtils.trapFocus(modal);
            
            // Clear previous input
            const eventCodeInput = document.getElementById('eventCode');
            if (eventCodeInput) {
                eventCodeInput.value = '';
                eventCodeInput.focus();
            }
        }
    }

    hideJoinModal() {
        const modal = document.getElementById('joinModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    joinEvent(eventIdOrCode = null) {
        const eventCode = eventIdOrCode || document.getElementById('eventCode')?.value.trim();
        
        if (!eventCode) {
            this.showNotification('Please enter an event code or URL', 'error');
            return;
        }
        
        // Try to find event by ID first, then by code
        let event = getEventById(eventCode) || findEventByCode(eventCode);
        
        if (!event) {
            this.showNotification('Event not found. Please check the code and try again.', 'error');
            return;
        }
        
        // Add current user as participant if not already added
        if (!event.participants.includes(this.currentUser.id)) {
            event.participants.push(this.currentUser.id);
            this.showNotification(`Successfully joined "${event.title}"!`, 'success');
        } else {
            this.showNotification(`You're already participating in "${event.title}"`, 'info');
        }
        
        this.hideJoinModal();
        this.viewEvent(event.id);
    }

    viewEvent(eventId) {
        const event = getEventById(eventId);
        if (!event) {
            this.showNotification('Event not found', 'error');
            return;
        }
        
        // Store current event
        this.currentEvent = event;
        
        // Navigate to event page
        window.location.href = `event.html?id=${eventId}`;
    }

    editEvent(eventId) {
        const event = getEventById(eventId);
        if (!event) {
            this.showNotification('Event not found', 'error');
            return;
        }
        
        if (event.creator !== this.currentUser.id) {
            this.showNotification('You can only edit events you created', 'error');
            return;
        }
        
        // Navigate to create page with event data
        window.location.href = `create.html?edit=${eventId}`;
    }

    createEventWithTitle(title) {
        // Navigate to create page with pre-filled title
        window.location.href = `create.html?title=${encodeURIComponent(title)}`;
    }

    // Time grid functions
    renderTimeGrid(event) {
        const container = document.querySelector('.time-grid-container');
        if (!container) return;
        
        const timeSlots = generateTimeSlots(event);
        const dates = [...new Set(timeSlots.map(slot => slot.date))];
        const times = [...new Set(timeSlots.map(slot => slot.time))];
        
        // Create grid structure
        const gridCols = dates.length + 1; // +1 for time labels
        const gridRows = times.length + 1; // +1 for date headers
        
        container.innerHTML = `
            <div class="time-grid-header">
                <h3>Select Your Availability</h3>
                <div class="grid-controls">
                    <div class="selection-mode">
                        <button class="mode-btn active" data-mode="available" style="background: #10b981;">Available</button>
                        <button class="mode-btn" data-mode="maybe" style="background: #f59e0b;">Maybe</button>
                        <button class="mode-btn" data-mode="unavailable" style="background: #ef4444;">Unavailable</button>
                    </div>
                    <button class="btn btn-secondary" onclick="app.clearAllSelections()">Clear All</button>
                </div>
                <div class="grid-legend">
                    <div class="legend-item">
                        <div class="legend-color legend-available"></div>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color legend-maybe"></div>
                        <span>Maybe</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color legend-unavailable"></div>
                        <span>Unavailable</span>
                    </div>
                </div>
            </div>
            <div class="time-grid" data-cols="${gridCols}" style="grid-template-columns: 100px repeat(${dates.length}, 1fr);">
                ${this.generateTimeGridHTML(dates, times, timeSlots, event)}
            </div>
        `;
        
        this.setupTimeGridEvents(container);
    }

    generateTimeGridHTML(dates, times, timeSlots, event) {
        let html = '<div class="time-header"></div>'; // Empty corner cell
        
        // Date headers
        dates.forEach(date => {
            const formattedDate = DateUtils.formatDate(date, 'short');
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            html += `
                <div class="time-header">
                    <div>${dayOfWeek}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">${formattedDate}</div>
                </div>
            `;
        });
        
        // Time rows
        times.forEach(time => {
            // Time label
            const formattedTime = DateUtils.formatTime(time, this.userPreferences?.timeFormat || '12h');
            html += `<div class="time-label">${formattedTime}</div>`;
            
            // Time slots for this time across all dates
            dates.forEach(date => {
                const slotId = `${date}_${time}`;
                const slot = timeSlots.find(s => s.id === slotId);
                
                if (slot) {
                    const userResponse = event.responses?.[this.currentUser.id]?.[slotId];
                    const othersAvailability = this.getOthersAvailability(event, slotId);
                    
                    html += `
                        <div class="time-slot ${userResponse ? 'selected-' + userResponse : ''} ${othersAvailability.length > 0 ? 'others-selected' : ''}"
                             data-slot-id="${slotId}"
                             data-date="${date}"
                             data-time="${time}"
                             title="${this.getSlotTooltip(slotId, userResponse, othersAvailability)}"
                             role="gridcell"
                             tabindex="-1"
                             aria-label="${formattedTime} on ${DateUtils.formatDate(date, 'long')}">
                        </div>
                    `;
                } else {
                    html += '<div class="time-slot disabled"></div>';
                }
            });
        });
        
        return html;
    }

    getOthersAvailability(event, slotId) {
        const availability = [];
        
        if (event.responses) {
            Object.entries(event.responses).forEach(([userId, responses]) => {
                if (userId !== this.currentUser.id && responses[slotId]) {
                    const user = getUserById(userId);
                    availability.push({
                        userId,
                        username: user ? user.username : 'Unknown',
                        status: responses[slotId]
                    });
                }
            });
        }
        
        return availability;
    }

    getSlotTooltip(slotId, userResponse, othersAvailability) {
        const [date, time] = slotId.split('_');
        const formattedDate = DateUtils.formatDate(date, 'long');
        const formattedTime = DateUtils.formatTime(time, this.userPreferences?.timeFormat || '12h');
        
        let tooltip = `${formattedTime} on ${formattedDate}`;
        
        if (userResponse) {
            tooltip += `\nYour status: ${userResponse}`;
        }
        
        if (othersAvailability.length > 0) {
            tooltip += '\nOthers: ' + othersAvailability.map(a => `${a.username} (${a.status})`).join(', ');
        }
        
        return tooltip;
    }

    setupTimeGridEvents(container) {
        // Selection mode buttons
        const modeButtons = container.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectionMode = btn.dataset.mode;
            });
        });
        
        // Time slot interactions
        const timeSlots = container.querySelectorAll('.time-slot:not(.disabled)');
        
        timeSlots.forEach(slot => {
            // Mouse events
            slot.addEventListener('mousedown', this.startSelection.bind(this));
            slot.addEventListener('mouseenter', this.continueSelection.bind(this));
            slot.addEventListener('mouseup', this.endSelection.bind(this));
            
            // Touch events for mobile
            slot.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            slot.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            slot.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            // Click for single selection
            slot.addEventListener('click', this.handleSlotClick.bind(this));
        });
        
        // Global mouse up to end selection
        document.addEventListener('mouseup', this.endSelection.bind(this));
        
        // Keyboard navigation setup
        A11yUtils.setupKeyboardNavigation(container.querySelector('.time-grid'), '.time-slot:not(.disabled)');
    }

    startSelection(e) {
        e.preventDefault();
        this.isSelecting = true;
        this.selectSlot(e.target);
    }

    continueSelection(e) {
        if (this.isSelecting) {
            this.selectSlot(e.target);
        }
    }

    endSelection(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.saveSelections();
        }
    }

    handleSlotClick(e) {
        if (!this.isSelecting) {
            this.selectSlot(e.target);
            this.saveSelections();
        }
    }

    selectSlot(slotElement) {
        if (!slotElement.classList.contains('time-slot') || slotElement.classList.contains('disabled')) {
            return;
        }
        
        const slotId = slotElement.dataset.slotId;
        
        // Remove previous selection class
        slotElement.className = slotElement.className.replace(/selected-\w+/g, '');
        
        // Add new selection class
        slotElement.classList.add(`selected-${this.selectionMode}`);
        
        // Store selection
        this.selectedSlots.set(slotId, this.selectionMode);
        
        // Update tooltip
        const othersAvailability = this.getOthersAvailability(this.currentEvent, slotId);
        slotElement.title = this.getSlotTooltip(slotId, this.selectionMode, othersAvailability);
        
        // Announce to screen reader
        A11yUtils.announceToScreenReader(`Selected ${slotId.replace('_', ' at ')} as ${this.selectionMode}`);
    }

    clearAllSelections() {
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            slot.className = slot.className.replace(/selected-\w+/g, '');
        });
        
        this.selectedSlots.clear();
        this.saveSelections();
        
        this.showNotification('All selections cleared', 'info');
    }

    saveSelections() {
        if (!this.currentEvent) return;
        
        // Update event responses
        if (!this.currentEvent.responses) {
            this.currentEvent.responses = {};
        }
        
        if (!this.currentEvent.responses[this.currentUser.id]) {
            this.currentEvent.responses[this.currentUser.id] = {};
        }
        
        // Clear previous responses for this user
        this.currentEvent.responses[this.currentUser.id] = {};
        
        // Add new selections
        this.selectedSlots.forEach((status, slotId) => {
            this.currentEvent.responses[this.currentUser.id][slotId] = status;
        });
        
        // Save to storage
        StorageUtils.set(`event_${this.currentEvent.id}`, this.currentEvent);
        
        // Update event in global data
        events[this.currentEvent.id] = this.currentEvent;
        
        // Show feedback
        this.showNotification('Availability saved!', 'success');
        
        // Update best times display
        this.updateBestTimes();
    }

    updateBestTimes() {
        const bestTimes = getBestTimes(this.currentEvent.id, 5);
        const container = document.querySelector('.best-times-container');
        
        if (container && bestTimes.length > 0) {
            container.innerHTML = `
                <h4>Best Times (Most Available)</h4>
                <div class="best-times-list">
                    ${bestTimes.map((slot, index) => `
                        <div class="best-time-item">
                            <div class="best-time-rank">#${index + 1}</div>
                            <div class="best-time-details">
                                <div class="best-time-datetime">
                                    ${DateUtils.formatDate(slot.date, 'short')} at ${DateUtils.formatTime(slot.time)}
                                </div>
                                <div class="best-time-count">
                                    ${slot.availableCount} available${slot.maybeCount > 0 ? `, ${slot.maybeCount} maybe` : ''}
                                </div>
                            </div>
                            <div class="best-time-participants">
                                ${slot.availability.map(a => `
                                    <span class="participant-indicator ${a.status}" title="${a.username}: ${a.status}">
                                        ${a.username[0].toUpperCase()}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Touch event handlers for mobile
    handleTouchStart(e) {
        e.preventDefault();
        this.isSelecting = true;
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        this.selectSlot(element);
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.isSelecting) {
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            this.selectSlot(element);
        }
    }

    handleTouchEnd(e) {
        this.endSelection(e);
    }

    // Mobile menu
    toggleMobileMenu() {
        const menu = document.querySelector('.nav-menu');
        if (menu) {
            menu.classList.toggle('mobile-open');
        }
    }

    // Notifications
    showNotification(message, type = 'info', duration = 4000) {
        const notification = DOMUtils.createElement('div', {
            className: `notification notification-${type}`,
            innerHTML: `
                <div class="notification-content">
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
            `
        });
        
        // Add to page
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = DOMUtils.createElement('div', { className: 'notifications-container' });
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Animate in
        DOMUtils.fadeIn(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                DOMUtils.fadeOut(notification).then(() => {
                    notification.remove();
                });
            }
        }, duration);
        
        // Announce to screen reader
        A11yUtils.announceToScreenReader(message, type === 'error' ? 'assertive' : 'polite');
    }

    // Loading states
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            DOMUtils.fadeOut(overlay);
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    window.location.href = 'create.html';
                    break;
                case 'h':
                    e.preventDefault();
                    window.location.href = 'index.html';
                    break;
                case 'd':
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                    break;
            }
        }
        
        // Escape key to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            if (openModal) {
                openModal.style.display = 'none';
            }
        }
    }

    // Browser history handling
    handlePopState(e) {
        this.loadPageContent();
    }

    // Data persistence
    saveUserData() {
        StorageUtils.set('currentUser', this.currentUser);
        StorageUtils.set('userPreferences', this.userPreferences);
    }

    // Visibility change handling for real-time updates
    handleVisibilityChange() {
        if (!document.hidden && this.currentEvent) {
            // Refresh event data when tab becomes visible
            this.refreshEventData();
        }
    }

    refreshEventData() {
        if (!this.currentEvent) return;
        
        // In a real app, this would fetch from server
        const updatedEvent = getEventById(this.currentEvent.id);
        if (updatedEvent) {
            this.currentEvent = updatedEvent;
            
            // Re-render time grid if on event page
            if (window.location.pathname.includes('event.html')) {
                this.renderTimeGrid(updatedEvent);
            }
        }
    }

    // Setup tooltips
    setupTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title]');
        elementsWithTooltips.forEach(element => {
            // Convert title to custom tooltip for better control
            const title = element.getAttribute('title');
            element.removeAttribute('title');
            element.dataset.tooltip = title;
            
            // Add hover listeners
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    showTooltip(e) {
        const element = e.target;
        const tooltipText = element.dataset.tooltip;
        if (!tooltipText) return;
        
        const tooltip = DOMUtils.createElement('div', {
            className: 'tooltip',
            textContent: tooltipText
        });
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        DOMUtils.fadeIn(tooltip, 200);
    }

    hideTooltip(e) {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Setup animations
    setupAnimations() {
        // Intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatableElements = document.querySelectorAll('.event-card, .stat-card');
        animatableElements.forEach(el => observer.observe(el));
    }

    preloadCriticalData() {
        // Preload user avatar and preferences
        if (this.currentUser.avatar) {
            const img = new Image();
            img.src = this.currentUser.avatar;
        }
        
        // Preload recent events data
        const recentEvents = getRecentEvents(6);
        recentEvents.forEach(event => {
            // Cache event participants
            if (event.participants) {
                event.participants.forEach(userId => {
                    const user = getUserById(userId);
                    // User data is already loaded
                });
            }
        });
    }

    // Utility method for escaping HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for button onclick handlers
window.showJoinModal = () => app.showJoinModal();
window.hideJoinModal = () => app.hideJoinModal();
window.joinEvent = () => app.joinEvent();
window.searchEvents = () => app.handleSearch({ target: { value: document.getElementById('eventSearchInput').value } });

// Initialize app when DOM is loaded
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new When2MeetApp();
        window.app = app; // Make globally accessible
    });
} else {
    app = new When2MeetApp();
    window.app = app;
}
