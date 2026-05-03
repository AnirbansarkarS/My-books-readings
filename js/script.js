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

    // --- Upcoming Books & All Books Functionality ---
    const addBookForm = document.getElementById('addBookForm');
    const upcomingBooksList = document.getElementById('upcomingBooksList');

    // Add action buttons to hardcoded books on page load
    document.querySelectorAll('.book').forEach(book => {
        addBookActions(book);
    });

    // Helper to add edit/delete buttons to a book element
    function addBookActions(bookElement) {
        if (bookElement.querySelector('.book-actions')) return;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('book-actions');
        actionsDiv.innerHTML = `
            <button class="edit-btn" title="Edit">✏️</button>
            <button class="delete-btn" title="Delete">🗑️</button>
        `;
        bookElement.appendChild(actionsDiv);
    }

    // Handle Edit and Delete clicks (Event Delegation)
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const bookEl = e.target.closest('.book');
            const titleEl = bookEl.querySelector('.title');
            if (confirm(`Are you sure you want to delete "${titleEl ? titleEl.innerText : 'this book'}"?`)) {
                // Remove from DOM
                bookEl.remove();
                // Remove from LocalStorage if it exists there
                removeBookFromStorage(titleEl.innerText);
            }
        }
        
        if (e.target.closest('.edit-btn')) {
            const bookEl = e.target.closest('.book');
            const titleEl = bookEl.querySelector('.title');
            const imgEl = bookEl.querySelector('img');
            
            const oldTitle = titleEl.innerText;
            const newTitle = prompt('Enter new title:', oldTitle);
            
            if (newTitle !== null && newTitle.trim() !== '') {
                const newCover = prompt('Enter new cover image URL (leave blank to keep current):', imgEl.src);
                
                titleEl.innerText = newTitle.trim();
                if (newCover !== null && newCover.trim() !== '') {
                    imgEl.src = newCover.trim();
                }
                
                // Update LocalStorage if it exists there
                updateBookInStorage(oldTitle, newTitle.trim(), imgEl.src);
            }
        }
    });

    function removeBookFromStorage(title) {
        let storedBooks = JSON.parse(localStorage.getItem('myUpcomingBooks')) || [];
        storedBooks = storedBooks.filter(b => b.title !== title);
        localStorage.setItem('myUpcomingBooks', JSON.stringify(storedBooks));
    }

    function updateBookInStorage(oldTitle, newTitle, newCover) {
        let storedBooks = JSON.parse(localStorage.getItem('myUpcomingBooks')) || [];
        const bookIndex = storedBooks.findIndex(b => b.title === oldTitle);
        if (bookIndex > -1) {
            storedBooks[bookIndex].title = newTitle;
            storedBooks[bookIndex].cover = newCover;
            localStorage.setItem('myUpcomingBooks', JSON.stringify(storedBooks));
        }
    }

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
        
        addBookActions(bookDiv);
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
