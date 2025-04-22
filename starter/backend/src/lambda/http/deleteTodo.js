import { DynamoDB } from 'aws-sdk';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('deleteTodo');

const dynamoDb = new DynamoDB.DocumentClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  const todoId = event.pathParameters.todoId;

  const params = {
    TableName: TODOS_TABLE,
    Key: {
      todoId
    }
  };

  try {
    await dynamoDb.delete(params).promise();

    logger.info('Successfully deleted TODO item', { todoId });

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
      },
      body: ''
    };
  } catch (error) {
    logger.error('Error deleting TODO item', { error });

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
      },
      body: JSON.stringify({
        message: 'Failed to delete TODO item',
        error: error.message
      })
    };
  }
}
