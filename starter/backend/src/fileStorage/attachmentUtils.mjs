import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const BUCKET_NAME = 'todo-samar';

export function createAttachmentPresignedUrl(todoId) {
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: todoId,
    Expires: 300, 
    ContentType: 'image/png', 
  };

  const uploadUrl = s3.getSignedUrl('putObject', s3Params);
  return uploadUrl;
}
