import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getTodosAction } from '../../businessLogic/todos.js';
import { getUserId } from '../auth/utils.mjs';

const getTodosHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const items = await getTodosAction(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ items }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving todos.' }),
    };
  }
};

export const handler = middy(getTodosHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
