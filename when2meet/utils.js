// Utility functions for When2Meet clone
// Handles timezone conversion, date formatting, accessibility, and other common operations

// Timezone utilities
class TimezoneUtils {
    static getTimezones() {
        return [
            { value: 'America/New_York', label: 'Eastern Time (ET)' },
            { value: 'America/Chicago', label: 'Central Time (CT)' },
            { value: 'America/Denver', label: 'Mountain Time (MT)' },
            { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
            { value: 'Europe/London', label: 'London (GMT)' },
            { value: 'Europe/Paris', label: 'Paris (CET)' },
            { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
            { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
            { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
            { value: 'UTC', label: 'UTC' }
        ];
    }

    static convertTime(datetime, fromTz, toTz) {
        if (!datetime || !fromTz || !toTz) return datetime;
        
        try {
            // Create date in source timezone
            const sourceDate = new Date(datetime + (fromTz === 'UTC' ? 'Z' : ''));
            
            // Convert to target timezone
            return new Intl.DateTimeFormat('en-US', {
                timeZone: toTz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).formatToParts(sourceDate);
        } catch (error) {
            console.error('Timezone conversion error:', error);
            return datetime;
        }
    }

    static getUserTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static formatTimezoneOffset(timezone) {
        const now = new Date();
        const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
        const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
        const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
        
        const sign = offset >= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(offset));
        const minutes = Math.round((Math.abs(offset) - hours) * 60);
        
        return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Date formatting utilities
class DateUtils {
    static formatDate(date, format = 'short') {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        switch (format) {
            case 'short':
                return dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            case 'long':
                return dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'compact':
                return dateObj.toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric'
                });
            case 'iso':
                return dateObj.toISOString().split('T')[0];
            default:
                return dateObj.toLocaleDateString();
        }
    }

    static formatTime(time, format = '12h') {
        if (!time) return '';
        
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        
        if (format === '12h') {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }

    static formatDateTime(datetime, includeTime = true) {
        if (!datetime) return '';
        
        const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };
        
        if (includeTime) {
            options.hour = 'numeric';
            options.minute = '2-digit';
            options.hour12 = true;
        }
        
        return date.toLocaleDateString('en-US', options);
    }

    static getRelativeTime(date) {
        if (!date) return '';
        
        const now = new Date();
        const targetDate = typeof date === 'string' ? new Date(date) : date;
        const diffMs = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
        if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
        
        return this.formatDate(targetDate);
    }

    static isToday(date) {
        const today = new Date();
        const targetDate = typeof date === 'string' ? new Date(date) : date;
        
        return today.toDateString() === targetDate.toDateString();
    }

    static isSameWeek(date1, date2) {
        const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
        const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
        
        const startOfWeek1 = new Date(d1.setDate(d1.getDate() - d1.getDay()));
        const startOfWeek2 = new Date(d2.setDate(d2.getDate() - d2.getDay()));
        
        return startOfWeek1.getTime() === startOfWeek2.getTime();
    }

    static getDaysInRange(startDate, endDate) {
        const days = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return days;
    }
}

// DOM utilities
class DOMUtils {
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        
        // Add children
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }

    static addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    static debounce(func, wait) {
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

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }
}

// Accessibility utilities
class A11yUtils {
    static announceToScreenReader(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    static trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
        
        firstElement.focus();
    }

    static addSkipLink(targetId, label = 'Skip to main content') {
        const skipLink = document.createElement('a');
        skipLink.href = `#${targetId}`;
        skipLink.textContent = label;
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 9999;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    static setupKeyboardNavigation(gridElement, cellSelector = '.time-slot') {
        const cells = Array.from(gridElement.querySelectorAll(cellSelector));
        let currentIndex = 0;
        
        // Make grid focusable
        gridElement.setAttribute('tabindex', '0');
        gridElement.setAttribute('role', 'grid');
        
        // Set up cell attributes
        cells.forEach((cell, index) => {
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
        
        gridElement.addEventListener('keydown', (e) => {
            const cols = parseInt(gridElement.dataset.cols) || Math.ceil(Math.sqrt(cells.length));
            const rows = Math.ceil(cells.length / cols);
            const currentRow = Math.floor(currentIndex / cols);
            const currentCol = currentIndex % cols;
            
            let newIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowRight':
                    if (currentCol < cols - 1 && currentIndex < cells.length - 1) {
                        newIndex = currentIndex + 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (currentCol > 0) {
                        newIndex = currentIndex - 1;
                    }
                    break;
                case 'ArrowDown':
                    if (currentRow < rows - 1) {
                        newIndex = Math.min(currentIndex + cols, cells.length - 1);
                    }
                    break;
                case 'ArrowUp':
                    if (currentRow > 0) {
                        newIndex = currentIndex - cols;
                    }
                    break;
                case 'Home':
                    newIndex = currentRow * cols;
                    break;
                case 'End':
                    newIndex = Math.min((currentRow + 1) * cols - 1, cells.length - 1);
                    break;
                case 'Enter':
                case ' ':
                    cells[currentIndex].click();
                    e.preventDefault();
                    return;
                default:
                    return;
            }
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cells.length) {
                cells[currentIndex].setAttribute('tabindex', '-1');
                cells[newIndex].setAttribute('tabindex', '0');
                cells[newIndex].focus();
                currentIndex = newIndex;
            }
            
            e.preventDefault();
        });
        
        // Update current index when clicking on cells
        cells.forEach((cell, index) => {
            cell.addEventListener('focus', () => {
                currentIndex = index;
            });
        });
    }
}

// Storage utilities
class StorageUtils {
    static set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    static has(key) {
        return localStorage.getItem(key) !== null;
    }
}

// Validation utilities
class ValidationUtils {
    static isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return false;
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        return endMinutes > startMinutes;
    }

    static isValidDateRange(startDate, endDate) {
        if (!startDate || !endDate) return false;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return end >= start;
    }

    static sanitizeEventCode(code) {
        return code.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
    }

    static validateEventData(eventData) {
        const errors = [];
        
        if (!eventData.title || eventData.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        }
        
        if (!eventData.dateRange || !eventData.dateRange.start || !eventData.dateRange.end) {
            errors.push('Date range is required');
        } else if (!this.isValidDateRange(eventData.dateRange.start, eventData.dateRange.end)) {
            errors.push('End date must be after start date');
        }
        
        if (!eventData.timeRange || !eventData.timeRange.start || !eventData.timeRange.end) {
            errors.push('Time range is required');
        } else if (!this.isValidTimeRange(eventData.timeRange.start, eventData.timeRange.end)) {
            errors.push('End time must be after start time');
        }
        
        if (eventData.timeSlotDuration && (eventData.timeSlotDuration < 15 || eventData.timeSlotDuration > 240)) {
            errors.push('Time slot duration must be between 15 and 240 minutes');
        }
        
        return errors;
    }
}

// Performance utilities
class PerformanceUtils {
    static measureTime(label, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${label}: ${end - start} milliseconds`);
        return result;
    }

    static lazy(fn) {
        let cached = null;
        let hasBeenCalled = false;
        
        return function(...args) {
            if (!hasBeenCalled) {
                cached = fn.apply(this, args);
                hasBeenCalled = true;
            }
            return cached;
        };
    }

    static memoize(fn) {
        const cache = new Map();
        
        return function(...args) {
            const key = JSON.stringify(args);
            
            if (cache.has(key)) {
                return cache.get(key);
            }
            
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }
}

// Export utilities
if (typeof window !== 'undefined') {
    window.TimezoneUtils = TimezoneUtils;
    window.DateUtils = DateUtils;
    window.DOMUtils = DOMUtils;
    window.A11yUtils = A11yUtils;
    window.StorageUtils = StorageUtils;
    window.ValidationUtils = ValidationUtils;
    window.PerformanceUtils = PerformanceUtils;
}

// Also export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TimezoneUtils,
        DateUtils,
        DOMUtils,
        A11yUtils,
        StorageUtils,
        ValidationUtils,
        PerformanceUtils
    };
}
