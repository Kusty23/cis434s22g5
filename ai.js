const WPAWN_VALUE_LOC = [100, 100, 100, 100, 105, 100, 100, 100,
    78, 83, 86, 73, 102, 82, 85, 90,
    7, 29, 21, 44, 40, 31, 44, 7,
    -17, 16, -2, 15, 14, 0, 15, -13,
    -26, 3, 10, 9, 6, 1, 0, -23,
    -22, 9, 5, -11, -10, -2, 3, -19,
    -31, 8, -7, -37, -36, -14, 3, -31,
    0, 0, 0, 0, 0, 0, 0, 0
];

const WKNIGHT_VALUE_LOC = [-66, -53, -75, -75, -10, -55, -58, -70,
    -3, -6, 100, -36, 4, 62, -4, -14,
    10, 67, 1, 74, 73, 27, 62, -2,
    24, 24, 45, 37, 33, 41, 25, 17,
    -1, 5, 31, 21, 22, 35, 2, 0,
    -18, 10, 13, 22, 18, 15, 11, -14,
    -23, -15, 2, 0, 2, 0, -23, -20,
    -74, -23, -26, -24, -19, -35, -22, -69
];

const WBISHOP_VALUE_LOC = [-59, -78, -82, -76, -23, -107, -37, -50,
    -11, 20, 35, -42, -39, 31, 2, -22,
    -9, 39, -32, 41, 52, -10, 28, -14,
    25, 17, 20, 34, 26, 25, 15, 10,
    13, 10, 17, 23, 17, 16, 0, 7,
    14, 25, 24, 15, 8, 25, 20, 15,
    19, 20, 11, 6, 7, 6, 20, 16,
    -7, 2, -15, -12, -14, -15, -10, -10
];

const WROOK_VALUE_LOC = [35, 29, 33, 4, 37, 33, 56, 50,
    55, 29, 56, 67, 55, 62, 34, 60,
    19, 35, 28, 33, 45, 27, 25, 15,
    0, 5, 16, 13, 18, -4, -9, -6,
    -28, -35, -16, -21, -13, -29, -46, -30,
    -42, -28, -42, -25, -25, -35, -26, -46,
    -53, -38, -31, -26, -29, -43, -44, -53,
    -30, -24, -18, 5, -2, -18, -31, -32
];

const WQUEEN_VALUE_LOC = [6, 1, -8, -104, 69, 24, 88, 26,
    14, 32, 60, -10, 20, 76, 57, 24,
    -2, 43, 32, 60, 72, 63, 43, 2,
    1, -16, 22, 17, 25, 20, -13, -6,
    -14, -15, -2, -5, -1, -10, -20, -22,
    -30, -6, -13, -11, -16, -11, -16, -27,
    -36, -18, 0, -19, -15, -15, -21, -38,
    -39, -30, -31, -13, -31, -36, -34, -42
];

const WKING_VALUE_LOC = [4, 54, 47, -99, -99, 60, 83, -62,
    -32, 10, 55, 56, 56, 55, 10, 3,
    -62, 12, -57, 44, -67, 28, 37, -31,
    -55, 50, 11, -4, -19, 13, 0, -49,
    -55, -43, -52, -28, -51, -47, -8, -50,
    -47, -42, -43, -79, -64, -32, -29, -32,
    -4, 3, -14, -50, -57, -18, 13, 4,
    17, 30, -3, -14, 6, -1, 40, 18
];

const BPAWN_VALUE_LOC = WPAWN_VALUE_LOC.slice().reverse();
const BKNIGHT_VALUE_LOC = WKNIGHT_VALUE_LOC.slice().reverse();
const BBISHOP_VALUE_LOC = WBISHOP_VALUE_LOC.slice().reverse();
const BROOK_VALUE_LOC = WROOK_VALUE_LOC.slice().reverse();
const BQUEEN_VALUE_LOC = WQUEEN_VALUE_LOC.slice().reverse();
const BKING_VALUE_LOC = WKING_VALUE_LOC.slice().reverse();


