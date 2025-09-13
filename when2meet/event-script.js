// Event page specific JavaScript
// Handles time grid interactions, availability selection, and event management

class EventPageController {
    constructor() {
        this.currentEvent = null;
        this.currentUser = getCurrentUser();
        this.selectedSlots = new Map(); // slotId -> status
        this.isSelecting = false;
        this.selectionMode = 'available';
        this.isViewMode = false;
        this.timeGridData = new Map();
        
        this.init();
    }

    init() {
        this.loadEventFromURL();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    loadEventFromURL() {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('id');
        
        if (!eventId) {
            app.showNotification('No event ID provided', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        const event = getEventById(eventId);
        if (!event) {
            app.showNotification('Event not found', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        this.currentEvent = event;
        this.loadUserSelections();
        this.renderEventInfo();
        this.renderTimeGrid();
        this.renderParticipants();
        this.renderBestTimes();
        this.setupCreatorActions();
    }

    loadUserSelections() {
        if (this.currentEvent.responses && this.currentEvent.responses[this.currentUser.id]) {
            const userResponses = this.currentEvent.responses[this.currentUser.id];
            Object.entries(userResponses).forEach(([slotId, status]) => {
                this.selectedSlots.set(slotId, status);
            });
        }
    }

    renderEventInfo() {
        const event = this.currentEvent;
        const creator = getUserById(event.creator);
        
        // Update page title
        document.title = `${event.title} - When2Meet`;
        
        // Update event header
        document.getElementById('eventTitle').textContent = event.title;
        document.getElementById('eventDescription').textContent = event.description || 'No description provided';
        document.getElementById('eventCode').textContent = event.eventCode;
        document.getElementById('eventCreator').textContent = creator ? creator.username : 'Unknown';
        
        const statusElement = document.getElementById('eventStatus');
        statusElement.textContent = event.status;
        statusElement.className = `status-badge ${event.status}`;
        
        // Update event details
        const startDate = DateUtils.formatDate(event.dateRange.start, 'long');
        const endDate = DateUtils.formatDate(event.dateRange.end, 'long');
        document.getElementById('eventDates').textContent = 
            event.dateRange.start === event.dateRange.end ? startDate : `${startDate} to ${endDate}`;
        
        const startTime = DateUtils.formatTime(event.timeRange.start);
        const endTime = DateUtils.formatTime(event.timeRange.end);
        document.getElementById('eventTimes').textContent = `${startTime} - ${endTime}`;
        
        const timezone = TimezoneUtils.getTimezones().find(tz => tz.value === event.timezone);
        document.getElementById('eventTimezone').textContent = timezone ? timezone.label : event.timezone;
        
        const participantCount = event.participants ? event.participants.length : 0;
        document.getElementById('eventParticipants').textContent = 
            `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;
    }

    renderTimeGrid() {
        const container = document.getElementById('timeGridContainer');
        const event = this.currentEvent;
        
        // Generate time slots
        const timeSlots = generateTimeSlots(event);
        if (timeSlots.length === 0) {
            container.innerHTML = '<div class="error-message">No valid time slots for this event</div>';
            return;
        }
        
        // Group slots by date and time
        const dates = [...new Set(timeSlots.map(slot => slot.date))].sort();
        const times = [...new Set(timeSlots.map(slot => slot.time))].sort();
        
        // Calculate grid dimensions
        const gridCols = dates.length + 1; // +1 for time labels
        const gridRows = times.length + 1; // +1 for date headers
        
        // Generate grid HTML
        const gridHTML = this.generateTimeGridHTML(dates, times, timeSlots, event);
        
        container.innerHTML = `
            <div class="time-grid" 
                 data-cols="${gridCols}" 
                 data-rows="${gridRows}"
                 style="grid-template-columns: 120px repeat(${dates.length}, 1fr);">
                ${gridHTML}
            </div>
        `;
        
        this.setupTimeGridInteractions();
        
        // Set up accessibility
        const grid = container.querySelector('.time-grid');
        A11yUtils.setupKeyboardNavigation(grid, '.time-slot:not(.disabled)');
    }

    generateTimeGridHTML(dates, times, timeSlots, event) {
        let html = '<div class="time-header corner-cell"></div>';
        
        // Date headers
        dates.forEach(date => {
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = DateUtils.formatDate(date, 'compact');
            const isToday = DateUtils.isToday(dateObj);
            
            html += `
                <div class="time-header date-header ${isToday ? 'today' : ''}">
                    <div class="day-of-week">${dayOfWeek}</div>
                    <div class="date-text">${formattedDate}</div>
                </div>
            `;
        });
        
        // Time rows
        times.forEach(time => {
            // Time label
            const formattedTime = DateUtils.formatTime(time, this.currentUser.preferences?.timeFormat || '12h');
            html += `<div class="time-label">${formattedTime}</div>`;
            
            // Time slots for this time across all dates
            dates.forEach(date => {
                const slotId = `${date}_${time}`;
                const slot = timeSlots.find(s => s.id === slotId);
                
                if (slot) {
                    const userResponse = this.selectedSlots.get(slotId);
                    const othersAvailability = this.getOthersAvailability(event, slotId);
                    const availabilityCount = this.getAvailabilityCount(othersAvailability);
                    
                    const slotClasses = [
                        'time-slot',
                        userResponse ? `selected-${userResponse}` : '',
                        othersAvailability.length > 0 ? 'others-selected' : '',
                        availabilityCount.available > 0 ? 'has-available' : '',
                        this.getAvailabilityIntensity(availabilityCount, event.participants.length)
                    ].filter(Boolean).join(' ');
                    
                    html += `
                        <div class="${slotClasses}"
                             data-slot-id="${slotId}"
                             data-date="${date}"
                             data-time="${time}"
                             data-available-count="${availabilityCount.available}"
                             data-maybe-count="${availabilityCount.maybe}"
                             title="${this.getSlotTooltip(slotId, userResponse, othersAvailability, formattedTime, date)}"
                             role="gridcell"
                             tabindex="-1"
                             aria-label="${this.getSlotAriaLabel(slotId, userResponse, availabilityCount, formattedTime, date)}">
                            ${availabilityCount.available > 0 ? `<span class="availability-count">${availabilityCount.available}</span>` : ''}
                        </div>
                    `;
                } else {
                    html += '<div class="time-slot disabled" role="gridcell" tabindex="-1"></div>';
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

    getAvailabilityCount(othersAvailability) {
        return {
            available: othersAvailability.filter(a => a.status === 'available').length,
            maybe: othersAvailability.filter(a => a.status === 'maybe').length,
            unavailable: othersAvailability.filter(a => a.status === 'unavailable').length
        };
    }

    getAvailabilityIntensity(count, totalParticipants) {
        const ratio = count.available / Math.max(totalParticipants - 1, 1); // -1 to exclude current user
        if (ratio >= 0.75) return 'intensity-high';
        if (ratio >= 0.5) return 'intensity-medium';
        if (ratio >= 0.25) return 'intensity-low';
        return '';
    }

    getSlotTooltip(slotId, userResponse, othersAvailability, formattedTime, date) {
        const formattedDate = DateUtils.formatDate(date, 'long');
        let tooltip = `${formattedTime} on ${formattedDate}`;
        
        if (userResponse) {
            tooltip += `\nYour status: ${userResponse}`;
        }
        
        if (othersAvailability.length > 0) {
            const availableUsers = othersAvailability.filter(a => a.status === 'available');
            const maybeUsers = othersAvailability.filter(a => a.status === 'maybe');
            
            if (availableUsers.length > 0) {
                tooltip += `\nAvailable: ${availableUsers.map(a => a.username).join(', ')}`;
            }
            if (maybeUsers.length > 0) {
                tooltip += `\nMaybe: ${maybeUsers.map(a => a.username).join(', ')}`;
            }
        }
        
        return tooltip;
    }

    getSlotAriaLabel(slotId, userResponse, availabilityCount, formattedTime, date) {
        const formattedDate = DateUtils.formatDate(date, 'long');
        let label = `${formattedTime} on ${formattedDate}`;
        
        if (userResponse) {
            label += `, your status: ${userResponse}`;
        }
        
        if (availabilityCount.available > 0) {
            label += `, ${availabilityCount.available} others available`;
        }
        
        if (availabilityCount.maybe > 0) {
            label += `, ${availabilityCount.maybe} others maybe`;
        }
        
        return label;
    }

    setupTimeGridInteractions() {
        const container = document.getElementById('timeGridContainer');
        
        // Mode selector buttons
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isViewMode) return;
                
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectionMode = btn.dataset.mode;
                
                A11yUtils.announceToScreenReader(`Selection mode changed to ${this.selectionMode}`);
            });
        });
        
        // Time slots
        const timeSlots = container.querySelectorAll('.time-slot:not(.disabled)');
        
        if (!this.isViewMode) {
            timeSlots.forEach(slot => {
                // Mouse interactions
                slot.addEventListener('mousedown', this.handleSlotMouseDown.bind(this));
                slot.addEventListener('mouseenter', this.handleSlotMouseEnter.bind(this));
                slot.addEventListener('mouseup', this.handleSlotMouseUp.bind(this));
                
                // Touch interactions
                slot.addEventListener('touchstart', this.handleSlotTouchStart.bind(this), { passive: false });
                slot.addEventListener('touchmove', this.handleSlotTouchMove.bind(this), { passive: false });
                slot.addEventListener('touchend', this.handleSlotTouchEnd.bind(this));
                
                // Click for individual selection
                slot.addEventListener('click', this.handleSlotClick.bind(this));
                
                // Keyboard interaction
                slot.addEventListener('keydown', this.handleSlotKeydown.bind(this));
            });
        }
        
        // Global mouse up to end selection
        document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));
        
        // Prevent text selection during drag
        container.addEventListener('selectstart', (e) => {
            if (this.isSelecting) e.preventDefault();
        });
    }

    handleSlotMouseDown(e) {
        e.preventDefault();
        this.startSelection(e.target);
    }

    handleSlotMouseEnter(e) {
        if (this.isSelecting) {
            this.addToSelection(e.target);
        }
    }

    handleSlotMouseUp(e) {
        this.endSelection();
    }

    handleSlotTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        this.startSelection(element);
    }

    handleSlotTouchMove(e) {
        e.preventDefault();
        if (this.isSelecting) {
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            this.addToSelection(element);
        }
    }

    handleSlotTouchEnd(e) {
        this.endSelection();
    }

    handleSlotClick(e) {
        if (!this.isSelecting) {
            this.toggleSlotSelection(e.target);
            this.saveSelections();
        }
    }

    handleSlotKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleSlotSelection(e.target);
            this.saveSelections();
        }
    }

    handleGlobalMouseUp() {
        if (this.isSelecting) {
            this.endSelection();
        }
    }

    startSelection(slotElement) {
        if (!slotElement || !slotElement.classList.contains('time-slot') || 
            slotElement.classList.contains('disabled') || this.isViewMode) {
            return;
        }
        
        this.isSelecting = true;
        this.addToSelection(slotElement);
    }

    addToSelection(slotElement) {
        if (!slotElement || !slotElement.classList.contains('time-slot') || 
            slotElement.classList.contains('disabled')) {
            return;
        }
        
        this.selectSlot(slotElement, this.selectionMode);
    }

    endSelection() {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.saveSelections();
        }
    }

    toggleSlotSelection(slotElement) {
        if (!slotElement || !slotElement.classList.contains('time-slot') || 
            slotElement.classList.contains('disabled')) {
            return;
        }
        
        const slotId = slotElement.dataset.slotId;
        const currentStatus = this.selectedSlots.get(slotId);
        
        if (currentStatus === this.selectionMode) {
            // Same mode clicked - remove selection
            this.clearSlotSelection(slotElement);
        } else {
            // Different mode or no selection - set to current mode
            this.selectSlot(slotElement, this.selectionMode);
        }
    }

    selectSlot(slotElement, mode) {
        const slotId = slotElement.dataset.slotId;
        
        // Clear previous selection classes
        slotElement.classList.remove('selected-available', 'selected-maybe', 'selected-unavailable');
        
        // Add new selection class
        slotElement.classList.add(`selected-${mode}`);
        
        // Update internal state
        this.selectedSlots.set(slotId, mode);
        
        // Update tooltip and aria-label
        this.updateSlotAccessibility(slotElement, mode);
    }

    clearSlotSelection(slotElement) {
        const slotId = slotElement.dataset.slotId;
        
        // Remove selection classes
        slotElement.classList.remove('selected-available', 'selected-maybe', 'selected-unavailable');
        
        // Remove from internal state
        this.selectedSlots.delete(slotId);
        
        // Update tooltip and aria-label
        this.updateSlotAccessibility(slotElement, null);
    }

    updateSlotAccessibility(slotElement, userResponse) {
        const slotId = slotElement.dataset.slotId;
        const [date, time] = slotId.split('_');
        const formattedTime = DateUtils.formatTime(time);
        const othersAvailability = this.getOthersAvailability(this.currentEvent, slotId);
        const availabilityCount = this.getAvailabilityCount(othersAvailability);
        
        // Update tooltip
        slotElement.title = this.getSlotTooltip(slotId, userResponse, othersAvailability, formattedTime, date);
        
        // Update aria-label
        slotElement.setAttribute('aria-label', 
            this.getSlotAriaLabel(slotId, userResponse, availabilityCount, formattedTime, date)
        );
    }

    saveSelections() {
        // Update event data
        if (!this.currentEvent.responses) {
            this.currentEvent.responses = {};
        }
        
        this.currentEvent.responses[this.currentUser.id] = Object.fromEntries(this.selectedSlots);
        
        // Save to storage
        StorageUtils.set(`event_${this.currentEvent.id}`, this.currentEvent);
        
        // Update global events data
        events[this.currentEvent.id] = this.currentEvent;
        
        // Show save indicator
        this.showSaveIndicator();
        
        // Update best times
        this.renderBestTimes();
        
        // Announce to screen reader
        const selectionCount = this.selectedSlots.size;
        A11yUtils.announceToScreenReader(`${selectionCount} time slots selected and saved`);
    }

    showSaveIndicator() {
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    renderParticipants() {
        const container = document.getElementById('participantList');
        const event = this.currentEvent;
        
        if (!event.participants || event.participants.length === 0) {
            container.innerHTML = '<div class="no-participants">No participants yet</div>';
            return;
        }
        
        container.innerHTML = '';
        
        event.participants.forEach(userId => {
            const user = getUserById(userId);
            const userResponses = event.responses && event.responses[userId] ? event.responses[userId] : {};
            const stats = this.calculateUserStats(userResponses);
            
            const isCurrentUser = userId === this.currentUser.id;
            const participantCard = DOMUtils.createElement('div', {
                className: `participant-card ${isCurrentUser ? 'current-user' : ''}`
            });
            
            participantCard.innerHTML = `
                <div class="participant-header">
                    <div class="participant-avatar-large">
                        ${user ? user.username[0].toUpperCase() : '?'}
                    </div>
                    <div class="participant-info">
                        <h4>${user ? user.username : 'Unknown User'}${isCurrentUser ? ' (You)' : ''}</h4>
                        <p class="participant-status">
                            ${Object.keys(userResponses).length > 0 ? 'Responded' : 'No response yet'}
                        </p>
                    </div>
                </div>
                <div class="participant-stats">
                    <div class="stat-item available">
                        <strong>${stats.available}</strong>
                        <span>Available</span>
                    </div>
                    <div class="stat-item maybe">
                        <strong>${stats.maybe}</strong>
                        <span>Maybe</span>
                    </div>
                    <div class="stat-item unavailable">
                        <strong>${stats.unavailable}</strong>
                        <span>Unavailable</span>
                    </div>
                </div>
            `;
            
            container.appendChild(participantCard);
        });
    }

    calculateUserStats(userResponses) {
        const stats = { available: 0, maybe: 0, unavailable: 0 };
        
        Object.values(userResponses).forEach(status => {
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
        });
        
        return stats;
    }

    renderBestTimes() {
        const container = document.getElementById('bestTimesGrid');
        const bestTimes = getBestTimes(this.currentEvent.id, 6);
        
        if (bestTimes.length === 0) {
            container.innerHTML = '<div class="no-best-times">No availability data yet. Participants need to select their available times.</div>';
            return;
        }
        
        container.innerHTML = '';
        
        bestTimes.forEach((timeSlot, index) => {
            const card = DOMUtils.createElement('div', { className: 'best-time-card' });
            
            const formattedDate = DateUtils.formatDate(timeSlot.date, 'short');
            const formattedTime = DateUtils.formatTime(timeSlot.time);
            const dayOfWeek = new Date(timeSlot.date).toLocaleDateString('en-US', { weekday: 'long' });
            
            card.innerHTML = `
                <div class="best-time-rank">#${index + 1}</div>
                <div class="best-time-header">
                    <h4>${dayOfWeek}</h4>
                    <p class="best-time-date">${formattedDate} at ${formattedTime}</p>
                </div>
                <div class="best-time-stats">
                    <div class="stat-group">
                        <span class="stat-number available">${timeSlot.availableCount}</span>
                        <span class="stat-label">Available</span>
                    </div>
                    ${timeSlot.maybeCount > 0 ? `
                        <div class="stat-group">
                            <span class="stat-number maybe">${timeSlot.maybeCount}</span>
                            <span class="stat-label">Maybe</span>
                        </div>
                    ` : ''}
                    <div class="stat-group">
                        <span class="stat-number total">${timeSlot.availability.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                </div>
                <div class="best-time-participants">
                    ${timeSlot.availability.map(participant => `
                        <div class="participant-indicator ${participant.status}" 
                             title="${participant.username}: ${participant.status}">
                            ${participant.username[0].toUpperCase()}
                        </div>
                    `).join('')}
                </div>
                ${this.currentEvent.creator === this.currentUser.id ? `
                    <button class="btn btn-sm btn-primary" onclick="eventController.selectFinalTime('${timeSlot.id}')">
                        Select This Time
                    </button>
                ` : ''}
            `;
            
            container.appendChild(card);
        });
    }

    setupCreatorActions() {
        const creatorActions = document.getElementById('creatorActions');
        
        if (this.currentEvent.creator === this.currentUser.id) {
            creatorActions.style.display = 'flex';
            
            document.getElementById('editEventBtn').addEventListener('click', () => {
                window.location.href = `create.html?edit=${this.currentEvent.id}`;
            });
            
            document.getElementById('manageEventBtn').addEventListener('click', () => {
                this.showManageModal();
            });
        }
    }

    setupEventListeners() {
        // Share event
        document.getElementById('shareEventBtn').addEventListener('click', () => {
            this.showShareModal();
        });
        
        // Export event
        document.getElementById('exportEventBtn').addEventListener('click', () => {
            this.exportEvent();
        });
        
        // Refresh
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshEvent();
        });
        
        // Grid tools
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllSelections();
        });
        
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAvailableTimes();
        });
        
        document.getElementById('viewModeBtn').addEventListener('click', () => {
            this.toggleViewMode();
        });
        
        // Invite participants
        document.getElementById('inviteParticipantsBtn').addEventListener('click', () => {
            this.showInviteModal();
        });
        
        // Auto-refresh every 30 seconds if document is visible
        setInterval(() => {
            if (!document.hidden) {
                this.refreshEvent(true); // Silent refresh
            }
        }, 30000);
    }

    clearAllSelections() {
        if (this.isViewMode) return;
        
        // Clear visual selections
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            slot.classList.remove('selected-available', 'selected-maybe', 'selected-unavailable');
        });
        
        // Clear internal state
        this.selectedSlots.clear();
        
        // Save changes
        this.saveSelections();
        
        app.showNotification('All selections cleared', 'info');
    }

    selectAvailableTimes() {
        if (this.isViewMode) return;
        
        // Auto-select reasonable available times (e.g., 9 AM to 5 PM)
        const timeSlots = document.querySelectorAll('.time-slot:not(.disabled)');
        const workingHours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                             '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
        
        timeSlots.forEach(slot => {
            const time = slot.dataset.time;
            if (workingHours.includes(time)) {
                this.selectSlot(slot, 'available');
            }
        });
        
        this.saveSelections();
        app.showNotification('Available times selected for working hours', 'success');
    }

    toggleViewMode() {
        this.isViewMode = !this.isViewMode;
        const btn = document.getElementById('viewModeBtn');
        
        if (this.isViewMode) {
            btn.textContent = 'Edit Mode';
            btn.classList.add('active');
            document.querySelector('.selection-toolbar').style.opacity = '0.6';
            A11yUtils.announceToScreenReader('View mode enabled. Time grid is read-only.');
        } else {
            btn.textContent = 'View Mode';
            btn.classList.remove('active');
            document.querySelector('.selection-toolbar').style.opacity = '1';
            A11yUtils.announceToScreenReader('Edit mode enabled. You can now select time slots.');
        }
        
        // Re-render grid to update interactions
        this.renderTimeGrid();
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        const shareLink = `${window.location.origin}${window.location.pathname}?id=${this.currentEvent.id}`;
        
        document.getElementById('shareLink').value = shareLink;
        document.getElementById('shareCode').value = this.currentEvent.eventCode;
        
        modal.style.display = 'block';
        A11yUtils.trapFocus(modal);
    }

    showInviteModal() {
        const modal = document.getElementById('inviteModal');
        modal.style.display = 'block';
        A11yUtils.trapFocus(modal);
        
        // Pre-fill with a default message
        const messageTextarea = document.getElementById('inviteMessage');
        messageTextarea.value = `Hi! You're invited to participate in "${this.currentEvent.title}". Please select your available times.`;
    }

    exportEvent() {
        const eventData = {
            title: this.currentEvent.title,
            description: this.currentEvent.description,
            dates: `${this.currentEvent.dateRange.start} to ${this.currentEvent.dateRange.end}`,
            times: `${this.currentEvent.timeRange.start} - ${this.currentEvent.timeRange.end}`,
            timezone: this.currentEvent.timezone,
            participants: this.currentEvent.participants.map(id => {
                const user = getUserById(id);
                return user ? user.username : 'Unknown';
            }),
            bestTimes: getBestTimes(this.currentEvent.id, 5).map(time => ({
                date: time.date,
                time: time.time,
                availableCount: time.availableCount
            }))
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(eventData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentEvent.title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        app.showNotification('Event data exported successfully', 'success');
    }

    refreshEvent(silent = false) {
        if (!silent) {
            app.showLoading();
        }
        
        // In a real app, this would fetch from server
        const updatedEvent = getEventById(this.currentEvent.id);
        
        if (updatedEvent) {
            this.currentEvent = updatedEvent;
            this.renderParticipants();
            this.renderBestTimes();
            
            if (!silent) {
                app.hideLoading();
                app.showNotification('Event refreshed', 'success');
            }
        } else {
            if (!silent) {
                app.hideLoading();
                app.showNotification('Failed to refresh event', 'error');
            }
        }
    }

    selectFinalTime(slotId) {
        // This would typically open a modal to confirm the final selection
        app.showNotification('Final time selection feature coming soon!', 'info');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'a':
                        e.preventDefault();
                        this.selectAvailableTimes();
                        break;
                    case 'x':
                        e.preventDefault();
                        this.clearAllSelections();
                        break;
                    case 's':
                        e.preventDefault();
                        this.showShareModal();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshEvent();
                        break;
                }
            }
            
            // Mode switching with number keys
            if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const modes = ['available', 'maybe', 'unavailable'];
                const modeIndex = parseInt(e.key) - 1;
                
                if (modeIndex < modes.length) {
                    this.selectionMode = modes[modeIndex];
                    
                    // Update UI
                    const modeButtons = document.querySelectorAll('.mode-btn');
                    modeButtons.forEach(btn => btn.classList.remove('active'));
                    modeButtons[modeIndex].classList.add('active');
                    
                    A11yUtils.announceToScreenReader(`Selection mode changed to ${this.selectionMode}`);
                }
            }
        });
    }
}

// Global functions for modal interactions
function hideShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function hideInviteModal() {
    document.getElementById('inviteModal').style.display = 'none';
}

function copyShareLink() {
    const input = document.getElementById('shareLink');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        app.showNotification('Share link copied!', 'success');
    });
}

function copyEventCode() {
    const input = document.getElementById('shareCode');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        app.showNotification('Event code copied!', 'success');
    });
}

