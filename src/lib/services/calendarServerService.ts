import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { BusyTimeSlot, ICalendarService, GoogleCredentials, CALENDAR_SCOPES } from '@/types/Calendar';
import { EmailService } from './email/EmailService';

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
      // Log which environment variables are present (without values for security)
      const envVars = [
        'GOOGLE_PROJECT_ID',
        'GOOGLE_PRIVATE_KEY',
        'GOOGLE_CLIENT_EMAIL',
        'GOOGLE_PRIVATE_KEY_ID',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_CERT_URL',
        'GOOGLE_ADMIN_EMAIL'
      ];
      
      const presentVars = envVars.filter(varName => {
        const isPresent = !!process.env[varName];
        console.log(`Env var ${varName} is ${isPresent ? 'present' : 'missing'}`);
        return isPresent;
      });

      // Validate required environment variables
      const requiredVars = ['GOOGLE_PROJECT_ID', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CLIENT_EMAIL'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Create credentials object
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

      console.log('Attempting to authenticate with service account:', {
        client_email: credentials.client_email,
        has_private_key: !!credentials.private_key,
        scopes: CALENDAR_SCOPES,
        using_impersonation: !!process.env.GOOGLE_ADMIN_EMAIL
      });

      const auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: CALENDAR_SCOPES,
        //subject: process.env.GOOGLE_ADMIN_EMAIL || undefined
      });

      try {
        await auth.authorize();
        console.log('Successfully authenticated with Google API');
        return auth;
      } catch (error) {
        const authError = error as Error & { response?: { data?: unknown } };
        console.error('Failed to authorize with Google API:', {
          error: authError,
          message: authError.message,
          stack: authError.stack,
          response: authError.response?.data
        });
        throw new Error(`Failed to authorize with Google API: ${authError.message}`);
      }
    } catch (error) {
      const typedError = error as Error;
      console.error('Error in getAuthClient:', {
        error: typedError,
        message: typedError.message,
        stack: typedError.stack
      });
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
    attendeeEmail: string,
    options: {
      sendEmail?: boolean;
      locale?: string;
      organizerName?: string;
      organizerEmail?: string;
    },
    calendarId: string = 'primary',
    description?: string,
  ): Promise<{ 
    success: boolean; 
    message?: string; 
    eventId?: string; 
    htmlLink?: string | null;
    meetLink?: string;
    details?: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.calendar) {
        throw new Error('Calendar client not initialized');
      }

      console.log('Creating calendar event with Google Meet');
      
      const event = {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        /* attendees: [
          {
            email: attendeeEmail,
            responseStatus: 'accepted',
            organizer: false,
            self: false
          },
        ], */
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 }
          ]
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true
      };

      let response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
        sendUpdates: 'all',
        conferenceDataVersion: 0,
        sendNotifications: true,
      });

      if (!response.data.id) {
        throw new Error('Failed to create calendar event');
      }

      try {
        response = await this.calendar.events.patch({
          calendarId,
          eventId: response.data.id,
          requestBody: {
            conferenceData: {
              createRequest: {
                requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          },
          conferenceDataVersion: 0,
          sendUpdates: 'all'
        });

        if (!response.data.id) {
          throw new Error('Event was created but no event ID was returned');
        }

        const meetLink = (response.data.hangoutLink || 
          (response.data.conferenceData?.entryPoints?.find(
            (ep: any) => ep.entryPointType === 'video' || ep.entryPointType === 'more'
          )?.uri)) ?? undefined;

        console.log('Event created successfully' + (meetLink ? ' with Google Meet' : ''));

        const result = { 
          success: true, 
          message: 'Event created successfully' + (meetLink ? ' with Google Meet' : ''),
          eventId: response.data.id,
          htmlLink: response.data.htmlLink ? String(response.data.htmlLink) : undefined,
          meetLink
        };

        if (result.success) {
          try {
            const emailService = EmailService.getInstance();
            await emailService.sendCalendarEventConfirmation(
              attendeeEmail,
              {
                title: summary,
                startTime,
                endTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                description,
                location: meetLink || '',
                organizer: options.organizerName && options.organizerEmail ? {
                  name: options.organizerName,
                  email: options.organizerEmail
                } : undefined
              },
              options.locale || 'en'
            );
            console.log('Confirmation email sent to', attendeeEmail);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the whole operation if email sending fails
            result.message += ' (but failed to send confirmation email)';
          }
        }

        return result;
      } catch (conferenceError) {
        console.error('Error adding Google Meet to event:', conferenceError);
        return { 
          success: true, 
          message: 'Event created but failed to add Google Meet. You can add it manually later.',
          eventId: response?.data?.id ? String(response.data.id) : undefined,
          htmlLink: response?.data?.htmlLink ? String(response.data.htmlLink) : undefined,
          details: 'Google Meet creation failed but event was created successfully'
        };
      }
    } catch (error) {
      console.error('Error in createCalendarEvent:', error);
      let userFriendlyMessage = 'Failed to create calendar event';
      let errorDetails = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid conference type value')) {
          userFriendlyMessage = 'Failed to create Google Meet conference. Please check your Google Workspace settings.';
        } else if (error.message.includes('conferenceData')) {
          userFriendlyMessage = 'Error setting up video conference. The event was created without a meeting link.';
        } else {
          userFriendlyMessage = error.message;
        }
      }
      
      console.error('Event creation failed:', {
        error: errorDetails,
        userFriendlyMessage,
        request: { summary, startTime, endTime, calendarId }
      });
      
      return { 
        success: false, 
        message: userFriendlyMessage,
        details: errorDetails
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
