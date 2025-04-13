import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Twilio } from 'npm:twilio@4.22.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherAlert {
  id: string;
  user_id: string;
  location: string;
  condition: string;
  method: string;
  user: {
    email: string;
    phone_number: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const twilio = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID') ?? '',
      Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
    );

    // Fetch all active alerts with user information
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select(`
        id,
        user_id,
        location,
        condition,
        method,
        users (
          email,
          phone_number
        )
      `);

    if (alertsError) throw alertsError;

    for (const alert of (alerts as WeatherAlert[] || [])) {
      try {
        // Fetch current weather for the alert location
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${alert.location}&units=metric&appid=${Deno.env.get('OPENWEATHER_API_KEY')}`
        );
        
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.statusText}`);
        }
        
        const weatherData = await weatherResponse.json();

        // Parse the condition (e.g., "temperature above 30°C")
        const [metric, comparison, threshold] = alert.condition.split(' ');
        const currentTemp = weatherData.main.temp;
        const thresholdValue = parseFloat(threshold);

        // Check if condition is met
        const isConditionMet = comparison === 'above' 
          ? currentTemp > thresholdValue
          : currentTemp < thresholdValue;

        if (isConditionMet) {
          const message = `Weather Alert: Current temperature in ${alert.location} is ${currentTemp}°C (${alert.condition})`;

          if (alert.method === 'email' && alert.user?.email) {
            // Send email using SendGrid
            await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                personalizations: [{
                  to: [{ email: alert.user.email }],
                }],
                from: { email: 'alerts@weatherdashboard.com' },
                subject: `Weather Alert for ${alert.location}`,
                content: [{ type: 'text/plain', value: message }],
              }),
            });

            console.log(`Email sent to ${alert.user.email}`);
          } else if (alert.method === 'sms' && alert.user?.phone_number) {
            // Send SMS using Twilio
            await twilio.messages.create({
              body: message,
              to: alert.user.phone_number,
              from: Deno.env.get('TWILIO_PHONE_NUMBER'),
            });

            console.log(`SMS sent to ${alert.user.phone_number}`);
          }
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Alerts checked successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});