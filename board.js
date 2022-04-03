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

function setStatus(message) {
    if (document.body.childElementCount > 1)
        document.body.removeChild(document.body.lastChild);

    document.body.appendChild(document.createTextNode(message));
}

class Cell {
    constructor(id, isWhite) {
        this.id = id;
        this.isWhite = isWhite;
        this.highlighted = false;

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

    highlight() {
        this.highlighted = true;
        this.div.style.backgroundColor = (this.isWhite) ? MOVE_LIGHT : MOVE_DARK;
    }

    dehighlight() {
        this.highlighted = false;
        this.div.style.backgroundColor = (this.isWhite) ? CELL_LIGHT : CELL_DARK;
    }
}

function genBoard() {
    var board = document.getElementById('board');
    var white = true;

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

function genPieces() {
    // Black Pieces
    new Rook(0, 'black');
    new Knight(1, 'black');
    new Bishop(2, 'black');
    new Queen(3, 'black');
    new King(4, 'black');
    new Bishop(5, 'black');
    new Knight(6, 'black');
    new Rook(7, 'black');

    new Pawn(8, 'black');
    new Pawn(9, 'black');
    new Pawn(10, 'black');
    new Pawn(11, 'black');
    new Pawn(12, 'black');
    new Pawn(13, 'black');
    new Pawn(14, 'black');
    new Pawn(15, 'black');

    // Black Pieces
    new Pawn(48, 'white');
    new Pawn(49, 'white');
    new Pawn(50, 'white');
    new Pawn(51, 'white');
    new Pawn(52, 'white');
    new Pawn(53, 'white');
    new Pawn(54, 'white');
    new Pawn(55, 'white');

    new Rook(56, 'white');
    new Knight(57, 'white');
    new Bishop(58, 'white');
    new Queen(59, 'white');
    new King(60, 'white');
    new Bishop(61, 'white');
    new Knight(62, 'white');
    new Rook(63, 'white');

    // Create the HTML elements for each piece
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece)
            gameboard[i].create();
    }
}

function screenToGamePos(x, y) {
    let gameX = Math.floor((x - margin_left) / CELL_SIZE);
    let gameY = Math.floor((y - margin_top) / CELL_SIZE);

    return gameX + (gameY * 8);
}
