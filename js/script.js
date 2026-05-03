document.addEventListener('DOMContentLoaded', () => {

    // --- JSON Database (LocalStorage) Logic ---
    
    // Save the entire state of all books on the page
    function saveDatabase() {
        const db = {
            completed: extractBooks('completedBooksList'),
            reading: extractBooks('readingBooksList'),
            upcoming: extractBooks('upcomingBooksList')
        };
        localStorage.setItem('myBooksDB', JSON.stringify(db));
    }

    // Extract book info from a specific container
    function extractBooks(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        const books = [];
        container.querySelectorAll('.book').forEach(bookEl => {
            const titleEl = bookEl.querySelector('.title');
            const imgEl = bookEl.querySelector('img');
            const dateEl = bookEl.querySelector('.date');
            
            const title = titleEl ? titleEl.innerText : 'Unknown Title';
            const cover = imgEl ? imgEl.src : '';
            const date = dateEl ? dateEl.innerText : '';
            const progress = bookEl.getAttribute('data-progress');
            
            books.push({ title, cover, date, progress });
        });
        return books;
    }

    // Load data and completely redraw the books
    function loadDatabase() {
        const dbString = localStorage.getItem('myBooksDB');
        
        if (dbString) {
            // We have saved data, overwrite the HTML defaults
            const db = JSON.parse(dbString);
            
            renderBooks('completedBooksList', db.completed);
            renderBooks('readingBooksList', db.reading);
            renderBooks('upcomingBooksList', db.upcoming);
        } else {
            // First time loading: sync the existing HTML into the DB
            // Then add action buttons and progress bars to them
            document.querySelectorAll('.book').forEach(book => {
                addBookActions(book);
                if (book.hasAttribute('data-progress')) {
                    initProgressBar(book);
                }
            });
            // Also merge the old "myUpcomingBooks" if migrating from old version
            migrateOldStorage();
        }
    }
    
    // Helper to rescue books saved in the older "myUpcomingBooks" format
    function migrateOldStorage() {
        const oldBooksString = localStorage.getItem('myUpcomingBooks');
        if (oldBooksString) {
            const oldBooks = JSON.parse(oldBooksString);
            oldBooks.forEach(b => {
                addBookToDOM('upcomingBooksList', b.title, b.cover, b.date);
            });
            localStorage.removeItem('myUpcomingBooks');
        }
        saveDatabase(); // Save the initial state + old migrations to the new generic DB
    }

    function renderBooks(containerId, booksArray) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = ''; // Wipe existing hardcoded HTML to use DB version
        
        if (booksArray) {
            booksArray.forEach(bookData => {
                addBookToDOM(containerId, bookData.title, bookData.cover, bookData.date, bookData.progress);
            });
        }
    }

    // Function to add a book element to the DOM
    function addBookToDOM(containerId, title, coverUrl, dateText = 'Upcoming', progress = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!coverUrl) {
            coverUrl = 'https://via.placeholder.com/150x225?text=No+Cover';
        }

        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book');

        if (progress) {
            bookDiv.setAttribute('data-progress', progress);
        }

        bookDiv.innerHTML = `
            <img src="${coverUrl}" alt="Book Cover">
            <div class="title">${title}</div>
            <div class="date">${dateText}</div>
        `;
        
        if (progress) {
            initProgressBar(bookDiv);
        }
        
        addBookActions(bookDiv);
        container.appendChild(bookDiv);
    }

    // Reading Tracker Init function for a single book
    function initProgressBar(book) {
        if (book.querySelector('.progress-container')) return; // Already initialized

        const progress = book.getAttribute('data-progress');
        
        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');
        
        const progressLabel = document.createElement('div');
        progressLabel.classList.add('progress-label');
        progressLabel.innerHTML = `<span>Reading Progress</span> <span>${progress}%</span>`;
        
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        
        const progressFill = document.createElement('div');
        progressFill.classList.add('progress-fill');
        progressFill.style.width = '0%';
        
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressLabel);
        progressContainer.appendChild(progressBar);
        
        book.appendChild(progressContainer);
        
        setTimeout(() => {
            progressFill.style.width = `${progress}%`;
        }, 300);
    }

    // Helper to add edit/delete/move buttons to a book element
    function addBookActions(bookElement) {
        if (bookElement.querySelector('.book-actions')) return;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('book-actions');
        actionsDiv.innerHTML = `
            <button class="move-prev-btn" title="Move Left">⬅️</button>
            <button class="move-next-btn" title="Move Right">➡️</button>
            <button class="edit-btn" title="Edit">✏️</button>
            <button class="delete-btn" title="Delete">🗑️</button>
        `;
        bookElement.appendChild(actionsDiv);
    }

    // Handle Edit, Delete, and Move clicks
    document.body.addEventListener('click', (e) => {
        // --- Move Left ---
        if (e.target.closest('.move-prev-btn')) {
            const bookEl = e.target.closest('.book');
            if (bookEl.previousElementSibling) {
                bookEl.parentNode.insertBefore(bookEl, bookEl.previousElementSibling);
                saveDatabase();
            }
        }

        // --- Move Right ---
        if (e.target.closest('.move-next-btn')) {
            const bookEl = e.target.closest('.book');
            if (bookEl.nextElementSibling) {
                bookEl.parentNode.insertBefore(bookEl.nextElementSibling, bookEl);
                saveDatabase();
            }
        }

        // --- Delete ---
        if (e.target.closest('.delete-btn')) {
            const bookEl = e.target.closest('.book');
            const titleEl = bookEl.querySelector('.title');
            if (confirm(`Are you sure you want to delete "${titleEl ? titleEl.innerText : 'this book'}"?`)) {
                bookEl.remove();
                saveDatabase();
            }
        }
        
        // --- Edit ---
        if (e.target.closest('.edit-btn')) {
            const bookEl = e.target.closest('.book');
            const titleEl = bookEl.querySelector('.title');
            const imgEl = bookEl.querySelector('img');
            const dateEl = bookEl.querySelector('.date');
            
            const oldTitle = titleEl.innerText;
            const newTitle = prompt('Enter new title:', oldTitle);
            
            if (newTitle !== null && newTitle.trim() !== '') {
                const newCover = prompt('Enter new cover image URL (leave blank to keep current):', imgEl.src);
                const newDate = prompt('Enter reading time (e.g., June 2026):', dateEl ? dateEl.innerText : '');
                
                titleEl.innerText = newTitle.trim();
                
                if (newCover !== null && newCover.trim() !== '') {
                    imgEl.src = newCover.trim();
                }
                if (dateEl && newDate !== null) {
                    dateEl.innerText = newDate.trim();
                }
                
                saveDatabase();
            }
        }
    });

    // Handle Add Book form submission
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const titleInput = document.getElementById('newBookTitle');
            const coverInput = document.getElementById('newBookCover');
            
            const title = titleInput.value.trim();
            const cover = coverInput.value.trim();
            
            if (title) {
                // Determine which container to add to based on selected logic.
                // For now, form adds to Upcoming Books. 
                // You can prompt the user or add a dropdown in the future.
                addBookToDOM('upcomingBooksList', title, cover, 'Upcoming');
                saveDatabase();
                
                titleInput.value = '';
                coverInput.value = '';
            }
        });
    }

    // Initialize Database
    loadDatabase();

    // Cozy Interaction
    const coffeeCup = document.getElementById('coffeeCup');
    const cozyIcons = ['☕', '🍵', '🕯️', '📚', '🍪'];
    let currentIconIndex = 0;

    if (coffeeCup) {
        coffeeCup.addEventListener('click', () => {
            currentIconIndex = (currentIconIndex + 1) % cozyIcons.length;
            coffeeCup.innerText = cozyIcons[currentIconIndex];
            
            coffeeCup.style.transform = 'scale(1.2) translateY(-15px)';
            setTimeout(() => {
                coffeeCup.style.transform = '';
            }, 200);
        });
    }
});
