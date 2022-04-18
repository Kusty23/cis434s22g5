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

function calculateBestMove(board, depth, isMaximizingPlayer) {
	var possibleMoves = getAllBlackPieceMoves();
	var bestMove;
	var bestValue = -Infinity;

	for (var i = 0; i < possibleMoves.length; i++) {
		var pboard = cloneGameBoard(board);

		var move = possibleMoves[i];
		pboard[move[0]].updatePosition(move[1], true);

		console.log("test1");
		var value = minimax(pboard, depth - 1, !isMaximizingPlayer);

		if (value >= bestValue) {
			bestValue = value;
			bestMove = move;
		}

		/*
		// Take the negative as AI is the black (minimizing) player
		//var boardValue = evaluateBoard(pboard1);
		if (boardValue >= bestValue) {
			bestValue = boardValue;
			bestMove = move;
		} */
	}

	return bestMove;
}

function minimax(board, depth, isMaximizingPlayer) {
	if (depth == 0) {
		
		console.log("test2");
		return evaluateBoard(board);
	}
	
	console.log("test3");

	var pboard = cloneGameBoard(board);
	if (isMaximizingPlayer) {																			// Where issues are occurring
		console.log("test5");

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
			var move = moves[i];
			pboard[move[0]].updatePosition(move[1], false);
			
			console.log(pboard);
			console.log(depth);
			console.log(isMaximizingPlayer);

			let value = minimax(pboard, depth - 1, !isMaximizingPlayer);
			if (value > bestValue) {
				bestValue = value;
			}
		}

		return bestValue;
	} else {																							// Where issues are occurring.
		var moves = [];
		
		console.log("test4");
		for (let i = 0; i < 64; i++) {
			if (pboard[i] instanceof Phantom_Piece && pboard[i].color == "black") {
				for (var j = 0; j < pboard[i].getValidMoves().length; j++) {
					moves.push([pboard[i].position, pboard[i].getValidMoves()[j]]);
				}
			}
		}

		var bestValue = Infinity;
		for (var i = 0; i < moves.length; i++) {
			var move = moves[i];
			pboard[move[0]].updatePosition(move[1], true);

			console.log(pboard);
			console.log(depth);
			console.log(isMaximizingPlayer);

			let value = minimax(pboard, depth - 1, !isMaximizingPlayer);
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
