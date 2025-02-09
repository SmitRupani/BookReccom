const sanitize = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

function searchBooks() {
    let query = document.getElementById('search-bar').value;
    if (!query) return;

    // const loading = document.getElementById('loading');
    // loading.style.display = 'block'; // Show loader

    localStorage.setItem('lastSearch', query);

    fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.items) {
                displaySearchResults(data.items);
            } else {
                alert("No books found for your search.");
            }
        })
        .catch(error => console.log("Error fetching books: ", error))
        // .finally(() => loading.style.display = 'none');
}

function displaySearchResults(books) {
    let bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    books.slice(0, 10).forEach(book => {
        let bookItem = document.createElement('div');
        bookItem.classList.add('book');
        bookItem.innerHTML = `
            <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="Book Cover of ${book.volumeInfo.title}">
            <h4>${book.volumeInfo.title}</h4>
            <p>${book.volumeInfo.authors?.join(', ')}</p>
            <button onclick="addToLibrary('${book.id}', '${book.volumeInfo.title}', '${book.volumeInfo.authors?.join(', ')}', '${book.volumeInfo.imageLinks?.thumbnail || ''}')">Add to Library</button>
        `;
        bookList.appendChild(bookItem);
    });
}

function addToLibrary(id, title, author, image) {
    let book = { id, title, author, image, status: "to-read", progress: 0 };
    let library = JSON.parse(localStorage.getItem('library')) || [];
    
    if (!library.some(b => b.id === id)) {
        library.push(book);
        localStorage.setItem('library', JSON.stringify(library));
    }
    displayLibrary();
}

function displayLibrary() {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    document.getElementById('to-read').innerHTML = '';
    document.getElementById('reading').innerHTML = '';
    document.getElementById('finished').innerHTML = '';

    library.forEach(book => {
        let bookItem = document.createElement('div');
        bookItem.classList.add('book');
        bookItem.id = book.id;
        bookItem.innerHTML = `
            <img src="${book.image}" alt="Book Cover of ${book.title}">
            <h4>${book.title}</h4>
            <p>${book.author}</p>
        `;
        
        if (book.status === "to-read") {
            bookItem.innerHTML += `
                <button onclick="moveBook('${book.id}', 'reading')">📚 Start Reading</button>
                <button onclick="removeFromLibrary('${book.id}')">❌ Remove</button>
                <div class="link-container">
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(book.title)}" target="_blank">🛒 Buy on Amazon</a>
                    <a href="https://www.audible.com/search?keywords=${encodeURIComponent(book.title)}" target="_blank">🎧 Listen on Audible</a>
                </div>
            `;
            document.getElementById('to-read').appendChild(bookItem);
        } else if (book.status === "reading") {
            bookItem.innerHTML += `
                <button onclick="moveBook('${book.id}', 'finished')">✅ Mark as Finished</button>
                <button onclick="moveBook('${book.id}', 'to-read')">📖 Add to To-read</button>
                <button onclick="removeFromLibrary('${book.id}')">❌ Remove</button>
                <div>
                    <input type="range" min="0" max="100" value="${book.progress}" onchange="updateProgress('${book.id}', this.value)">
                    <span>${book.progress}%</span>
                </div>
            `;
            document.getElementById('reading').appendChild(bookItem);
        } else if (book.status === "finished") {
            bookItem.innerHTML += `
                <button onclick="moveBook('${book.id}', 'to-read')">📖 Add to To-read</button>
                <button onclick="moveBook('${book.id}', 'reading')">📚 Start Reading</button>
                <button onclick="removeFromLibrary('${book.id}')">❌ Remove</button>
            `;
            document.getElementById('finished').appendChild(bookItem);
        }
    });
}

function moveBook(id, newStatus) {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    let book = library.find(b => b.id === id);
    if (book) book.status = newStatus;
    localStorage.setItem('library', JSON.stringify(library));
    displayLibrary();
}

function removeFromLibrary(id) {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    library = library.filter(b => b.id !== id);
    localStorage.setItem('library', JSON.stringify(library));
    displayLibrary();
}

function updateProgress(id, progress) {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    let book = library.find(b => b.id === id);
    if (book) {
        progress = Math.max(0, Math.min(100, progress));
        book.progress = progress;
        localStorage.setItem('library', JSON.stringify(library));
        displayLibrary();
    }
}

function clearLibrary() {
    localStorage.removeItem('library');
    displayLibrary();
}

