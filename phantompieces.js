let PHANTOM_ATTACK_WHITE = [];
let PHANTOM_ATTACK_BLACK = [];

PHANTOM_ATTACK_WHITE.fill(1);
PHANTOM_ATTACK_BLACK.fill(1);

let PHANTOM_WHITE_KING;
let PHANTOM_BLACK_KING;

let phantom_id = 0;

// Container class for Phantom_Piece elements
class Phantom_Piece {
    constructor(phantom_board, position, color) {

        this.id = id;
        id++;

        this.phantom_board = phantom_board;

        // Set position on this.phantom_board
        this.position = position;
        phantom_board[position] = this;

        this.color = color;

        this.active = false;
        this.alive = true;

    }

    // Checks if a square is empty or has an enemy Phantom_Piece
    canMoveTo(position) {
        return (this.phantom_board[position] instanceof Phantom_Piece && this.phantom_board[position].color != this.color) || !(this.phantom_board[position] instanceof Phantom_Piece);
    }

    /* Tries to update the position of the Phantom_Piece. If a position
       is given, it will treat it as being 'placed' instead of
       moved by a player */
    updatePosition(position) {
        var oldPosition = this.position;
        // Force the Phantom_Piece to move to the new position
        this.phantom_board[this.position] = null;
        this.position = position;
            
        // If applicable, kill opposing Phantom_Piece
        if (this.phantom_board[position] instanceof Phantom_Piece)
            this.phantom_board[position].kill();
        
        // Place Phantom_Piece in proper position in this.phantom_board array
        this.phantom_board[this.position] = this;

        return this.position != oldPosition;
    }

    // Kills the Phantom_Piece, making it no longer counted in move generation
    kill() {
        this.alive = false;
    }

    // Gets all squares that are attacked by this Phantom_Piece
    getAttacks() {
        return [];
    }

    // Gets all valid moves for this Phantom_Piece
    getValidMoves() {
        return [];
    }
}

// Pawn subclass of Phantom_Piece
class Phantom_Pawn extends Phantom_Piece {
    constructor(phantom_board, position, color) {
        super(phantom_board, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        let forward = (this.color == 'white') ? this.position - 8 : this.position + 8;

        // Attack left
        if (parseInt((forward - 1) / 8) == parseInt(forward / 8)) {
            if (forward - 1 >= 0 && forward - 1 < 64) {
                attacks.push(forward - 1);
            }
        }


        // Attack Right
        if (parseInt((forward + 1) / 8) == parseInt(forward / 8)) {
            if (forward - 1 >= 0 && forward - 1 < 64) {
                attacks.push(forward + 1);
            }
        }

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        let forward = (this.color == 'white') ? -8 : +8;

        // Move forward one
        if (!(this.phantom_board[this.position + forward] instanceof Phantom_Piece)) {
            if (this.position + forward >= 0 && this.position + forward < 64) {
                moves.push(this.position + forward);

                // Move forward 2 if not yet moved
                if (!this.hasMoved && !(this.phantom_board[this.position + forward * 2] instanceof Phantom_Piece)) {
                    if (this.position + forward * 2 >= 0 && this.position + forward * 2 < 64) {
                        moves.push(this.position + forward * 2);
                    }
                }
            }
        }

        // Diagonal Attacks
        let f1 = this.position + forward;

        if (parseInt((f1 - 1) / 8) * 8 == parseInt(f1 / 8) * 8) {
            if (this.phantom_board[f1 - 1] instanceof Phantom_Piece && this.phantom_board[f1 - 1].color != this.color) {
                if (f1 - 1 >= 0 && f1 - 1 < 64) {
                    moves.push(f1 - 1);
                }
            }
        }

        if (parseInt((f1 + 1) / 8) * 8 == parseInt(f1 / 8) * 8) {
            if (this.phantom_board[f1 + 1] instanceof Phantom_Piece && this.phantom_board[f1 + 1].color != this.color) {
                if (f1 + 1 >= 0 && f1 + 1 < 64) {
                    moves.push(f1 + 1);
                }
            }
        }

        if (phantomInCheck == this.color) {
            moves = checkedPhantomByOneFilter(this, moves);
        }

        pinnedPhantomFilter(this, moves);

        return moves;
    }
}

// Rook subclass of Phantom_Piece
class Phantom_Rook extends Phantom_Piece {
    constructor(phantom_board, position, color) {
        super(phantom_board, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        getPhantomSliderPerpindicularAttacks(this, attacks);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        // Up
        for (var pos = this.position - 8; pos >= 0; pos -= 8) {
            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);

                break;
            } else {
                moves.push(pos);
            }
        }

