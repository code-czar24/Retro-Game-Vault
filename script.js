const API_KEY = 'e23f1d85b2e24a77b3e5aac810823aec';
const BASE_URL = `https://api.rawg.io/api/games?key=${API_KEY}`;

let allGames = [];
let displayedGames = [];

const gameGrid = document.getElementById('gameGrid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const ratingThreshold = document.getElementById('ratingThreshold');

const fetchGames = async () => {
    try {
        showStatus('loading');
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        allGames = data.results;
        displayedGames = [...allGames];
        renderGames(displayedGames);
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

const renderGames = (games) => {
    gameGrid.innerHTML = '';
    games.map(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        const img = document.createElement('img');
        img.src = game.background_image || 'https://via.placeholder.com/400x200?text=No+Image';
        img.alt = game.name;
        card.appendChild(img);

        const info = document.createElement('div');
        info.className = 'game-info';

        const name = document.createElement('h3');
        name.className = 'game-name';
        name.textContent = game.name;
        info.appendChild(name);

        const meta = document.createElement('div');
        meta.className = 'game-meta';

        const ratingWrap = document.createElement('span');
        ratingWrap.className = 'game-rating';
        ratingWrap.textContent = `★ ${game.rating}`;
        meta.appendChild(ratingWrap);

        const released = document.createElement('span');
        released.className = 'game-date';
        released.textContent = game.released ? new Date(game.released).toLocaleDateString() : 'N/A';
        meta.appendChild(released);

        info.appendChild(meta);
        card.appendChild(info);
        gameGrid.appendChild(card);
    });
};

const applyFiltersAndSort = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const minRating = parseFloat(ratingThreshold.value) || 0;
    const sortBy = sortSelect.value;

    let filtered = allGames.filter(game => 
        game.name.toLowerCase().includes(searchTerm) && 
        game.rating >= minRating
    );

    if (sortBy !== 'none') {
        filtered.sort((a, b) => {
            if (sortBy === 'rating-desc') return b.rating - a.rating;
            if (sortBy === 'rating-asc') return a.rating - b.rating;
            if (sortBy === 'released-desc') return new Date(b.released || 0) - new Date(a.released || 0);
            if (sortBy === 'released-asc') return new Date(a.released || 0) - new Date(b.released || 0);
            return 0;
        });
    }

    renderGames(filtered);
};

searchInput.addEventListener('input', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);
ratingThreshold.addEventListener('input', applyFiltersAndSort);

fetchGames();
