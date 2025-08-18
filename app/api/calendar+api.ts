import { ServerCalendarService } from '@/lib/services/calendar/calendarServerService';
import { CalendarServiceResponse } from '@/types/Calendar.types';
import { BusyTimeSlot } from '@/types/Calendar.types';
const calendarService = ServerCalendarService.getInstance();

const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const calendarId = url.searchParams.get('calendarId') || 'primary';

  if (!date || typeof date !== 'string') {
    return Response.json(
      { success: false, error: 'Date parameter is required' }, 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const busySlots: CalendarServiceResponse<BusyTimeSlot[]> = await calendarService.fetchBusySlots(date, calendarId);
    return Response.json(
      busySlots,
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching busy slots:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch busy slots' 
      }, 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json(
        { 
          success: false, 
          error: 'Invalid JSON payload' 
        }, 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { summary, startTime, endTime, options, attendeeEmail, description } = body;
    
    if (!summary || !startTime || !endTime || !attendeeEmail) {
      return jsonResponse(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Please provide summary, startTime, endTime, attendeeEmail'
        },
        400
      );
    }

    const result = await calendarService.createCalendarEvent(
      summary, 
      startTime, 
      endTime, 
      attendeeEmail,
      options || {},
      description
    );

    if (!result.success) {
      console.error('Failed to create event:', result.message);
      return jsonResponse(
        { 
          success: false,
          error: result.message || 'Failed to create event',
          message: result.message || 'Failed to create calendar event'
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      message: result.message || 'Event created successfully',
      data: { 
        summary, 
        startTime, 
        endTime, 
        eventId: result.eventId,
        htmlLink: result.htmlLink
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
    console.error('Error creating calendar event:', error);
    return jsonResponse(
      { 
        success: false,
        error: errorMessage,
        message: 'Failed to create calendar event',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      500
    );
  }
};
