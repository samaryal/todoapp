import { S3 } from 'aws-sdk';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('generateUploadUrl');

const s3 = new S3();
const BUCKET_NAME = process.env.ATTACHMENTS_S3_BUCKET;

export async function handler(event) {
  const todoId = event.pathParameters.todoId;

  const fileName = `${todoId}.jpg`;
  const filePath = `attachments/${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: filePath,
    Expires: 300,
    ContentType: 'image/jpeg'
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    logger.info('Generated presigned URL', { todoId, uploadUrl });

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    };
  } catch (error) {
    logger.error('Error generating presigned URL', { error });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate presigned URL',
        error: error.message
      })
    };
  }
}