document.addEventListener('DOMContentLoaded', () => {
    // Show loading indicator for library
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    
    // Load library first
    displayLibrary();
    
    // Then handle search history
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
        document.getElementById('search-bar').value = lastSearch;
        searchBooks();
    }
    
    loading.style.display = 'none';
});

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    document.querySelector('header').classList.toggle("dark-mode");
    document.querySelectorAll('section').forEach(section => section.classList.toggle("dark-mode"));
}


function displaySearchResults(books) {
    let bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    books.slice(0, 10).forEach(book => {
        let bookItem = document.createElement('div');
        bookItem.classList.add('book');
        bookItem.innerHTML = `
            <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title} cover">
            <h4>${book.volumeInfo.title}</h4>
            <p>${book.volumeInfo.authors?.join(', ')}</p>
            <button onclick="addToLibrary('${book.id}', '${book.volumeInfo.title}', '${book.volumeInfo.authors?.join(', ')}', '${book.volumeInfo.imageLinks?.thumbnail || ''}')">Add to Library</button>
        `;
        bookList.appendChild(bookItem);
    });
}


function displayLibrary() {
    const library = JSON.parse(localStorage.getItem('library')) || [];
    
    // Clear all shelves first
    ['to-read', 'reading', 'finished'].forEach(shelfId => {
        document.getElementById(shelfId).innerHTML = '';
    });

    library.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book';
        bookItem.innerHTML = `
            <div class="book-content">
                <img src="${book.image || 'placeholder-book.png'}" alt="${sanitize(book.title)} cover">
                <h4>${sanitize(book.title)}</h4>
                <p>${sanitize(book.author)}</p>
                <div class="book-actions">
                    ${getActionButtons(book)}
                </div>
            </div>
            ${book.status === 'reading' ? `
            <div class="progress-container">
                <input type="range" min="0" max="100" value="${book.progress}" 
                    onchange="updateProgress('${book.id}', this.value)">
                <span>${book.progress}%</span>
            </div>` : ''}
        `;
        
        document.getElementById(book.status).appendChild(bookItem);
    });
}

function getActionButtons(book) {
    const statusActions = {
        'to-read': [
            ['reading', '📚 Start Reading'],
            ['finished', '✅ Mark Finished']
        ],
        'reading': [
            ['finished', '✅ Mark Finished'],
            ['to-read', '📖 Move to To-Read']
        ],
        'finished': [
            ['to-read', '📖 Move to To-Read'],
            ['reading', '📚 Restart Reading']
        ]
    };
    
    return statusActions[book.status].map(([newStatus, label]) => `
        <button onclick="moveBook('${book.id}', '${newStatus}')">${label}</button>
    `).join('') + `<button onclick="removeFromLibrary('${book.id}')">❌ Remove</button>`;
}

// Add this new function for auto-completion
function checkAutoComplete(bookId, progress) {
    if (parseInt(progress) === 100) {
        moveBook(bookId, 'finished');
    }
}

// Modify the updateProgress function
function updateProgress(id, progress) {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    let book = library.find(b => b.id === id);
    if (book) {
        progress = Math.max(0, Math.min(100, progress));
        book.progress = progress;
        localStorage.setItem('library', JSON.stringify(library));
        checkAutoComplete(id, progress); // Check for auto-completion
        displayLibrary();
    }
}

// Update the progress container in displayLibrary
// In the reading shelf section, modify to:
bookItem.innerHTML += `
    <div class="progress-container">
        <input type="range" min="0" max="100" value="${book.progress}" 
               onchange="updateProgress('${book.id}', this.value)">
        <span>${book.progress}%</span>
    </div>
    ${book.progress === 100 ? '<div class="complete-badge">Complete! 🎉</div>' : ''}
`;

function getActionButtons(book) {
    const statusActions = {
      'to-read': [['reading', '📚 Start Reading'], ['finished', '✅ Mark Finished']],
      'reading': [['finished', '✅ Mark Finished'], ['to-read', '📖 Move to To-Read']],
      'finished': [['to-read', '📖 Move to To-Read'], ['reading', '📚 Restart Reading']]
    };
    
    return statusActions[book.status]
      .map(([newStatus, label]) => `<button onclick="moveBook('${book.id}', '${newStatus}')">${label}</button>`)
      .join('') + `<button onclick="removeFromLibrary('${book.id}')">❌ Remove</button>`;
  }

  function loadSearchFromStorage() {
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
        document.getElementById('search-bar').value = lastSearch;
        searchBooks();
    }
}