function shareViaEmail() {
    const shareLink = document.getElementById('shareLink').value;
    const subject = encodeURIComponent(`Join my event: ${eventController.currentEvent.title}`);
    const body = encodeURIComponent(`Hi! You're invited to participate in "${eventController.currentEvent.title}". Please visit: ${shareLink}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
}

function shareViaWhatsApp() {
    const shareLink = document.getElementById('shareLink').value;
    const text = encodeURIComponent(`Join my event "${eventController.currentEvent.title}": ${shareLink}`);
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareViaSlack() {
    const shareLink = document.getElementById('shareLink').value;
    const text = encodeURIComponent(`Join my event "${eventController.currentEvent.title}": ${shareLink}`);
    
    window.open(`https://slack.com/intl/en-gb/help/articles/201330736?text=${text}`, '_blank');
}

function generateQRCode() {
    const shareLink = document.getElementById('shareLink').value;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`;
    
    // Open QR code in new window
    const qrWindow = window.open('', '_blank', 'width=300,height=300');
    qrWindow.document.write(`
        <html>
            <head><title>QR Code for ${eventController.currentEvent.title}</title></head>
            <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                <h3>Scan to join event</h3>
                <img src="${qrCodeUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px;"/>
                <p style="font-size: 12px; color: #666; word-break: break-all;">${shareLink}</p>
            </body>
        </html>
    `);
}

function sendInvitations() {
    const emails = document.getElementById('inviteEmails').value;
    const message = document.getElementById('inviteMessage').value;
    
    if (!emails.trim()) {
        app.showNotification('Please enter at least one email address', 'error');
        return;
    }
    
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    const validEmails = emailList.filter(email => ValidationUtils.isEmail(email));
    
    if (validEmails.length === 0) {
        app.showNotification('Please enter valid email addresses', 'error');
        return;
    }
    
    // In a real app, this would send actual invitations
    // For now, we'll simulate it
    setTimeout(() => {
        hideInviteModal();
        app.showNotification(`Invitations sent to ${validEmails.length} participant${validEmails.length !== 1 ? 's' : ''}!`, 'success');
        
        // Clear form
        document.getElementById('inviteEmails').value = '';
        document.getElementById('inviteMessage').value = '';
    }, 1000);
}

// Initialize event page controller
let eventController;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        eventController = new EventPageController();
        window.eventController = eventController;
    });
} else {
    eventController = new EventPageController();
    window.eventController = eventController;
}