        // Down
        for (var pos = this.position + 8; pos < 64; pos += 8) {
            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
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

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
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

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        if (phantomInCheck == this.color) {
            moves = checkedPhantomByOneFilter(this, moves);
        }

        pinnedPhantomFilter(this, moves);

        return moves;
    }
}

// Bishop subclass of Phantom_Piece
class Phantom_Bishop extends Phantom_Piece {
    constructor(phantom_board, position, color) {
        super(phantom_board, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        getPhantomSliderDiagonalAttacks(this, attacks);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        // Up + Right
        for (var pos = this.position - 7; pos >= 0; pos -= 7) {
            if (this.position % 8 == 7)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 7)
                break;
        }

        // Down + Right
        for (var pos = this.position + 9; pos < 64; pos += 9) {
            if (this.position % 8 == 7)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 7)
                break;
        }

        // Down + Left
        for (var pos = this.position + 7; pos < 64; pos += 7) {
            if (this.position % 8 == 0)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 0)
                break;
        }

        // Up + Left
        for (var pos = this.position - 9; pos >= 0; pos -= 9) {
            if (this.position % 8 == 0)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 0)
                break;
        }

        if (phantomInCheck == this.color) {
            moves = checkedPhantomByOneFilter(this, moves);
        }

        pinnedPhantomFilter(this, moves);

        return moves;
    }
}

