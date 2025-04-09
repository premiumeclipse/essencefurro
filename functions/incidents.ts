import { Handler } from '@netlify/functions';

// For demonstration, we'll store incidents in memory
let incidents = [
  {
    id: 1,
    title: 'Database Connection Issues',
    description: 'Intermittent database connection issues affecting some user profile operations.',
    status: 'investigating',
    type: 'yellow',
    timestamp: 'April 9, 2025 - 03:25 AM UTC',
    public: true
  },
  {
    id: 2,
    title: 'API Rate Limiting Resolved',
    description: 'Previously experienced Discord API rate limiting issues have been resolved.',
    status: 'resolved',
    type: 'green',
    timestamp: 'April 9, 2025 - 02:15 AM UTC',
    public: true
  }
];

export const handler: Handler = async (event, context) => {
  try {
    // Get public incidents
    if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/incidents') {
      // Only return public incidents for regular users
      const publicIncidents = incidents.filter(incident => incident.public);
      return {
        statusCode: 200,
        body: JSON.stringify(publicIncidents),
      };
    }
    
    // Get all incidents (for admin)
    if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/incidents/all') {
      return {
        statusCode: 200,
        body: JSON.stringify(incidents),
      };
    }
    
    // Create new incident
    if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/incidents' && event.body) {
      const { title, description, status, type, public: isPublic } = JSON.parse(event.body);
      
      if (!title || !description) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Title and description are required" }),
        };
      }
      
      const timestamp = new Date();
      const formattedTimestamp = `${timestamp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')} AM UTC`;
      
      const newId = incidents.length > 0 ? Math.max(...incidents.map(inc => inc.id)) + 1 : 1;
      
      const newIncident = {
        id: newId,
        title,
        description,
        status: status || 'investigating',
        type: type || 'yellow',
        timestamp: formattedTimestamp,
        public: isPublic !== undefined ? isPublic : true
      };
      
      incidents = [newIncident, ...incidents];
      
      return {
        statusCode: 201,
        body: JSON.stringify(newIncident),
      };
    }
    
    // Update incident
    if (event.httpMethod === 'PATCH' && event.path.startsWith('/.netlify/functions/incidents/') && event.body) {
      const id = parseInt(event.path.split('/').pop() || '');
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid incident ID" }),
        };
      }
      
      const incidentIndex = incidents.findIndex(inc => inc.id === id);
      
      if (incidentIndex === -1) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Incident not found" }),
        };
      }
      
      const { status, type, public: isPublic } = JSON.parse(event.body);
      
      const timestamp = new Date();
      const formattedTimestamp = `${timestamp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')} AM UTC`;
      
      const updatedIncident = {
        ...incidents[incidentIndex],
        status: status || incidents[incidentIndex].status,
        type: type || incidents[incidentIndex].type,
        timestamp: formattedTimestamp,
        public: isPublic !== undefined ? isPublic : incidents[incidentIndex].public
      };
      
      incidents[incidentIndex] = updatedIncident;
      
      return {
        statusCode: 200,
        body: JSON.stringify(updatedIncident),
      };
    }
    
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Route not found' }),
    };
  } catch (error) {
    console.error('Error handling incidents:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to handle incident request' }),
    };
  }
};