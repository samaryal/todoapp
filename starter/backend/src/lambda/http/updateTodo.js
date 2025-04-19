import { DynamoDB } from 'aws-sdk';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('updateTodo');

const dynamoDb = new DynamoDB.DocumentClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const updatedTodo = JSON.parse(event.body);

  const userId = event.requestContext.authorizer.principalId;

  const params = {
    TableName: TODOS_TABLE,
    Key: {
      userId: userId,  
      todoId: todoId   
    },
    UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#dueDate': 'dueDate',
      '#done': 'done'
    },
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    },
    ReturnValues: 'ALL_NEW'  
  };

  try {
    const result = await dynamoDb.update(params).promise();
    
    logger.info('Updated Todo', { todoId, result });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Todo updated successfully',
        updatedTodo: result.Attributes
      })
    };
  } catch (error) {
    logger.error('Error updating Todo', { error });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update Todo',
        error: error.message
      })
   
    };
  }
}
