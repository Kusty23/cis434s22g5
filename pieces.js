let ATTACK_WHITE = [];
let ATTACK_BLACK = [];

ATTACK_WHITE.fill(1);
ATTACK_BLACK.fill(1);

let WHITE_KING;
let BLACK_KING;

let id = 0;

// Container class for piece elements
class Piece {
    constructor(symbol, position, color) {
        this.symbol = symbol;

        this.id = 'piece' + id;
        id++;

        // Set position on gameboard
        this.position = position;
        gameboard[position] = this;

        this.color = color;

        if (color == 'white') {
            whitePieces.push(this);
        } else {
            blackPieces.push(this);
        }

        this.active = false;
        this.alive = true;

        this.wrapper = document.createElement('div');
        this.wrapper.setAttribute('id', this.id);
        this.text = document.createTextNode(this.symbol);
    }

    // Creates the html element and positions it correctly
    create() {
        this.wrapper.style.color = this.color;
        this.wrapper.style.position = 'absolute';

        this.wrapper.appendChild(this.text);
        cells[this.position].div.appendChild(this.wrapper);
        this.updatePosition(this.position);

        this.enableDragging();

        this.hasMoved = false;
    }

    // Checks if a square is empty or has an enemy piece
    canMoveTo(position) {
        return (gameboard[position] instanceof Piece && gameboard[position].color != this.color) || !(gameboard[position] instanceof Piece);
    }

    /* Tries to update the position of the piece. If a position
       is given, it will treat it as being 'placed' instead of
       moved by a player */
    updatePosition(position, computer) {
        var oldPosition = this.position;
        if (position != null) {
            // Force the piece to move to the new position
            gameboard[this.position] = null;
            this.position = position;
            if (computer == true) {
                // If applicable, kill opposing piece
                if (gameboard[position] instanceof Piece)
                    gameboard[position].kill();
            }
        } else {
            // Get X position from pos on screen
            var newX = this.getLeft() - margin_left;
            newX = Math.floor(newX / CELL_SIZE);

            // Get Y position from pos on screen
            var newY = this.getTop() - margin_top;
            newY = Math.floor(newY / CELL_SIZE);

            // Get cell id
            var newPos = newX + (newY * 8);

            // Check if this is a valid move
            if (this.getValidMoves().includes(newPos)) {
                // Update the piece's position
                gameboard[this.position] = null;
                this.position = newPos;

                // If applicable, kill opposing piece
                if (gameboard[newPos] instanceof Piece)
                    gameboard[newPos].kill();
            }
        }

        // Place piece in proper position in gameboard array
        gameboard[this.position] = this;

        // Position this within the cell
        var posX = this.position % 8;
        var posY = Math.floor(this.position / 8);

        // Center within cell
        var left = parseInt(cells[this.position].div.getBoundingClientRect().left) + CELL_SIZE / 6;
        var top = margin_top + (posY * CELL_SIZE);

        // Animate it if the computer is moving to help player see the move made
        if (computer) {
            $('#' + this.id).animate({ left: left + 'px', top: top + 'px' });
        }
        else {
            this.wrapper.style.left = left + 'px';
            this.wrapper.style.top = top + 'px';
        }

        if (this.position != oldPosition) {
            // Now the piece has moved
            this.hasMoved = true;
            ATTACK_BLACK = generateBlackAttackMap();
            ATTACK_WHITE = generateWhiteAttackMap();

            isCheck();

            whiteTurn = !whiteTurn;
            setStatus(whiteTurn);
            playTurn();
        }

        return this.position != oldPosition;
    }

    // Kills the piece, making it no longer counted in move generation
    kill() {
        this.wrapper.style.visibility = 'hidden';
        this.alive = false;
    }

    // Gets the left position relative to board
    getLeft() {
        return parseInt((this.wrapper.style.left).slice(0, -2)) + (this.wrapper.clientWidth / 2);
    }

    // Gets top position relative to board
    getTop() {
        return parseInt((this.wrapper.style.top).slice(0, -2)) + (this.wrapper.clientHeight / 2);
    }

