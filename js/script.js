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

    // --- Upcoming Books Functionality ---
    const addBookForm = document.getElementById('addBookForm');
    const upcomingBooksList = document.getElementById('upcomingBooksList');

    // Load custom upcoming books from localStorage
    function loadCustomBooks() {
        const storedBooks = JSON.parse(localStorage.getItem('myUpcomingBooks')) || [];
        storedBooks.forEach(book => addBookToDOM(book.title, book.cover));
    }

    // Function to add a book element to the DOM
    function addBookToDOM(title, coverUrl) {
        if (!coverUrl) {
            coverUrl = 'https://via.placeholder.com/150x225?text=No+Cover';
        }

        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book');

        bookDiv.innerHTML = `
            <img src="${coverUrl}" alt="Book Cover">
            <div class="title">${title}</div>
            <div class="date">Upcoming</div>
        `;

        upcomingBooksList.appendChild(bookDiv);
    }

    // Handle form submission
    if (addBookForm) {
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const titleInput = document.getElementById('newBookTitle');
            const coverInput = document.getElementById('newBookCover');
            
            const title = titleInput.value.trim();
            const cover = coverInput.value.trim();
            
            if (title) {
                // Add to DOM
                addBookToDOM(title, cover);
                
                // Save to localStorage
                const storedBooks = JSON.parse(localStorage.getItem('myUpcomingBooks')) || [];
                storedBooks.push({ title: title, cover: cover });
                localStorage.setItem('myUpcomingBooks', JSON.stringify(storedBooks));
                
                // Clear inputs
                titleInput.value = '';
                coverInput.value = '';
            }
        });
    }

    // Initialize custom books on load
    loadCustomBooks();
});
