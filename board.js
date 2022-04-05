const PAWN = '♟';
const KNIGHT = '♞';
const BISHOP = '♝';
const ROOK = '♜';
const QUEEN = '♛';
const KING = '♚';

const CELL_LIGHT = '#629bad';
const SELECTED_LIGHT = '#8cc6d9';
const MOVE_LIGHT = '#f7f2a0';

const CELL_DARK = '#254b7d';
const SELECTED_DARK = '#3d6cab';
const MOVE_DARK = '#c8bd1b';

const WHITE = true;
const BLACK = false;

const CELL_SIZE = 60;
let margin_top;
let margin_left;

// Sets the status in the dev panel
function setStatus(message) {
    if (document.body.childElementCount > 1)
        document.body.removeChild(document.body.lastChild);

    document.body.appendChild(document.createTextNode(message));
}

// Container class for each board square
class Cell {
    constructor(id, isWhite) {
        this.id = id;
        this.isWhite = isWhite;
        this.highlighted = false;

        // Create cell div element
        this.div = document.createElement('div');
        board.appendChild(this.div);
        this.div.className = 'cell';
        this.div.style.width = CELL_SIZE + 'px';
        this.div.style.height = CELL_SIZE + 'px';
        this.div.style.fontSize = '40px';

        if (isWhite) {
            this.div.style.backgroundColor = CELL_LIGHT;
        } else {
            this.div.style.backgroundColor = CELL_DARK;
        }
    }

    // Slightly lightens the color of cell
    select() {
        if (this.highlighted)
            return;
        this.div.style.backgroundColor = (this.isWhite) ? SELECTED_LIGHT : SELECTED_DARK;
    }

    deselect() {
        if (this.highlighted)
            return;
        this.div.style.backgroundColor = (this.isWhite) ? CELL_LIGHT : CELL_DARK;
    }

    // Highlights cell in yellow
    highlight() {
        this.highlighted = true;
        this.div.style.backgroundColor = (this.isWhite) ? MOVE_LIGHT : MOVE_DARK;
    }

    dehighlight() {
        this.highlighted = false;
        this.div.style.backgroundColor = (this.isWhite) ? CELL_LIGHT : CELL_DARK;
    }
}

// Generates the squares of the chess board
function genBoard() {
    var board = document.getElementById('board');
    var white = true;

    // Get the true margins from the browser
    margin_top = parseInt(board.getBoundingClientRect().top);
    margin_left = parseInt(board.getBoundingClientRect().left);

    // Generate Cells
    for (var i = 0; i < 64; i++) {
        // If a new row, flip the color
        if (i % 8 == 0)
            white = !white;

        // Create cell
        cells[i] = new Cell(i, white);

        // Flip color
        white = !white;
    }
}

// Adds numerical id in corner of each cell
function addCellIds() {
    for (var i = 0; i < 64; i++) {
        var id = document.createTextNode(i);

        // Create wrapper for id text
        var idWrapper = document.createElement('div');
        idWrapper.className = 'id_wrapper';

        idWrapper.style.fontSize = '10px';
        idWrapper.style.color = 'white';
        idWrapper.style.fontFamily = 'sans-serif';

        idWrapper.appendChild(id);

        // Add id to cell
        cells[i].div.appendChild(idWrapper);
    }
}

// Gets the cell id that contains point (x,y) of screen
function screenToGamePos(x, y) {
    let gameX = Math.floor((x - margin_left) / CELL_SIZE);
    let gameY = Math.floor((y - margin_top) / CELL_SIZE);

    return gameX + (gameY * 8);
}