    // Set up drag and drop behavior
    enableDragging() {
        var delX, delY, posX, posY;

        var piece = this;
        var wrapper = this.wrapper;
        var hoverCell;

        wrapper.onmousedown = startDragging;

        function startDragging(e) {
            if (piece.active) {
                // Get initial Position
                posX = e.clientX;
                posY = e.clientY;

                // Set mouse listener methods
                document.onmousemove = drag;
                document.onmouseup = stopDragging;

                // Highlight all valid moves for this piece
                piece.highlightValidMoves();
            }
        }

        function drag(e) {
            // Calculate the offset
            delX = posX - e.clientX;
            delY = posY - e.clientY;

            // Store position
            posX = e.clientX;
            posY = e.clientY;

            // Update Position
            wrapper.style.left = (wrapper.offsetLeft - delX) + "px";
            wrapper.style.top = (wrapper.offsetTop - delY) + "px";

            // Deselect hoverCell
            if (hoverCell)
                hoverCell.deselect();

            // Select hoverCell
            hoverCell = cells[screenToGamePos(piece.getLeft(), piece.getTop())];
            hoverCell.select();
        }

        function stopDragging(e) {
            // dehighlight any cells to reset for next piece
            piece.dehighlightValidMoves();

            // Deselect hoverCell
            if (hoverCell) {
                hoverCell.deselect();
            }

            // Try to move piece to its current location
            var changed = piece.updatePosition();

            // Stop using onmousemove()
            this.onmousemove = null;
        }

    }

    // Highlights all valid moves
    highlightValidMoves() {
        var moves = this.getValidMoves();
        for (var i = 0; i < moves.length; i++) {
            cells[moves[i]].highlight();
        }
    }

    // Unhighlights any valid moves
    dehighlightValidMoves() {
        var moves = this.getValidMoves();
        for (var i = 0; i < moves.length; i++) {
            cells[moves[i]].dehighlight();
        }
    }

    // Gets all squares that are attacked by this piece
    getAttacks() {
        return [];
    }

    // Gets all valid moves for this piece
    getValidMoves() {
        return [];
    }
}

