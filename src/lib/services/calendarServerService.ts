import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { BusyTimeSlot, ICalendarService, GoogleCredentials, CALENDAR_SCOPES } from '@/types/Calendar';

class ServerCalendarService implements ICalendarService {
  private static instance: ServerCalendarService;
  private calendar: calendar_v3.Calendar | null = null;
  private isInitialized = false;
  private initializationError: Error | null = null;

  private constructor() {}

  public static getInstance(): ServerCalendarService {
    if (!ServerCalendarService.instance) {
      ServerCalendarService.instance = new ServerCalendarService();
      // Initialize immediately when getting the instance
      ServerCalendarService.instance.initialize().catch(error => {
        console.error('Error during service initialization:', error);
      });
    }
    return ServerCalendarService.instance;
  }

  public getInitializationStatus() {
    return {
      isInitialized: this.isInitialized,
      error: this.initializationError,
      errorMessage: this.initializationError?.message || null
    };
  }

  public async initialize(): Promise<{ success: boolean; error?: Error }> {
    if (this.isInitialized) return { success: true };

    try {
      const auth = await this.getAuthClient();
      this.calendar = google.calendar({ version: 'v3', auth });
      this.isInitialized = true;
      this.initializationError = null;
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during initialization';
      console.error('Failed to initialize ServerCalendarService:', error);
      this.initializationError = error instanceof Error ? error : new Error(errorMessage);
      return { 
        success: false, 
        error: this.initializationError 
      };
    }
  }

  private async getAuthClient(): Promise<JWT> {
    try {
      const credentials: GoogleCredentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID || '',
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
        private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/gm, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || '',
        universe_domain: 'googleapis.com'
      };

      // Validate required environment variables
      const requiredVars = ['GOOGLE_PROJECT_ID', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CLIENT_EMAIL'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      const auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: CALENDAR_SCOPES,
      });

      await auth.authorize();
      return auth;
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      throw error;
    }
  }

  public async fetchBusySlots(date: string, calendarId: string = 'primary'): Promise<{ success: boolean; data?: BusyTimeSlot[]; error?: string }> {
    if (!this.isInitialized) {
      const { success, error } = await this.initialize();
      if (!success) {
        console.error('Failed to initialize calendar service:', error?.message);
        return { 
          success: false, 
          error: 'Failed to initialize calendar service. Please try again later or contact support.' 
        };
      }
    }

    try {
      if (!this.calendar) {
        const errorMsg = 'Calendar client not properly initialized';
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const timeMin = new Date(date);
      timeMin.setHours(0, 0, 0, 0);
      
      const timeMax = new Date(date);
      timeMax.setHours(23, 59, 59, 999);

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          timeZone: 'UTC',
          items: [{ id: calendarId }],
        },
      });

      const busySlots = response.data.calendars?.[calendarId]?.busy || [];
      if (busySlots.length === 0) {
        return { success: true, data: [] };
      }
      return { 
        success: true, 
        data: busySlots.map((slot) => ({
          start: slot.start || '',
          end: slot.end || ''
        }))
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error fetching busy slots';
      console.error('Error in fetchBusySlots (server):', error);
      return { 
        success: false, 
        error: errorMsg,
        data: this.getMockBusySlots(date) // Still return mock data but mark as error
      };
    }
  }

  public async createCalendarEvent(
    summary: string,
    startTime: string,
    endTime: string,
    calendarId: string = 'primary'
  ): Promise<{ success: boolean; message?: string; eventId?: string; htmlLink?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.calendar) {
        throw new Error('Calendar client not initialized');
      }

      const event = {
        summary,
        start: {
          dateTime: startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      console.log('Creating event with data:', { calendarId, event });
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      console.log('Google Calendar API response:', response.data);
      
      if (response.status === 200 && response.data) {
        return { 
          success: true, 
          message: 'Event created successfully',
          eventId: response.data.id || undefined,
          htmlLink: response.data.htmlLink || undefined
        };
      }
      
      return {
        success: false,
        message: 'Failed to create event: No data in response'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error creating calendar event (server):', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        request: { summary, startTime, endTime, calendarId }
      });
      return { 
        success: false, 
        message: `Failed to create event: ${errorMessage}`
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

export { ServerCalendarService };
