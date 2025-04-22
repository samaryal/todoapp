import { v4 as uuidv4 } from 'uuid';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoImage
} from '../dataLayer/todosAccess.js';
import { createAttachmentPresignedUrl } from '../fileStorage/attachmentUtils.mjs';

const getTodosAction = async (userId) => {
  const result = await getTodos(userId);
  return result;
};

const createTodoAction = async (userId, item) => {
  const createdAt = new Date().toISOString();
  const newTodo = {
    ...item,
    userId,
    todoId: uuidv4(),
    createdAt
  };
  const result = await createTodo(newTodo);
  return result;
};

const updateTodoAction = async (userId, todoId, item) => {
  await updateTodo(userId, todoId, item);
};

const deleteTodoAction = async (userId, todoId) => {
  await deleteTodo(userId, todoId);
};

const uploadImageAction = async (todoId, image) => {
  const imageId = uuidv4();
  const { presignedUrl, imageUrl } = await createAttachmentPresignedUrl(imageId);

  const newImage = {
    todoId,
    imageId,
    imageUrl,
    timestamp: new Date().toISOString()
  };

  await updateTodoImage(todoId, newImage.imageUrl);

  return { presignedUrl, imageUrl };
};

const generateImageUrlAction = async (userId, todoId) => {
  const imageId = uuidv4();
  const { presignedUrl, imageUrl } = await createAttachmentPresignedUrl(imageId);

  await updateTodoImage(userId, todoId, imageUrl);

  return presignedUrl;
};

export {
  getTodosAction,
  createTodoAction,
  updateTodoAction,
  deleteTodoAction,
  uploadImageAction,
  generateImageUrlAction
};
