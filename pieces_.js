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
    }

    canMoveTo(position) {
        return (gameboard[position] instanceof Piece && gameboard[position].color != this.color) || !(gameboard[position] instanceof Piece);
    }

    tryUpdatePosition() {
        // Get X position
        var newX = this.getLeft() - MARGIN;
        newX = Math.floor(newX / CELL_SIZE);

        // Get Y position
        var newY = this.getTop() - MARGIN;
        newY = Math.floor(newY / CELL_SIZE);

        var newPos = newX + (newY * 8);

        // Check valid move
        if (!(this.getValidMoves().includes(newPos))) {
            this.updatePosition(this.position);
            return;
        }

        // Remove from current position
        gameboard[this.position] = null;

        if (gameboard[newPos] instanceof Piece)
            gameboard[newPos].kill();

        this.updatePosition(newPos);
    }

    updatePosition(pos) {
        this.position = pos;
        gameboard[this.position] = this;

        // Get X position
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

            var validMoves = piece.getValidMoves();
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
            piece.tryUpdatePosition();

            // Stop using onmousemove()
            this.onmousemove = null;

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

    getValidMoves() {
        let moves = [];
        //for (var i = 0; i < 64; i++)
        //    moves.push(i);

        return moves;
    }
}

class Pawn extends Piece {
    constructor(position, color) {
        super(PAWN, position, color);

        this.hasMoved = false;
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
        if (!(gameboard[this.position + forward * 2] instanceof Piece))
            moves.push(this.position + forward * 2);

        return moves;
    }
}

class Rook extends Piece {
    constructor(position, color) {
        super(ROOK, position, color);

        this.hasMoved = false;
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

        return moves;
    }
}

class Bishop extends Piece {
    constructor(position, color) {
        super(BISHOP, position, color);

        this.hasMoved = false;
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

        return moves;
    }
}

class Queen extends Piece {
    constructor(position, color) {
        super(QUEEN, position, color);

        this.hasMoved = false;
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

        return moves;
    }
}

class King extends Piece {
    constructor(position, color) {
        super(KING, position, color);

        this.hasMoved = false;
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

        return moves;
    }
}