function cloneGameBoard(board) {
    var phantom_board = [64];
    for (var i = 0; i < board.length; i++) {
        if (!(board[i] instanceof Piece || board[i] instanceof Phantom_Piece)) {
            continue;
        }

        if (board[i] instanceof Pawn || board[i] instanceof Phantom_Pawn) {
            phantom_board[i] = new Phantom_Pawn(phantom_board, i, board[i].color);
        } else if (board[i] instanceof Knight || board[i] instanceof Phantom_Knight) {
            phantom_board[i] = new Phantom_Knight(phantom_board, i, board[i].color);
        } else if (board[i] instanceof Bishop || board[i] instanceof Phantom_Bishop) {
            phantom_board[i] = new Phantom_Bishop(phantom_board, i, board[i].color);
        } else if (board[i] instanceof Rook || board[i] instanceof Phantom_Rook) {
            phantom_board[i] = new Phantom_Rook(phantom_board, i, board[i].color);
        } else if (board[i] instanceof Queen || board[i] instanceof Phantom_Queen) {
            phantom_board[i] = new Phantom_Queen(phantom_board, i, board[i].color);
        } else {
            phantom_board[i] = new Phantom_King(phantom_board, i, board[i].color);
        }
    }
    return phantom_board;

}

function calculateBestMove(board, depth, isMaximizingPlayer) {
    var possibleMoves = isMaximizingPlayer ? getAllWhitePieceMoves() : getAllBlackPieceMoves();
    var bestMove;
    var bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    possibleMoves.sort(() => Math.random() - 0.5);

    for (var i = 0; i < possibleMoves.length; i++) {
        var pboard = cloneGameBoard(board);

        var move = possibleMoves[i];
        pboard[move[0]].updatePosition(move[1], true);

        var value = minimax(pboard, depth - 1, !isMaximizingPlayer);

        if (isMaximizingPlayer) {
            if (value >= bestValue) {
                bestValue = value;
                bestMove = move;
            }
        } else {
            if (value <= bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }

    }

    return bestMove;
}

function minimax(board, depth, isMaximizingPlayer) {
    if (depth <= 0) {
        return evaluateBoard(board);
    }

    var pboard = cloneGameBoard(board);
    if (isMaximizingPlayer) {
        var moves = [];

        for (var i = 0; i < 64; i++) {
            if (pboard[i] instanceof Phantom_Piece && pboard[i].color == "white") {
                for (var j = 0; j < pboard[i].getValidMoves().length; j++) {
                    moves.push([pboard[i].position, pboard[i].getValidMoves()[j]]);
                }
            }
        }

        var bestValue = -Infinity;
        for (var i = 0; i < moves.length; i++) {

            tempboard = cloneGameBoard(pboard);

            var move = moves[i];
            tempboard[move[0]].updatePosition(move[1], false);

            let value = minimax(tempboard, depth - 1, !isMaximizingPlayer);
            if (value > bestValue) {
                bestValue = value;
            }
        }

        return bestValue;
    } else {
        var moves = [];

        for (let i = 0; i < 64; i++) {
            if (pboard[i] instanceof Phantom_Piece && pboard[i].color == "black") {
                for (var j = 0; j < pboard[i].getValidMoves().length; j++) {
                    moves.push([pboard[i].position, pboard[i].getValidMoves()[j]]);
                }
            }
        }

        var bestValue = Infinity;
        for (var i = 0; i < moves.length; i++) {
            tempboard = cloneGameBoard(pboard);

            var move = moves[i];
            tempboard[move[0]].updatePosition(move[1], true);

            let value = minimax(tempboard, depth - 1, !isMaximizingPlayer);

            if (value < bestValue) {
                bestValue = value;
            }
        }

        return bestValue;
    }
}

function evaluateBoard(board) {
    var totalEval = 0;
    for (var i = 0; i < board.length; i++) {
        totalEval += getPieceValue(board[i]);
    }

    return totalEval;
}

function getPieceValue(phantom_piece) {
    if (!(phantom_piece instanceof Phantom_Piece)) {
        return 0;
    }

    function pieceValue(phantom_piece) {
		if (phantom_piece.color == 'white') {
			if (phantom_piece instanceof Phantom_Pawn) {
	            return 10 + WPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Knight) {
	            return 30 + WPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Bishop) {
	            return 30 + WPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Rook) {
	            return 50 + WPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Queen) {
	            return 90 + WPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_King) {
	            return 900 + WPAWN_VALUE_LOC[phantom_piece.position];
	        }
		}
		else {
			if (phantom_piece instanceof Phantom_Pawn) {
	            return 10 + BPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Knight) {
	            return 30 + BPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Bishop) {
	            return 30 + BPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Rook) {
	            return 50 + BPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_Queen) {
	            return 90 + BPAWN_VALUE_LOC[phantom_piece.position];
	        } else if (phantom_piece instanceof Phantom_King) {
	            return 900 + BPAWN_VALUE_LOC[phantom_piece.position];
	        }
		}

    };

    var pieceValue = pieceValue(phantom_piece);
    return phantom_piece instanceof Phantom_Piece && phantom_piece.color == 'white' ? pieceValue : -pieceValue;
}
