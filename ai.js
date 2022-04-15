function cloneGameBoard(board) {
	var phantom_board = [64];
	for (var i = 0; i < board.length; i++) {
		if (!(board[i] instanceof Piece)) {
			continue;
		}

		if (board[i] instanceof Pawn) {
			phantom_board[i] = new Phantom_Pawn(phantom_board, i, board[i].color);
		} else if (board[i] instanceof Knight) {
			phantom_board[i] = new Phantom_Knight(phantom_board, i, board[i].color);
		} else if (board[i] instanceof Bishop) {
			phantom_board[i] = new Phantom_Bishop(phantom_board, i, board[i].color);
		} else if (board[i] instanceof Rook) {
			phantom_board[i] = new Phantom_Rook(phantom_board, i, board[i].color);
		} else if (board[i] instanceof Queen) {
			phantom_board[i] = new Phantom_Queen(phantom_board, i, board[i].color);
		} else {
			phantom_board[i] = new Phantom_King(phantom_board, i, board[i].color);
		}
	}
	return phantom_board;

}

function calculateBestMove() {
	var possibleMoves = getAllBlackPieceMoves();
	var bestMove;
	var bestValue = -Infinity;

	for (var i = 0; i < possibleMoves.length; i++) {
		var pboard1 = cloneGameBoard(gameboard);

		var move = possibleMoves[i];


		// Take the negative as AI is the black (minimizing) player
		var boardValue = evaluateBoard(pboard1);
		if (boardValue >= bestValue) {
			bestValue = boardValue;
			bestMove = move;
		}
	}

	return bestMove;
}

function evaluateBoard(board) {
	var totalEval = 0;
	for (var i = 0; i < board.length; i++) {
		totalEval += getPieceValue(board[i]);
	}

	return totalEval;
}

function getPieceValue(piece) {
	if (!(piece instanceof Piece)) {
		return 0;
	}

	function pieceValue(piece) {
		if (piece instanceof Piece && piece.symbol == PAWN) {
			return 10;
		} else if (piece instanceof Piece && piece.symbol == KNIGHT) {
			return 30;
		} else if (piece instanceof Piece && piece.symbol == BISHOP) {
			return 30;
		} else if (piece instanceof Piece && piece.symbol == ROOK) {
			return 50;
		} else if (piece instanceof Piece && piece.symbol == QUEEN) {
			return 90;
		} else if (piece instanceof Piece && piece.symbol == KING) {
			return 900;
		}
	};

	var pieceValue = pieceValue(piece);
	return piece instanceof Piece && piece.color == 'white' ? pieceValue : -pieceValue;
}


/*
if (mode == 'pvc' || mode == 'cvc') {
	let moved = false;
	while (!moved) {
		let piece = blackPieces[parseInt(Math.random() * blackPieces.length)];
		let moves = piece.getValidMoves();
		if (piece.alive && moves.length > 0) {
			let move = calculateBestMove(moves); 
			console.log(piece);
			console.log('was moved by black to ' + move);
			piece.updatePosition(move, true);
			moved = true;
		}
	}
} */