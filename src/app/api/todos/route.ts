import { NextRequest, NextResponse } from 'next/server';
import { saveTodoToDynamoDB, loadTodosFromDynamoDB } from '../../../utils/todoService';
import { generateUUID } from '../../../utils/uuid';
import { validateTodo } from '../../../utils/validation';
import { publishNotification } from '../../../utils/snsService';

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
    
    // 通知送信（非同期、エラーでもTodo作成は成功）
    publishNotification({
      subject: '新しいタスクが追加されました',
      message: `タスク: ${newTodo.text}\n作成日時: ${newTodo.createdAt.toLocaleString('ja-JP')}`,
    }).catch(error => {
      console.error('Failed to send notification:', error);
    });
    
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}