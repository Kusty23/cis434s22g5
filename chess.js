var gameboard = [];
var whitePieces = [];
var blackPieces = [];
var cells = [];

var status;
var inCheck;
var checkmate = false;

var whiteTurn = true;
var madeMove = false;

var isPvC;

// Need to move pieces back to the right position when board moves due to window change
function onResize() {
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece) {
            gameboard[i].updatePosition(i);
        }
    }
}

// Gets parameter from url from form submission
function getParameterByName(name) {
    let url = window.location.href;

    // Filter out annoying characters
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);

    // If no result
    if (!results) {
        return null;
    }

    // If no result value pair
    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Starts a new game of chess
function newGame() {
    // If Player v Computer
    if (getParameterByName('pvc')) {
        isPvC = true;
    }
    // If Player v Player
    else {
        isPvC = false;
    }


    genBoard();
    genPieces();
    addCellIds();

    setStatus('running');

    // Kicks off the first turn. playTurn() recursively calls itself so
    // we don't need to continue this execution thread
    playTurn()
}

// Starts a new turn, called when a piece is moved successfully
function playTurn() {
    // White Turn
    if (whiteTurn) {
        deactivateBlack();

        if (getAllWhiteMoves().length == 0) {
            endGame();
            return;
        }

        activateWhite();
    }
    // Black Turn
    else {
        deactivateWhite();

        if (getAllBlackMoves().length == 0) {
            endGame();
            return;
        }

        activateBlack();

        if (isPvC) {
            let moved = false;
            while (!moved) {
                let piece = blackPieces[parseInt(Math.random() * blackPieces.length)];

                let moves = piece.getValidMoves();
                if (piece.alive && moves.length > 0) {
                    let move = moves[parseInt(Math.random() * moves.length)];
                    piece.updatePosition(move, true);
                    moved = true;
                }
            }
        }
    }
}

// Checks if king is in check
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

// Handles end game behavior
function endGame(winner) {
    let banner = document.getElementById('win');

    banner.style.opacity = '100%';

    // Animates the banner appearing and then fading out
    $('#win').animate({ width: '100%' }, {
        easing: 'swing',
        duration: 500,
        complete: function() {
            $('#win-text').animate({ opacity: '100%' }, {
                easing: 'swing',
                duration: 1000,
                complete: function() {
                    $('#win-text').animate({ opacity: '0' }, {
                        easing: 'swing',
                        duration: 2000,
                        complete: function() {
                            $('#win').animate({ opacity: '0' });
                            $('#win').animate({ width: '0' });
                        }
                    });
                }
            });

        }
    });
}

// Sets all white pieces to active
function activateWhite() {
    for (var i = 0; i < whitePieces.length; i++) {
        whitePieces[i].active = true;
    }
}

// Sets all white pieces to disactive
function deactivateWhite() {
    for (var i = 0; i < whitePieces.length; i++) {
        whitePieces[i].active = false;
    }
}

// Sets all black pieces to active
function activateBlack() {
    for (var i = 0; i < whitePieces.length; i++) {
        blackPieces[i].active = true;
    }
}

// Sets all black pieces to disactive
function deactivateBlack() {
    for (var i = 0; i < whitePieces.length; i++) {
        blackPieces[i].active = false;
    }
}

// Generates all valid moves white can make
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

// Generates all valid moves black can make
function getAllBlackMoves() {
    let moves = [];

    for (var i = 0; i < blackPieces.length; i++) {
        if (blackPieces[i].alive == false) {
            continue;
        }
        for (var j = 0; j < blackPieces[i].getValidMoves().length; j++) {
            moves.push(blackPieces[i].getValidMoves()[j]);
        }
    }

    return moves;
}
