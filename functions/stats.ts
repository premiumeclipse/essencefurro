import { Handler } from '@netlify/functions';
import { storage } from '../server/storage';

// Get stats handler
export const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === 'GET') {
      const stats = await storage.getBotStats();
      return {
        statusCode: 200,
        body: JSON.stringify(stats),
      };
    } else if (event.httpMethod === 'POST' && event.body) {
      const currentStats = await storage.getBotStats();
      const body = JSON.parse(event.body);
      
      // Only update the fields that are provided
      const updatedStats = {
        ...currentStats,
        ...body
      };
      
      // Update stats in storage
      const newStats = await storage.updateBotStats(updatedStats);
      
      return {
        statusCode: 200,
        body: JSON.stringify(newStats),
      };
    }
    
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error handling stats:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to handle stats request' }),
    };
  }
};