import 'source-map-support/register';
import middy from '@middy/core';
import httpCors from '@middy/http-cors';

import { getUserId } from '../utils.js';
import { createTodo } from '../../helpers/businessLogic/todos.js';


export const handler = middy(async (event) => {
  try {
    const newTodo = JSON.parse(event.body);
    const userId = getUserId(event);

    const result = await createTodo(newTodo, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: result
      }),
    };
  } catch (error) {
    console.error('Error creating TODO:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create TODO'
      }),
    };
  }
});

handler.use(httpCors({
  credentials: true
}));
