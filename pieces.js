let ATTACK_WHITE = [];
let ATTACK_BLACK = [];
let CAPTURE_WHITE = [];
let CAPTURE_BLACK = [];
let PUSH_WHITE = [];
let PUSH_BLACK = [];

ATTACK_WHITE.fill(1);
ATTACK_BLACK.fill(1);
CAPTURE_WHITE.fill(1);
CAPTURE_BLACK.fill(1);
PUSH_WHITE.fill(1);
PUSH_BLACK.fill(1);

let WHITE_KING;
let BLACK_KING;

class Piece {
    constructor(symbol, position, color) {
        this.symbol = symbol;

        // Set position on gameboard
        this.position = position;
        gameboard[position] = this;

        this.color = color;

        this.wrapper = document.createElement('div');
        this.text = document.createTextNode(this.symbol);
    }

    create() {
        this.wrapper.style.color = this.color;
        this.wrapper.style.position = 'absolute';

        this.wrapper.appendChild(this.text);
        cells[this.position].div.appendChild(this.wrapper);
        this.updatePosition(this.position);

        this.enableDragging();

        this.hasMoved = false;
    }

    canMoveTo(position) {
        return (gameboard[position] instanceof Piece && gameboard[position].color != this.color) || !(gameboard[position] instanceof Piece);
    }

    /* Tries to update the position of the piece. If a position
       is given, it will treat it as being 'placed' instead of
       moved by a player */
    updatePosition(position) {
        if (position != null) {
            // Force the piece to move to the new position
            gameboard[this.position] = null;
            this.position = position;
        } else {
            // Get X position from pos on screen
            var newX = this.getLeft() - MARGIN;
            newX = Math.floor(newX / CELL_SIZE);

            // Get Y position from pos on screen
            var newY = this.getTop() - MARGIN;
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

        // Now the piece has moved
        this.hasMoved = true;

        // Position this within the cell
        var posX = this.position % 8;
        var posY = Math.floor(this.position / 8);

        // Center within cell
        var left = MARGIN + (posX * CELL_SIZE) + 20;
        this.wrapper.style.left = left + 'px';

        var top = MARGIN + (posY * CELL_SIZE);
        this.wrapper.style.top = top + 'px';
    }

    kill() {
        this.wrapper.style.visibility = 'hidden';
    }

    getLeft() {
        return parseInt((this.wrapper.style.left).slice(0, -2)) + (this.wrapper.clientWidth / 2);
    }

    getTop() {
        return parseInt((this.wrapper.style.top).slice(0, -2)) + (this.wrapper.clientHeight / 2);
    }

    enableDragging() {
        var delX, delY, posX, posY;

        var piece = this;
        var wrapper = this.wrapper;
        var hoverCell;

        wrapper.onmousedown = startDragging;

        function startDragging(e) {
            // Get initial Position
            posX = e.clientX;
            posY = e.clientY;

            // Set mouse listener methods
            document.onmousemove = drag;
            document.onmouseup = stopDragging;

            piece.highlightValidMoves();
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
            piece.dehighlightValidMoves();

            // Deselect hoverCell
            hoverCell.deselect();

            // Try to move piece to its current location
            piece.updatePosition();

            // Stop using onmousemove()
            this.onmousemove = null;

            ATTACK_BLACK = generateBlackAttackMap();
            ATTACK_WHITE = generateWhiteAttackMap();

            isCheck();
        }
    }

    highlightValidMoves() {
        var moves = this.getValidMoves();
        for (var i = 0; i < moves.length; i++) {
            cells[moves[i]].highlight();
        }
    }

    dehighlightValidMoves() {
        var moves = this.getValidMoves();
        for (var i = 0; i < moves.length; i++) {
            cells[moves[i]].dehighlight();
        }
    }

    getAttacks() {
        return [];
    }

    getValidMoves() {
        return [];
    }
}

class Pawn extends Piece {
    constructor(position, color) {
        super(PAWN, position, color);

        this.hasMoved = false;
    }

    getAttacks() {
        let attacks = [];

        let forward = (this.color == 'white') ? this.position - 8 : this.position + 8;

        if (parseInt((forward - 1) / 8) == parseInt(forward / 8))
            attacks.push(forward - 1);

        if (parseInt((forward + 1) / 8) == parseInt(forward / 8))
            attacks.push(forward + 1);

        return attacks;
    }

