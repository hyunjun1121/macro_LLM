// Dashboard specific JavaScript
// Handles event management, filtering, and dashboard interactions

class DashboardController {
    constructor() {
        this.currentUser = getCurrentUser();
        this.allEvents = [];
        this.filteredEvents = [];
        this.selectedEvents = new Set();
        this.currentTab = 'my-events';
        this.currentFilter = 'all';
        this.currentSort = 'created';
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.updateStats();
        this.renderEvents();
        this.loadDrafts();
    }

    loadEvents() {
        const allEventsData = getAllEvents();
        
        // Get events where user is creator or participant
        this.allEvents = Object.values(allEventsData).filter(event => 
            event.creator === this.currentUser.id || 
            (event.participants && event.participants.includes(this.currentUser.id))
        );
        
        this.applyFiltersAndSort();
    }

    setupEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Filters and search
        document.getElementById('eventFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.applyFiltersAndSort();
            this.renderEvents();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applyFiltersAndSort();
            this.renderEvents();
        });

        document.getElementById('dashboardSearch').addEventListener('input', 
            DOMUtils.debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.applyFiltersAndSort();
                this.renderEvents();
            }, 300)
        );

        // Bulk actions
        document.getElementById('exportAllBtn').addEventListener('click', () => {
            this.exportAllEvents();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'a':
                        e.preventDefault();
                        this.selectAllEvents();
                        break;
                    case 'e':
                        e.preventDefault();
                        if (this.selectedEvents.size > 0) {
                            this.bulkExport();
                        } else {
                            this.exportAllEvents();
                        }
                        break;
                }
            }
        });
    }

    switchTab(tabName) {
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;
        this.renderEvents();
    }

    applyFiltersAndSort() {
        let events = [...this.allEvents];

        // Apply search filter
        if (this.searchQuery) {
            events = events.filter(event => 
                event.title.toLowerCase().includes(this.searchQuery) ||
                event.description.toLowerCase().includes(this.searchQuery) ||
                (event.tags && event.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }

        // Apply category filter
        switch (this.currentFilter) {
            case 'created':
                events = events.filter(event => event.creator === this.currentUser.id);
                break;
            case 'participating':
                events = events.filter(event => 
                    event.creator !== this.currentUser.id && 
                    event.participants && event.participants.includes(this.currentUser.id)
                );
                break;
            case 'active':
                events = events.filter(event => event.status === 'active');
                break;
            case 'completed':
                events = events.filter(event => event.status === 'completed');
                break;
            case 'pending':
                events = events.filter(event => 
                    event.status === 'active' && 
                    (!event.responses || !event.responses[this.currentUser.id])
                );
                break;
        }

        // Apply sorting
        events.sort((a, b) => {
            switch (this.currentSort) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'participants':
                    return (b.participants?.length || 0) - (a.participants?.length || 0);
                case 'upcoming':
                    return new Date(a.dateRange.start) - new Date(b.dateRange.start);
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        this.filteredEvents = events;
    }

    updateStats() {
        const stats = {
            created: this.allEvents.filter(event => event.creator === this.currentUser.id).length,
            participating: this.allEvents.filter(event => 
                event.participants && event.participants.includes(this.currentUser.id)
            ).length,
            active: this.allEvents.filter(event => event.status === 'active').length,
            completed: this.allEvents.filter(event => event.status === 'completed').length
        };

        // Animate numbers
        this.animateStatNumber('createdEventsCount', stats.created);
        this.animateStatNumber('participatingEventsCount', stats.participating);
        this.animateStatNumber('activeEventsCount', stats.active);
        this.animateStatNumber('completedEventsCount', stats.completed);
    }

    animateStatNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    renderEvents() {
        const events = this.getEventsForCurrentTab();
        
        switch (this.currentTab) {
            case 'my-events':
                this.renderEventsList('myEventsList', events, true);
                this.updateEventCount('myEventsCount', events.length);
                break;
            case 'participating':
                this.renderEventsList('participatingList', events, false);
                this.updateEventCount('participatingCount', events.length);
                break;
            case 'completed':
                this.renderEventsList('completedList', events, true);
                this.updateEventCount('completedCount', events.length);
                break;
            case 'drafts':
                this.renderDraftsList();
                break;
        }

        this.toggleEmptyState(events.length === 0);
    }

    getEventsForCurrentTab() {
        switch (this.currentTab) {
            case 'my-events':
                return this.filteredEvents.filter(event => 
                    event.creator === this.currentUser.id && event.status !== 'completed'
                );
            case 'participating':
                return this.filteredEvents.filter(event => 
                    event.creator !== this.currentUser.id && 
                    event.participants && event.participants.includes(this.currentUser.id)
                );
            case 'completed':
                return this.filteredEvents.filter(event => event.status === 'completed');
            default:
                return this.filteredEvents;
        }
    }

    renderEventsList(containerId, events, showCreatorActions) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = '<div class="empty-message">No events to display</div>';
            return;
        }

        container.innerHTML = events.map(event => 
            this.createEventListItem(event, showCreatorActions)
        ).join('');

        // Add event listeners for checkboxes and actions
        this.setupEventListeners(container);
    }

    createEventListItem(event, showCreatorActions) {
        const creator = getUserById(event.creator);
        const participantCount = event.participants ? event.participants.length : 0;
        const userResponse = event.responses && event.responses[this.currentUser.id] 
            ? Object.keys(event.responses[this.currentUser.id]).length > 0 
            : false;
        
        const dateRange = event.dateRange.start === event.dateRange.end
            ? DateUtils.formatDate(event.dateRange.start, 'short')
            : `${DateUtils.formatDate(event.dateRange.start, 'short')} - ${DateUtils.formatDate(event.dateRange.end, 'short')}`;

        return `
            <div class="dashboard-event-item" data-event-id="${event.id}">
                <div class="event-item-content">
                    <div class="event-checkbox" onclick="dashboardController.toggleEventSelection('${event.id}')"></div>
                    <div class="event-item-info">
                        <a href="event.html?id=${event.id}" class="event-item-title">${this.escapeHtml(event.title)}</a>
                        <div class="event-item-meta">
                            <span class="meta-item">
                                <strong>Status:</strong> 
                                <span class="status-badge ${event.status}">${event.status}</span>
                            </span>
                            <span class="meta-item">
                                <strong>Date:</strong> ${dateRange}
                            </span>
                            <span class="meta-item">
                                <strong>Participants:</strong> ${participantCount}
                            </span>
                            ${showCreatorActions ? '' : `
                                <span class="meta-item">
                                    <strong>Creator:</strong> ${creator ? creator.username : 'Unknown'}
                                </span>
                            `}
                            <span class="meta-item">
                                <strong>Response:</strong> 
                                <span class="${userResponse ? 'responded' : 'no-response'}">
                                    ${userResponse ? 'Responded' : 'No response'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="event-item-actions">
                    <button class="action-btn primary" onclick="dashboardController.viewEvent('${event.id}')">
                        View
                    </button>
                    ${showCreatorActions ? `
                        <button class="action-btn" onclick="dashboardController.editEvent('${event.id}')">
                            Edit
                        </button>
                        <button class="action-btn" onclick="dashboardController.shareEvent('${event.id}')">
                            Share
                        </button>
                    ` : ''}
                    <button class="more-actions-btn" onclick="dashboardController.showEventActions('${event.id}')">
                        ⋮
                    </button>
                </div>
            </div>
        `;
    }

    renderDraftsList() {
        const container = document.getElementById('draftsList');
        const drafts = this.loadDrafts();
        
        if (drafts.length === 0) {
            container.innerHTML = '<div class="empty-message">No draft events</div>';
            this.updateEventCount('draftsCount', 0);
            return;
        }

        container.innerHTML = drafts.map(draft => `
            <div class="dashboard-event-item draft-item">
                <div class="event-item-content">
                    <div class="event-item-info">
                        <div class="event-item-title">${this.escapeHtml(draft.title || 'Untitled Draft')}</div>
                        <div class="event-item-meta">
                            <span class="meta-item">
                                <strong>Saved:</strong> ${DateUtils.formatDateTime(draft.savedAt)}
                            </span>
                            <span class="meta-item">
                                <strong>Type:</strong> ${draft.isAutoSave ? 'Auto-saved' : 'Manual draft'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="event-item-actions">
                    <button class="action-btn primary" onclick="dashboardController.continueDraft('${draft.savedAt}')">
                        Continue
                    </button>
                    <button class="action-btn danger" onclick="dashboardController.deleteDraft('${draft.savedAt}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        this.updateEventCount('draftsCount', drafts.length);
    }

    loadDrafts() {
        const drafts = [];
        
        const eventDraft = StorageUtils.get('eventDraft');
        if (eventDraft) {
            drafts.push(eventDraft);
        }

        const autoSave = StorageUtils.get('eventAutoSave');
        if (autoSave) {
            drafts.push(autoSave);
        }

        return drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    }

    setupEventListeners(container) {
        // Event listeners are handled via onclick attributes for simplicity
        // In a production app, you might want to use event delegation
    }

    updateEventCount(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `${count} event${count !== 1 ? 's' : ''}`;
        }
    }

    toggleEmptyState(show) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = show ? 'block' : 'none';
        }
    }

    // Event actions
    viewEvent(eventId) {
        window.location.href = `event.html?id=${eventId}`;
    }

    editEvent(eventId) {
        window.location.href = `create.html?edit=${eventId}`;
    }

    shareEvent(eventId) {
        const event = getEventById(eventId);
        if (!event) return;

        const shareUrl = `${window.location.origin}/when2meet/event.html?id=${eventId}`;
        
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Join my event: ${event.title}`,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                app.showNotification('Event link copied to clipboard!', 'success');
            });
        }
    }

    showEventActions(eventId) {
        const event = getEventById(eventId);
        if (!event) return;

        const isCreator = event.creator === this.currentUser.id;
        const modal = document.getElementById('eventActionsModal');
        const title = document.getElementById('actionModalTitle');
        const actionsList = document.getElementById('actionsList');

        title.textContent = `Actions for "${event.title}"`;

        const actions = [
            {
                icon: '👁',
                label: 'View Event',
                action: () => this.viewEvent(eventId)
            },
            {
                icon: '📤',
                label: 'Share Event',
                action: () => this.shareEvent(eventId)
            },
            {
                icon: '📥',
                label: 'Export Data',
                action: () => this.exportEvent(eventId)
            }
        ];

        if (isCreator) {
            actions.push(
                {
                    icon: '✏️',
                    label: 'Edit Event',
                    action: () => this.editEvent(eventId)
                },
                {
                    icon: '👥',
                    label: 'Manage Participants',
                    action: () => this.manageParticipants(eventId)
                },
                {
                    icon: '🗑',
                    label: 'Delete Event',
                    action: () => this.deleteEvent(eventId),
                    danger: true
                }
            );
        }

        actionsList.innerHTML = actions.map(action => `
            <div class="action-item ${action.danger ? 'danger' : ''}" 
                 onclick="dashboardController.executeAction('${eventId}', '${action.label}')">
                <div class="action-icon">${action.icon}</div>
                <div class="action-text">${action.label}</div>
            </div>
        `).join('');

        // Store actions for execution
        this.currentActions = Object.fromEntries(
            actions.map(action => [action.label, action.action])
        );

        modal.style.display = 'block';
        A11yUtils.trapFocus(modal);
    }

    executeAction(eventId, actionLabel) {
        this.hideEventActionsModal();
        
        if (this.currentActions && this.currentActions[actionLabel]) {
            this.currentActions[actionLabel]();
        }
    }

    deleteEvent(eventId) {
        const event = getEventById(eventId);
        if (!event) return;

        const modal = document.getElementById('deleteModal');
        const title = document.getElementById('deleteEventTitle');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        title.textContent = event.title;

        // Set up confirmation handler
        confirmBtn.onclick = () => {
            this.confirmDeleteEvent(eventId);
        };

        modal.style.display = 'block';
        A11yUtils.trapFocus(modal);
    }

    confirmDeleteEvent(eventId) {
        // Remove from storage
        StorageUtils.remove(`event_${eventId}`);
        
        // Remove from global events
        delete events[eventId];
        
        // Refresh dashboard
        this.loadEvents();
        this.updateStats();
        this.renderEvents();
        
        this.hideDeleteModal();
        app.showNotification('Event deleted successfully', 'success');
    }

    exportEvent(eventId) {
        const event = getEventById(eventId);
        if (!event) return;

        const bestTimes = getBestTimes(eventId, 10);
        const exportData = {
            event: {
                title: event.title,
                description: event.description,
                creator: getUserById(event.creator)?.username,
                dateRange: event.dateRange,
                timeRange: event.timeRange,
                timezone: event.timezone,
                status: event.status
            },
            participants: event.participants?.map(userId => {
                const user = getUserById(userId);
                const responses = event.responses?.[userId] || {};
                return {
                    username: user?.username || 'Unknown',
                    responseCount: Object.keys(responses).length,
                    availableSlots: Object.entries(responses)
                        .filter(([_, status]) => status === 'available')
                        .map(([slot, _]) => slot)
                };
            }) || [],
            bestTimes: bestTimes.map(time => ({
                date: time.date,
                time: time.time,
                availableCount: time.availableCount,
                maybeCount: time.maybeCount,
                participants: time.availability.map(a => a.username)
            })),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
        link.click();

        URL.revokeObjectURL(url);
        app.showNotification('Event exported successfully', 'success');
    }

    exportAllEvents() {
        const exportData = {
            events: this.allEvents.map(event => ({
                title: event.title,
                description: event.description,
                dateRange: event.dateRange,
                timeRange: event.timeRange,
                status: event.status,
                participantCount: event.participants?.length || 0
            })),
            summary: {
                totalEvents: this.allEvents.length,
                activeEvents: this.allEvents.filter(e => e.status === 'active').length,
                completedEvents: this.allEvents.filter(e => e.status === 'completed').length
            },
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `when2meet_events_export_${DateUtils.formatDate(new Date(), 'iso')}.json`;
        link.click();

        URL.revokeObjectURL(url);
        app.showNotification('All events exported successfully', 'success');
    }

    // Selection management
    toggleEventSelection(eventId) {
        const checkbox = document.querySelector(`[data-event-id="${eventId}"] .event-checkbox`);
        
        if (this.selectedEvents.has(eventId)) {
            this.selectedEvents.delete(eventId);
            checkbox.classList.remove('checked');
        } else {
            this.selectedEvents.add(eventId);
            checkbox.classList.add('checked');
        }

        this.updateBulkActions();
    }

    selectAllEvents() {
        const eventItems = document.querySelectorAll('.dashboard-event-item');
        const checkboxes = document.querySelectorAll('.event-checkbox');
        
        if (this.selectedEvents.size === eventItems.length) {
            // Deselect all
            this.selectedEvents.clear();
            checkboxes.forEach(cb => cb.classList.remove('checked'));
        } else {
            // Select all
            eventItems.forEach(item => {
                const eventId = item.dataset.eventId;
                this.selectedEvents.add(eventId);
            });
            checkboxes.forEach(cb => cb.classList.add('checked'));
        }

        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedEvents.size > 0) {
            bulkActions.style.display = 'block';
            selectedCount.textContent = this.selectedEvents.size;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    clearSelection() {
        this.selectedEvents.clear();
        document.querySelectorAll('.event-checkbox').forEach(cb => {
            cb.classList.remove('checked');
        });
        this.updateBulkActions();
    }

    bulkExport() {
        const selectedEvents = Array.from(this.selectedEvents).map(id => getEventById(id)).filter(Boolean);
        
        const exportData = {
            events: selectedEvents.map(event => ({
                title: event.title,
                description: event.description,
                dateRange: event.dateRange,
                timeRange: event.timeRange,
                status: event.status,
                participantCount: event.participants?.length || 0,
                bestTimes: getBestTimes(event.id, 5)
            })),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `selected_events_export_${DateUtils.formatDate(new Date(), 'iso')}.json`;
        link.click();

        URL.revokeObjectURL(url);
        app.showNotification(`${selectedEvents.length} events exported successfully`, 'success');
    }

    bulkDelete() {
        if (this.selectedEvents.size === 0) return;

        const confirmation = confirm(`Are you sure you want to delete ${this.selectedEvents.size} event${this.selectedEvents.size !== 1 ? 's' : ''}? This action cannot be undone.`);
        
        if (confirmation) {
            Array.from(this.selectedEvents).forEach(eventId => {
                StorageUtils.remove(`event_${eventId}`);
                delete events[eventId];
            });

            this.selectedEvents.clear();
            this.loadEvents();
            this.updateStats();
            this.renderEvents();
            this.updateBulkActions();

            app.showNotification('Selected events deleted successfully', 'success');
        }
    }

    // Draft management
    continueDraft(savedAt) {
        const drafts = this.loadDrafts();
        const draft = drafts.find(d => d.savedAt === savedAt);
        
        if (draft) {
            // Store draft data for create page to load
            StorageUtils.set('draftToLoad', draft);
            window.location.href = 'create.html?draft=true';
        }
    }

    deleteDraft(savedAt) {
        const confirmation = confirm('Are you sure you want to delete this draft?');
        
        if (confirmation) {
            const drafts = this.loadDrafts();
            const draft = drafts.find(d => d.savedAt === savedAt);
            
            if (draft) {
                if (draft.isAutoSave) {
                    StorageUtils.remove('eventAutoSave');
                } else {
                    StorageUtils.remove('eventDraft');
                }
                
                this.renderDraftsList();
                app.showNotification('Draft deleted successfully', 'success');
            }
        }
    }

    // Modal management
    hideEventActionsModal() {
        document.getElementById('eventActionsModal').style.display = 'none';
    }

    hideDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
function hideEventActionsModal() {
    dashboardController.hideEventActionsModal();
}

function hideDeleteModal() {
    dashboardController.hideDeleteModal();
}

function clearSelection() {
    dashboardController.clearSelection();
}

function bulkExport() {
    dashboardController.bulkExport();
}

function bulkDelete() {
    dashboardController.bulkDelete();
}

// Initialize dashboard controller
let dashboardController;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboardController = new DashboardController();
        window.dashboardController = dashboardController;
    });
} else {
    dashboardController = new DashboardController();
    window.dashboardController = dashboardController;
}
