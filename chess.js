var gameboard = [];
var whitePieces = [];
var blackPieces = [];
var cells = [];

var status;
var inCheck;
var checkmate = false;

var whiteTurn = true;
var madeMove = false;

function onResize() {
    for (var i=0; i<64; i++) {
        if (gameboard[i] instanceof Piece) {
            gameboard[i].updatePosition(i);
        }
    }
}

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

    banner.style.opacity = '100%';

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
                        }});
                }
            });

        }
    });
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
