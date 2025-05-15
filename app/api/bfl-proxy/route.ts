// app/api/bfl-proxy/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { BFL_API_BASE_URL, API_KEY } from '@/lib/bfl-config';

export async function POST(request: Request) {
  try {
    const { endpoint, params } = await request.json();
    
    console.log('Отправка запроса на:', `${BFL_API_BASE_URL}${endpoint}`);
    console.log('С параметрами:', JSON.stringify(params));
    
    const response = await axios.post(
      `${BFL_API_BASE_URL}${endpoint}`,
      params,
      {
        headers: {
          'x-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to BFL API:', error);
    console.error('Запрос был отправлен на URL:', `${BFL_API_BASE_URL}${error.config?.url || ''}`);
    console.error('С данными:', JSON.stringify(error.config?.data || {}));
    
    // Передаем ошибку клиенту с тем же статусом
    if (error.response) {
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}