// Pawn subclass of Piece
class Pawn extends Piece {
    constructor(position, color) {
        super(PAWN, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        let forward = (this.color == 'white') ? this.position - 8 : this.position + 8;

        // Attack left
        if (parseInt((forward - 1) / 8) == parseInt(forward / 8))
            attacks.push(forward - 1);

        // Attack Right
        if (parseInt((forward + 1) / 8) == parseInt(forward / 8))
            attacks.push(forward + 1);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        let forward = (this.color == 'white') ? -8 : +8;

        // Move forward one
        if (!(gameboard[this.position + forward] instanceof Piece)) {
            moves.push(this.position + forward);

            // Move forward 2 if not yet moved
            if (!this.hasMoved && !(gameboard[this.position + forward * 2] instanceof Piece))
                moves.push(this.position + forward * 2);
        }

        // Diagonal Attacks
        let f1 = this.position + forward;

        if (parseInt((f1 - 1) / 8) * 8 == parseInt(f1 / 8) * 8) {
            if (gameboard[f1 - 1] instanceof Piece && gameboard[f1 - 1].color != this.color) {
                moves.push(f1 - 1);
            }
        }

        if (parseInt((f1 + 1) / 8) * 8 == parseInt(f1 / 8) * 8) {
            if (gameboard[f1 + 1] instanceof Piece && gameboard[f1 + 1].color != this.color) {
                moves.push(f1 + 1);
            }
        }

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

// Rook subclass of Piece
class Rook extends Piece {
    constructor(position, color) {
        super(ROOK, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        getSliderPerpindicularAttacks(this, attacks);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        // Up
        for (var pos = this.position - 8; pos >= 0; pos -= 8) {
            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);

                break;
            } else {
                moves.push(pos);
            }
        }

        // Down
        for (var pos = this.position + 8; pos < 64; pos += 8) {
            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Left
        for (var pos = this.position - 1; pos >= parseInt(this.position / 8) * 8; pos--) {
            if (this.position % 8 == 0)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Right
        for (var pos = this.position + 1; pos < (parseInt(this.position / 8) + 1) * 8; pos++) {
            if (this.position % 8 == 7)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

// Bishop subclass of Piece
class Bishop extends Piece {
    constructor(position, color) {
        super(BISHOP, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        getSliderDiagonalAttacks(this, attacks);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        // Up + Right
        for (var pos = this.position - 7; pos >= 0; pos -= 7) {
            if (this.position % 8 == 7)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 7)
                break;
        }

        // Down + Right
        for (var pos = this.position + 9; pos < 64; pos += 9) {
            if (this.position % 8 == 7)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 7)
                break;
        }

        // Down + Left
        for (var pos = this.position + 7; pos < 64; pos += 7) {
            if (this.position % 8 == 0)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 0)
                break;
        }

        // Up + Left
        for (var pos = this.position - 9; pos >= 0; pos -= 9) {
            if (this.position % 8 == 0)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 0)
                break;
        }

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

// Knight subclass of Piece
class Knight extends Piece {
    constructor(position, color) {
        super(KNIGHT, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        var pos;

        // Left-Down
        pos = this.position - 2 + 8;
        if (parseInt(pos / 8) == parseInt((this.position + 8) / 8)) {
            attacks.push(pos);
        }

        // Left-Up
        pos = this.position - 2 - 8;
        if (parseInt(pos / 8) == parseInt((this.position - 8) / 8)) {
            attacks.push(pos);
        }

        // Up-Left
        pos = this.position - 1 - 16;
        if (parseInt(pos / 8) == parseInt((this.position - 16) / 8)) {
            attacks.push(pos);
        }

        // Up-Right
        pos = this.position + 1 - 16;
        if (parseInt(pos / 8) == parseInt((this.position - 16) / 8)) {
            attacks.push(pos);
        }

        // Right-Up
        pos = this.position + 2 - 8;
        if (parseInt(pos / 8) == parseInt((this.position - 8) / 8)) {
            attacks.push(pos);
        }

        // Right-Down
        pos = this.position + 2 + 8;
        if (parseInt(pos / 8) == parseInt((this.position + 8) / 8)) {
            attacks.push(pos);
        }

        // Down-Right
        pos = this.position + 1 + 16;
        if (parseInt(pos / 8) == parseInt((this.position + 16) / 8)) {
            attacks.push(pos);
        }

        // Down - Left
        pos = this.position - 1 + 16;
        if (parseInt(pos / 8) == parseInt((this.position + 16) / 8)) {
            attacks.push(pos);
        }

        attacks = attacks.filter(function checkBounds(pos) {
            return pos >= 0 && pos < 64;
        })

        return attacks;
    }

    getValidMoves() {
        let moves = [];
        var pos;

        // Left-Down
        pos = this.position - 2 + 8;
        if (parseInt(pos / 8) == parseInt((this.position + 8) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Left-Up
        pos = this.position - 2 - 8;
        if (parseInt(pos / 8) == parseInt((this.position - 8) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Up-Left
        pos = this.position - 1 - 16;
        if (parseInt(pos / 8) == parseInt((this.position - 16) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Up-Right
        pos = this.position + 1 - 16;
        if (parseInt(pos / 8) == parseInt((this.position - 16) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Right-Up
        pos = this.position + 2 - 8;
        if (parseInt(pos / 8) == parseInt((this.position - 8) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Right-Down
        pos = this.position + 2 + 8;
        if (parseInt(pos / 8) == parseInt((this.position + 8) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Down-Right
        pos = this.position + 1 + 16;
        if (parseInt(pos / 8) == parseInt((this.position + 16) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        // Down - Left
        pos = this.position - 1 + 16;
        if (parseInt(pos / 8) == parseInt((this.position + 16) / 8)) {
            if (!(gameboard[pos] instanceof Piece) || gameboard[pos].color != this.color)
                moves.push(pos);
        }

        moves = moves.filter(function checkBounds(pos) {
            return pos >= 0 && pos < 64;
        })

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

// Queen subclass of Piece
class Queen extends Piece {
    constructor(position, color) {
        super(QUEEN, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        getSliderPerpindicularAttacks(this, attacks);
        getSliderDiagonalAttacks(this, attacks);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        // Up
        for (var pos = this.position - 8; pos >= 0; pos -= 8) {
            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Down
        for (var pos = this.position + 8; pos < 64; pos += 8) {
            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Left
        for (var pos = this.position - 1; pos >= parseInt(this.position / 8) * 8; pos--) {
            if (this.position % 8 == 0)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Right
        for (var pos = this.position + 1; pos < (parseInt(this.position / 8) + 1) * 8; pos++) {
            if (this.position % 8 == 7)
                break;
            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Up + Right
        for (var pos = this.position - 7; pos >= 0; pos -= 7) {
            if (this.position % 8 == 7)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 7)
                break;
        }

        // Down + Right
        for (var pos = this.position + 9; pos < 64; pos += 9) {
            if (this.position % 8 == 7)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 7)
                break;
        }

        // Down + Left
        for (var pos = this.position + 7; pos < 64; pos += 7) {
            if (this.position % 8 == 0)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 0)
                break;
        }

        // Up + Left
        for (var pos = this.position - 9; pos >= 0; pos -= 9) {
            if (this.position % 8 == 0)
                break;

            if (gameboard[pos] instanceof Piece) {
                if (gameboard[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (gameboard[pos] instanceof Piece || pos % 8 == 0)
                break;
        }

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

// King subclass of Piece
class King extends Piece {
    constructor(position, color) {
        super(KING, position, color);

        if (color == 'white') {
            WHITE_KING = this;
        } else {
            BLACK_KING = this;
        }

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        var pos = this.position;
        var left = parseInt(pos / 8) * 8;
        var right = left + 7;

        // Left
        if (pos - 1 >= left) {
            attacks.push(pos - 1);

            // Right
            if (this.canMoveTo(pos + 1) && pos + 1 <= right)
                attacks.push(pos + 1);

            // Up
            if (this.canMoveTo(pos - 8) && pos - 8 >= 0)
                attacks.push(pos - 8);

            // Down
            if (this.canMoveTo(pos + 8) && pos + 8 < 64)
                attacks.push(pos + 8);

            // Up Left
            if (this.canMoveTo(pos - 9) && pos - 9 >= (left - 8) && pos - 9 >= 0)
                attacks.push(pos - 9);

            // Up Right
            if (this.canMoveTo(pos - 7) && pos - 7 < left && pos - 7 >= 0)
                attacks.push(pos - 7);

            // Down Left
            if (this.canMoveTo(pos + 7) && pos + 7 > right && pos + 7 < 64)
                attacks.push(pos + 7);

            // Down Right
            if (this.canMoveTo(pos + 9) && pos + 9 <= (right + 8) && pos + 9 < 64)
                attacks.push(pos + 9);

            return attacks;
        }
    }

    getValidMoves() {
        let moves = [];

        var pos = this.position;
        var left = parseInt(pos / 8) * 8;
        var right = left + 7;

        // Left
        if (this.canMoveTo(pos - 1) && pos - 1 >= left)
            moves.push(pos - 1);

        // Right
        if (this.canMoveTo(pos + 1) && pos + 1 <= right)
            moves.push(pos + 1);

        // Up
        if (this.canMoveTo(pos - 8) && pos - 8 >= 0)
            moves.push(pos - 8);

        // Down
        if (this.canMoveTo(pos + 8) && pos + 8 < 64)
            moves.push(pos + 8);

        // Up Left
        if (this.canMoveTo(pos - 9) && pos - 9 >= (left - 8) && pos - 9 >= 0)
            moves.push(pos - 9);

        // Up Right
        if (this.canMoveTo(pos - 7) && pos - 7 < left && pos - 7 >= 0)
            moves.push(pos - 7);

        // Down Left
        if (this.canMoveTo(pos + 7) && pos + 7 > right && pos + 7 < 64)
            moves.push(pos + 7);

        // Down Right
        if (this.canMoveTo(pos + 9) && pos + 9 <= (right + 8) && pos + 9 < 64)
            moves.push(pos + 9);

        removeAttackedSquares(this, moves);

        return moves;
    }
}

// Finds the correct piece object on the board using the wrapper div
function getPieceFromWrapper(wrapper) {
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece) {

            if (gameboard[i].wrapper.isEqualNode(wrapper))
                return gameboard[i];
        }
    }
}

// Get a map of all squares white can attack
function generateWhiteAttackMap() {
    var attackedSquares = [64];
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece && gameboard[i].color == 'white') {
            var attacks = gameboard[i].getAttacks();

            if (attacks == null) {
                continue;
            }

            for (var j = 0; j < attacks.length; j++) {
                attackedSquares[attacks[j]] = 1;
            }
        }
    }

    return attackedSquares;
}

// Get a map of all squares black can attack
function generateBlackAttackMap() {
    var attackedSquares = [64];
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece && gameboard[i].color == 'black') {
            var attacks = gameboard[i].getAttacks();
            if (attacks == null) {
                continue;
            }
            for (var j = 0; j < attacks.length; j++) {
                attackedSquares[attacks[j]] = 1;
            }
        }
    }

    return attackedSquares;
}

// Return slider attacks going up, down, left, and right
function getSliderPerpindicularAttacks(piece, attacks) {
    // Up
    for (var pos = piece.position - 8; pos >= 0; pos -= 8) {
        if (gameboard[pos] instanceof Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }

    // Down
    for (var pos = piece.position + 8; pos < 64; pos += 8) {
        if (gameboard[pos] instanceof Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }

    // Left
    for (var pos = piece.position - 1; pos >= parseInt(piece.position / 8) * 8; pos--) {
        if (gameboard[pos] instanceof Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }

    // Right
    for (var pos = piece.position + 1; pos < parseInt(piece.position / 8) * 8 + 8; pos++) {
        if (gameboard[pos] instanceof Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }
}

// Get slider attacks going diagonally
function getSliderDiagonalAttacks(piece, attacks) {
    // Up + Right
    for (var pos = piece.position - 7; pos >= 0; pos -= 7) {

        if (piece.position % 8 == 7)
            break;

        attacks.push(pos);

        if (gameboard[pos] instanceof Piece) {
            // Ignore king for sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        }

        if (pos % 8 == 7)
            break;
    }

    // Up + Left
    for (var pos = piece.position - 9; pos >= 0; pos -= 9) {

        if (piece.position % 8 == 0)
            break;

        attacks.push(pos);

        if (gameboard[pos] instanceof Piece) {
            // Ignore king for sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        }

        if (pos % 8 == 0)
            break;
    }

    // Down + Right
    for (var pos = piece.position + 9; pos >= 0; pos += 9) {

        if (piece.position % 8 == 7)
            break;

        attacks.push(pos);

        if (gameboard[pos] instanceof Piece) {
            // Ignore king for sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        }

        if (pos % 8 == 7)
            break;
    }

    // Down + Left
    for (var pos = piece.position + 7; pos >= 0; pos += 7) {

        if (piece.position % 8 == 0)
            break;

        attacks.push(pos);

        if (gameboard[pos] instanceof Piece) {
            // Ignore king for sliders
            if (!(gameboard[pos] instanceof King && gameboard[pos].color != piece.color))
                break;
        }

        if (pos % 8 == 0)
            break;
    }
}

// Remove any squares that are under atack
function removeAttackedSquares(piece, moves) {
    if (piece.color == 'white') {
        for (var i = 0; i < moves.length; i++) {
            if (ATTACK_BLACK[moves[i]] == 1) {
                moves.splice(i, 1);
                i--;
            }
        }
    } else {
        for (var i = 0; i < moves.length; i++) {
            if (ATTACK_WHITE[moves[i]] == 1) {
                moves.splice(i, 1);
                i--;
            }
        }
    }
}

// Displays the white attacks from dev panel
function showWhiteAttacks() {
    for (var i = 0; i < 64; i++) {
        if (ATTACK_WHITE[i] == 1) {
            cells[i].div.style.backgroundColor = 'red';
        } else {
            cells[i].dehighlight();
        }
    }
}

// Displays the black attacks from dev panel
function showBlackAttacks() {
    for (var i = 0; i < 64; i++) {
        if (ATTACK_BLACK[i] == 1) {
            cells[i].div.style.backgroundColor = 'red';
        } else {
            cells[i].dehighlight();
        }
    }
}

// Filter out moves when checked by at least one piece
function checkedByOneFilter(piece, moves) {
    let attackerPos = -1;

    if (piece.color == 'white' || true) {
        for (var i = 0; i < 64; i++) {
            var attacker = gameboard[i];
            if (attacker instanceof Piece && attacker.color != piece.color) {
                var attackerMoves = attacker.getValidMoves();
                for (var j = 0; j < attackerMoves.length; j++) {
                    if (piece.color == 'white') {
                        if (attackerMoves[j] == WHITE_KING.position) {
                            attackerPos = i;
                            break;
                        }
                    } else {
                        if (attackerMoves[j] == BLACK_KING.position) {
                            attackerPos = i;
                            break;

                        }
                    }
                }
            }
        }

        var validMoves = generatePushMap(piece, gameboard[attackerPos], moves);

        if (moves.includes(attackerPos)) {
            validMoves.push(attackerPos);
            return validMoves;
        } else {
            return validMoves;
        }
    }
}

// Get a map of where the piece can move to protect the king
function generatePushMap(defender, attacker, moves) {

    pushMoves = [];
    if (attacker instanceof Rook || attacker instanceof Queen || attacker instanceof Bishop) {
        let kingPos = (defender.color == 'white') ? WHITE_KING.position : BLACK_KING.position;
        let attPos = attacker.position;

        // If attPos is in the same column, ray is vertical
        if (attPos % 8 == kingPos % 8) {
            // If attPos < kingPos then ray needs to go up
            if (attPos < kingPos) {
                for (var pos = kingPos - 8; attPos <= pos; pos -= 8) {
                    pushMoves.push(pos);
                }
            }
            // Else the ray needs to go Down
            else {
                for (var pos = kingPos + 8; attPos >= pos; pos += 8) {
                    pushMoves.push(pos);
                }
            }
        }
        // If attPos in same row, ray is horizontal
        else if (parseInt(attPos / 8) == parseInt(kingPos / 8)) {
            // If attPos < kingPos, the ray needs to go left
            if (attPos < kingPos) {
                for (var pos = kingPos - 1; attPos <= pos; pos--) {
                    pushMoves.push(pos);
                }
            }
            // Else the ray needs to go right
            else {
                for (var pos = kingPos + 1; attPos >= pos; pos++) {
                    pushMoves.push(pos);
                }
            }
        }
        // Else the ray is diagonal
        else {
            // If attPos % 8 < kingPos % 8, then ray goes to the left
            if (attPos % 8 < kingPos % 8) {
                // If int(attPos / 8) < int(kingPos / 8) then ray goes up-left
                if (parseInt(attPos / 8) < parseInt(kingPos / 8)) {
                    for (var pos = kingPos - 9; attPos <= pos; pos -= 9) {
                        pushMoves.push(pos);
                    }
                }
                // Else the ray goes down-left
                else {
                    for (var pos = kingPos + 7; attPos >= pos; pos += 7) {
                        pushMoves.push(pos);
                    }
                }
            }
            // Else the ray goes to the right
            else {
                // If int(attPos / 8) < int(kingPos / 8) then ray goes up-right
                if (parseInt(attPos / 8) < parseInt(kingPos / 8)) {
                    for (var pos = kingPos - 7; attPos <= pos; pos -= 7) {
                        pushMoves.push(pos);
                    }
                }
                // Else the ray goes down-right
                else {
                    for (var pos = kingPos + 9; attPos >= pos; pos += 9) {
                        pushMoves.push(pos);
                    }
                }
            }
        }
    }

    var validMoves = [];

    for (var i = 0; i < pushMoves.length; i++) {
        if (moves.includes(pushMoves[i])) {
            validMoves.push(pushMoves[i]);
        }
    }

    return validMoves;
}
