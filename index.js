const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');

fileInput.addEventListener('change', function() {
    let file = fileInput.files[0]
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            canvas.innerHTML = "";

            // let img = document.createElement("img");
            // img.src = e.target.result;
            createGrid(e.target.result);
            canvas.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
})


function createGrid(imgSrc) {
    canvas.innterHTML = "";

    let tileSize = 100;
    let fullSize = 300;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                let emptyTile = document.createElement("div");
                emptyTile.classList.add("tile", "empty");
                continue;
            }

            let tile = document.createElement("div");
            tile.classList.add("tile")

            tile.style.backgroundImage = `url(${imgSrc})`;
            tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;

            canvas.appendChild(tile);

        }

    }
}