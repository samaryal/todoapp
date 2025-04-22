import { DynamoDB } from 'aws-sdk';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('updateTodo');

const dynamoDb = new DynamoDB.DocumentClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const updatedTodo = JSON.parse(event.body);

  const userId = event.requestContext.authorizer.principalId;

  // تحقق من وجود القيم المطلوبة في المدخلات
  if (!updatedTodo.name || !updatedTodo.dueDate || updatedTodo.done === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing required fields: name, dueDate, or done'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
      }
    };
  }

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
    
    // إذا لم تكن هناك قيم محدثة (إذا كان التو دو غير موجود)
    if (!result.Attributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Todo not found'
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
        }
      };
    }

    logger.info('Updated Todo', { todoId, result });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Todo updated successfully',
        updatedTodo: result.Attributes
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
      }
    };
  } catch (error) {
    // إذا كانت هناك مشكلة أثناء التحديث
    logger.error('Error updating Todo', { error });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update Todo',
        error: error.message
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
      }
    };
  }
}
