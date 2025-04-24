import { v4 as uuidv4 } from 'uuid'
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoImage
} from '../dataLayer/todosAccess.js'
import { generateImageUrl } from '../fileStorage/attachmentUtils.mjs'

const getTodosAction = async (userId) => {
  try {
    const result = await getTodos(userId)
    return result
  } catch (error) {
    console.error("Error retrieving todos:", error)
    throw new Error("Failed to retrieve todos.")
  }
}

const createTodoAction = async (userId, item) => {
  try {
    const createdAt = new Date().toISOString()
    const newTodo = {
      ...item,
      userId,
      todoId: uuidv4(),
      createdAt
    }
    const result = await createTodo(newTodo)
    return result
  } catch (error) {
    console.error("Error creating todo:", error)
    throw new Error("Failed to create todo.")
  }
}

const updateTodoAction = async (userId, todoId, item) => {
  try {
    await updateTodo(userId, todoId, item)
  } catch (error) {
    console.error("Error updating todo:", error)
    throw new Error("Failed to update todo.")
  }
}

const deleteTodoAction = async (userId, todoId) => {
  try {
    await deleteTodo(userId, todoId)
  } catch (error) {
    console.error("Error deleting todo:", error)
    throw new Error("Failed to delete todo.")
  }
}

const uploadImageAction = async (todoId, image) => {
  try {
    const imageId = uuidv4()

    const { presignedUrl, imageUrl } = await generateImageUrl(imageId)

    const newImage = {
      todoId,
      imageId,
      imageUrl,
      timestamp: new Date().toISOString()
    }

    await updateTodoImage(todoId, newImage.imageUrl)

    return { presignedUrl, imageUrl }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image.")
  }
}

const generateImageUrlAction = async (userId, todoId) => {
  try {
    const imageId = uuidv4()

    const { presignedUrl, imageUrl } = await generateImageUrl(imageId)

    await updateTodoImage(userId, todoId, imageUrl)

    return presignedUrl
  } catch (error) {
    console.error("Error generating image URL:", error)
    throw new Error("Failed to generate image URL.")
  }
}

export {
  getTodosAction,
  createTodoAction,
  updateTodoAction,
  deleteTodoAction,
  uploadImageAction,
  generateImageUrlAction
}
