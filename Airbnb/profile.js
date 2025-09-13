// Profile Page JavaScript

class ProfileApp {
    constructor() {
        this.users = window.airbnbData.users;
        this.listings = window.airbnbData.listings;
        this.reviews = window.airbnbData.reviews;
        this.currentUser = window.airbnbData.currentUser;
        this.storageUtils = window.airbnbData.storageUtils;
        
        this.viewingUser = null;
        this.isOwnProfile = false;
        this.favorites = this.storageUtils.getFavorites();
        this.bookings = this.storageUtils.getBookings();
        
        this.init();
    }
    
    init() {
        // Get user ID from URL parameters or default to current user
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id') || this.currentUser.id;
        
        this.loadProfile(userId);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle back button
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('id') || this.currentUser.id;
            this.loadProfile(userId);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    loadProfile(userId) {
        this.showLoading();
        
        // Simulate API delay
        setTimeout(() => {
            const user = this.users.find(u => u.id === userId) || this.currentUser;
            this.viewingUser = user;
            this.isOwnProfile = user.id === this.currentUser.id;
            
            this.renderProfile();
            this.hideLoading();
        }, 300);
    }
    
    renderProfile() {
        if (!this.viewingUser) return;
        
        // Update page title
        document.title = `${this.viewingUser.name} - Profile - Airbnb`;
        
        // Get user's listings and reviews
        const userListings = this.listings.filter(l => l.hostId === this.viewingUser.id);
        const userReviews = this.reviews.filter(r => r.userId === this.viewingUser.id);
        const reviewsReceived = this.reviews.filter(r => 
            this.listings.some(l => l.hostId === this.viewingUser.id && l.id === r.listingId)
        );
        
        const profileHTML = `
            <div class="profile-header">
                <div class="profile-avatar-container">
                    <img src="${this.viewingUser.avatar}" alt="${this.viewingUser.name}" class="profile-avatar-large">
                    ${this.isOwnProfile ? '<button class="change-photo-btn" onclick="changeProfilePhoto()"><i class="fas fa-camera"></i></button>' : ''}
                </div>
                
                <div class="profile-info">
                    <div class="profile-name-section">
                        <h1 class="profile-name">${this.viewingUser.name}</h1>
                        ${this.viewingUser.superhost ? '<span class="superhost-badge large">Superhost</span>' : ''}
                        ${this.isOwnProfile ? '<button class="edit-profile-btn" onclick="openEditModal()"><i class="fas fa-edit"></i> Edit Profile</button>' : ''}
                    </div>
                    
                    <div class="profile-subtitle">
                        <span><i class="fas fa-map-marker-alt"></i> ${this.viewingUser.location || 'Location not specified'}</span>
                        <span><i class="fas fa-calendar"></i> Joined ${new Date(this.viewingUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        ${this.viewingUser.verifiedId ? '<span><i class="fas fa-check-circle" style="color: #00a699;"></i> Identity verified</span>' : ''}
                    </div>
                    
                    ${this.viewingUser.bio ? `<p class="profile-bio">${this.viewingUser.bio}</p>` : ''}
                </div>
                
                ${!this.isOwnProfile ? `
                <div class="profile-actions">
                    <button class="contact-btn" onclick="contactUser('${this.viewingUser.id}')">
                        <i class="fas fa-envelope"></i>
                        Contact ${this.viewingUser.name}
                    </button>
                </div>
                ` : ''}
            </div>

            <!-- Profile Stats -->
            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="number">${userListings.length}</span>
                    <span class="label">Listing${userListings.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="profile-stat">
                    <span class="number">${reviewsReceived.length}</span>
                    <span class="label">Review${reviewsReceived.length !== 1 ? 's' : ''} as host</span>
                </div>
                <div class="profile-stat">
                    <span class="number">${userReviews.length}</span>
                    <span class="label">Review${userReviews.length !== 1 ? 's' : ''} written</span>
                </div>
                ${this.isOwnProfile ? `
                <div class="profile-stat">
                    <span class="number">${this.favorites.length}</span>
                    <span class="label">Favorite${this.favorites.length !== 1 ? 's' : ''}</span>
                </div>
                ` : ''}
            </div>

            <!-- Profile Navigation Tabs -->
            <div class="profile-tabs">
                ${userListings.length > 0 ? '<button class="profile-tab active" data-tab="listings" onclick="switchProfileTab(\'listings\')">Listings</button>' : ''}
                ${reviewsReceived.length > 0 ? '<button class="profile-tab" data-tab="reviews-received" onclick="switchProfileTab(\'reviews-received\')">Reviews received</button>' : ''}
                ${userReviews.length > 0 ? '<button class="profile-tab" data-tab="reviews-written" onclick="switchProfileTab(\'reviews-written\')">Reviews written</button>' : ''}
                ${this.isOwnProfile ? '<button class="profile-tab" data-tab="favorites" onclick="switchProfileTab(\'favorites\')">Favorites</button>' : ''}
                ${this.isOwnProfile ? '<button class="profile-tab" data-tab="trips" onclick="switchProfileTab(\'trips\')">Trips</button>' : ''}
                <button class="profile-tab" data-tab="about" onclick="switchProfileTab('about')">About</button>
            </div>

            <!-- Tab Content -->
            <div class="profile-content">
                ${this.createTabContent(userListings, reviewsReceived, userReviews)}
            </div>
        `;
        
        document.getElementById('profileContainer').innerHTML = profileHTML;
        
        // Activate first available tab
        if (userListings.length > 0) {
            this.switchTab('listings');
        } else if (reviewsReceived.length > 0) {
            this.switchTab('reviews-received');
        } else {
            this.switchTab('about');
        }
    }
    
    createTabContent(userListings, reviewsReceived, userReviews) {
        return `
            <!-- Listings Tab -->
            ${userListings.length > 0 ? `
            <div class="tab-content" id="listings-tab">
                <div class="listings-grid">
                    ${userListings.map(listing => this.createListingCard(listing)).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Reviews Received Tab -->
            ${reviewsReceived.length > 0 ? `
            <div class="tab-content" id="reviews-received-tab" style="display: none;">
                <div class="reviews-list">
                    ${reviewsReceived.map(review => this.createReviewCard(review, 'received')).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Reviews Written Tab -->
            ${userReviews.length > 0 ? `
            <div class="tab-content" id="reviews-written-tab" style="display: none;">
                <div class="reviews-list">
                    ${userReviews.map(review => this.createReviewCard(review, 'written')).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Favorites Tab -->
            ${this.isOwnProfile ? `
            <div class="tab-content" id="favorites-tab" style="display: none;">
                ${this.createFavoritesContent()}
            </div>
            ` : ''}
            
            <!-- Trips Tab -->
            ${this.isOwnProfile ? `
            <div class="tab-content" id="trips-tab" style="display: none;">
                ${this.createTripsContent()}
            </div>
            ` : ''}
            
            <!-- About Tab -->
            <div class="tab-content" id="about-tab" style="display: none;">
                ${this.createAboutContent()}
            </div>
        `;
    }
    
    createListingCard(listing) {
        return `
            <div class="profile-listing-card" onclick="window.location.href='property.html?id=${listing.id}'">
                <div class="listing-image-container">
                    <img src="${listing.images[0]}" alt="${listing.title}" loading="lazy">
                    ${listing.superhost ? '<span class="superhost-badge small">Superhost</span>' : ''}
                </div>
                <div class="listing-info">
                    <h3 class="listing-title">${listing.title}</h3>
                    <p class="listing-location">${listing.location}</p>
                    <div class="listing-rating">
                        <i class="fas fa-star"></i>
                        <span>${listing.rating.toFixed(1)}</span>
                        <span>(${listing.reviewCount} reviews)</span>
                    </div>
                    <div class="listing-price">
                        <strong>$${listing.price}</strong> night
                    </div>
                </div>
                ${this.isOwnProfile ? `
                <div class="listing-actions">
                    <button class="edit-listing-btn" onclick="event.stopPropagation(); editListing('${listing.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="listing-stats-btn" onclick="event.stopPropagation(); showListingStats('${listing.id}')">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    createReviewCard(review, type) {
        const listing = this.listings.find(l => l.id === review.listingId);
        const reviewer = this.users.find(u => u.id === review.userId);
        
        return `
            <div class="profile-review-card">
                <div class="review-header">
                    <div class="review-listing-info" onclick="window.location.href='property.html?id=${listing?.id}'">
                        <img src="${listing?.images[0]}" alt="${listing?.title}" class="review-listing-image">
                        <div class="review-listing-details">
                            <h4>${listing?.title}</h4>
                            <p>${listing?.location}</p>
                        </div>
                    </div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                </div>
                
                <div class="review-rating">
                    ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                </div>
                
                <p class="review-text">${review.text}</p>
                
                ${type === 'written' && reviewer ? `
                <div class="reviewer-info">
                    <img src="${reviewer.avatar}" alt="${reviewer.name}" class="reviewer-avatar small">
                    <span>Review by ${reviewer.name}</span>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    createFavoritesContent() {
        if (this.favorites.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-heart fa-3x"></i>
                    <h3>No favorites yet</h3>
                    <p>Start exploring and save places you love!</p>
                    <a href="index.html" class="explore-btn">Explore listings</a>
                </div>
            `;
        }
        
        const favoriteListings = this.listings.filter(l => this.favorites.includes(l.id));
        
        return `
            <div class="favorites-grid">
                ${favoriteListings.map(listing => this.createListingCard(listing)).join('')}
            </div>
        `;
    }
    
    createTripsContent() {
        if (this.bookings.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-suitcase fa-3x"></i>
                    <h3>No trips yet</h3>
                    <p>Time to dust off your bags and start planning your next adventure!</p>
                    <a href="index.html" class="explore-btn">Start searching</a>
                </div>
            `;
        }
        
        return `
            <div class="trips-list">
                ${this.bookings.map(booking => this.createTripCard(booking)).join('')}
            </div>
        `;
    }
    
    createTripCard(booking) {
        const listing = this.listings.find(l => l.id === booking.listingId);
        const checkinDate = new Date(booking.checkin);
        const checkoutDate = new Date(booking.checkout);
        const now = new Date();
        
        let status = 'upcoming';
        if (checkoutDate < now) status = 'past';
        else if (checkinDate <= now && checkoutDate >= now) status = 'current';
        
        return `
            <div class="trip-card ${status}">
                <div class="trip-image">
                    <img src="${listing?.images[0]}" alt="${listing?.title}">
                    <span class="trip-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                <div class="trip-info">
                    <h3>${listing?.title}</h3>
                    <p class="trip-location">${listing?.location}</p>
                    <p class="trip-dates">${checkinDate.toLocaleDateString()} - ${checkoutDate.toLocaleDateString()}</p>
                    <p class="trip-guests">${booking.guests} guest${booking.guests !== 1 ? 's' : ''}</p>
                    <p class="trip-total">Total: ${booking.total || '$0'}</p>
                </div>
                <div class="trip-actions">
                    <button class="view-booking-btn" onclick="viewBookingDetails('${booking.id}')">
                        View Details
                    </button>
                    ${status === 'past' ? `
                    <button class="review-btn" onclick="writeReview('${listing?.id}')">
                        Write Review
                    </button>
                    ` : ''}
                    ${status !== 'past' ? `
                    <button class="cancel-btn" onclick="cancelBooking('${booking.id}')">
                        Cancel
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    createAboutContent() {
        return `
            <div class="about-content">
                ${this.viewingUser.bio ? `
                <div class="about-section">
                    <h3>About ${this.viewingUser.name}</h3>
                    <p>${this.viewingUser.bio}</p>
                </div>
                ` : ''}
                
                <div class="about-details">
                    <div class="detail-group">
                        <h4>Personal Details</h4>
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Lives in ${this.viewingUser.location || 'Not specified'}</span>
                        </div>
                        ${this.viewingUser.work ? `
                        <div class="detail-item">
                            <i class="fas fa-briefcase"></i>
                            <span>Works at ${this.viewingUser.work}</span>
                        </div>
                        ` : ''}
                        ${this.viewingUser.school ? `
                        <div class="detail-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Went to ${this.viewingUser.school}</span>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>Joined ${new Date(this.viewingUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                    
                    ${this.viewingUser.languages ? `
                    <div class="detail-group">
                        <h4>Languages</h4>
                        <div class="languages-list">
                            ${Array.isArray(this.viewingUser.languages) ? 
                                this.viewingUser.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('') :
                                `<span class="language-tag">${this.viewingUser.languages}</span>`
                            }
                        </div>
                    </div>
                    ` : ''}
                    
                    ${this.viewingUser.funFact ? `
                    <div class="detail-group">
                        <h4>Fun Fact</h4>
                        <p>${this.viewingUser.funFact}</p>
                    </div>
                    ` : ''}
                    
                    ${this.viewingUser.hobbies ? `
                    <div class="detail-group">
                        <h4>Interests</h4>
                        <div class="hobbies-list">
                            ${Array.isArray(this.viewingUser.hobbies) ? 
                                this.viewingUser.hobbies.map(hobby => `<span class="hobby-tag">${hobby}</span>`).join('') :
                                `<span class="hobby-tag">${this.viewingUser.hobbies}</span>`
                            }
                        </div>
                    </div>
                    ` : ''}
                    
                    ${this.viewingUser.superhost ? `
                    <div class="detail-group">
                        <h4>Hosting</h4>
                        <div class="hosting-info">
                            <span class="superhost-badge">Superhost</span>
                            <p>Superhosts are experienced, highly rated hosts who provide great stays for guests.</p>
                            ${this.viewingUser.responseRate ? `<p><strong>Response rate:</strong> ${this.viewingUser.responseRate}%</p>` : ''}
                            ${this.viewingUser.responseTime ? `<p><strong>Response time:</strong> ${this.viewingUser.responseTime}</p>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                ${this.viewingUser.verifiedId ? `
                <div class="verification-section">
                    <h4><i class="fas fa-check-circle" style="color: #00a699;"></i> Identity verified</h4>
                    <p>We've confirmed this person's identity using official government ID and other verification methods.</p>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    closeAllModals() {
        document.getElementById('editProfileModal').style.display = 'none';
    }
}

// Global functions
function switchProfileTab(tabName) {
    window.profileApp.switchTab(tabName);
}

function openEditModal() {
    const user = window.profileApp.viewingUser;
    
    // Populate form
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editBio').value = user.bio || '';
    document.getElementById('editLocation').value = user.location || '';
    document.getElementById('editWork').value = user.work || '';
    document.getElementById('editSchool').value = user.school || '';
    document.getElementById('editLanguages').value = Array.isArray(user.languages) ? user.languages.join(', ') : (user.languages || '');
    
    document.getElementById('editProfileModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

function saveProfile() {
    const formData = {
        name: document.getElementById('editName').value,
        bio: document.getElementById('editBio').value,
        location: document.getElementById('editLocation').value,
        work: document.getElementById('editWork').value,
        school: document.getElementById('editSchool').value,
        languages: document.getElementById('editLanguages').value.split(',').map(lang => lang.trim()).filter(lang => lang)
    };
    
    // Update user object (in real app, this would be an API call)
    Object.assign(window.profileApp.viewingUser, formData);
    
    // Re-render profile
    window.profileApp.renderProfile();
    closeEditModal();
    
    showMessage('Profile updated successfully!', 'success');
}

function changeProfilePhoto() {
    // In a real app, this would open a file picker
    showMessage('Photo upload would be implemented here', 'success');
}

function contactUser(userId) {
    showMessage(`Message sent to user!`, 'success');
    // In a real app, this would open messaging interface
}

function editListing(listingId) {
    showMessage(`Edit listing functionality would open here`, 'success');
    // In a real app, this would navigate to listing edit page
}

function showListingStats(listingId) {
    const listing = window.airbnbData.listings.find(l => l.id === listingId);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content stats-modal" onclick="event.stopPropagation()">
            <h2>Listing Statistics</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="stats-content">
                <h3>${listing.title}</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${listing.reviewCount}</span>
                        <span class="stat-label">Total Reviews</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${listing.rating.toFixed(1)}</span>
                        <span class="stat-label">Average Rating</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">$${listing.price}</span>
                        <span class="stat-label">Price per Night</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${Math.floor(Math.random() * 100)}%</span>
                        <span class="stat-label">Occupancy Rate</span>
                    </div>
                </div>
                <p class="stats-note">These are sample statistics. In a real application, detailed analytics would be provided.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function viewBookingDetails(bookingId) {
    const booking = window.profileApp.bookings.find(b => b.id === bookingId);
    const listing = window.airbnbData.listings.find(l => l.id === booking?.listingId);
    
    if (!booking || !listing) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content booking-details-modal" onclick="event.stopPropagation()">
            <h2>Booking Details</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="booking-details-content">
                <div class="booking-property">
                    <img src="${listing.images[0]}" alt="${listing.title}">
                    <div>
                        <h3>${listing.title}</h3>
                        <p>${listing.location}</p>
                    </div>
                </div>
                <div class="booking-info">
                    <p><strong>Check-in:</strong> ${new Date(booking.checkin).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> ${new Date(booking.checkout).toLocaleDateString()}</p>
                    <p><strong>Guests:</strong> ${booking.guests}</p>
                    <p><strong>Total:</strong> ${booking.total}</p>
                    <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function writeReview(listingId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content write-review-modal" onclick="event.stopPropagation()">
            <h2>Write a Review</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <form class="review-form" onsubmit="submitReview('${listingId}'); return false;">
                <div class="rating-input">
                    <label>Rating</label>
                    <div class="star-rating">
                        ${Array(5).fill(0).map((_, i) => `
                            <button type="button" class="star-btn" onclick="setRating(${i + 1})">
                                <i class="far fa-star"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="reviewText">Your review</label>
                    <textarea id="reviewText" rows="5" required placeholder="Share your experience..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit">Submit Review</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function setRating(rating) {
    document.querySelectorAll('.star-btn i').forEach((star, index) => {
        star.className = index < rating ? 'fas fa-star' : 'far fa-star';
    });
    
    // Store rating
    document.querySelector('.review-form').dataset.rating = rating;
}

function submitReview(listingId) {
    const rating = document.querySelector('.review-form').dataset.rating;
    const text = document.getElementById('reviewText').value;
    
    if (!rating) {
        showMessage('Please select a rating', 'error');
        return;
    }
    
    // In real app, this would be submitted to API
    showMessage('Review submitted successfully!', 'success');
    document.querySelector('.modal-overlay').remove();
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Remove booking from local storage
        window.profileApp.bookings = window.profileApp.bookings.filter(b => b.id !== bookingId);
        window.profileApp.storageUtils.saveBooking = (bookings) => {
            localStorage.setItem('airbnb_bookings', JSON.stringify(bookings));
        };
        
        // Re-render trips
        window.profileApp.renderProfile();
        showMessage('Booking cancelled successfully', 'success');
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

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileApp = new ProfileApp();
});
