const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const shuffleBtn = document.querySelector('button');
const solveButton = document.getElementById('solveButton');
const GOAL = [1,2,3,4,5,6,7,8,0];
const VALID_MOVES = {
    // key:value pair of index of empty spot: array of indices it can swap with
    0: [1, 3],    
    1: [0, 2, 4],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4, 8],
    6: [3, 7],
    7: [4, 6, 8],
    8: [5, 7] 
};
const GOAL_POSITIONS = {
    // THis just maps tile values(1-8) to GOAL index(0-8)
    1: 0, 2: 1, 3: 2, 
    4: 3, 5: 4, 6: 5, 
    7: 6, 8: 7, 0: 8 
};

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
    canvas.innerHTML = "";

    let tileSize = 100;
    let fullSize = 300;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                let emptyTile = document.createElement("div");
                emptyTile.classList.add("tile", "empty");
                canvas.appendChild(emptyTile); // append the empty tile
                continue;
            }

            let tile = document.createElement("div");
            tile.classList.add("tile")

            tile.style.width = tile.style.height = tileSize + "px";
            tile.style.backgroundImage = `url(${imgSrc})`;
            tile.style.backgroundRepeat = "no-repeat";
            tile.style.backgroundSize = `${fullSize}px ${fullSize}px`;
            tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;

            tile.dataset.value = row * 3 + col + 1;
            canvas.appendChild(tile);
        }
    }
}

function shuffleTiles() {
    let tiles = Array.from(canvas.children);
    let values = tiles.map(t => t.dataset.value || "0"); 

    // Simple random shuffle
    for (let i = values.length - 1; i > 0; i--) { // traversing backards
        const j = Math.floor(Math.random() * (i + 1)); // floors and assigns j to random int between 0 to i
        [values[i], values[j]] = [values[j], values[i]];
    }

    // Reorder DOM children
    values.forEach(v => {
        const tile = tiles.find(t => (t.dataset.value || "0") === v);
        canvas.appendChild(tile);
    });
}

shuffleBtn.addEventListener('click', shuffleTiles);


function getCurrentState() {
    // get the current tiles and empty pos inside the canvas element
    const tiles = Array.from(canvas.children);

    // convert each tile element into numerical value using map
    const state = tiles.map(tile => {
        // value is now stored in data-value attribute
        const valueString = tile.dataset.value || "0";

        return parseInt(valueString)

    });

    return state;

}

function getNeighborStates(state) {
    const neighbors = [];

    // This returns the index of where 0 (or empty tile) is located
    const emptyIndex = state.indexOf(0);

    // Looks up in the map to see where 0 (or empty tile) can swap (valid moves)
    const validSwapIndices = VALID_MOVES[emptyIndex.toString()];

    for (const swapIndex of validSwapIndices) {
        // creates new array for neighbor state and clones the array to newState
        const newState = [...state];

        [newState[emptyIndex], newState[swapIndex]] = [newState[swapIndex], newState[emptyIndex]];
        neighbors.push(newState);
    }
    return neighbors;
}

function getManhattanDistance(state) {
    let distance = 0;

    for (let i = 0; i < 9; i++) {
        const tileValue = state[i];

        if (tileValue === 0) {
            continue;
        }
        const currentX = i % 3;
        const currentY = Math.floor(i / 3);

        const goalIndex = GOAL_POSITIONS[tileValue];

        const goalX = goalIndex % 3;
        const goalY = Math.floor(goalIndex / 3);

        // Calculate the manhattan distance: |x1 - x2| + |y1 - y2|
        const dx = Math.abs(currentX - goalX);
        const dy = Math.abs(currentY - goalY);

        distance += dx + dy
    }

    return distance;
}

function createNode(state, parent, g) {
    const h = getManhattanDistance(state);
    const f = g + h;
    
    return {

        state: state,     
        parent: parent,    
        g: g,               
        h: h,         
        f: f      
    };
}

function reconstructPath(goalNode) {
    const path = [];
    let currentNode = goalNode;

    while (currentNode !== null) {
        path.push(currentNode.state);
        currentNode = currentNode.parent;
    }

    return path.reverse();
}

const MAX_SEARCH_NODES = 20000;

function solvePuzzle() {
    const initialStateArray = getCurrentState();
    const startTime = performance.now(); 

    let openList = []; 
    
    let closedSet = new Set(); 
    
    const startNode = createNode(initialStateArray, null, 0); 
    openList.push(startNode);
    
    let nodesChecked = 0;

    while (openList.length > 0 && nodesChecked < MAX_SEARCH_NODES) {
        
        openList.sort((a, b) => {
            if (a.f !== b.f) return a.f - b.f;
            return a.h - b.h; 
        });
        
        const currentNode = openList.shift();
        nodesChecked++;

        if (currentNode.state.every((val, index) => val === GOAL[index])) {
            const endTime = performance.now(); // Stop timing
            const timeTaken = endTime - startTime;
            
            // Return an object with the results
            return {
                path: reconstructPath(currentNode), 
                nodes: nodesChecked, 
                time: timeTaken
            }; 
        }
        
        // Checks if already visited
        const stateString = currentNode.state.join(',');
        if (closedSet.has(stateString)) {
            continue;
        }
        
        closedSet.add(stateString);

        const neighborStates = getNeighborStates(currentNode.state);

        for (const neighborState of neighborStates) {
            const newG = currentNode.g + 1;

            const neighborNode = createNode(neighborState, currentNode, newG);
            
            if (closedSet.has(neighborNode.state.join(','))) {
                continue;
            }

            openList.push(neighborNode);
        }
    }

    return null; // Solution not found
}

solveButton.addEventListener('click', function() {
    console.log("Starting puzzle solver...");
    const result = solvePuzzle();
    
    if (result) {
        const solutionPath = result.path;
        const moves = solutionPath.length - 1; 

        console.log(`Solution found with ${moves} moves.`);
        updateStats(moves, result.nodes, result.time); 
        displaySolution(solutionPath); 
        
    } else {
        console.log("Could not find a solution within the search limit.");
        updateStats('N/A', 0, 'N/A'); 
    }
});

const ANIMATION_SPEED = 200; 

function displaySolution(solutionPath) {
    if (!solutionPath || solutionPath.length === 0) {
        console.log("No solution path provided.");
        return;
    }

    let step = 0;
    
    const tiles = Array.from(canvas.children);

    function executeNextStep() {
        if (step >= solutionPath.length) {
            console.log("Animation complete!");
            return; // Stop the animation
        }

        const nextState = solutionPath[step];

        nextState.forEach(value => {

            const valueString = value.toString();
            const tile = tiles.find(t => (t.dataset.value || "0") === valueString);
            
            // Move the tile to the current end of the canvas children list
            canvas.appendChild(tile);
        });

        step++;

        setTimeout(executeNextStep, ANIMATION_SPEED);
    }

    executeNextStep();
}

function updateStats(moves, nodes, time) {
    document.getElementById('moves-count').textContent = moves;
    document.getElementById('nodes-explored').textContent = nodes;
    
    let timeString;
    if (typeof time === 'number' && isFinite(time)) {
        timeString = `${time.toFixed(2)}ms`;
    } else {
        timeString = time; 
    }
    
    document.getElementById('time-taken').textContent = timeString;
}