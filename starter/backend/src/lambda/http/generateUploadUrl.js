const { S3 } = require('aws-sdk');
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('generateUploadUrl');

const s3 = new S3();
const BUCKET_NAME = process.env.ATTACHMENTS_BUCKET;

export async function handler(event) {
  const todoId = event.pathParameters.todoId;

  const fileName = `${todoId}.jpg`;
  const filePath = `attachments/${fileName}`;

  const params = {
    Bucket: 'todo-samar-1',  // اسم الباكت
    Key: filePath,
    Expires: 300,
    ContentType: 'image/jpeg',
    // إعدادات CORS
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: ['*'],  // السماح لجميع النطاقات
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],  // السماح بطرق HTTP معينة
          AllowedHeaders: ['Content-Type', 'Authorization']  // السماح برؤوس معينة
        }
      ]
    }
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
        message: 'Failed to g generate presigned URL',
        error: error.message
      })
    };
  }
}
