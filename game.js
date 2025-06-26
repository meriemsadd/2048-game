document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreDisplay = document.getElementById('score');
    const bestDisplay = document.getElementById('best');
    const newGameBtn = document.getElementById('new-game');

    const size = 4;
    const cellSize = 70;
    const gap = 12;
    let grid = [];
    let tiles = [];
    let score = 0;
    let bestScore = 0;

    // Crée la grille fixe (fond)
    function createGrid() {
        board.innerHTML = '';
        grid = new Array(size * size).fill(0);

        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            board.appendChild(cell);
        }
    }

    // Positionne et affiche les tiles
    function drawTiles() {
        // Supprime anciennes tiles
        tiles.forEach(tile => board.removeChild(tile.element));
        tiles = [];

        grid.forEach((value, index) => {
            if (value !== 0) {
                const tile = document.createElement('div');
                tile.classList.add('tile', `tile-${value}`);

                tile.style.top = `${Math.floor(index / size) * (cellSize + gap) + gap}px`;
                tile.style.left = `${(index % size) * (cellSize + gap) + gap}px`;

                tile.textContent = value;
                board.appendChild(tile);
                tiles.push({element: tile, value, index});
            }
        });
    }

    // Ajoute un tile 2 ou 4 dans une case vide aléatoire
    function addRandomTile() {
        const emptyIndices = grid.reduce((acc, val, i) => val === 0 ? [...acc, i] : acc, []);
        if (emptyIndices.length === 0) return false;

        const randIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        grid[randIndex] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    // Mise à jour score
    function updateScore(value) {
        score += value;
        scoreDisplay.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            bestDisplay.textContent = bestScore;
        }
    }

    // Fusionne les lignes ou colonnes selon direction
    function slide(row) {
        let arr = row.filter(v => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i+1]) {
                arr[i] *= 2;
                updateScore(arr[i]);
                arr[i+1] = 0;
            }
        }
        arr = arr.filter(v => v !== 0);
        while (arr.length < size) arr.push(0);
        return arr;
    }

    // Déplace dans une direction
    function move(direction) {
        let moved = false;
        let newGrid = [...grid];

        for (let i = 0; i < size; i++) {
            let line = [];
            for (let j = 0; j < size; j++) {
                let index;
                if (direction === 'left') index = i * size + j;
                else if (direction === 'right') index = i * size + (size - 1 - j);
                else if (direction === 'up') index = j * size + i;
                else if (direction === 'down') index = (size - 1 - j) * size + i;

                line.push(newGrid[index]);
            }

            let slid = slide(line);

            for (let j = 0; j < size; j++) {
                let index;
                if (direction === 'left') index = i * size + j;
                else if (direction === 'right') index = i * size + (size - 1 - j);
                else if (direction === 'up') index = j * size + i;
                else if (direction === 'down') index = (size - 1 - j) * size + i;

                if (newGrid[index] !== slid[j]) moved = true;
                newGrid[index] = slid[j];
            }
        }

        if (moved) {
            grid = newGrid;
            addRandomTile();
            drawTiles();
            checkGameOver();
        }
    }

    // Vérifie si plus de mouvements possibles
    function checkGameOver() {
        if (grid.includes(0)) return false;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const current = grid[i*size + j];
                if ((j < size - 1 && current === grid[i*size + j + 1]) ||
                    (i < size - 1 && current === grid[(i+1)*size + j])) {
                    return false;
                }
            }
        }
        setTimeout(() => alert("Game Over! Essaie encore."), 100);
        return true;
    }

    // Vérifie si 2048 est atteint
    function checkWin() {
        if (grid.includes(2048)) {
            setTimeout(() => alert("Bravo ! Tu as atteint 2048 !"), 100);
            return true;
        }
        return false;
    }

    // Gestion clavier
    window.addEventListener('keydown', e => {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const dirMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            move(dirMap[e.key]);
            checkWin();
        }
    });

    // Gestion swipe mobile
    let touchStartX = 0, touchStartY = 0;
    window.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    window.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) move('right');
            else if (dx < -30) move('left');
        } else {
            if (dy > 30) move('down');
            else if (dy < -30) move('up');
        }
        checkWin();
    });

    // Nouvelle partie
    newGameBtn.addEventListener('click', () => {
        score = 0;
        scoreDisplay.textContent = score;
        createGrid();
        addRandomTile();
        addRandomTile();
        drawTiles();
    });

    // Initialisation
    newGameBtn.click();
});
