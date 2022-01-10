const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

module.exports = class PostCapture {

  constructor() {
    this.S3 = new AWS.S3();

  }

  /**
   * to save the event data to AWS S3
   * @param {mixed} data 
   * @void
   */
  async capture(data) {
    await this.S3.putObject({
      Bucket: config.bucket_name,
      Key: `postCapture/CheckReceivable/${uuidv4()}.json`,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      ACL: 'public-read'
    }).promise();
  }

}