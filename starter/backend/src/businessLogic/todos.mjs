import { createTodoItem, getTodosByUserId, updateTodoItem, deleteTodoItem } from '../dataLayer/todosAccess.mjs';
import { parseUserId } from '../auth/utils.mjs';

export async function createTodo(newTodo, userId) {
  return await createTodoItem(newTodo, userId);
}

export async function getTodos(userId) {
  return await getTodosByUserId(userId);
}

export async function updateTodo(todoId, updatedTodo, userId) {
  return await updateTodoItem(todoId, updatedTodo, userId);
}

export async function deleteTodo(todoId, userId) {
  return await deleteTodoItem(todoId, userId);
}
