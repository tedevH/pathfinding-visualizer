// Grid dimensions
const ROWS = 25;
const COLS = 50;

// Special node positions
let START_NODE = { row: 12, col: 10 };
let END_NODE = { row: 12, col: 40 };

// State
let grid = [];
let isMousePressed = false;

// Initialize the grid
function createGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    grid = [];

    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            const node = {
                row,
                col,
                isStart: row === START_NODE.row && col === START_NODE.col,
                isEnd: row === END_NODE.row && col === END_NODE.col,
                isWall: false,
                isVisited: false,
                distance: Infinity,
                previousNode: null
            };
            currentRow.push(node);

            const nodeElement = document.createElement('div');
            nodeElement.className = 'node';
            nodeElement.id = `node-${row}-${col}`;
            
            if (node.isStart) nodeElement.classList.add('start');
            if (node.isEnd) nodeElement.classList.add('end');

            nodeElement.addEventListener('mousedown', () => handleMouseDown(row, col));
            nodeElement.addEventListener('mouseenter', () => handleMouseEnter(row, col));
            nodeElement.addEventListener('mouseup', () => handleMouseUp());

            gridElement.appendChild(nodeElement);
        }
        grid.push(currentRow);
    }
}

// Mouse event handlers
function handleMouseDown(row, col) {
    isMousePressed = true;
    toggleWall(row, col);
}

function handleMouseEnter(row, col) {
    if (isMousePressed) {
        toggleWall(row, col);
    }
}

function handleMouseUp() {
    isMousePressed = false;
}

function toggleWall(row, col) {
    const node = grid[row][col];
    if (node.isStart || node.isEnd) return;

    node.isWall = !node.isWall;
    const nodeElement = document.getElementById(`node-${row}-${col}`);
    
    if (node.isWall) {
        nodeElement.classList.add('wall');
    } else {
        nodeElement.classList.remove('wall');
    }
}

// Clear functions
function clearPath() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            node.isVisited = false;
            node.distance = Infinity;
            node.heuristic = 0;
            node.previousNode = null;
            
            const nodeElement = document.getElementById(`node-${row}-${col}`);
            nodeElement.classList.remove('visited', 'path');
        }
    }
}

function clearWalls() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            node.isWall = false;
            
            const nodeElement = document.getElementById(`node-${row}-${col}`);
            nodeElement.classList.remove('wall');
        }
    }
}

// ====================
// PATHFINDING ALGORITHMS
// ====================

function bfs() {
    const startNode = grid[START_NODE.row][START_NODE.col];
    const endNode = grid[END_NODE.row][END_NODE.col];
    
    const visitedNodesInOrder = [];
    const queue = [startNode];
    startNode.isVisited = true;
    
    while (queue.length > 0) {
        const currentNode = queue.shift();
        visitedNodesInOrder.push(currentNode);
        
        if (currentNode === endNode) {
            return visitedNodesInOrder;
        }
        
        const neighbors = getNeighbors(currentNode);
        
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }
    }
    
    return visitedNodesInOrder;
}

function dfs() {
    const startNode = grid[START_NODE.row][START_NODE.col];
    const endNode = grid[END_NODE.row][END_NODE.col];
    
    const visitedNodesInOrder = [];
    const stack = [startNode];
    startNode.isVisited = true;
    
    while (stack.length > 0) {
        const currentNode = stack.pop();
        visitedNodesInOrder.push(currentNode);
        
        if (currentNode === endNode) {
            return visitedNodesInOrder;
        }
        
        const neighbors = getNeighbors(currentNode);
        
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                stack.push(neighbor);
            }
        }
    }
    
    return visitedNodesInOrder;
}

function dijkstra() {
    const startNode = grid[START_NODE.row][START_NODE.col];
    const endNode = grid[END_NODE.row][END_NODE.col];
    
    startNode.distance = 0;
    const visitedNodesInOrder = [];
    const unvisitedNodes = getAllNodes();
    
    while (unvisitedNodes.length > 0) {
        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const closestNode = unvisitedNodes.shift();
        
        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return visitedNodesInOrder;
        
        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
        
        if (closestNode === endNode) return visitedNodesInOrder;
        
        updateNeighbors(closestNode);
    }
    
    return visitedNodesInOrder;
}

function astar() {
    const startNode = grid[START_NODE.row][START_NODE.col];
    const endNode = grid[END_NODE.row][END_NODE.col];
    
    startNode.distance = 0;
    startNode.heuristic = manhattanDistance(startNode, endNode);
    
    const visitedNodesInOrder = [];
    const unvisitedNodes = getAllNodes();
    
    while (unvisitedNodes.length > 0) {
        unvisitedNodes.sort((a, b) => {
            const fA = a.distance + a.heuristic;
            const fB = b.distance + b.heuristic;
            return fA - fB;
        });
        
        const closestNode = unvisitedNodes.shift();
        
        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return visitedNodesInOrder;
        
        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
        
        if (closestNode === endNode) return visitedNodesInOrder;
        
        updateNeighborsAStar(closestNode, endNode);
    }
    
    return visitedNodesInOrder;
}

// Helper functions
function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;
    
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
    
    return neighbors;
}

function getAllNodes() {
    const nodes = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            nodes.push(grid[row][col]);
        }
    }
    return nodes;
}

