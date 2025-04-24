import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { deleteTodoAction } from '../../businessLogic/todos.js';

const deleteTodoHandler = async (event) => {
  try {

    const userId = getUserId(event);

    const { todoId } = event.pathParameters;

    await deleteTodoAction(userId, todoId);

    return {
      statusCode: 204, 
      body: JSON.stringify({}),
    };
  } catch (error) {
    
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500, 
      body: JSON.stringify({
        message: 'internal Server Error.',
      }),
    };
  }
};

export const handler = middy(deleteTodoHandler)
  .use(httpErrorHandler()) 
  .use(
    cors({
      credentials: true, 
    })
  );