// Knight subclass of Phantom_Piece
class Phantom_Knight extends Phantom_Piece {
    constructor(phantom_board, position, color) {
        super(phantom_board, position, color);

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
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Left-Up
        pos = this.position - 2 - 8;
        if (parseInt(pos / 8) == parseInt((this.position - 8) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Up-Left
        pos = this.position - 1 - 16;
        if (parseInt(pos / 8) == parseInt((this.position - 16) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Up-Right
        pos = this.position + 1 - 16;
        if (parseInt(pos / 8) == parseInt((this.position - 16) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Right-Up
        pos = this.position + 2 - 8;
        if (parseInt(pos / 8) == parseInt((this.position - 8) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Right-Down
        pos = this.position + 2 + 8;
        if (parseInt(pos / 8) == parseInt((this.position + 8) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Down-Right
        pos = this.position + 1 + 16;
        if (parseInt(pos / 8) == parseInt((this.position + 16) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        // Down - Left
        pos = this.position - 1 + 16;
        if (parseInt(pos / 8) == parseInt((this.position + 16) / 8)) {
            if (!(this.phantom_board[pos] instanceof Phantom_Piece) || this.phantom_board[pos].color != this.color)
                moves.push(pos);
        }

        moves = moves.filter(function checkBounds(pos) {
            return pos >= 0 && pos < 64;
        })

        if (phantomInCheck == this.color) {
            moves = checkedPhantomByOneFilter(this, moves);
        }

        return moves;
    }
}

// Queen subclass of Phantom_Piece
class Phantom_Queen extends Phantom_Piece {
    constructor(phantom_board, position, color) {
        super(phantom_board, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        getPhantomSliderPerpindicularAttacks(this, attacks);
        getPhantomSliderDiagonalAttacks(this, attacks);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        // Up
        for (var pos = this.position - 8; pos >= 0; pos -= 8) {
            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }
        }

        // Down
        for (var pos = this.position + 8; pos < 64; pos += 8) {
            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
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

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
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
            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
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

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 7)
                break;
        }

        // Down + Right
        for (var pos = this.position + 9; pos < 64; pos += 9) {
            if (this.position % 8 == 7)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 7)
                break;
        }

        // Down + Left
        for (var pos = this.position + 7; pos < 64; pos += 7) {
            if (this.position % 8 == 0)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 0)
                break;
        }

        // Up + Left
        for (var pos = this.position - 9; pos >= 0; pos -= 9) {
            if (this.position % 8 == 0)
                break;

            if (this.phantom_board[pos] instanceof Phantom_Piece) {
                if (this.phantom_board[pos].color != this.color)
                    moves.push(pos);
                break;
            } else {
                moves.push(pos);
            }

            if (this.phantom_board[pos] instanceof Phantom_Piece || pos % 8 == 0)
                break;
        }

        if (phantomInCheck == this.color) {
            moves = checkedPhantomByOneFilter(this, moves);
        }

        pinnedPhantomFilter(this, moves);

        return moves;
    }
}

// King subclass of Phantom_Piece
class Phantom_King extends Phantom_Piece {
    constructor(phantom_board, position, color) {
        super(phantom_board, position, color);

        if (color == 'white') {
            PHANTOM_WHITE_KING = this;
        } else {
            PHANTOM_BLACK_KING = this;
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

        removePhantomAttackedSquares(this, moves);

        return moves;
    }
}

// Get a map of all squares white can attack
function generatePhantomWhiteAttackMap(phantom_board) {
    var attackedSquares = [64];
    for (var i = 0; i < 64; i++) {
        if (phantom_board[i] instanceof Phantom_Piece && phantom_board[i].color == 'white') {
            var attacks = phantom_board[i].getAttacks();

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
function generatePhantomBlackAttackMap(phantom_board) {
    var attackedSquares = [64];
    for (var i = 0; i < 64; i++) {
        if (phantom_board[i] instanceof Phantom_Piece && phantom_board[i].color == 'black') {
            var attacks = phantom_board[i].getAttacks();
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
function getPhantomSliderPerpindicularAttacks(phantom_piece, attacks) {
    // Up
    phantom_board = phantom_piece.phantom_board;
    for (var pos = phantom_piece.position - 8; pos >= 0; pos -= 8) {
        if (phantom_board[pos] instanceof Phantom_Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }

    // Down
    for (var pos = phantom_piece.position + 8; pos < 64; pos += 8) {
        if (phantom_board[pos] instanceof Phantom_Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }

    // Left
    for (var pos = phantom_piece.position - 1; pos >= parseInt(phantom_piece.position / 8) * 8; pos--) {
        if (phantom_board[pos] instanceof Phantom_Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }

    // Right
    for (var pos = phantom_piece.position + 1; pos < parseInt(phantom_piece.position / 8) * 8 + 8; pos++) {
        if (phantom_board[pos] instanceof Phantom_Piece) {
            attacks.push(pos);

            // Ignore the king on sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        } else {
            attacks.push(pos);
        }
    }
}

// Get slider attacks going diagonally
function getPhantomSliderDiagonalAttacks(phantom_piece, attacks) {
    phantom_board = phantom_piece.phantom_board;

    // Up + Right
    for (var pos = phantom_piece.position - 7; pos >= 0; pos -= 7) {

        if (phantom_piece.position % 8 == 7)
            break;

        attacks.push(pos);

        if (phantom_board[pos] instanceof Phantom_Piece) {
            // Ignore king for sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        }

        if (pos % 8 == 7)
            break;
    }

    // Up + Left
    for (var pos = phantom_piece.position - 9; pos >= 0; pos -= 9) {

        if (phantom_piece.position % 8 == 0)
            break;

        attacks.push(pos);

        if (phantom_board[pos] instanceof Phantom_Piece) {
            // Ignore king for sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        }

        if (pos % 8 == 0)
            break;
    }

    // Down + Right
    for (var pos = phantom_piece.position + 9; pos >= 0; pos += 9) {

        if (phantom_piece.position % 8 == 7)
            break;

        attacks.push(pos);

        if (phantom_board[pos] instanceof Phantom_Piece) {
            // Ignore king for sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        }

        if (pos % 8 == 7)
            break;
    }

    // Down + Left
    for (var pos = phantom_piece.position + 7; pos >= 0; pos += 7) {

        if (phantom_piece.position % 8 == 0)
            break;

        attacks.push(pos);

        if (phantom_board[pos] instanceof Phantom_Piece) {
            // Ignore king for sliders
            if (!(phantom_board[pos] instanceof Phantom_King && phantom_board[pos].color != phantom_piece.color))
                break;
        }

        if (pos % 8 == 0)
            break;
    }
}

// Remove any squares that are under atack
function removePhantomAttackedSquares(phantom_piece, moves) {
    if (phantom_piece.color == 'white') {
        for (var i = 0; i < moves.length; i++) {
            if (PHANTOM_ATTACK_BLACK[moves[i]] == 1) {
                moves.splice(i, 1);
                i--;
            }
        }
    } else {
        for (var i = 0; i < moves.length; i++) {
            if (PHANTOM_ATTACK_WHITE[moves[i]] == 1) {
                moves.splice(i, 1);
                i--;
            }
        }
    }
}

// Filter out moves when checked by at least one Phantom_Piece
function checkedPhantomByOneFilter(phantom_piece, moves) {
    phantom_board = phantom_piece.phantom_board;
    let attackerPos = -1;

    if (phantom_piece.color == 'white' || true) {
        for (var i = 0; i < 64; i++) {
            var attacker = phantom_board[i];
            if (attacker instanceof Phantom_Piece && attacker.color != phantom_piece.color) {
                var attackerMoves = attacker.getValidMoves();
                for (var j = 0; j < attackerMoves.length; j++) {
                    if (phantom_piece.color == 'white') {
                        if (attackerMoves[j] == PHANTOM_WHITE_KING.position) {
                            attackerPos = i;
                            break;
                        }
                    } else {
                        if (attackerMoves[j] == PHANTOM_BLACK_KING.position) {
                            attackerPos = i;
                            break;

                        }
                    }
                }
            }
        }

        var validMoves = generatePhantomPushMap(phantom_piece, phantom_board[attackerPos], moves);

        if (moves.includes(attackerPos)) {
            validMoves.push(attackerPos);
            return validMoves;
        } else {
            return validMoves;
        }
    }
}

// Get a map of where the Phantom_Piece can move to protect the king
function generatePhantomPushMap(defender, attacker, moves) {

    pushMoves = [];
    if (attacker instanceof Phantom_Rook || attacker instanceof Phantom_Queen || attacker instanceof Phantom_Bishop) {
        let kingPos = (defender.color == 'white') ? PHANTOM_WHITE_KING.position : PHANTOM_BLACK_KING.position;
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

function pinnedPhantomFilter(phantom_piece, moves) {
    phantom_board = phantom_piece.phantom_board;
    var opponentPieces = [];
    for (var i = 0; i < phantom_board.length; i++) {
        if (phantom_board[i] instanceof Phantom_Piece && phantom_board[i].color != phantom_piece.color) {
            opponentPieces.push(phantom_board[i]);
        }
    }

    // Check Perpindicular Pins
    if (phantom_piece instanceof Phantom_Rook || phantom_piece instanceof Phantom_Queen || phantom_piece instanceof Phantom_Pawn) {
        for (let i = 0; i < opponentPieces.length; i++) {
            let opponentPiece = opponentPieces[i];

            if (opponentPiece instanceof Phantom_Rook || opponentPiece instanceof Phantom_Queen) {
                let opponentMoves = [];
                getPhantomSliderPerpindicularAttacks(opponentPiece, opponentMoves);

                let kingMoves = [];

                let king = (phantom_piece.color == 'white') ? PHANTOM_WHITE_KING : PHANTOM_BLACK_KING;
                getPhantomSliderPerpindicularAttacks(king, kingMoves);

                if (opponentMoves.includes(phantom_piece.position) && kingMoves.includes(phantom_piece.position)) {
                    let pinnedRay = [];

                    // If pinned ray is horizontal
                    if (parseInt(king.position / 8) == parseInt(opponentPiece.position / 8)) {
                        let left;
                        let right;

                        if (king.position < opponentPiece.position) {
                            left = king.position + 1;
                            right = opponentPiece.position;
                        } else {
                            left = opponentPiece.position;
                            right = king.position - 1;
                        }

                        for (let j = left; j <= right; j++) {
                            pinnedRay.push(j);
                        }
                    }
                    // If pinned ray is vertical
                    else {
                        let top;
                        let bottom;

                        if (king.position < opponentPiece.position) {
                            top = king.position + 8;
                            bottom = opponentPiece.position;
                        } else {
                            top = opponentPiece.position;
                            bottom = king.position - 8;
                        }

                        for (let j = top; j <= bottom; j += 8) {
                            pinnedRay.push(j);
                        }
                    }

                    for (let j = 0; j < moves.length;) {
                        if (!pinnedRay.includes(moves[j])) {
                            moves.splice(j, 1);
                        } else {
                            j++;
                        }
                    }
                }
            }
        }
    }

    // Check diagonal pins
    if (phantom_piece instanceof Phantom_Bishop || phantom_piece instanceof Phantom_Queen || phantom_piece instanceof Phantom_Pawn) {
        for (let i = 0; i < opponentPieces.length; i++) {
            let opponentPiece = opponentPieces[i];

            if (opponentPiece instanceof Phantom_Bishop || opponentPiece instanceof Phantom_Queen) {
                let opponentMoves = [];
                getPhantomSliderDiagonalAttacks(opponentPiece, opponentMoves);

                let kingMoves = [];

                let king = (phantom_piece.color == 'white') ? PHANTOM_WHITE_KING : PHANTOM_BLACK_KING;
                getPhantomSliderDiagonalAttacks(king, kingMoves);

                if (opponentMoves.includes(phantom_piece.position) && kingMoves.includes(phantom_piece.position)) {
                    let pinnedRay = [];

                    // If ray goes left from king
                    if (king.position % 8 > opponentPiece.position % 8) {
                        // If ray goes up left from king
                        if (king.position > opponentPiece.position) {
                            for (let j = king.position; j >= opponentPiece.position; j -= 9) {
                                pinnedRay.push(j);
                            }
                        }
                        // If ray goes down left from king
                        else {
                            for (let j = king.position; j <= opponentPiece.position; j += 7) {
                                pinnedRay.push(j);
                            }
                        }
                    }
                    // If ray goes right from king
                    else {
                        // If ray goes up right from king
                        if (king.position > opponentPiece.position) {
                            for (let j = king.position; j >= opponentPiece.position; j -= 7) {
                                pinnedRay.push(j);
                            }
                        }
                        // If ray goes down right from king
                        else {
                            for (let j = king.position; j <= opponentPiece.position; j += 9) {
                                pinnedRay.push(j);
                            }
                        }
                    }

                    for (let j = 0; j < moves.length;) {
                        if (!pinnedRay.includes(moves[j])) {
                            moves.splice(j, 1);
                        } else {
                            j++;
                        }
                    }
                }
            }
        }
    }
}
