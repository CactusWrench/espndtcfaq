// ESPN DTC FAQ - Interactive Navigation System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the quiz
    initializeQuiz();
    
    // Initialize visitor counter
    initializeVisitorCounter();
    
    // Add event listeners to all choice buttons
    const choiceButtons = document.querySelectorAll('.choice-btn');
    choiceButtons.forEach(button => {
        button.addEventListener('click', handleChoice);
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
});

function initializeQuiz() {
    // Hide all screens except the start screen
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the start screen
    const startScreen = document.getElementById('start');
    if (startScreen) {
        startScreen.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function handleChoice(event) {
    const button = event.currentTarget;
    const nextScreen = button.getAttribute('data-next');
    
    if (nextScreen) {
        // Add a slight delay for better UX
        button.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            showScreen(nextScreen);
            button.style.transform = '';
        }, 150);
    }
}

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Smooth scroll to top of the screen
        setTimeout(() => {
            targetScreen.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
        
        // Focus on the screen for accessibility
        targetScreen.focus();
        
        // Track the user's journey (for analytics if needed)
        trackUserPath(screenId);
    }
}

function restartQuiz() {
    // Reset the quiz to the beginning
    initializeQuiz();
    
    // Clear any stored user path
    if (typeof Storage !== "undefined") {
        localStorage.removeItem('espnDtcUserPath');
    }
}

function trackUserPath(screenId) {
    // Store user path in localStorage for potential analytics
    if (typeof Storage !== "undefined") {
        let userPath = JSON.parse(localStorage.getItem('espnDtcUserPath') || '[]');
        userPath.push({
            screen: screenId,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('espnDtcUserPath', JSON.stringify(userPath));
    }
}

function handleKeyboardNavigation(event) {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;
    
    const buttons = activeScreen.querySelectorAll('.choice-btn, .restart-btn');
    
    // Handle Enter key on focused buttons
    if (event.key === 'Enter' && event.target.classList.contains('choice-btn')) {
        event.target.click();
    }
    
    // Handle arrow key navigation
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        
        const currentIndex = Array.from(buttons).indexOf(document.activeElement);
        let nextIndex;
        
        if (event.key === 'ArrowDown') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= buttons.length) nextIndex = 0;
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = buttons.length - 1;
        }
        
        buttons[nextIndex].focus();
    }
    
    // Handle Escape key to restart
    if (event.key === 'Escape') {
        restartQuiz();
    }
}

// Utility function to get user's current result
function getCurrentResult() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return null;
    
    const screenId = activeScreen.id;
    
    switch (screenId) {
        case 'free-access':
            return {
                type: 'free',
                cost: '$0',
                message: 'Free access through cable provider deal'
            };
        case 'disney-bundle':
            return {
                type: 'discount',
                cost: '$29.99/month for 12 months',
                message: 'Special Disney Bundle discount'
            };
        case 'must-pay-cable':
        case 'standalone-espn-plus':
        case 'no-espn':
            return {
                type: 'full-price',
                cost: '$29.99/month or $299.99/year',
                message: 'Full ESPN DTC subscription required'
            };
        default:
            return null;
    }
}

// Function to share results
function shareResult() {
    const result = getCurrentResult();
    if (!result) {
        alert('Complete the quiz first to share your result!');
        return;
    }
    
    const shareText = `I just found out my ESPN DTC cost for WWE events: ${result.cost}! ${result.message}. Check yours: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My ESPN DTC Cost for WWE Events',
            text: shareText,
            url: window.location.href
        }).catch(() => {
            // Fallback if native sharing fails
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Result copied to clipboard! Share it on social media.');
        }).catch(() => {
            // Final fallback - show text in alert
            alert('Share this result:\n\n' + text);
        });
    } else {
        // Final fallback - show text in alert
        alert('Share this result:\n\n' + text);
    }
}

// Add smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add resize handler for responsive adjustments
window.addEventListener('resize', function() {
    // Ensure proper layout on orientation change
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && window.innerWidth <= 768) {
        // Adjust layout for mobile if needed
        activeScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// Performance optimization: Preload next likely screens
function preloadScreenAssets() {
    // This could be used to preload images or other assets
    // for screens the user is likely to visit next
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        const nextButtons = currentScreen.querySelectorAll('.choice-btn[data-next]');
        nextButtons.forEach(button => {
            const nextScreenId = button.getAttribute('data-next');
            const nextScreen = document.getElementById(nextScreenId);
            if (nextScreen) {
                // Preload any images in the next screen
                const images = nextScreen.querySelectorAll('img');
                images.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                });
            }
        });
    }
}

// Initialize preloading after a short delay
setTimeout(preloadScreenAssets, 1000);

// Add print functionality
function printResult() {
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        // Hide all other screens for printing
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            if (screen !== activeScreen) {
                screen.style.display = 'none';
            }
        });
        
        window.print();
        
        // Restore display after printing
        setTimeout(() => {
            allScreens.forEach(screen => {
                screen.style.display = '';
            });
        }, 1000);
    }
}

// Visitor Counter Functions
async function initializeVisitorCounter() {
    try {
        // Use CountAPI.xyz for global visitor counter
        const response = await fetch('https://api.countapi.xyz/hit/espndtcfaq/visits');
        const data = await response.json();
        
        if (data.value) {
            updateVisitorDisplay(data.value);
        } else {
            throw new Error('Invalid response from CountAPI');
        }
    } catch (error) {
        console.warn('Failed to fetch global visitor count, falling back to localStorage:', error);
        
        // Fallback to localStorage if CountAPI fails
        let visitCount = localStorage.getItem('espnDtcVisitCount');
        
        if (!visitCount) {
            visitCount = 1;
        } else {
            visitCount = parseInt(visitCount) + 1;
        }
        
        localStorage.setItem('espnDtcVisitCount', visitCount.toString());
        updateVisitorDisplay(visitCount);
    }
}

function updateVisitorDisplay(count) {
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
        // Add some animation to make it feel more dynamic
        visitorCountElement.style.transform = 'scale(1.1)';
        visitorCountElement.textContent = formatVisitorCount(count);
        
        // Reset scale after animation
        setTimeout(() => {
            visitorCountElement.style.transform = 'scale(1)';
        }, 200);
    }
}

function formatVisitorCount(count) {
    // Add commas for large numbers
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    } else {
        return count.toLocaleString();
    }
}

// Function to get current visitor count (for potential analytics)
async function getVisitorCount() {
    try {
        // Try to get current count from CountAPI (without incrementing)
        const response = await fetch('https://api.countapi.xyz/get/espndtcfaq/visits');
        const data = await response.json();
        return data.value || parseInt(localStorage.getItem('espnDtcVisitCount') || '1');
    } catch (error) {
        // Fallback to localStorage
        return parseInt(localStorage.getItem('espnDtcVisitCount') || '1');
    }
}

// Expose functions globally for potential future use
window.espnDtcFaq = {
    restartQuiz,
    getCurrentResult,
    shareResult,
    printResult,
    showScreen,
    getVisitorCount
};