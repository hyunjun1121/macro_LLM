// Host Dashboard JavaScript

class HostDashboardApp {
    constructor() {
        this.users = window.airbnbData.users;
        this.listings = window.airbnbData.listings;
        this.reviews = window.airbnbData.reviews;
        this.currentUser = window.airbnbData.currentUser;
        this.storageUtils = window.airbnbData.storageUtils;
        
        // Find jun's data for hosting
        this.hostUser = this.users.find(u => u.id === 'jun') || this.currentUser;
        this.hostListings = this.listings.filter(l => l.hostId === this.hostUser.id);
        this.hostReviews = this.reviews.filter(r => 
            this.hostListings.some(listing => listing.id === r.listingId)
        );
        
        this.bookings = this.storageUtils.getBookings();
        this.hostBookings = this.bookings.filter(b => 
            this.hostListings.some(listing => listing.id === b.listingId)
        );
        
        this.selectedTimeframe = '30days';
        
        this.init();
    }
    
    init() {
        this.renderDashboard();
        this.setupEventListeners();
        this.hideLoading();
    }
    
    setupEventListeners() {
        // Timeframe selector
        document.addEventListener('change', (e) => {
            if (e.target.matches('.timeframe-selector')) {
                this.selectedTimeframe = e.target.value;
                this.updateStats();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            if (e.key === 'n' && e.metaKey) {
                e.preventDefault();
                this.openAddListingModal();
            }
        });
    }
    
    renderDashboard() {
        const earnings = this.calculateEarnings();
        const stats = this.calculateStats();
        
        const dashboardHTML = `
            <!-- Welcome Section -->
            <div class="dashboard-header">
                <div class="container">
                    <div class="welcome-section">
                        <div class="welcome-content">
                            <h1>Welcome back, ${this.hostUser.name}!</h1>
                            ${this.hostUser.superhost ? '<span class="superhost-badge large">Superhost</span>' : ''}
                            <p class="welcome-subtitle">
                                ${this.hostListings.length > 0 ? 
                                    `You have ${this.hostListings.length} active listing${this.hostListings.length !== 1 ? 's' : ''}` :
                                    'Ready to start hosting? List your first space!'
                                }
                            </p>
                        </div>
                        <div class="welcome-actions">
                            <button class="primary-btn" onclick="openAddListingModal()">
                                <i class="fas fa-plus"></i>
                                List new space
                            </button>
                            <button class="secondary-btn" onclick="viewHostResources()">
                                <i class="fas fa-book"></i>
                                Host resources
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="stats-overview">
                <div class="container">
                    <div class="stats-header">
                        <h2>Your hosting overview</h2>
                        <select class="timeframe-selector">
                            <option value="7days">Last 7 days</option>
                            <option value="30days" selected>Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="year">This year</option>
                        </select>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card earnings">
                            <div class="stat-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="stat-content">
                                <h3>$${earnings.total.toLocaleString()}</h3>
                                <p>Total earnings</p>
                                <span class="stat-change positive">+${earnings.change}% vs last period</span>
                            </div>
                        </div>
                        
                        <div class="stat-card reservations">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${stats.reservations}</h3>
                                <p>Reservations</p>
                                <span class="stat-change positive">+${stats.reservationsChange}% vs last period</span>
                            </div>
                        </div>
                        
                        <div class="stat-card occupancy">
                            <div class="stat-icon">
                                <i class="fas fa-bed"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${stats.occupancyRate}%</h3>
                                <p>Occupancy rate</p>
                                <span class="stat-change ${stats.occupancyChange > 0 ? 'positive' : 'negative'}">${stats.occupancyChange > 0 ? '+' : ''}${stats.occupancyChange}% vs last period</span>
                            </div>
                        </div>
                        
                        <div class="stat-card rating">
                            <div class="stat-icon">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${stats.avgRating.toFixed(1)}</h3>
                                <p>Average rating</p>
                                <span class="stat-subtitle">${stats.totalReviews} reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-section">
                <div class="container">
                    <h2>Quick actions</h2>
                    <div class="actions-grid">
                        <button class="action-card" onclick="viewReservations()">
                            <i class="fas fa-calendar"></i>
                            <h3>Manage reservations</h3>
                            <p>View and manage your upcoming bookings</p>
                        </button>
                        
                        <button class="action-card" onclick="viewMessages()">
                            <i class="fas fa-envelope"></i>
                            <h3>Messages</h3>
                            <p>Respond to guest inquiries</p>
                            <span class="notification-badge">3</span>
                        </button>
                        
                        <button class="action-card" onclick="updateCalendar()">
                            <i class="fas fa-calendar-alt"></i>
                            <h3>Update calendar</h3>
                            <p>Manage availability and pricing</p>
                        </button>
                        
                        <button class="action-card" onclick="viewEarnings()">
                            <i class="fas fa-chart-line"></i>
                            <h3>View earnings</h3>
                            <p>Track your hosting income</p>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Listings Management -->
            ${this.hostListings.length > 0 ? `
            <div class="listings-section">
                <div class="container">
                    <div class="section-header">
                        <h2>Your listings</h2>
                        <div class="listing-actions">
                            <button class="secondary-btn" onclick="viewAllListings()">View all</button>
                            <button class="primary-btn" onclick="openAddListingModal()">Add new</button>
                        </div>
                    </div>
                    
                    <div class="host-listings-grid">
                        ${this.hostListings.slice(0, 3).map(listing => this.createHostListingCard(listing)).join('')}
                    </div>
                </div>
            </div>
            ` : `
            <div class="empty-listings-section">
                <div class="container">
                    <div class="empty-state">
                        <i class="fas fa-home fa-3x"></i>
                        <h2>Start your hosting journey</h2>
                        <p>List your space and start earning money as an Airbnb host</p>
                        <button class="primary-btn large" onclick="openAddListingModal()">
                            List your space
                        </button>
                    </div>
                </div>
            </div>
            `}

            <!-- Recent Activity -->
            <div class="activity-section">
                <div class="container">
                    <h2>Recent activity</h2>
                    <div class="activity-feed">
                        ${this.createActivityFeed()}
                    </div>
                </div>
            </div>

            <!-- Reviews Section -->
            ${this.hostReviews.length > 0 ? `
            <div class="reviews-section">
                <div class="container">
                    <div class="section-header">
                        <h2>Recent reviews</h2>
                        <button class="secondary-btn" onclick="viewAllReviews()">View all reviews</button>
                    </div>
                    
                    <div class="host-reviews-grid">
                        ${this.hostReviews.slice(0, 3).map(review => this.createHostReviewCard(review)).join('')}
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Tips and Resources -->
            <div class="resources-section">
                <div class="container">
                    <h2>Tips to improve your hosting</h2>
                    <div class="tips-grid">
                        <div class="tip-card">
                            <i class="fas fa-camera"></i>
                            <h3>Great photos</h3>
                            <p>Professional photos can increase bookings by up to 40%</p>
                            <button class="tip-btn" onclick="learnMore('photos')">Learn more</button>
                        </div>
                        
                        <div class="tip-card">
                            <i class="fas fa-reply"></i>
                            <h3>Quick responses</h3>
                            <p>Respond to inquiries within an hour to boost your visibility</p>
                            <button class="tip-btn" onclick="learnMore('responses')">Learn more</button>
                        </div>
                        
                        <div class="tip-card">
                            <i class="fas fa-star"></i>
                            <h3>5-star reviews</h3>
                            <p>Provide exceptional service to earn great reviews</p>
                            <button class="tip-btn" onclick="learnMore('reviews')">Learn more</button>
                        </div>
                        
                        <div class="tip-card">
                            <i class="fas fa-dollar-sign"></i>
                            <h3>Smart pricing</h3>
                            <p>Adjust your prices based on demand and local events</p>
                            <button class="tip-btn" onclick="learnMore('pricing')">Learn more</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Insights -->
            ${this.hostListings.length > 0 ? `
            <div class="insights-section">
                <div class="container">
                    <h2>Performance insights</h2>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <h3>Booking trends</h3>
                            <div class="chart-placeholder">
                                <i class="fas fa-chart-line fa-2x"></i>
                                <p>Interactive booking chart would be here</p>
                            </div>
                        </div>
                        
                        <div class="insight-card">
                            <h3>Guest feedback</h3>
                            <div class="feedback-summary">
                                <div class="feedback-item">
                                    <span class="feedback-category">Cleanliness</span>
                                    <div class="rating-bar">
                                        <div class="rating-fill" style="width: 96%"></div>
                                    </div>
                                    <span class="rating-value">4.8</span>
                                </div>
                                <div class="feedback-item">
                                    <span class="feedback-category">Communication</span>
                                    <div class="rating-bar">
                                        <div class="rating-fill" style="width: 98%"></div>
                                    </div>
                                    <span class="rating-value">4.9</span>
                                </div>
                                <div class="feedback-item">
                                    <span class="feedback-category">Location</span>
                                    <div class="rating-bar">
                                        <div class="rating-fill" style="width: 92%"></div>
                                    </div>
                                    <span class="rating-value">4.6</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
        `;
        
        document.getElementById('hostDashboard').innerHTML = dashboardHTML;
    }
    
    createHostListingCard(listing) {
        const listingReviews = this.reviews.filter(r => r.listingId === listing.id);
        const recentBookings = this.hostBookings.filter(b => b.listingId === listing.id).length;
        
        return `
            <div class="host-listing-card">
                <div class="listing-image-section">
                    <img src="${listing.images[0]}" alt="${listing.title}">
                    <div class="listing-status active">Active</div>
                </div>
                
                <div class="listing-content">
                    <h3 class="listing-title">${listing.title}</h3>
                    <p class="listing-location">${listing.location}</p>
                    
                    <div class="listing-stats">
                        <div class="stat">
                            <i class="fas fa-star"></i>
                            <span>${listing.rating.toFixed(1)} (${listing.reviewCount})</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${listing.price}/night</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-calendar-check"></i>
                            <span>${recentBookings} bookings</span>
                        </div>
                    </div>
                </div>
                
                <div class="listing-actions">
                    <button class="action-btn" onclick="viewListing('${listing.id}')" title="View listing">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editListing('${listing.id}')" title="Edit listing">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="viewListingStats('${listing.id}')" title="View stats">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <div class="dropdown">
                        <button class="action-btn dropdown-toggle" onclick="toggleListingMenu('${listing.id}')" title="More options">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" id="menu-${listing.id}">
                            <a href="#" onclick="duplicateListing('${listing.id}')">Duplicate</a>
                            <a href="#" onclick="pauseListing('${listing.id}')">Pause listing</a>
                            <a href="#" onclick="shareListing('${listing.id}')">Share</a>
                            <hr>
                            <a href="#" onclick="deleteListing('${listing.id}')" class="danger">Delete</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createHostReviewCard(review) {
        const listing = this.hostListings.find(l => l.id === review.listingId);
        
        return `
            <div class="host-review-card">
                <div class="review-header">
                    <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar">
                    <div class="reviewer-info">
                        <h4>${review.userName}</h4>
                        <div class="review-rating">
                            ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                        </div>
                        <p class="review-date">${new Date(review.date).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <p class="review-text">${review.text}</p>
                
                <div class="review-listing">
                    <small>Review for: ${listing?.title}</small>
                </div>
                
                <div class="review-actions">
                    <button class="reply-btn" onclick="replyToReview('${review.id}')">
                        <i class="fas fa-reply"></i>
                        Reply
                    </button>
                </div>
            </div>
        `;
    }
    
    createActivityFeed() {
        const activities = [
            {
                type: 'booking',
                icon: 'fas fa-calendar-check',
                message: 'New booking for Modern Hanok in Historic Bukchon',
                time: '2 hours ago'
            },
            {
                type: 'review',
                icon: 'fas fa-star',
                message: 'Sarah left a 5-star review for your Luxury Apartment',
                time: '5 hours ago'
            },
            {
                type: 'inquiry',
                icon: 'fas fa-envelope',
                message: '3 new guest inquiries received',
                time: '1 day ago'
            },
            {
                type: 'payout',
                icon: 'fas fa-dollar-sign',
                message: 'Payout of $340 processed successfully',
                time: '2 days ago'
            },
            {
                type: 'update',
                icon: 'fas fa-edit',
                message: 'Cozy Hongdae Studio listing updated',
                time: '3 days ago'
            }
        ];
        
        if (this.hostListings.length === 0) {
            return `
                <div class="empty-activity">
                    <i class="fas fa-clock fa-2x"></i>
                    <p>Your hosting activity will appear here once you start hosting</p>
                </div>
            `;
        }
        
        return activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-message">${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    calculateEarnings() {
        // Mock earnings calculation
        const baseEarnings = this.hostListings.reduce((total, listing) => {
            return total + (listing.price * 15); // Assume 15 nights booked per month
        }, 0);
        
        return {
            total: baseEarnings,
            change: Math.floor(Math.random() * 20) + 5 // 5-25% increase
        };
    }
    
    calculateStats() {
        const totalReviews = this.hostReviews.length;
        const avgRating = totalReviews > 0 ? 
            this.hostReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 
            0;
        
        return {
            reservations: this.hostBookings.length + Math.floor(Math.random() * 20),
            reservationsChange: Math.floor(Math.random() * 30) + 5,
            occupancyRate: Math.floor(Math.random() * 40) + 60,
            occupancyChange: Math.floor(Math.random() * 20) - 10,
            avgRating: avgRating || 4.8,
            totalReviews
        };
    }
    
    updateStats() {
        // Re-render stats section based on selected timeframe
        console.log('Updating stats for timeframe:', this.selectedTimeframe);
        // In a real app, this would fetch new data and update the display
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    closeAllModals() {
        document.getElementById('addListingModal').style.display = 'none';
    }
}

// Global functions
function openAddListingModal() {
    document.getElementById('addListingModal').style.display = 'flex';
}

function closeAddListingModal() {
    document.getElementById('addListingModal').style.display = 'none';
}

function createListing() {
    const formData = {
        title: document.getElementById('listingTitle').value,
        description: document.getElementById('listingDescription').value,
        type: document.getElementById('listingType').value,
        category: document.getElementById('listingCategory').value,
        location: document.getElementById('listingLocation').value,
        maxGuests: parseInt(document.getElementById('listingGuests').value),
        bedrooms: parseInt(document.getElementById('listingBedrooms').value),
        bathrooms: parseFloat(document.getElementById('listingBathrooms').value),
        price: parseInt(document.getElementById('listingPrice').value)
    };
    
    // In a real app, this would create the listing via API
    console.log('Creating listing:', formData);
    
    closeAddListingModal();
    showMessage('Listing created successfully! It will be reviewed and published soon.', 'success');
    
    // Clear form
    document.querySelector('.add-listing-form').reset();
}

function viewListing(listingId) {
    window.location.href = `property.html?id=${listingId}`;
}

function editListing(listingId) {
    showMessage('Edit listing functionality would open here', 'success');
}

function viewListingStats(listingId) {
    const listing = window.hostDashboard.hostListings.find(l => l.id === listingId);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content stats-modal" onclick="event.stopPropagation()">
            <h2>Listing Performance</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="stats-content">
                <h3>${listing.title}</h3>
                
                <div class="performance-stats">
                    <div class="stat-group">
                        <h4>Bookings</h4>
                        <div class="stat-item">
                            <span class="stat-label">This month:</span>
                            <span class="stat-value">${Math.floor(Math.random() * 10) + 5}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total:</span>
                            <span class="stat-value">${Math.floor(Math.random() * 50) + 20}</span>
                        </div>
                    </div>
                    
                    <div class="stat-group">
                        <h4>Earnings</h4>
                        <div class="stat-item">
                            <span class="stat-label">This month:</span>
                            <span class="stat-value">$${(listing.price * (Math.floor(Math.random() * 10) + 5)).toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average per night:</span>
                            <span class="stat-value">$${listing.price}</span>
                        </div>
                    </div>
                    
                    <div class="stat-group">
                        <h4>Guest Feedback</h4>
                        <div class="stat-item">
                            <span class="stat-label">Rating:</span>
                            <span class="stat-value">${listing.rating.toFixed(1)} ⭐</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Reviews:</span>
                            <span class="stat-value">${listing.reviewCount}</span>
                        </div>
                    </div>
                </div>
                
                <div class="chart-placeholder">
                    <i class="fas fa-chart-line fa-3x"></i>
                    <p>Detailed analytics charts would be displayed here</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function toggleListingMenu(listingId) {
    const menu = document.getElementById(`menu-${listingId}`);
    
    // Close all other menus
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    
    menu.classList.toggle('show');
}

function duplicateListing(listingId) {
    showMessage('Listing duplicated! You can now edit the copy.', 'success');
}

function pauseListing(listingId) {
    showMessage('Listing paused. It will not be visible to guests.', 'success');
}

function shareListing(listingId) {
    const url = `${window.location.origin}/property.html?id=${listingId}`;
    if (navigator.share) {
        navigator.share({
            title: 'Check out my Airbnb listing',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showMessage('Listing URL copied to clipboard!', 'success');
        });
    }
}

function deleteListing(listingId) {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
        showMessage('Listing deleted successfully.', 'success');
        // In a real app, remove from listings array and re-render
    }
}

function viewReservations() {
    showMessage('Reservations page would open here', 'success');
}

function viewMessages() {
    showMessage('Messages page would open here', 'success');
}

function updateCalendar() {
    showMessage('Calendar management would open here', 'success');
}

function viewEarnings() {
    showMessage('Earnings page would open here', 'success');
}

function viewAllListings() {
    showMessage('All listings view would open here', 'success');
}

function viewAllReviews() {
    showMessage('All reviews view would open here', 'success');
}

function replyToReview(reviewId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content reply-modal" onclick="event.stopPropagation()">
            <h2>Reply to Review</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <form onsubmit="submitReply('${reviewId}'); return false;">
                <div class="form-group">
                    <label for="replyText">Your reply</label>
                    <textarea id="replyText" rows="4" required placeholder="Thank your guest and address any concerns..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit">Send Reply</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function submitReply(reviewId) {
    const replyText = document.getElementById('replyText').value;
    // In a real app, this would submit the reply via API
    showMessage('Reply sent successfully!', 'success');
    document.querySelector('.modal-overlay').remove();
}

function viewHostResources() {
    showMessage('Host resources page would open here', 'success');
}

function learnMore(topic) {
    const topics = {
        photos: 'Learn about professional photography tips',
        responses: 'Learn about quick response strategies',
        reviews: 'Learn how to earn 5-star reviews',
        pricing: 'Learn about smart pricing strategies'
    };
    
    showMessage(topics[topic] || 'Learn more about hosting', 'success');
}

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function showMessage(text, type = 'success') {
    // Reuse message system
    if (window.airbnbApp && window.airbnbApp.showMessage) {
        window.airbnbApp.showMessage(text, type);
        return;
    }
    
    // Fallback
    const message = document.createElement('div');
    message.className = `toast-message ${type}`;
    message.style.cssText = `
        position: fixed; top: 100px; right: 20px; background: white;
        border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        padding: 16px; z-index: 10000; animation: slideInRight 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hostDashboard = new HostDashboardApp();
});
