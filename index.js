const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const shuffleBtn = document.querySelector('button'); // first button in your HTML

fileInput.addEventListener('change', function() {
    let file = fileInput.files[0]
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            canvas.innerHTML = "";

            createGrid(e.target.result);
            // canvas.appendChild(img); // remove this, img is undefined
        };

        reader.readAsDataURL(file);
    }
})

function createGrid(imgSrc) {
    canvas.innerHTML = ""; // typo fix (was innterHTML)

    let tileSize = 100;
    let fullSize = 300;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                let emptyTile = document.createElement("div");
                emptyTile.classList.add("tile", "empty");
                canvas.appendChild(emptyTile); // append the blank
                continue;
            }

            let tile = document.createElement("div");
            tile.classList.add("tile")

            tile.style.width = tile.style.height = tileSize + "px";
            tile.style.backgroundImage = `url(${imgSrc})`;
            tile.style.backgroundRepeat = "no-repeat";
            tile.style.backgroundSize = `${fullSize}px ${fullSize}px`;
            tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;

            tile.dataset.value = row * 3 + col + 1; // store position
            canvas.appendChild(tile);
        }
    }
}

// Shuffle logic  this was just added now
function shuffleTiles() {
    let tiles = Array.from(canvas.children);
    let values = tiles.map(t => t.dataset.value || "0"); // "0" for empty

    // Simple random shuffle
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    // Reorder DOM children
    values.forEach(v => {
        const tile = tiles.find(t => (t.dataset.value || "0") === v);
        canvas.appendChild(tile);
    });
}

// Hook up button
shuffleBtn.addEventListener('click', shuffleTiles);
