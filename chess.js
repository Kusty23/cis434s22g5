var gameboard = [];
var whitePieces = [];
var blackPieces = [];
var cells = [];

var status;
var inCheck;
var checkmate = false;

var whiteTurn = true;
var madeMove = false;

function newGame() {
    genBoard();
    genPieces();
    addCellIds();

    setStatus('running');

    playTurn()
}

function playTurn() {
    // White Turn
    if (whiteTurn) {
        deactivateBlack();

        if (getAllWhiteMoves().length == 0) {
            endGame();
        }

        activateWhite();
    }
    // Black Turn
    else {
        deactivateWhite();

        if (getAllBlackMoves().length == 0) {
            console.log("gameover");
            endGame();
        }

        activateBlack();
    }
}

function isCheck() {
    var whiteKingPos, blackKingPos;

    for (var i in gameboard) {
        if (gameboard[i] instanceof Piece && gameboard[i].symbol == KING) {
            if (gameboard[i].color == 'white')
                whiteKingPos = i;
            else
                blackKingPos = i;
        }
    }

    if (ATTACK_BLACK[whiteKingPos] == 1) {
        setStatus('white in check');
        inCheck = 'white';
    } else if (ATTACK_WHITE[blackKingPos] == 1) {
        setStatus('black in check');
        inCheck = 'black';
    } else {
        setStatus('running');
        inCheck = '';
    }
}

function endGame(winner) {
    let banner = document.getElementById('win');
    banner.style.visibility = 'visible';
}

function activateWhite() {
    for (var i = 0; i < whitePieces.length; i++) {
        whitePieces[i].active = true;
    }
}

function deactivateWhite() {
    for (var i = 0; i < whitePieces.length; i++) {
        whitePieces[i].active = false;
    }
}

function activateBlack() {
    for (var i = 0; i < whitePieces.length; i++) {
        blackPieces[i].active = true;
    }
}

function deactivateBlack() {
    for (var i = 0; i < whitePieces.length; i++) {
        blackPieces[i].active = false;
    }
}

function getAllWhiteMoves() {
    let moves = [];

    for (var i = 0; i < whitePieces.length; i++) {
        if (whitePieces[i].alive) {
            for (var j = 0; j < whitePieces[i].getValidMoves().length; j++) {
                moves.push(whitePieces[i].getValidMoves()[j]);
            }
        }
    }

    return moves;
}

function getAllBlackMoves() {
    let moves = [];

    console.log("getAllBlackMoves");

    for (var i = 0; i < blackPieces.length; i++) {
        if (blackPieces[i].alive == false ) {
            continue;
        }
        if (blackPieces[i].getValidMoves().length > 0) {
            console.log(blackPieces[i]);
        }
        for (var j = 0; j < blackPieces[i].getValidMoves().length; j++) {
            moves.push(blackPieces[i].getValidMoves()[j]);
        }
    }

    console.log(moves);

    return moves;
}
