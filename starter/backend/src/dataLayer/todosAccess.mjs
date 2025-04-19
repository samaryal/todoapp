import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export async function createTodoItem(newTodo, userId) {
  const todoId = uuid.v4();
  const createdAt = new Date().toISOString();

  const params = {
    TableName: TODOS_TABLE,
    Item: {
      todoId,
      userId,
      createdAt,
      name: newTodo.name,
      dueDate: newTodo.dueDate,
      done: false,
      attachmentUrl: newTodo.attachmentUrl || null,
    },
  };

  await dynamoDb.put(params).promise();
  return params.Item;
}

export async function getTodosByUserId(userId) {
  const params = {
    TableName: TODOS_TABLE,
    IndexName: process.env.TODOS_CREATED_AT_INDEX,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const result = await dynamoDb.query(params).promise();
  return result.Items;
}

export async function updateTodoItem(todoId, updatedTodo, userId) {
  const params = {
    TableName: TODOS_TABLE,
    Key: { userId, todoId },
    UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done,
    },
    ReturnValues: 'ALL_NEW',
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
}

export async function deleteTodoItem(todoId, userId) {
  const params = {
    TableName: TODOS_TABLE,
    Key: { userId, todoId },
  };

  await dynamoDb.delete(params).promise();
}
