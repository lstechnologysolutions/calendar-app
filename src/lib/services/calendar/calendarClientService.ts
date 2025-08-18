import { BusyTimeSlot, ICalendarService, API_BASE_URL, CalendarServiceResponse } from '@/types/Calendar.types';

class ClientCalendarService implements ICalendarService {
  private static instance: ClientCalendarService;
  private constructor() {}

  public static getInstance(): ClientCalendarService {
    if (!ClientCalendarService.instance) {
      ClientCalendarService.instance = new ClientCalendarService();
    }
    return ClientCalendarService.instance;
  }

  public async fetchBusySlots(date: string, calendarId: string): Promise<CalendarServiceResponse<BusyTimeSlot[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}?date=${date}&calendarId=${encodeURIComponent(calendarId)}`);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from server:', text);
        return {
          success: false,
          error: 'Invalid response from server',
          data: this.getMockBusySlots(date)
        };
      }

      const responseData = await response.json();
      
      if (!response.ok || !responseData.success) {
        const errorMessage = responseData?.error || responseData?.message || `Failed to fetch busy slots: ${response.statusText}`;
        console.error('Error response from server:', responseData);
        return {
          success: false,
          error: errorMessage,
          data: this.getMockBusySlots(date)
        };
      }

      return {
        success: true,
        data: responseData.data || []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching busy slots';
      console.error('Error in fetchBusySlots (client):', error);
      return {
        success: false,
        error: errorMessage,
        data: this.getMockBusySlots(date)
      };
    }
  }

  public async createCalendarEvent(
    summary: string,
    startTime: string,
    endTime: string,
    attendeeEmail: string,
    options: {
      sendEmail?: boolean;
      locale?: string;
      organizerName?: string;
      organizerEmail?: string;
      customerDetails?: {
        customer: {
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
        };
        service: string;
        notes: string;
      };
      calendarId: string;
    },
    description?: string,
  ): Promise<CalendarServiceResponse<{ eventId?: string; htmlLink?: string }>> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          summary,
          startTime,
          endTime,
          attendeeEmail,
          options,
          description
        }),
      });

      // First check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from server');
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Failed to create event: ${response.statusText}`;
        console.error('Error response:', responseData);
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: responseData.message || 'Event created successfully',
        data: {
          eventId: responseData.data?.eventId,
          htmlLink: responseData.data?.htmlLink
        }
      };
    } catch (error) {
      console.error('Error in createCalendarEvent (client):', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create calendar event';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    }
  }

  public getMockBusySlots(date: string): BusyTimeSlot[] {
    return [
      {
        start: `${date}T09:00:00-05:00`,
        end: `${date}T10:30:00-05:00`
      },
      {
        start: `${date}T14:00:00-05:00`,
        end: `${date}T15:30:00-05:00`
      }
    ];
  }
}

export { ClientCalendarService };
