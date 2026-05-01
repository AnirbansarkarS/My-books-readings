document.addEventListener('DOMContentLoaded', () => {
    // Reading Tracker Init
    const trackBooks = document.querySelectorAll('.book[data-progress]');
    
    trackBooks.forEach(book => {
        const progress = book.getAttribute('data-progress');
        
        // Create progress container elements
        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');
        
        const progressLabel = document.createElement('div');
        progressLabel.classList.add('progress-label');
        progressLabel.innerHTML = `<span>Reading Progress</span> <span>${progress}%</span>`;
        
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        
        const progressFill = document.createElement('div');
        progressFill.classList.add('progress-fill');
        progressFill.style.width = '0%'; // Start at 0 for animation
        
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressLabel);
        progressContainer.appendChild(progressBar);
        
        book.appendChild(progressContainer);
        
        // Animate progress after a short delay
        setTimeout(() => {
            progressFill.style.width = `${progress}%`;
        }, 300);
    });

    // Cozy Interaction
    const coffeeCup = document.getElementById('coffeeCup');
    const cozyIcons = ['☕', '🍵', '🕯️', '📚', '🍪'];
    let currentIconIndex = 0;

    coffeeCup.addEventListener('click', () => {
        currentIconIndex = (currentIconIndex + 1) % cozyIcons.length;
        coffeeCup.innerText = cozyIcons[currentIconIndex];
        
        // Quick visual feedback
        coffeeCup.style.transform = 'scale(1.2) translateY(-15px)';
        setTimeout(() => {
            coffeeCup.style.transform = '';
        }, 200);
    });
});
