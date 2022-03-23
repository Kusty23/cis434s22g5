var gameboard = [];
var cells = [];
var pieces = gameboard;

var status;

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
const MARGIN = 50;

function newGame() {
    genBoard();
    genPieces();
    addCellIds();

    setStatus('running');
}

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
    gameboard[0] = new Rook(0, 'black');
    gameboard[1] = new Piece(KNIGHT, 1, 'black');
    gameboard[2] = new Bishop(2, 'black');
    gameboard[3] = new Queen(3, 'black');
    gameboard[4] = new Piece(KING, 4, 'black');
    gameboard[5] = new Bishop(5, 'black');
    gameboard[6] = new Piece(KNIGHT, 6, 'black');
    gameboard[7] = new Rook(7, 'black');

    gameboard[8] = new Pawn(8, 'black');
    gameboard[9] = new Pawn(9, 'black');
    gameboard[10] = new Pawn(10, 'black');
    gameboard[11] = new Pawn(11, 'black');
    gameboard[12] = new Pawn(12, 'black');
    gameboard[13] = new Pawn(13, 'black');
    gameboard[14] = new Pawn(14, 'black');
    gameboard[15] = new Pawn(15, 'black');

    // Black Pieces
    gameboard[48] = new Pawn(48, 'white');
    gameboard[49] = new Pawn(49, 'white');
    gameboard[50] = new Pawn(50, 'white');
    gameboard[51] = new Pawn(51, 'white');
    gameboard[52] = new Pawn(52, 'white');
    gameboard[53] = new Pawn(53, 'white');
    gameboard[54] = new Pawn(54, 'white');
    gameboard[55] = new Pawn(55, 'white');

    pieces[56] = new Rook(56, 'white');
    pieces[57] = new Piece(KNIGHT, 57, 'white');
    pieces[58] = new Bishop(58, 'white');
    pieces[59] = new Queen(59, 'white');
    pieces[60] = new Piece(KING, 60, 'white');
    pieces[61] = new Bishop(61, 'white');
    pieces[62] = new Piece(KNIGHT, 62, 'white');
    pieces[63] = new Rook(63, 'white');

    // Create the HTML elements for each piece
    for (var i = 0; i < 64; i++) {
        if (pieces[i] instanceof Piece)
            pieces[i].create();
    }
}

function screenToGamePos(x, y) {
    let gameX = Math.floor((x - MARGIN) / CELL_SIZE);
    let gameY = Math.floor((y - MARGIN) / CELL_SIZE);

    return gameX + (gameY * 8);
}
