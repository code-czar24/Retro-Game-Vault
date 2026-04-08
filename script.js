const API_KEY = 'e23f1d85b2e24a77b3e5aac810823aec';
const BASE_URL = `https://api.rawg.io/api/games?key=${API_KEY}`;

// Global State Requirements
let originalData = [];
let filteredData = [];
// Bonus/Requirement: Store favorites in an array and localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM Elements
const gameGrid = document.getElementById('gameGrid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const genreSelect = document.getElementById('genreSelect');
const themeToggle = document.getElementById('themeToggle');

// --- Initialization ---

const fetchGames = async () => {
    try {
        showStatus('loading');
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        originalData = data.results;
        filteredData = [...originalData];
        renderData(filteredData);
        showStatus('content');
    } catch (err) {
        showStatus('error');
    }
};

const showStatus = (status) => {
    loadingElement.classList.toggle('hidden', status !== 'loading');
    errorElement.classList.toggle('hidden', status !== 'error');
    gameGrid.classList.toggle('hidden', status !== 'content');
};

// --- Core Features (Milestone 3) ---

// 1. Separate Render Function
const renderData = (data) => {
    // Show 'No results' state
    if (data.length === 0) {
        gameGrid.innerHTML = '<div class="status-message">No results found (Try adjusting filters)</div>';
        return;
    }

    // Requirement: Use ONLY map, filter, find, sort, reduce - NO loops
    // We map each game to HTML string, then reduce array of strings to a single HTML string
    gameGrid.innerHTML = data.map(game => {
        const isFav = favorites.find(id => id === game.id) !== undefined;
        const img = game.background_image || 'https://via.placeholder.com/400x200?text=No+Image';
        const rawDate = game.released ? new Date(game.released).toLocaleDateString() : 'N/A';
        
        return `
            <div class="game-card">
                <img src="${img}" alt="${game.name}">
                <div class="game-info">
                    <h3 class="game-name">${game.name}</h3>
                    <div class="game-meta">
                        <span class="game-rating">★ ${game.rating}</span>
                        <span class="game-date">${rawDate}</span>
                    </div>
                    <!-- Favorite Toggle Button -->
                    <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${game.id}">
                        ${isFav ? '❤️ Liked' : '🤍 Like'}
                    </button>
                </div>
            </div>
        `;
    }).reduce((htmlString, cardMarkup) => htmlString + cardMarkup, '');

    // Attach event listeners to favorite buttons (converting NodeList to Array to use .map)
    const favoriteBtns = Array.from(document.querySelectorAll('.favorite-btn'));
    favoriteBtns.map(btn => {
        btn.addEventListener('click', (e) => {
            const gameId = parseInt(e.currentTarget.dataset.id);
            toggleFavorite(gameId);
        });
    });
};

// 2. Favorite Toggle Interaction
const toggleFavorite = (id) => {
    const isFavorite = favorites.find(favId => favId === id);
    if (isFavorite) {
        // Requirement: Use .filter() to remove unliked
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites = [...favorites, id];
    }
    // Save preference using localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Update dynamically
    renderData(filteredData);
};

// 3. Search Functionality
const handleSearch = (data) => {
    const term = searchInput.value.toLowerCase();
    if (!term) return data;
    // Requirement: Use .filter() based on keyword
    return data.filter(game => game.name.toLowerCase().includes(term));
};

// 4. Filter Functionality
const handleFilter = (data) => {
    const genre = genreSelect.value;
    if (genre === 'all') return data;
    // Requirement: Use .filter() for matching results
    return data.filter(game => {
        if (!game.genres) return false;
        // Requirement: Use .find() internal API data checks
        return game.genres.find(g => g.name.includes(genre));
    });
};

// 5. Sort Functionality
const handleSort = (data) => {
    const sortBy = sortSelect.value;
    // Using spread to avoid directly mutating the original array passed in
    let sorted = [...data];
    
    // Requirement: Add sorting options (asc, desc, alphabetical) using .sort()
    return sorted.sort((a, b) => {
        if (sortBy === 'rating-desc') return b.rating - a.rating;
        if (sortBy === 'rating-asc') return a.rating - b.rating;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0; // default for 'none'
    });
};

// Orchestrator: Chains filters/searches and updates UI
const updateUI = () => {
    let result = [...originalData]; // start with clean slate
    result = handleSearch(result);
    result = handleFilter(result);
    // Finally apply sort to the filtered data
    filteredData = handleSort(result);
    
    // Update UI dynamically
    renderData(filteredData);
};

// --- Bonus Additions ---

// Bonus: Debounce Search Input
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

// Only trigger search after the user stops typing for 300ms
const handleSearchDebounced = debounce(() => updateUI(), 300);

// Requirement: Dark Mode Toggle
const initTheme = () => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark-mode');
    updateThemeButtonText();
};

const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    // Save to localStorage
    localStorage.setItem('darkMode', isDark);
    updateThemeButtonText();
};

const updateThemeButtonText = () => {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
};

// Attach Listeners
searchInput.addEventListener('input', handleSearchDebounced);
sortSelect.addEventListener('change', updateUI);
genreSelect.addEventListener('change', updateUI);
themeToggle.addEventListener('click', toggleTheme);

// Boot App
initTheme();
fetchGames();
