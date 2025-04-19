import { DynamoDB } from 'aws-sdk';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('getTodos');
const dynamoDb = new DynamoDB.DocumentClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  const userId = event.requestContext.authorizer.principalId;

  const params = {
    TableName: TODOS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    }
  };

  logger.info('Request received to fetch todos for userId', { userId });

  try {
    const result = await dynamoDb.query(params).promise();
    
    logger.info('Fetched Todos successfully', { userId, result });

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items
      })
    };
  } catch (error) {
    logger.error('Error fetching Todos from DynamoDB', { error });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch Todos',
        error: error.message
      })
    };
  }
}
