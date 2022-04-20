var gameboard = [];
var whitePieces = [];
var blackPieces = [];
var cells = [];

var status;
var inCheck;
var phantomInCheck;
var checkmate = false;

var whiteTurn = true;
var madeMove = false;
var firstMove = true;

var mode;
let doBlitz;

var standardFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
//standardFEN = 'rnkq2n1/pppb1b1p/8/4r2B/8/3p4/PPPPPP1P/RN1QK1NR';

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
    mode = getParameterByName('player-mode');
    doBlitz = getParameterByName('doBlitz');

    if (doBlitz) {
        setUpBlitz();
    }
    else {
        document.getElementById('timer').style.display = 'none';
    }


    genBoard();
    setupPieces(standardFEN);
    addCellIds();

    setStatus('running');

    // Kicks off the first turn. playTurn() is called again when a piece moves
    playTurn();

    // Start the timer
    startTimer();
}

function setUpBlitz() {
    let blitzTime = getParameterByName('blitz-time');

    document.getElementById('min1').innerHTML = blitzTime;
    document.getElementById('min2').innerHTML = blitzTime;
}

function setupPieces(fen) {
    let pos = 0;
    for (let i = 0; i < fen.length; i++) {
        switch (fen[i]) {
            case 'r':
                new Rook(pos, 'black');
                pos++;
                break;
            case 'n':
                new Knight(pos, 'black');
                pos++;
                break;
            case 'b':
                new Bishop(pos, 'black');
                pos++;
                break;
            case 'q':
                new Queen(pos, 'black');
                pos++;
                break;
            case 'k':
                new King(pos, 'black');
                pos++;
                break;
            case 'p':
                new Pawn(pos, 'black');
                pos++;
                break;

            case 'R':
                new Rook(pos, 'white');
                pos++;
                break;
            case 'N':
                new Knight(pos, 'white');
                pos++;
                break;
            case 'B':
                new Bishop(pos, 'white');
                pos++;
                break;
            case 'Q':
                new Queen(pos, 'white');
                pos++;
                break;
            case 'K':
                new King(pos, 'white');
                pos++;
                break;
            case 'P':
                new Pawn(pos, 'white');
                pos++;
                break;

            case '/':
                break;

            default:
                pos += parseInt(fen[i]);
        }
    }

    // Create the HTML elements for each piece
    for (var i = 0; i < 64; i++) {
        if (gameboard[i] instanceof Piece)
            gameboard[i].create();
    }
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

        if (mode == 'cvc') {
            let moved = false;
            while (!moved) {
                let piece = whitePieces[parseInt(Math.random() * whitePieces.length)];

                let moves = piece.getValidMoves();
                if (piece.alive && moves.length > 0) {
                    let move = moves[parseInt(Math.random() * moves.length)];
                    console.log(piece);
                    console.log('was moved by white to ' + move);
                    piece.updatePosition(move, true);
                    moved = true;
                }
            }
        }
    }
    // Black Turn
    else {
        deactivateWhite();

        if (getAllBlackMoves().length == 0) {
            endGame();
            return;
        }

        activateBlack();
        
        if (mode == 'pvc' || mode == 'cvc') {
			let moved = false;
			while (!moved) {
                if (firstMove) {
                    var moves = getAllBlackPieceMoves();
                    let move = moves[parseInt(Math.random() * moves.length)];
                    
                    gameboard[move[0]].updatePosition(move[1], true);
                    firstMove = false;
                } else {
                    var bestMove = calculateBestMove(gameboard, 4, false);
                    gameboard[bestMove[0]].updatePosition(bestMove[1], true);
                }
                moved = true;
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
        check();
        inCheck = 'white';
    } else if (ATTACK_WHITE[blackKingPos] == 1) {
        setStatus('black in check');
        inCheck = 'black';
        check();
    } else {
        setStatus('running');
        inCheck = '';
    }
}

function check(victim) {
    let banner = document.getElementById('check');

    banner.style.opacity = '100%';

    // Animates the banner appearing and then fading out
    $('#check').animate({ width: '100%' }, {
        easing: 'swing',
        duration: 200,
        complete: function() {
            $('#check-text').animate({ opacity: '100%' }, {
                easing: 'swing',
                duration: 500,
                complete: function() {
                    $('#check-text').animate({ opacity: '0' }, {
                        easing: 'swing',
                        duration: 200,
                        complete: function() {
                            $('#check').animate({ opacity: '0' });
                            $('#check').animate({ width: '0' });
                        }
                    });
                }
            });

        }
    });
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
    for (var i = 0; i < blackPieces.length; i++) {
        blackPieces[i].active = true;
    }
}

// Sets all black pieces to disactive
function deactivateBlack() {
    for (var i = 0; i < blackPieces.length; i++) {
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

function getAllBlackPieceMoves() {
    let moves = [];

    for (var i = 0; i < blackPieces.length; i++) {
        if (blackPieces[i].alive == false) {
            continue;
        }
        for (var j = 0; j < blackPieces[i].getValidMoves().length; j++) {
            moves.push([blackPieces[i].position, blackPieces[i].getValidMoves()[j]]);
        }
    }
    
    return moves;
}
