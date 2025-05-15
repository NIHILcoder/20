// pages/api/bfl-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { BFL_API_BASE_URL, API_KEY } from '@/lib/bfl-config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { endpoint, params } = req.body;
    
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
    
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to BFL API:', error);
    
    // Передаем ошибку клиенту с тем же статусом
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}