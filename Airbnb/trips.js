// Trips Page JavaScript

class TripsApp {
    constructor() {
        this.listings = window.airbnbData.listings;
        this.users = window.airbnbData.users;
        this.reviews = window.airbnbData.reviews;
        this.currentUser = window.airbnbData.currentUser;
        this.storageUtils = window.airbnbData.storageUtils;
        
        this.bookings = this.storageUtils.getBookings();
        this.currentFilter = 'all';
        this.currentTripForCancel = null;
        this.currentTripForReview = null;
        this.reviewRatings = {};
        
        this.init();
    }
    
    init() {
        // Add some sample bookings if none exist
        if (this.bookings.length === 0) {
            this.createSampleBookings();
        }
        
        this.renderTrips();
        this.hideLoading();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay')) {
                this.closeAllModals();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    createSampleBookings() {
        const sampleBookings = [
            {
                id: 'booking_sample_1',
                listingId: 'jun_1',
                userId: this.currentUser.id,
                checkin: '2024-12-15',
                checkout: '2024-12-18',
                guests: 2,
                totalNights: 3,
                subtotal: 360,
                serviceFee: 50,
                taxes: 29,
                total: 439,
                status: 'confirmed',
                bookedAt: '2024-09-01T10:00:00Z'
            },
            {
                id: 'booking_sample_2',
                listingId: 'listing_1',
                userId: this.currentUser.id,
                checkin: '2024-08-10',
                checkout: '2024-08-14',
                guests: 4,
                totalNights: 4,
                subtotal: 1800,
                serviceFee: 252,
                taxes: 144,
                total: 2196,
                status: 'confirmed',
                bookedAt: '2024-07-15T14:30:00Z'
            },
            {
                id: 'booking_sample_3',
                listingId: 'listing_3',
                userId: this.currentUser.id,
                checkin: '2024-07-20',
                checkout: '2024-07-25',
                guests: 2,
                totalNights: 5,
                subtotal: 925,
                serviceFee: 129,
                taxes: 74,
                total: 1128,
                status: 'confirmed',
                bookedAt: '2024-06-20T09:15:00Z'
            }
        ];
        
        this.bookings = sampleBookings;
        // Save sample bookings to localStorage
        localStorage.setItem('airbnb_bookings', JSON.stringify(this.bookings));
    }
    
    renderTrips() {
        const filteredTrips = this.getFilteredTrips();
        
        if (filteredTrips.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const tripsHTML = `
            <div class="trips-list">
                ${filteredTrips.map(booking => this.createTripCard(booking)).join('')}
            </div>
        `;
        
        document.getElementById('tripsContent').innerHTML = tripsHTML;
    }
    
    renderEmptyState() {
        const emptyStateHTML = `
            <div class="empty-trips-state">
                <div class="empty-state-icon">
                    <i class="fas fa-suitcase fa-4x"></i>
                </div>
                <h2>No trips yet</h2>
                <p>Time to dust off your bags and start planning your next adventure</p>
                <a href="index.html" class="explore-btn">
                    <i class="fas fa-search"></i>
                    Start searching
                </a>
            </div>
        `;
        
        document.getElementById('tripsContent').innerHTML = emptyStateHTML;
    }
    
    getFilteredTrips() {
        const now = new Date();
        
        return this.bookings.filter(booking => {
            const checkinDate = new Date(booking.checkin);
            const checkoutDate = new Date(booking.checkout);
            
            switch (this.currentFilter) {
                case 'upcoming':
                    return checkinDate > now;
                case 'current':
                    return checkinDate <= now && checkoutDate >= now;
                case 'past':
                    return checkoutDate < now;
                default:
                    return true;
            }
        }).sort((a, b) => new Date(b.checkin) - new Date(a.checkin));
    }
    
    createTripCard(booking) {
        const listing = this.listings.find(l => l.id === booking.listingId);
        const host = listing ? this.users.find(u => u.id === listing.hostId) : null;
        
        if (!listing) {
            return ''; // Skip if listing not found
        }
        
        const checkinDate = new Date(booking.checkin);
        const checkoutDate = new Date(booking.checkout);
        const now = new Date();
        
        let status = 'upcoming';
        let statusClass = 'upcoming';
        if (checkoutDate < now) {
            status = 'completed';
            statusClass = 'past';
        } else if (checkinDate <= now && checkoutDate >= now) {
            status = 'current';
            statusClass = 'current';
        }
        
        const canCancel = checkinDate > new Date(Date.now() + 48 * 60 * 60 * 1000); // Can cancel if more than 48 hours before checkin
        const canReview = status === 'completed';
        const daysTillCheckin = Math.ceil((checkinDate - now) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="trip-card ${statusClass}" data-booking-id="${booking.id}">
                <div class="trip-image">
                    <img src="${listing.images[0]}" alt="${listing.title}" loading="lazy">
                    <div class="trip-status-badge ${statusClass}">
                        ${status === 'upcoming' ? 
                            (daysTillCheckin <= 7 ? `${daysTillCheckin} days` : 'Upcoming') : 
                            status.charAt(0).toUpperCase() + status.slice(1)
                        }
                    </div>
                </div>
                
                <div class="trip-content">
                    <div class="trip-header">
                        <h3 class="trip-title">${listing.title}</h3>
                        <button class="trip-menu-btn" onclick="toggleTripMenu('${booking.id}')">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="trip-menu" id="menu-${booking.id}">
                            <a href="#" onclick="viewTripDetails('${booking.id}')">View details</a>
                            <a href="property.html?id=${listing.id}" target="_blank">View listing</a>
                            <a href="#" onclick="contactHost('${host?.id}')">Contact host</a>
                            ${canCancel ? '<hr><a href="#" onclick="openCancelTripModal(\'' + booking.id + '\')" class="danger">Cancel reservation</a>' : ''}
                        </div>
                    </div>
                    
                    <div class="trip-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${listing.location}</span>
                    </div>
                    
                    <div class="trip-host">
                        <img src="${host?.avatar}" alt="${host?.name}" class="host-avatar-small">
                        <span>Hosted by ${host?.name}</span>
                        ${host?.superhost ? '<span class="superhost-badge small">Superhost</span>' : ''}
                    </div>
                    
                    <div class="trip-dates">
                        <div class="date-info">
                            <i class="fas fa-calendar"></i>
                            <span>${checkinDate.toLocaleDateString()} - ${checkoutDate.toLocaleDateString()}</span>
                        </div>
                        <div class="guest-info">
                            <i class="fas fa-users"></i>
                            <span>${booking.guests} guest${booking.guests !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    
                    <div class="trip-details">
                        <div class="nights-info">
                            <span class="nights">${booking.totalNights} night${booking.totalNights !== 1 ? 's' : ''}</span>
                            <span class="total-cost">$${booking.total}</span>
                        </div>
                        <div class="booking-confirmation">
                            <span class="confirmation-number">Confirmation: ${booking.id.slice(-8).toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <div class="trip-actions">
                        ${status === 'upcoming' && daysTillCheckin <= 1 ? `
                        <div class="check-in-info">
                            <i class="fas fa-info-circle"></i>
                            <span>Check-in instructions will be sent 1 hour before arrival</span>
                        </div>
                        ` : ''}
                        
                        <div class="action-buttons">
                            ${status === 'current' ? `
                            <button class="action-btn primary" onclick="getDirections('${listing.id}')">
                                <i class="fas fa-directions"></i>
                                Get directions
                            </button>
                            ` : ''}
                            
                            ${canReview ? `
                            <button class="action-btn secondary" onclick="openWriteReviewModal('${booking.id}')">
                                <i class="fas fa-star"></i>
                                Write review
                            </button>
                            ` : ''}
                            
                            <button class="action-btn secondary" onclick="viewTripDetails('${booking.id}')">
                                <i class="fas fa-receipt"></i>
                                View receipt
                            </button>
                            
                            ${canCancel ? `
                            <button class="action-btn danger-outline" onclick="openCancelTripModal('${booking.id}')">
                                <i class="fas fa-times"></i>
                                Cancel
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    filterTrips(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Re-render trips
        this.renderTrips();
    }
    
    viewTripDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        const listing = this.listings.find(l => l.id === booking?.listingId);
        const host = listing ? this.users.find(u => u.id === listing.hostId) : null;
        
        if (!booking || !listing) return;
        
        const checkinDate = new Date(booking.checkin);
        const checkoutDate = new Date(booking.checkout);
        
        const detailsHTML = `
            <div class="trip-details-header">
                <h2>Trip Details</h2>
                <div class="confirmation-code">
                    Confirmation code: <strong>${booking.id.slice(-8).toUpperCase()}</strong>
                </div>
            </div>
            
            <div class="trip-property-info">
                <img src="${listing.images[0]}" alt="${listing.title}" class="property-image">
                <div class="property-details">
                    <h3>${listing.title}</h3>
                    <p class="property-location">${listing.location}</p>
                    <div class="property-host">
                        <img src="${host?.avatar}" alt="${host?.name}" class="host-avatar">
                        <div>
                            <span class="host-name">Hosted by ${host?.name}</span>
                            ${host?.superhost ? '<span class="superhost-badge">Superhost</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="trip-booking-info">
                <div class="info-section">
                    <h4>Dates</h4>
                    <p><strong>Check-in:</strong> ${checkinDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Check-out:</strong> ${checkoutDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Duration:</strong> ${booking.totalNights} night${booking.totalNights !== 1 ? 's' : ''}</p>
                </div>
                
                <div class="info-section">
                    <h4>Guests</h4>
                    <p>${booking.guests} guest${booking.guests !== 1 ? 's' : ''}</p>
                </div>
                
                <div class="info-section">
                    <h4>Property Details</h4>
                    <p>${listing.type}</p>
                    <p>${listing.maxGuests} max guests • ${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? 's' : ''} • ${listing.bathrooms} bathroom${listing.bathrooms !== 1 ? 's' : ''}</p>
                </div>
            </div>
            
            <div class="trip-cost-breakdown">
                <h4>Cost Breakdown</h4>
                <div class="cost-details">
                    <div class="cost-item">
                        <span>$${listing.price} x ${booking.totalNights} night${booking.totalNights !== 1 ? 's' : ''}</span>
                        <span>$${booking.subtotal}</span>
                    </div>
                    <div class="cost-item">
                        <span>Service fee</span>
                        <span>$${booking.serviceFee}</span>
                    </div>
                    <div class="cost-item">
                        <span>Taxes</span>
                        <span>$${booking.taxes}</span>
                    </div>
                    <div class="cost-item total">
                        <span><strong>Total</strong></span>
                        <span><strong>$${booking.total}</strong></span>
                    </div>
                </div>
            </div>
            
            <div class="trip-actions-section">
                <button class="action-btn secondary" onclick="contactHost('${host?.id}')">
                    <i class="fas fa-envelope"></i>
                    Contact Host
                </button>
                <button class="action-btn secondary" onclick="window.open('property.html?id=${listing.id}', '_blank')">
                    <i class="fas fa-external-link-alt"></i>
                    View Listing
                </button>
                <button class="action-btn secondary" onclick="printReceipt('${booking.id}')">
                    <i class="fas fa-print"></i>
                    Print Receipt
                </button>
            </div>
        `;
        
        document.getElementById('tripDetailsContent').innerHTML = detailsHTML;
        document.getElementById('tripDetailsModal').style.display = 'flex';
    }
    
    openCancelTripModal(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        const listing = this.listings.find(l => l.id === booking?.listingId);
        
        if (!booking || !listing) return;
        
        this.currentTripForCancel = booking;
        
        const checkinDate = new Date(booking.checkin);
        const now = new Date();
        const hoursTillCheckin = Math.floor((checkinDate - now) / (1000 * 60 * 60));
        
        let refundAmount = 0;
        let refundText = '';
        
        if (hoursTillCheckin > 48) {
            refundAmount = booking.total;
            refundText = 'Full refund';
        } else if (hoursTillCheckin > 24) {
            refundAmount = Math.floor(booking.total * 0.5);
            refundText = '50% refund';
        } else {
            refundAmount = 0;
            refundText = 'No refund';
        }
        
        document.getElementById('refundInfo').innerHTML = `
            <div class="refund-details">
                <h4>Refund Information</h4>
                <div class="refund-item">
                    <span>Original payment:</span>
                    <span>$${booking.total}</span>
                </div>
                <div class="refund-item">
                    <span>Cancellation fee:</span>
                    <span>$${booking.total - refundAmount}</span>
                </div>
                <div class="refund-item total">
                    <span><strong>Refund amount:</strong></span>
                    <span><strong>$${refundAmount}</strong></span>
                </div>
                <p class="refund-note">${refundText} - ${hoursTillCheckin} hours until check-in</p>
            </div>
        `;
        
        document.getElementById('cancelTripModal').style.display = 'flex';
    }
    
    confirmCancelTrip() {
        if (!this.currentTripForCancel) return;
        
        // Remove booking from array
        this.bookings = this.bookings.filter(b => b.id !== this.currentTripForCancel.id);
        
        // Update localStorage
        localStorage.setItem('airbnb_bookings', JSON.stringify(this.bookings));
        
        this.closeCancelTripModal();
        this.renderTrips();
        
        showMessage('Trip cancelled successfully. Refund will be processed within 3-5 business days.', 'success');
    }
    
    openWriteReviewModal(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        const listing = this.listings.find(l => l.id === booking?.listingId);
        const host = listing ? this.users.find(u => u.id === listing.hostId) : null;
        
        if (!booking || !listing) return;
        
        this.currentTripForReview = booking;
        this.reviewRatings = {};
        
        document.getElementById('reviewPropertyInfo').innerHTML = `
            <div class="review-property">
                <img src="${listing.images[0]}" alt="${listing.title}">
                <div class="property-info">
                    <h3>${listing.title}</h3>
                    <p>${listing.location}</p>
                    <p>Hosted by ${host?.name}</p>
                </div>
            </div>
        `;
        
        // Reset all star ratings
        document.querySelectorAll('.star-rating .star-btn i').forEach(star => {
            star.className = 'far fa-star';
        });
        
        document.getElementById('reviewText').value = '';
        document.getElementById('writeReviewModal').style.display = 'flex';
    }
    
    setReviewRating(category, rating) {
        this.reviewRatings[category] = rating;
        
        const starContainer = document.querySelector(`[data-category="${category}"]`);
        const stars = starContainer.querySelectorAll('.star-btn i');
        
        stars.forEach((star, index) => {
            star.className = index < rating ? 'fas fa-star' : 'far fa-star';
        });
    }
    
    submitTripReview() {
        const reviewText = document.getElementById('reviewText').value;
        const overallRating = this.reviewRatings.overall;
        
        if (!overallRating) {
            showMessage('Please provide an overall rating', 'error');
            return;
        }
        
        // Create review object
        const review = {
            id: 'review_' + Date.now(),
            listingId: this.currentTripForReview.listingId,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            rating: overallRating,
            date: new Date().toISOString().split('T')[0],
            text: reviewText || 'Great stay!',
            categories: this.reviewRatings
        };
        
        // In a real app, this would be saved to the backend
        console.log('Review submitted:', review);
        
        this.closeWriteReviewModal();
        showMessage('Review submitted successfully!', 'success');
    }
    
    toggleTripMenu(bookingId) {
        const menu = document.getElementById(`menu-${bookingId}`);
        
        // Close all other menus
        document.querySelectorAll('.trip-menu').forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });
        
        menu.classList.toggle('show');
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    closeAllModals() {
        document.getElementById('tripDetailsModal').style.display = 'none';
        document.getElementById('cancelTripModal').style.display = 'none';
        document.getElementById('writeReviewModal').style.display = 'none';
    }
    
    closeTripDetailsModal() {
        document.getElementById('tripDetailsModal').style.display = 'none';
    }
    
    closeCancelTripModal() {
        document.getElementById('cancelTripModal').style.display = 'none';
        this.currentTripForCancel = null;
    }
    
    closeWriteReviewModal() {
        document.getElementById('writeReviewModal').style.display = 'none';
        this.currentTripForReview = null;
        this.reviewRatings = {};
    }
}

// Global functions
function filterTrips(filter) {
    window.tripsApp.filterTrips(filter);
}

function viewTripDetails(bookingId) {
    window.tripsApp.viewTripDetails(bookingId);
}

function openCancelTripModal(bookingId) {
    window.tripsApp.openCancelTripModal(bookingId);
}

function confirmCancelTrip() {
    window.tripsApp.confirmCancelTrip();
}

function openWriteReviewModal(bookingId) {
    window.tripsApp.openWriteReviewModal(bookingId);
}

function setReviewRating(category, rating) {
    window.tripsApp.setReviewRating(category, rating);
}

function submitTripReview() {
    window.tripsApp.submitTripReview();
}

function toggleTripMenu(bookingId) {
    window.tripsApp.toggleTripMenu(bookingId);
}

function closeTripDetailsModal() {
    window.tripsApp.closeTripDetailsModal();
}

function closeCancelTripModal() {
    window.tripsApp.closeCancelTripModal();
}

function closeWriteReviewModal() {
    window.tripsApp.closeWriteReviewModal();
}

function contactHost(hostId) {
    showMessage('Message sent to host!', 'success');
}

function getDirections(listingId) {
    const listing = window.airbnbData.listings.find(l => l.id === listingId);
    if (listing && listing.coordinates) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${listing.coordinates.lat},${listing.coordinates.lng}`;
        window.open(url, '_blank');
    } else {
        showMessage('Directions will be available closer to your check-in date', 'success');
    }
}

function printReceipt(bookingId) {
    // In a real app, this would generate a printable receipt
    showMessage('Receipt download started', 'success');
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
    if (!e.target.closest('.trip-menu-btn')) {
        document.querySelectorAll('.trip-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tripsApp = new TripsApp();
});
