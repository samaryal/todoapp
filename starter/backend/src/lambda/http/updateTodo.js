import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../auth/utils.mjs';
import { updateTodoAction } from '../../businessLogic/todos.js';

const updateTodoHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const { todoId } = event.pathParameters;
    const updatedTodo = JSON.parse(event.body);

    await updateTodoAction(userId, todoId, updatedTodo);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Todo updated successfully',
      }),
    };
  } catch (error) {
    console.error('Failed to update todo:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update the todo item. Please try again later.',
      }),
    };
  }
};

export const handler = middy(updateTodoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
