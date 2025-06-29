// app/api/bfl-result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BFL_API_BASE_URL, API_KEY } from '@/lib/bfl-config';

export async function GET(request: NextRequest) {
    try {
      const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }
    
    const response = await axios.get(
        `${BFL_API_BASE_URL}/v1/get_result?id=${id}`,
        {
          headers: {
            'x-key': API_KEY
          }
        }
      );
    
      console.log('Полный ответ от BFL API:', JSON.stringify(response.data, null, 2));
    
      return NextResponse.json(response.data);
    } catch (error: any) {  
    console.error('Error proxying request to BFL API:', error);
    
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