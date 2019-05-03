const WTError = require('../../error');
const futureBoard = require('../models/future-board');
const RemoteBoard = require('../models/remote-board');

module.exports = function({ request, routes }) {
  /**
   * Creates a new board, without items.
   * @param   {Object}  board A board object without items.
   * @returns {Promise}       A board object
   */
  return async function createBoard(board) {
    try {
      const response = await request.send(
        routes.boards.create,
        futureBoard(board)
      );
      return new RemoteBoard(response);
    } catch (error) {
      throw new WTError('There was an error when creating the board.', error);
    }
  };
};
