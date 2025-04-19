import { createTodo } from '../../businessLogic/todos.mjs'

export async function handler(event) {
  const newTodo = JSON.parse(event.body)

  try {
    const createdTodo = await createTodo(newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: createdTodo
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (error) {
    console.error('Error creating TODO item:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Could not create the TODO item'
      })
    }
  }
}
