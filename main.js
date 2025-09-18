// Initialize Lucide icons
lucide.createIcons();

// Randomize floating elements
function randomizeFloatingElements() {
  const elements = document.querySelectorAll('.floating-element');
  
  elements.forEach((element, index) => {
    // Random position (with some margin from edges)
    const x = Math.random() * 85 + 5; // 5% to 90%
    const y = Math.random() * 85 + 5; // 5% to 90%
    
    // Random animation delay (0-30 seconds)
    const delay = Math.random() * 30;
    
    // Random duration (20-40 seconds)
    const duration = Math.random() * 20 + 20;
    
    // Apply CSS custom properties
    element.style.setProperty('--start-x', x + '%');
    element.style.setProperty('--start-y', y + '%');
    element.style.setProperty('--delay', delay + 's');
    element.style.setProperty('--duration', duration + 's');
  });
}

// Make service cards clickable
document.addEventListener('DOMContentLoaded', function() {
  // Randomize floating elements on page load
  randomizeFloatingElements();
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    // Find the main service link (the one in the h3)
    const mainLink = card.querySelector('.service-header h3 a');
    
    if (mainLink) {
      const mainUrl = mainLink.href;
      const mainTarget = mainLink.target;
      
      // Add click handler to the card
      card.addEventListener('click', function(e) {
        // Check if the click was on a nested link or its parent elements
        let target = e.target;
        let isNestedLink = false;
        
        // Walk up the DOM tree to check if we clicked on a nested link
        while (target && target !== card) {
          if (target.tagName === 'A' && target !== mainLink) {
            isNestedLink = true;
            break;
          }
          target = target.parentElement;
        }
        
        // Only navigate to main URL if we didn't click on a nested link
        if (!isNestedLink) {
          if (mainTarget === '_blank') {
            window.open(mainUrl, '_blank');
          } else {
            window.location.href = mainUrl;
          }
        }
      });
    }
  });
});
