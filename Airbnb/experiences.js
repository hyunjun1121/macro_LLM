// Experiences Page JavaScript - Complete functionality

class ExperiencesApp {
    constructor() {
        this.experiences = window.airbnbData.experiences;
        this.users = window.airbnbData.users;
        this.currentUser = window.airbnbData.currentUser;
        this.storageUtils = window.airbnbData.storageUtils;
        
        this.filteredExperiences = [...this.experiences];
        this.currentFilters = {
            location: '',
            date: '',
            guests: 1,
            category: 'all',
            priceRange: { min: null, max: null },
            sortBy: 'featured'
        };
        
        this.favorites = this.storageUtils.getFavorites();
        this.bookings = this.storageUtils.getBookings();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadExperiences();
        this.setMinDate();
    }
    
    setupEventListeners() {
        // Search functionality
        const locationInput = document.getElementById('experienceLocationInput');
        const dateInput = document.getElementById('experienceDateInput');
        const guestsInput = document.getElementById('experienceGuestsInput');
        
        if (locationInput) {
            locationInput.addEventListener('input', this.debounce(() => {
                this.updateSearch();
            }, 300));
        }
        
        if (dateInput) {
            dateInput.addEventListener('change', () => this.updateSearch());
        }
        
        if (guestsInput) {
            guestsInput.addEventListener('change', () => this.updateSearch());
        }
        
        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterExperiences(category);
            });
        });
        
        // Sort options
        const sortOptions = document.getElementById('sortOptions');
        if (sortOptions) {
            sortOptions.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.sortExperiences();
            });
        }
        
        // Profile menu
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.toggleProfileMenu());
        }
        
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay')) {
                this.closeExperienceModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeExperienceModal();
            }
        });
    }
    
    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('experienceDateInput');
        if (dateInput) {
            dateInput.min = today;
        }
    }
    
    updateSearch() {
        const locationInput = document.getElementById('experienceLocationInput');
        const dateInput = document.getElementById('experienceDateInput');
        const guestsInput = document.getElementById('experienceGuestsInput');
        
        this.currentFilters.location = locationInput?.value || '';
        this.currentFilters.date = dateInput?.value || '';
        this.currentFilters.guests = parseInt(guestsInput?.value) || 1;
        
        this.applyFilters();
    }
    
    searchExperiences() {
        this.updateSearch();
        this.showMessage('Searching for amazing experiences...', 'success');
        
        // Scroll to results
        const experiencesGrid = document.getElementById('experiencesGrid');
        if (experiencesGrid) {
            experiencesGrid.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    filterExperiences(category) {
        // Update active category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`[data-category="${category}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
        
        this.currentFilters.category = category;
        this.applyFilters();
    }
    
    applyFilters() {
        this.showLoading();
        
        setTimeout(() => {
            let filtered = [...this.experiences];
            
            // Apply location filter
            if (this.currentFilters.location) {
                filtered = filtered.filter(exp => 
                    exp.location.toLowerCase().includes(this.currentFilters.location.toLowerCase()) ||
                    exp.title.toLowerCase().includes(this.currentFilters.location.toLowerCase())
                );
            }
            
            // Apply category filter
            if (this.currentFilters.category !== 'all') {
                filtered = filtered.filter(exp => 
                    exp.type.toLowerCase().includes(this.currentFilters.category) ||
                    exp.category === this.currentFilters.category
                );
            }
            
            // Apply guest filter
            filtered = filtered.filter(exp => exp.maxGuests >= this.currentFilters.guests);
            
            // Apply price filter
            if (this.currentFilters.priceRange.min !== null) {
                filtered = filtered.filter(exp => exp.price >= this.currentFilters.priceRange.min);
            }
            if (this.currentFilters.priceRange.max !== null) {
                filtered = filtered.filter(exp => exp.price <= this.currentFilters.priceRange.max);
            }
            
            this.filteredExperiences = filtered;
            this.hideLoading();
            this.sortExperiences();
        }, 500);
    }
    
    sortExperiences() {
        const sortBy = this.currentFilters.sortBy;
        
        switch (sortBy) {
            case 'price-low':
                this.filteredExperiences.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredExperiences.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredExperiences.sort((a, b) => b.rating - a.rating);
                break;
            case 'duration':
                this.filteredExperiences.sort((a, b) => a.duration - b.duration);
                break;
            default: // featured
                this.filteredExperiences.sort((a, b) => b.reviewCount - a.reviewCount);
        }
        
        this.renderExperiences();
    }
    
    loadExperiences() {
        this.renderExperiences();
    }
    
    renderExperiences() {
        const grid = document.getElementById('experiencesGrid');
        const noResults = document.getElementById('experiencesNoResults');
        
        if (!grid) return;
        
        if (this.filteredExperiences.length === 0) {
            grid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        if (noResults) noResults.style.display = 'none';
        
        const experienceCards = this.filteredExperiences.map(exp => this.createExperienceCard(exp));
        grid.innerHTML = experienceCards.join('');
        
        // Apply fade-in animation
        setTimeout(() => {
            document.querySelectorAll('.experience-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in');
                }, index * 100);
            });
        }, 100);
    }
    
    createExperienceCard(experience) {
        const host = this.users.find(u => u.id === experience.hostId);
        const isFavorite = this.favorites.includes(experience.id);
        
        return `
            <div class="experience-card" onclick="openExperienceModal('${experience.id}')">
                <div class="experience-image-container">
                    <img src="${experience.image}" alt="${experience.title}" class="experience-image">
                    <button class="experience-favorite ${isFavorite ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleExperienceFavorite('${experience.id}')"
                            aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="experience-duration">
                        <i class="fas fa-clock"></i>
                        ${experience.duration} hours
                    </div>
                </div>
                
                <div class="experience-content">
                    <div class="experience-type">${experience.type}</div>
                    <h3 class="experience-title">${experience.title}</h3>
                    <div class="experience-host">Hosted by ${host?.name || 'Host'}</div>
                    <div class="experience-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${experience.location}
                    </div>
                    
                    <div class="experience-footer">
                        <div class="experience-rating">
                            <i class="fas fa-star"></i>
                            <span>${experience.rating.toFixed(1)}</span>
                            <span class="review-count">(${experience.reviewCount})</span>
                        </div>
                        <div class="experience-price">
                            <span class="price-amount">$${experience.price}</span>
                            <span class="price-period">per person</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    openExperienceModal(experienceId) {
        const experience = this.experiences.find(exp => exp.id === experienceId);
        const host = this.users.find(u => u.id === experience.hostId);
        
        if (!experience) return;
        
        const modalContent = `
            <div class="experience-modal-header">
                <h1>${experience.title}</h1>
                <div class="experience-modal-rating">
                    <i class="fas fa-star"></i>
                    <span>${experience.rating.toFixed(1)}</span>
                    <span>(${experience.reviewCount} reviews)</span>
                </div>
            </div>
            
            <div class="experience-modal-image">
                <img src="${experience.image}" alt="${experience.title}">
            </div>
            
            <div class="experience-modal-details">
                <div class="experience-modal-main">
                    <div class="experience-info-header">
                        <div class="experience-type">${experience.type}</div>
                        <div class="experience-duration">
                            <i class="fas fa-clock"></i>
                            ${experience.duration} hours
                        </div>
                        <div class="experience-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${experience.location}
                        </div>
                    </div>
                    
                    <div class="experience-description">
                        <h3>What you'll do</h3>
                        <p>${experience.description}</p>
                    </div>
                    
                    <div class="experience-highlights">
                        <h3>What's included</h3>
                        <ul>
                            ${experience.highlights.map(highlight => `
                                <li><i class="fas fa-check"></i> ${highlight}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="experience-host-section">
                        <h3>Meet your host</h3>
                        <div class="host-info">
                            <img src="${host?.avatar}" alt="${host?.name}" class="host-avatar">
                            <div class="host-details">
                                <h4>${host?.name}</h4>
                                <p>${host?.bio || 'Experienced host ready to show you around!'}</p>
                                ${host?.superhost ? '<span class="superhost-badge">Superhost</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="experience-booking-widget">
                    <div class="booking-price-header">
                        <span class="price-amount">$${experience.price}</span>
                        <span class="price-period">per person</span>
                    </div>
                    
                    <form class="experience-booking-form" onsubmit="bookExperience('${experience.id}'); return false;">
                        <div class="booking-date-section">
                            <label>Choose date</label>
                            <input type="date" id="modalExperienceDate" required>
                        </div>
                        
                        <div class="booking-guests-section">
                            <label>Guests (up to ${experience.maxGuests})</label>
                            <select id="modalExperienceGuests" required>
                                ${Array.from({length: experience.maxGuests}, (_, i) => `
                                    <option value="${i + 1}">${i + 1} guest${i > 0 ? 's' : ''}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <button type="submit" class="book-experience-btn">
                            Reserve experience
                        </button>
                    </form>
                    
                    <div class="booking-total" id="experienceBookingTotal">
                        <div class="total-calculation">
                            <span>$${experience.price} x <span id="guestCount">1</span> guest<span id="guestPlural"></span></span>
                            <span id="totalAmount">$${experience.price}</span>
                        </div>
                    </div>
                    
                    <div class="booking-note">
                        <p><i class="fas fa-info-circle"></i> You won't be charged yet</p>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('experienceModal');
        const modalContentDiv = document.getElementById('experienceModalContent');
        
        modalContentDiv.innerHTML = modalContent;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Setup modal booking functionality
        this.setupExperienceBooking(experience);
        
        // Set minimum date
        const dateInput = document.getElementById('modalExperienceDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        // Update total when guests change
        const guestsSelect = document.getElementById('modalExperienceGuests');
        guestsSelect.addEventListener('change', () => {
            this.updateExperienceTotal(experience);
        });
    }
    
    setupExperienceBooking(experience) {
        this.updateExperienceTotal(experience);
    }
    
    updateExperienceTotal(experience) {
        const guestsSelect = document.getElementById('modalExperienceGuests');
        const guestCount = parseInt(guestsSelect.value) || 1;
        const total = experience.price * guestCount;
        
        document.getElementById('guestCount').textContent = guestCount;
        document.getElementById('guestPlural').textContent = guestCount > 1 ? 's' : '';
        document.getElementById('totalAmount').textContent = `$${total}`;
    }
    
    bookExperience(experienceId) {
        const experience = this.experiences.find(exp => exp.id === experienceId);
        const date = document.getElementById('modalExperienceDate').value;
        const guests = parseInt(document.getElementById('modalExperienceGuests').value);
        
        if (!date || !guests) {
            this.showMessage('Please fill in all booking details', 'error');
            return;
        }
        
        const booking = {
            id: 'exp_booking_' + Date.now(),
            experienceId: experienceId,
            userId: this.currentUser.id,
            date: date,
            guests: guests,
            status: 'confirmed',
            bookedAt: new Date().toISOString(),
            totalCost: experience.price * guests,
            type: 'experience'
        };
        
        this.storageUtils.saveBooking(booking);
        this.closeExperienceModal();
        
        this.showMessage('Experience booked successfully! Check your email for details.', 'success');
    }
    
    closeExperienceModal() {
        const modal = document.getElementById('experienceModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    toggleExperienceFavorite(experienceId) {
        const index = this.favorites.indexOf(experienceId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showMessage('Removed from favorites', 'success');
        } else {
            this.favorites.push(experienceId);
            this.showMessage('Added to favorites', 'success');
        }
        
        this.storageUtils.saveFavorites(this.favorites);
        this.updateFavorites();
    }
    
    updateFavorites() {
        document.querySelectorAll('.experience-favorite').forEach(btn => {
            const experienceId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            const isFavorite = this.favorites.includes(experienceId);
            
            btn.classList.toggle('active', isFavorite);
            btn.setAttribute('aria-label', 
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
            );
        });
    }
    
    // Profile menu
    toggleProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }
    
    // Loading states
    showLoading() {
        const loading = document.getElementById('experiencesLoading');
        const grid = document.getElementById('experiencesGrid');
        
        if (loading) loading.style.display = 'flex';
        if (grid) grid.style.opacity = '0.5';
    }
    
    hideLoading() {
        const loading = document.getElementById('experiencesLoading');
        const grid = document.getElementById('experiencesGrid');
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.opacity = '1';
    }
    
    // Messages
    showMessage(text, type = 'success') {
        // Reuse the toast message system from main script
        if (window.airbnbApp && window.airbnbApp.showMessage) {
            window.airbnbApp.showMessage(text, type);
        } else {
            // Fallback simple alert
            alert(text);
        }
    }
    
    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions for onclick handlers
function searchExperiences() {
    window.experiencesApp.searchExperiences();
}

function filterExperiences(category) {
    window.experiencesApp.filterExperiences(category);
}

function sortExperiences() {
    window.experiencesApp.sortExperiences();
}

function openExperienceModal(experienceId) {
    window.experiencesApp.openExperienceModal(experienceId);
}

function closeExperienceModal() {
    window.experiencesApp.closeExperienceModal();
}

function bookExperience(experienceId) {
    window.experiencesApp.bookExperience(experienceId);
}

function toggleExperienceFavorite(experienceId) {
    window.experiencesApp.toggleExperienceFavorite(experienceId);
}

function toggleProfileMenu() {
    window.experiencesApp.toggleProfileMenu();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.experiencesApp = new ExperiencesApp();
});
