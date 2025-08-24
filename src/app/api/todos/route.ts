import { NextRequest, NextResponse } from 'next/server';
import { saveTodoToDynamoDB, loadTodosFromDynamoDB } from '../../../utils/todoService';
import { generateUUID } from '../../../utils/uuid';
import { validateTodo } from '../../../utils/validation';

export async function GET() {
  try {
    const todos = await loadTodosFromDynamoDB();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to load todos:', error);
    return NextResponse.json({ error: 'Failed to load todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    const validationError = validateTodo(text, []);
    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }

    const newTodo = {
      id: generateUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
    };

    await saveTodoToDynamoDB(newTodo);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}