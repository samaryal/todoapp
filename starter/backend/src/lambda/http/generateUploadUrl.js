import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { generateImageUrlAction } from '../../businessLogic/todos.js';

const generateImageUrlHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const { todoId } = event.pathParameters;

    const uploadUrl = await generateImageUrlAction(userId, todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl,
      }),
    };
  } catch (error) {
    console.error('Failed to generate image upload URL:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate image upload URL. Please try again later.',
      }),
    };
  }
};

export const handler = middy(generateImageUrlHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
