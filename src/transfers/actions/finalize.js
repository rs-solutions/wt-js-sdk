const WTError = require('../../error');
const { RemoteTransfer } = require('../models');

module.exports = function({ request, routes }) {
  /**
   * Marks the transfer as completed
   * @param   {Object} transfer Transfer item.
   * @returns {Promise}
   */
  return async function finalizeTransfer(transfer) {
    try {
      const response = await request.send(routes.transfers.finalize(transfer));
      return new RemoteTransfer(response);
    } catch (error) {
      throw new WTError(
        'There was an error when finalizing the transfer.',
        error
      );
    }
  };
};