function updateNeighbors(node) {
    const neighbors = getNeighbors(node);
    for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
            const newDistance = node.distance + 1;
            if (newDistance < neighbor.distance) {
                neighbor.distance = newDistance;
                neighbor.previousNode = node;
            }
        }
    }
}

function updateNeighborsAStar(node, endNode) {
    const neighbors = getNeighbors(node);
    for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
            const newDistance = node.distance + 1;
            if (newDistance < neighbor.distance) {
                neighbor.distance = newDistance;
                neighbor.heuristic = manhattanDistance(neighbor, endNode);
                neighbor.previousNode = node;
            }
        }
    }
}

function manhattanDistance(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function getShortestPath(endNode) {
    const path = [];
    let currentNode = endNode;
    
    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    
    return path;
}

// ====================
// ANIMATION
// ====================

function animateAlgorithm(visitedNodes, shortestPath) {
    for (let i = 0; i < visitedNodes.length; i++) {
        setTimeout(() => {
            const node = visitedNodes[i];
            if (!node.isStart && !node.isEnd) {
                const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
                nodeElement.classList.add('visited');
            }
            
            if (i === visitedNodes.length - 1) {
                setTimeout(() => {
                    animatePath(shortestPath);
                }, 500);
            }
        }, 10 * i);
    }
}

function animatePath(path) {
    for (let i = 0; i < path.length; i++) {
        setTimeout(() => {
            const node = path[i];
            if (!node.isStart && !node.isEnd) {
                const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
                nodeElement.classList.add('path');
            }
        }, 50 * i);
    }
}

// ====================
// MAZE GENERATION
// ====================

function generateMazeRecursive() {
    clearWalls();
    clearPath();
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            if (!node.isStart && !node.isEnd) {
                node.isWall = true;
                document.getElementById(`node-${row}-${col}`).classList.add('wall');
            }
        }
    }
    
    const startRow = Math.floor(Math.random() * ROWS);
    const startCol = Math.floor(Math.random() * COLS);
    
    recursiveBacktrack(startRow, startCol);
}

function recursiveBacktrack(row, col) {
    const node = grid[row][col];
    node.isWall = false;
    document.getElementById(`node-${row}-${col}`).classList.remove('wall');
    
    const neighbors = [];
    
    if (row >= 2) neighbors.push({ row: row - 2, col, direction: 'up' });
    if (row < ROWS - 2) neighbors.push({ row: row + 2, col, direction: 'down' });
    if (col >= 2) neighbors.push({ row, col: col - 2, direction: 'left' });
    if (col < COLS - 2) neighbors.push({ row, col: col + 2, direction: 'right' });
    
    shuffleArray(neighbors);
    
    for (const neighbor of neighbors) {
        const neighborNode = grid[neighbor.row][neighbor.col];
        
        if (neighborNode.isWall) {
            if (neighbor.direction === 'up') {
                grid[row - 1][col].isWall = false;
                document.getElementById(`node-${row - 1}-${col}`).classList.remove('wall');
            } else if (neighbor.direction === 'down') {
                grid[row + 1][col].isWall = false;
                document.getElementById(`node-${row + 1}-${col}`).classList.remove('wall');
            } else if (neighbor.direction === 'left') {
                grid[row][col - 1].isWall = false;
                document.getElementById(`node-${row}-${col - 1}`).classList.remove('wall');
            } else if (neighbor.direction === 'right') {
                grid[row][col + 1].isWall = false;
                document.getElementById(`node-${row}-${col + 1}`).classList.remove('wall');
            }
            
            recursiveBacktrack(neighbor.row, neighbor.col);
        }
    }
}

function generateRandomWalls() {
    clearWalls();
    clearPath();
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            if (!node.isStart && !node.isEnd && Math.random() < 0.3) {
                node.isWall = true;
                document.getElementById(`node-${row}-${col}`).classList.add('wall');
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ====================
// EVENT LISTENERS
// ====================

window.addEventListener('load', createGrid);

document.getElementById('clear-path').addEventListener('click', clearPath);
document.getElementById('clear-walls').addEventListener('click', clearWalls);

document.getElementById('visualize').addEventListener('click', () => {
    clearPath();
    
    const algorithm = document.getElementById('algorithm').value;
    let visitedNodes;
    
    switch(algorithm) {
        case 'bfs':
            visitedNodes = bfs();
            break;
        case 'dfs':
            visitedNodes = dfs();
            break;
        case 'dijkstra':
            visitedNodes = dijkstra();
            break;
        case 'astar':
            visitedNodes = astar();
            break;
        default:
            alert('Algorithm not found');
            return;
    }
    
    const endNode = grid[END_NODE.row][END_NODE.col];
    const shortestPath = getShortestPath(endNode);
    
    if (shortestPath.length > 1) {
        animateAlgorithm(visitedNodes, shortestPath);
    } else {
        alert('No path found!');
    }
});

document.getElementById('generate-maze').addEventListener('click', () => {
    const choice = prompt('Choose maze type:\n1 = Recursive Backtracking\n2 = Random Walls\n\nEnter 1 or 2:');
    
    if (choice === '1') {
        generateMazeRecursive();
    } else if (choice === '2') {
        generateRandomWalls();
    } else {
        alert('Invalid choice! Enter 1 or 2');
    }
});