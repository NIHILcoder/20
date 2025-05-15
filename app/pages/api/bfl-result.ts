// pages/api/bfl-result.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { BFL_API_BASE_URL, API_KEY } from '@/lib/bfl-config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    const response = await axios.get(
      `${BFL_API_BASE_URL}/v1/get_result?id=${id}`,
      {
        headers: {
          'x-key': API_KEY
        }
      }
    );
    
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to BFL API:', error);
    
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