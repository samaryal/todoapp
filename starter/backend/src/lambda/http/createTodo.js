import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../utils.mjs';
import { createTodoAction } from '../../businessLogic/todos.js';

const createTodoHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const newTodo = JSON.parse(event.body);
    const todo = await createTodoAction(userId, newTodo);

    return {
      statusCode: 201,
      body: JSON.stringify({ item: todo }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating the todo item.' }),
    };
  }
};

export const handler = middy(createTodoHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
