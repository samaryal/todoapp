import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

const dynamoDB = new DynamoDB()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDB)
const dynamodbClient = DynamoDBDocument.from(dynamoDbXRay)

const todosTable = process.env.TODOS_TABLE
const todosByUserIndexTable = process.env.TODOS_BY_USER_INDEX

const getTodos = async (userId) => {
  try {
    const result = await dynamodbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :id',
      ExpressionAttributeValues: {
        ':id': userId
      },
      ScanIndexForward: false
    })
    console.log('Fetched todos:', result.Items)
    return result.Items || []
  } catch (error) {
    console.error('Failed to fetch todos for user:', userId, error)
    throw new Error('Failed to get todos')
  }
}

const createTodo = async (item) => {
  try {
    await dynamodbClient.put({
      TableName: todosTable,
      Item: item
    })
    console.log('Created todo:', item)
    return item
  } catch (error) {
    console.error('Failed to create todo:', item, error)
    throw new Error('Failed to create todo')
  }
}

const checkHasExistedTodo = async (userId, name) => {
  try {
    const result = await dynamodbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :i',
      FilterExpression: 'name = :name',
      ExpressionAttributeValues: {
        ':i': userId,
        ':name': name
      },
      ScanIndexForward: false
    })
    console.log('Checked if todo exists:', { userId, name }, 'Result:', result.Items)
    return result.Items && result.Items.length > 0
  } catch (error) {
    console.error('Failed to check if todo exists for user:', userId, 'with name:', name, error)
    throw new Error('Failed to check todo existence')
  }
}

const updateTodo = async (userId, todoId, item) => {
  try {
    await dynamodbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': item.name,
        ':dueDate': item.dueDate,
        ':done': item.done
      }
    })
    console.log('Updated todo:', { userId, todoId, updated: item })
  } catch (error) {
    console.error('Failed to update todo:', { userId, todoId, item }, error)
    throw new Error('Failed to update todo')
  }
}

const deleteTodo = async (userId, todoId) => {
  try {
    await dynamodbClient.delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })
    console.log('Deleted todo:', { userId, todoId })
  } catch (error) {
    console.error('Failed to delete todo:', { userId, todoId }, error)
    throw new Error('Failed to delete todo')
  }
}

const updateTodoImage = async (userId, todoId, uploadUrl) => {
  try {
    await dynamodbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': uploadUrl
      }
    })
    console.log('Updated image URL for todo:', { userId, todoId, uploadUrl })
  } catch (error) {
    console.error('Failed to update image URL for todo:', { userId, todoId }, error)
    throw new Error('Failed to update todo image')
  }
}

export {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoImage,
  checkHasExistedTodo
}
