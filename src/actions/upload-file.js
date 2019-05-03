const { get } = require('lodash');

const WTError = require('../error');

module.exports = function({ request, getUploadUrl, completeFileUpload }) {
  /**
   * Uploads a chunk of the file to S3
   * @param   {Object}  transferOrBoard Transfer or Board item.
   * @param   {Object}  file            Item containing information about number of parts, upload url, etc.
   * @param   {Buffer}  data            File content
   * @param   {Number}  partNumber      Which part number we want to upload
   * @returns {Promise}                 Empty response if everything goes well 🤔
   */
  function uploadPart(transferOrBoard, file, data, partNumber) {


    return getUploadUrl(
      transferOrBoard.id,
      file.id,
      partNumber,
      get(file, 'multipart.id')
    ).then((multipartItem) => {
      return request.upload(multipartItem.url, data);
    });
  }

  /**
   * Given the content of the file, and the number of parts that must be uploaded to S3,
   * it splits the file into chunks and uploads each part sequentially
   * @param   {Object}  transferOrBoard Transfer or Board item.
   * @param   {Object}  file            Item containing information about number of parts, upload url, etc.
   * @param   {Buffer}  content         File content
   */
  async function uploadAllParts(transferOrBoard, file, content) {
    const totalParts = file.multipart.part_numbers;


    for (let partNumber = 0; partNumber < totalParts; partNumber++) {
      const chunkStart = partNumber * file.multipart.chunk_size;
      const chunkEnd = (partNumber + 1) * file.multipart.chunk_size;

      await uploadPart(
        transferOrBoard,
        file,
        content.slice(chunkStart, chunkEnd),
        partNumber + 1
      );
    }
  }

  /**
   * Given the content of the file, and the number of parts that must be uploaded to S3,
   * it splits the file into chunks and uploads each part sequentially.
   * Completes the file upload at the end.
   * @param   {Object}  transferOrBoard Transfer or Board item.
   * @param   {Object}  file            Item containing information about number of parts, upload url, etc.
   * @param   {Buffer}  content         File content
   * @returns {Promise}                 Empty response if everything goes well 🤔
   */
  return async function uploadFile(transferOrBoard, file, content) {

    try {
      await uploadAllParts(transferOrBoard, file, content);
      const response = await completeFileUpload(transferOrBoard, file);

      return response;
    } catch (error) {
      throw new WTError(
        `There was an error when uploading ${file.name}.`,
        error
      );
    }
  };
};
