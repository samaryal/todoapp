import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
})

const bucketName = process.env.ATTACHMENTS_BUCKET
const signedUrlExpireSeconds = 60 * 5  

const getPutSignedUrl = async (key) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: signedUrlExpireSeconds,
    })
    return presignedUrl
  } catch (error) {
    console.error('Failed to generate presigned URL:', error.message)
    throw new Error('Failed to generate presigned URL')
  }
}

const generateImageUrl = async (imageId) => {
  try {
    const presignedUrl = await getPutSignedUrl(imageId)
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageId}`
    return { presignedUrl, imageUrl }
  } catch (error) {
    console.error('Error generating image URL:', error.message)
    throw new Error('Failed to generate image URL')
  }
}

export {
  getPutSignedUrl,
  generateImageUrl
}