    getValidMoves() {
        let moves = [];

        let forward = (this.color == 'white') ? -8 : +8;

        // Move forward one
        if (!(gameboard[this.position + forward] instanceof Piece))
            moves.push(this.position + forward);
        else
            return moves;

        // Move forward 2 if not yet moved
        if (!this.hasMoved && !(gameboard[this.position + forward * 2] instanceof Piece))
            moves.push(this.position + forward * 2);

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

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

        if (inCheck == this.color) {
            moves = checkedByOneFilter(this, moves);
        }

        return moves;
    }
}

function generateWhiteAttackMap() {
    var attackedSquares = [64];
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece && gameboard[i].color == 'white') {
            var attacks = gameboard[i].getAttacks();
            for (var j = 0; j < attacks.length; j++) {
                attackedSquares[attacks[j]] = 1;
            }
        }
    }

    return attackedSquares;
}

function generateBlackAttackMap() {
    var attackedSquares = [64];
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece && gameboard[i].color == 'black') {
            var attacks = gameboard[i].getAttacks();
            for (var j = 0; j < attacks.length; j++) {
                attackedSquares[attacks[j]] = 1;
            }
        }
    }

    return attackedSquares;
}

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

function removeAttackedSquares(piece, moves) {
    if (piece.color = 'white') {
        for (var i = 0; i < moves.length; i++) {
            if (ATTACK_BLACK[moves[i]] == 1) {
                moves.splice(i, 1);
                i--;
            }
        }
    } else {
        if (ATTACK_WHITE[moves[i]] == 1) {
            moves.splice(i, 1);
            i--;
        }
    }
}

function showWhiteAttacks() {
    for (var i = 0; i < 64; i++) {
        if (ATTACK_WHITE[i] == 1) {
            cells[i].div.style.backgroundColor = 'red';
        } else {
            cells[i].dehighlight();
        }
    }
}

function showBlackAttacks() {
    for (var i = 0; i < 64; i++) {
        if (ATTACK_BLACK[i] == 1) {
            cells[i].div.style.backgroundColor = 'red';
        } else {
            cells[i].dehighlight();
        }
    }
}

function checkedByOneFilter(piece, moves) {
    let attackerPos = -1;

    if (piece.color == 'white') {
        for (var i = 0; i < 64; i++) {
            var attacker = gameboard[i];
            if (attacker instanceof Piece && attacker.color == 'black') {
                var attackerMoves = attacker.getValidMoves();
                for (var j = 0; j < attackerMoves.length; j++) {
                    if (attackerMoves[j] == WHITE_KING.position) {
                        attackerPos = i;
                        break;
                    }
                }
            }
        }

        var validMoves = generatePushMap(piece, gameboard[attackerPos], moves);

        //var validMoves = [];
        if (moves.includes(attackerPos)) {
            validMoves.push(attackerPos);
            return validMoves;
        } else {
            return validMoves;
        }
    } else {
        for (var i = 0; i < 64; i++) {
            var attacker = gameboard[i];
            if (attacker.color == 'black') {
                var attackerMoves = attacker.getValidMoves();
                for (var j = 0; j < attackerMoves.length; j++) {
                    if (attackerMoves[j] == BLACK_KING.position) {
                        attackerPos = i;
                        break;
                    }
                }
            }
        }

        if (moves.includes(attackerPos)) {
            moves = [attackerPos];
        } else {
            moves = [];
        }
    }
}

function generatePushMap(defender, attacker, moves) {

    pushMoves = [];

    if (attacker instanceof Rook || attacker instanceof Queen) {
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
                    for (var pos=kingPos-9; attPos<=pos; pos-=9) {
                        pushMoves.push(pos);
                    }
                }
                // Else the ray goes down-left
                else {
                    for (var pos=kingPos+7; attPos>=pos; pos+=7) {
                        pushMoves.push(pos);
                    }
                }
            }
            // Else the ray goes to the right
            else {
                // If int(attPos / 8) < int(kingPos / 8) then ray goes up-right
                if (parseInt(attPos / 8) < parseInt(kingPos / 8)) {
                    for (var pos=kingPos-7; attPos<=pos; pos-=7) {
                        pushMoves.push(pos);
                    }
                }
                // Else the ray goes down-right
                else {
                    for (var pos=kingPos+9; attPos>=pos; pos+=9) {
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
