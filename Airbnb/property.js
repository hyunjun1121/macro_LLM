// Property Detail Page JavaScript

class PropertyDetailApp {
    constructor() {
        this.listings = window.airbnbData.listings;
        this.users = window.airbnbData.users;
        this.reviews = window.airbnbData.reviews;
        this.storageUtils = window.airbnbData.storageUtils;
        
        this.currentProperty = null;
        this.currentImageIndex = 0;
        this.bookingData = {
            checkin: '',
            checkout: '',
            guests: 1,
            totalNights: 0,
            subtotal: 0,
            serviceFee: 0,
            total: 0
        };
        
        this.favorites = this.storageUtils.getFavorites();
        
        this.init();
    }
    
    init() {
        // Get property ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');
        
        if (propertyId) {
            this.loadProperty(propertyId);
        } else {
            // If no ID provided, show first property or redirect to home
            this.loadProperty(this.listings[0].id);
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle back button
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const propertyId = urlParams.get('id');
            if (propertyId) {
                this.loadProperty(propertyId);
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    loadProperty(propertyId) {
        this.showLoading();
        
        // Simulate API delay
        setTimeout(() => {
            const property = this.listings.find(l => l.id === propertyId);
            
            if (!property) {
                this.showError('Property not found');
                return;
            }
            
            this.currentProperty = property;
            this.renderProperty();
            this.hideLoading();
        }, 500);
    }
    
    renderProperty() {
        if (!this.currentProperty) return;
        
        const host = this.users.find(u => u.id === this.currentProperty.hostId);
        const propertyReviews = this.reviews.filter(r => r.listingId === this.currentProperty.id);
        const isFavorite = this.favorites.includes(this.currentProperty.id);
        
        // Update page title
        document.title = `${this.currentProperty.title} - Airbnb`;
        document.getElementById('property-title').textContent = `${this.currentProperty.title} - Airbnb`;
        
        const propertyHTML = `
            <!-- Property Header -->
            <div class="property-header">
                <h1 class="property-title">${this.currentProperty.title}</h1>
                <div class="property-subtitle">
                    <div class="property-rating">
                        <i class="fas fa-star"></i>
                        <span>${this.currentProperty.rating.toFixed(1)}</span>
                        <span>(${this.currentProperty.reviewCount} reviews)</span>
                    </div>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${this.currentProperty.location}
                    </div>
                    ${this.currentProperty.superhost ? '<span class="superhost-badge">Superhost</span>' : ''}
                </div>
                <div class="property-actions">
                    <button class="action-btn share-btn" onclick="shareProperty()">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="togglePropertyFavorite('${this.currentProperty.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${isFavorite ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
            </div>

            <!-- Property Images -->
            <div class="property-images" style="position: relative;">
                ${this.createImageGrid()}
                <button class="show-all-photos" onclick="openImageGallery(0)">
                    <i class="fas fa-th"></i>
                    <span>Show all photos</span>
                </button>
            </div>

            <!-- Property Main Content -->
            <div class="property-main">
                <div class="property-info">
                    <!-- Property Overview -->
                    <div class="property-overview">
                        <div class="host-info">
                            <img src="${host?.avatar}" alt="${host?.name}" class="host-avatar">
                            <div class="host-details">
                                <h3>${this.currentProperty.type} hosted by ${host?.name}</h3>
                                <p>${this.currentProperty.maxGuests} guests • ${this.currentProperty.bedrooms} bedroom${this.currentProperty.bedrooms !== 1 ? 's' : ''} • ${this.currentProperty.beds} bed${this.currentProperty.beds !== 1 ? 's' : ''} • ${this.currentProperty.bathrooms} bathroom${this.currentProperty.bathrooms !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        
                        <!-- Property Highlights -->
                        <div class="property-highlights">
                            ${this.currentProperty.highlights?.map(highlight => `
                                <div class="highlight-item">
                                    <i class="${highlight.icon}"></i>
                                    <div class="highlight-content">
                                        <h4>${highlight.title}</h4>
                                        <p>${highlight.description}</p>
                                    </div>
                                </div>
                            `).join('') || ''}
                        </div>
                    </div>

                    <!-- Property Description -->
                    <div class="property-description">
                        <p>${this.currentProperty.description}</p>
                    </div>

                    <!-- Sleeping Arrangements -->
                    <div class="sleeping-arrangements">
                        <h3>Where you'll sleep</h3>
                        <div class="sleeping-grid">
                            ${this.createSleepingArrangements()}
                        </div>
                    </div>

                    <!-- Amenities -->
                    <div class="property-amenities">
                        <h3>What this place offers</h3>
                        <div class="amenities-grid">
                            ${this.currentProperty.amenities?.slice(0, 10).map(amenity => `
                                <div class="amenity-item">
                                    <i class="${this.getAmenityIcon(amenity)}"></i>
                                    <span>${amenity}</span>
                                </div>
                            `).join('') || ''}
                        </div>
                        ${this.currentProperty.amenities?.length > 10 ? 
                            `<button class="show-all-amenities" onclick="showAllAmenities()">
                                Show all ${this.currentProperty.amenities.length} amenities
                            </button>` : ''}
                    </div>

                    <!-- Calendar -->
                    <div class="property-calendar">
                        <h3>Select check-in date</h3>
                        <div class="calendar-note">Add your travel dates for exact pricing</div>
                        <div class="calendar-widget" id="calendarWidget">
                            ${this.createCalendar()}
                        </div>
                    </div>
                </div>

                <!-- Booking Card -->
                <div class="booking-card">
                    <div class="booking-header">
                        <div class="booking-price">
                            <span class="price-amount">$${this.currentProperty.price}</span>
                            <span class="price-period">night</span>
                        </div>
                        <div class="booking-rating">
                            <i class="fas fa-star"></i>
                            <span>${this.currentProperty.rating.toFixed(1)}</span>
                            <span>(${this.currentProperty.reviewCount})</span>
                        </div>
                    </div>
                    
                    <form class="booking-form" onsubmit="initiateBooking(); return false;">
                        <div class="booking-dates">
                            <div class="date-field">
                                <label>CHECK-IN</label>
                                <input type="date" id="checkin" required onchange="updateBookingCalculation()">
                            </div>
                            <div class="date-field">
                                <label>CHECKOUT</label>
                                <input type="date" id="checkout" required onchange="updateBookingCalculation()">
                            </div>
                        </div>
                        
                        <div class="booking-guests">
                            <label>GUESTS</label>
                            <select id="guests" required onchange="updateBookingCalculation()">
                                ${Array.from({length: this.currentProperty.maxGuests}, (_, i) => `
                                    <option value="${i + 1}">${i + 1} guest${i > 0 ? 's' : ''}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <button type="submit" class="reserve-btn" id="reserveBtn">
                            Check availability
                        </button>
                    </form>
                    
                    <div class="booking-note">
                        You won't be charged yet
                    </div>
                    
                    <div class="booking-breakdown" id="bookingBreakdown" style="display: none;">
                        <div class="cost-item">
                            <span>$${this.currentProperty.price} x <span id="nights-display">0</span> nights</span>
                            <span id="subtotal-display">$0</span>
                        </div>
                        <div class="cost-item">
                            <span>Service fee</span>
                            <span id="service-fee-display">$0</span>
                        </div>
                        <div class="cost-item">
                            <span>Taxes</span>
                            <span id="taxes-display">$0</span>
                        </div>
                        <div class="cost-item total">
                            <span>Total</span>
                            <span id="total-display">$0</span>
                        </div>
                    </div>

                    <!-- Host Contact -->
                    <div class="host-contact">
                        <button class="contact-host-btn" onclick="contactHost('${host?.id}')">
                            <i class="fas fa-envelope"></i>
                            Contact Host
                        </button>
                    </div>
                </div>
            </div>

            <!-- Reviews Section -->
            ${propertyReviews.length > 0 ? `
            <div class="reviews-section">
                <div class="reviews-header">
                    <h3><i class="fas fa-star"></i> ${this.currentProperty.rating.toFixed(1)} • ${this.currentProperty.reviewCount} reviews</h3>
                </div>
                
                <div class="review-categories">
                    ${this.createReviewCategories()}
                </div>
                
                <div class="reviews-grid">
                    ${propertyReviews.slice(0, 6).map(review => `
                        <div class="review-item">
                            <div class="review-header">
                                <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar">
                                <div class="reviewer-info">
                                    <h4>${review.userName}</h4>
                                    <p>${new Date(review.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div class="review-rating">
                                ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                            </div>
                            <p class="review-text">${review.text}</p>
                        </div>
                    `).join('')}
                </div>
                
                ${propertyReviews.length > 6 ? 
                    `<button class="show-all-reviews" onclick="showAllReviews()">
                        Show all ${propertyReviews.length} reviews
                    </button>` : ''}
            </div>
            ` : ''}

            <!-- Location -->
            <div class="location-section">
                <h3>Where you'll be</h3>
                <div class="location-info">
                    <h4>${this.currentProperty.location}</h4>
                    <div class="map-container">
                        <div class="map-placeholder">
                            <i class="fas fa-map-marked-alt"></i>
                            <p>Interactive map would be here</p>
                            <small>Showing approximate location for privacy</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Host Section -->
            <div class="host-section">
                <h3>Meet your host</h3>
                <div class="host-card">
                    <div class="host-profile">
                        <img src="${host?.avatar}" alt="${host?.name}" class="host-avatar-large">
                        <div class="host-info-detailed">
                            <h4>${host?.name}</h4>
                            ${host?.superhost ? '<span class="superhost-badge">Superhost</span>' : ''}
                            <div class="host-stats">
                                <div class="host-stat">
                                    <i class="fas fa-star"></i>
                                    <span>${host?.avgRating?.toFixed(1) || 'New'} Rating</span>
                                </div>
                                <div class="host-stat">
                                    <i class="fas fa-comment"></i>
                                    <span>${host?.totalReviews || 0} Reviews</span>
                                </div>
                                <div class="host-stat">
                                    <i class="fas fa-clock"></i>
                                    <span>Hosting since ${new Date(host?.joinDate).getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="host-details">
                        <p>${host?.bio || 'Great host!'}</p>
                        ${host?.responseRate ? `<p><strong>Response rate:</strong> ${host.responseRate}%</p>` : ''}
                        ${host?.responseTime ? `<p><strong>Response time:</strong> ${host.responseTime}</p>` : ''}
                        
                        <div class="host-actions">
                            <button class="contact-host" onclick="contactHost('${host?.id}')">
                                <i class="fas fa-envelope"></i>
                                Contact host
                            </button>
                            <button class="view-profile" onclick="viewHostProfile('${host?.id}')">
                                <i class="fas fa-user"></i>
                                View profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- House Rules -->
            <div class="house-rules-section">
                <h3>Things to know</h3>
                <div class="rules-grid">
                    <div class="rules-category">
                        <h4>House rules</h4>
                        ${this.currentProperty.rules?.map(rule => `<p>${rule}</p>`).join('') || '<p>No specific house rules</p>'}
                    </div>
                    <div class="rules-category">
                        <h4>Health & safety</h4>
                        <p>Smoke alarm</p>
                        <p>Carbon monoxide alarm</p>
                        <p>Enhanced cleaning protocol</p>
                    </div>
                    <div class="rules-category">
                        <h4>Cancellation policy</h4>
                        <p>Free cancellation for 48 hours</p>
                        <p>Review the full policy</p>
                    </div>
                </div>
            </div>

            <!-- Similar Listings -->
            <div class="similar-listings">
                <h3>Other places to stay</h3>
                <div class="similar-grid" id="similarGrid">
                    ${this.createSimilarListings()}
                </div>
            </div>
        `;
        
        document.getElementById('propertyDetail').innerHTML = propertyHTML;
        
        // Setup date inputs
        this.setupDateInputs();
    }
    
    createImageGrid() {
        if (!this.currentProperty.images || this.currentProperty.images.length === 0) {
            return '<div class="no-images">No images available</div>';
        }
        
        const images = this.currentProperty.images;
        
        if (images.length === 1) {
            return `
                <div class="single-image">
                    <img src="${images[0]}" alt="${this.currentProperty.title}" onclick="openImageGallery(0)">
                </div>
            `;
        }
        
        return `
            <div class="images-grid">
                <div class="main-image">
                    <img src="${images[0]}" alt="${this.currentProperty.title}" onclick="openImageGallery(0)">
                </div>
                <div class="side-images">
                    ${images.slice(1, 5).map((img, index) => `
                        <img src="${img}" alt="${this.currentProperty.title}" onclick="openImageGallery(${index + 1})">
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    createSleepingArrangements() {
        // Generate sleeping arrangements based on bedrooms and beds
        const arrangements = [];
        
        for (let i = 0; i < this.currentProperty.bedrooms; i++) {
            arrangements.push(`
                <div class="sleeping-item">
                    <i class="fas fa-bed"></i>
                    <div>
                        <h4>Bedroom ${i + 1}</h4>
                        <p>1 queen bed</p>
                    </div>
                </div>
            `);
        }
        
        return arrangements.join('');
    }
    
    getAmenityIcon(amenity) {
        const iconMap = {
            'WiFi': 'fas fa-wifi',
            'Kitchen': 'fas fa-utensils',
            'Washer': 'fas fa-tshirt',
            'Dryer': 'fas fa-wind',
            'Air conditioning': 'fas fa-snowflake',
            'Heating': 'fas fa-fire',
            'Pool': 'fas fa-swimming-pool',
            'Hot tub': 'fas fa-hot-tub',
            'Parking': 'fas fa-car',
            'TV': 'fas fa-tv',
            'Workspace': 'fas fa-laptop',
            'Gym': 'fas fa-dumbbell',
            'Beach access': 'fas fa-umbrella-beach',
            'Ocean view': 'fas fa-water',
            'Mountain view': 'fas fa-mountain',
            'City view': 'fas fa-city',
            'Fireplace': 'fas fa-fire',
            'Balcony': 'fas fa-door-open',
            'Garden': 'fas fa-leaf',
            'BBQ grill': 'fas fa-fire'
        };
        
        return iconMap[amenity] || 'fas fa-check';
    }
    
    createCalendar() {
        // Simple calendar for demonstration
        return `
            <div class="calendar-simple">
                <p>Interactive calendar would be implemented here</p>
                <p>Select your dates using the booking form on the right</p>
            </div>
        `;
    }
    
    createReviewCategories() {
        // Mock review categories with ratings
        const categories = [
            { name: 'Cleanliness', rating: 4.8 },
            { name: 'Accuracy', rating: 4.9 },
            { name: 'Check-in', rating: 4.7 },
            { name: 'Communication', rating: 4.9 },
            { name: 'Location', rating: 4.6 },
            { name: 'Value', rating: 4.5 }
        ];
        
        return `
            <div class="review-categories-grid">
                ${categories.map(cat => `
                    <div class="review-category">
                        <span class="category-name">${cat.name}</span>
                        <div class="category-rating">
                            <div class="rating-bar">
                                <div class="rating-fill" style="width: ${(cat.rating / 5) * 100}%"></div>
                            </div>
                            <span class="rating-value">${cat.rating.toFixed(1)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    createSimilarListings() {
        // Get similar listings (same category, different from current)
        const similar = this.listings
            .filter(l => l.category === this.currentProperty.category && l.id !== this.currentProperty.id)
            .slice(0, 4);
        
        return similar.map(listing => `
            <div class="similar-card" onclick="window.location.href='property.html?id=${listing.id}'">
                <img src="${listing.images[0]}" alt="${listing.title}">
                <div class="similar-info">
                    <div class="similar-location">${listing.location}</div>
                    <div class="similar-rating">
                        <i class="fas fa-star"></i>
                        <span>${listing.rating.toFixed(1)}</span>
                    </div>
                    <div class="similar-price">$${listing.price} night</div>
                </div>
            </div>
        `).join('');
    }
    
    setupDateInputs() {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        
        if (checkinInput && checkoutInput) {
            const today = new Date().toISOString().split('T')[0];
            checkinInput.min = today;
            
            checkinInput.addEventListener('change', () => {
                checkoutInput.min = checkinInput.value;
                this.updateBookingCalculation();
            });
            
            checkoutInput.addEventListener('change', () => {
                this.updateBookingCalculation();
            });
        }
    }
    
    updateBookingCalculation() {
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const guests = document.getElementById('guests').value;
        
        if (!checkin || !checkout) {
            document.getElementById('bookingBreakdown').style.display = 'none';
            document.getElementById('reserveBtn').textContent = 'Check availability';
            return;
        }
        
        const startDate = new Date(checkin);
        const endDate = new Date(checkout);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        if (nights <= 0) {
            document.getElementById('bookingBreakdown').style.display = 'none';
            document.getElementById('reserveBtn').textContent = 'Check availability';
            return;
        }
        
        // Calculate costs
        const subtotal = this.currentProperty.price * nights;
        const serviceFee = Math.round(subtotal * 0.14);
        const taxes = Math.round(subtotal * 0.08);
        const total = subtotal + serviceFee + taxes;
        
        // Store booking data
        this.bookingData = {
            checkin,
            checkout,
            guests: parseInt(guests),
            totalNights: nights,
            subtotal,
            serviceFee,
            taxes,
            total
        };
        
        // Update display
        document.getElementById('nights-display').textContent = nights;
        document.getElementById('subtotal-display').textContent = `$${subtotal}`;
        document.getElementById('service-fee-display').textContent = `$${serviceFee}`;
        document.getElementById('taxes-display').textContent = `$${taxes}`;
        document.getElementById('total-display').textContent = `$${total}`;
        document.getElementById('bookingBreakdown').style.display = 'block';
        document.getElementById('reserveBtn').textContent = this.currentProperty.instantBook ? 'Reserve' : 'Request to book';
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    showError(message) {
        document.getElementById('propertyDetail').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <button onclick="window.location.href='index.html'" class="back-home-btn">
                    Back to Home
                </button>
            </div>
        `;
    }
    
    closeAllModals() {
        document.getElementById('imageGalleryModal').style.display = 'none';
        document.getElementById('bookingModal').style.display = 'none';
    }
}

// Global functions
function openImageGallery(index) {
    if (!window.propertyApp.currentProperty) return;
    
    window.propertyApp.currentImageIndex = index;
    const modal = document.getElementById('imageGalleryModal');
    const image = document.getElementById('galleryModalImage');
    
    image.src = window.propertyApp.currentProperty.images[index];
    modal.style.display = 'flex';
    
    // Create thumbnails
    const thumbnails = document.getElementById('galleryThumbnails');
    thumbnails.innerHTML = window.propertyApp.currentProperty.images.map((img, i) => `
        <img src="${img}" alt="Thumbnail ${i + 1}" 
             class="gallery-thumbnail ${i === index ? 'active' : ''}"
             onclick="changeGalleryImage(${i})">
    `).join('');
}

function closeImageGallery() {
    document.getElementById('imageGalleryModal').style.display = 'none';
}

function previousGalleryImage() {
    const images = window.propertyApp.currentProperty.images;
    window.propertyApp.currentImageIndex = 
        window.propertyApp.currentImageIndex === 0 ? 
        images.length - 1 : 
        window.propertyApp.currentImageIndex - 1;
    
    changeGalleryImage(window.propertyApp.currentImageIndex);
}

function nextGalleryImage() {
    const images = window.propertyApp.currentProperty.images;
    window.propertyApp.currentImageIndex = 
        (window.propertyApp.currentImageIndex + 1) % images.length;
    
    changeGalleryImage(window.propertyApp.currentImageIndex);
}

function changeGalleryImage(index) {
    window.propertyApp.currentImageIndex = index;
    document.getElementById('galleryModalImage').src = 
        window.propertyApp.currentProperty.images[index];
    
    // Update thumbnails
    document.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function togglePropertyFavorite(propertyId) {
    if (!window.propertyApp) return;
    
    const favorites = window.propertyApp.favorites;
    const index = favorites.indexOf(propertyId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showMessage('Removed from favorites', 'success');
    } else {
        favorites.push(propertyId);
        showMessage('Added to favorites', 'success');
    }
    
    window.propertyApp.storageUtils.saveFavorites(favorites);
    
    // Update button
    const btn = document.querySelector('.favorite-btn');
    const isActive = favorites.includes(propertyId);
    btn.classList.toggle('active', isActive);
    btn.querySelector('span').textContent = isActive ? 'Saved' : 'Save';
}

function shareProperty() {
    if (navigator.share) {
        navigator.share({
            title: window.propertyApp.currentProperty.title,
            text: 'Check out this amazing place!',
            url: window.location.href
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showMessage('Link copied to clipboard!', 'success');
        });
    }
}

function contactHost(hostId) {
    showMessage('Message sent to host!', 'success');
    // In a real app, this would open a messaging interface
}

function viewHostProfile(hostId) {
    window.location.href = `profile.html?id=${hostId}`;
}

function initiateBooking() {
    if (!window.propertyApp.bookingData.checkin || !window.propertyApp.bookingData.checkout) {
        showMessage('Please select your dates', 'error');
        return;
    }
    
    // Show booking confirmation modal
    const modal = document.getElementById('bookingModal');
    const summary = document.getElementById('bookingSummary');
    
    const booking = window.propertyApp.bookingData;
    const property = window.propertyApp.currentProperty;
    
    summary.innerHTML = `
        <div class="booking-summary-content">
            <h3>${property.title}</h3>
            <p><strong>Dates:</strong> ${new Date(booking.checkin).toLocaleDateString()} - ${new Date(booking.checkout).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Nights:</strong> ${booking.totalNights}</p>
            <div class="summary-costs">
                <div class="cost-line">
                    <span>$${property.price} x ${booking.totalNights} nights</span>
                    <span>$${booking.subtotal}</span>
                </div>
                <div class="cost-line">
                    <span>Service fee</span>
                    <span>$${booking.serviceFee}</span>
                </div>
                <div class="cost-line">
                    <span>Taxes</span>
                    <span>$${booking.taxes}</span>
                </div>
                <div class="cost-line total">
                    <span>Total</span>
                    <span>$${booking.total}</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function confirmBooking() {
    const booking = {
        id: 'booking_' + Date.now(),
        listingId: window.propertyApp.currentProperty.id,
        userId: window.airbnbData.currentUser.id,
        ...window.propertyApp.bookingData,
        status: window.propertyApp.currentProperty.instantBook ? 'confirmed' : 'pending',
        bookedAt: new Date().toISOString()
    };
    
    window.propertyApp.storageUtils.saveBooking(booking);
    closeBookingModal();
    
    showMessage(
        window.propertyApp.currentProperty.instantBook ? 
            'Booking confirmed! Check your email for details.' : 
            'Booking request sent! The host will respond within 24 hours.',
        'success'
    );
    
    // Redirect to trips page after delay
    setTimeout(() => {
        window.location.href = 'trips.html';
    }, 2000);
}

function showAllAmenities() {
    const property = window.propertyApp.currentProperty;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content amenities-modal" onclick="event.stopPropagation()">
            <h2>Amenities</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="all-amenities-grid">
                ${property.amenities.map(amenity => `
                    <div class="amenity-item">
                        <i class="${window.propertyApp.getAmenityIcon(amenity)}"></i>
                        <span>${amenity}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showAllReviews() {
    const reviews = window.airbnbData.reviews.filter(r => r.listingId === window.propertyApp.currentProperty.id);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="modal-content reviews-modal" onclick="event.stopPropagation()">
            <h2>All Reviews (${reviews.length})</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="all-reviews-list">
                ${reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar">
                            <div class="reviewer-info">
                                <h4>${review.userName}</h4>
                                <p>${new Date(review.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                        </div>
                        <p class="review-text">${review.text}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showMessage(text, type = 'success') {
    // Reuse the message system from main script
    if (window.airbnbApp && window.airbnbApp.showMessage) {
        window.airbnbApp.showMessage(text, type);
        return;
    }
    
    // Fallback implementation
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.propertyApp = new PropertyDetailApp();
});
