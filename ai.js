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
		}
		else {
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
		if (phantom_piece instanceof Phantom_Pawn) {
			return 10;
		} else if (phantom_piece instanceof Phantom_Knight) {
			return 30;
		} else if (phantom_piece instanceof Phantom_Bishop) {
			return 30;
		} else if (phantom_piece instanceof Phantom_Rook) {
			return 50;
		} else if (phantom_piece instanceof Phantom_Queen) {
			return 90;
		} else if (phantom_piece instanceof Phantom_King) {
			return 900;
		}
	};

	var pieceValue = pieceValue(phantom_piece);
	return phantom_piece instanceof Phantom_Piece && phantom_piece.color == 'white' ? pieceValue : -pieceValue;
}
