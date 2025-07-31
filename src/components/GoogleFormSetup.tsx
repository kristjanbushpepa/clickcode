
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GoogleFormSetup = () => {
  const { toast } = useToast();

  const appsScriptCode = `function onFormSubmit(e) {
  try {
    const responses = e.values;
    const timestamp = responses[0];
    const name = responses[1];
    const email = responses[2];
    const phone = responses[3];
    const date = responses[4];
    const time = responses[5];
    const restaurantName = responses[6] || 'Not specified';
    const additionalInfo = responses[7] || 'None';
    
    // Send email notification
    const subject = 'New Demo Booking Request';
    const body = \`
New demo booking received:

Name: \${name}
Email: \${email}
Phone: \${phone}
Restaurant: \${restaurantName}
Date: \${date}
Time: \${time}
Additional Info: \${additionalInfo}

Submitted at: \${timestamp}
\`;
    
    // Send to admin email (replace with your email)
    GmailApp.sendEmail('your-admin-email@gmail.com', subject, body);
    
    // Create Google Calendar event
    createCalendarEvent(name, email, date, time, restaurantName, additionalInfo);
    
    // Send confirmation email to customer
    sendConfirmationEmail(name, email, date, time);
    
  } catch (error) {
    console.error('Error processing form submission:', error);
  }
}

function createCalendarEvent(name, email, date, time, restaurantName, additionalInfo) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    
    // Parse date and time
    const eventDate = new Date(date + ' ' + time);
    const endDate = new Date(eventDate.getTime() + (60 * 60 * 1000)); // 1 hour duration
    
    const title = \`Demo: \${name} - \${restaurantName}\`;
    const description = \`
Demo booking details:
- Customer: \${name}
- Email: \${email}
- Restaurant: \${restaurantName}
- Additional Info: \${additionalInfo}
\`;
    
    calendar.createEvent(title, eventDate, endDate, {
      description: description,
      guests: email,
      sendInvites: true
    });
    
    console.log('Calendar event created successfully');
  } catch (error) {
    console.error('Error creating calendar event:', error);
  }
}

function sendConfirmationEmail(name, email, date, time) {
  try {
    const subject = 'Demo Booking Confirmation - Click Code';
    const body = \`
Dear \${name},

Thank you for scheduling a demo with Click Code!

Your demo is confirmed for:
Date: \${date}
Time: \${time}

We'll contact you shortly to confirm the details and send you the meeting link.

If you need to make any changes, please reply to this email.

Best regards,
Click Code Team
\`;
    
    GmailApp.sendEmail(email, subject, body);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Form Setup Guide</CardTitle>
          <CardDescription>
            Follow these steps to set up instant notifications and calendar integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Create Google Form</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Forms</a></li>
              <li>Create a new form titled "Demo Booking Requests"</li>
              <li>Add these fields in exact order:</li>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Full Name (Short answer, Required)</li>
                <li>Email Address (Short answer, Required)</li>
                <li>Phone Number (Short answer, Required)</li>
                <li>Preferred Date (Short answer, Required)</li>
                <li>Preferred Time (Short answer, Required)</li>
                <li>Restaurant Name (Short answer, Optional)</li>
                <li>Additional Information (Paragraph, Optional)</li>
              </ul>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Get Form Details</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Send" button in your form</li>
              <li>Copy the form URL (it should end with /viewform)</li>
              <li>Replace "/viewform" with "/formResponse" in the URL</li>
              <li>Right-click each field → "Inspect" → find the "name" attribute (e.g., "entry.123456789")</li>
              <li>Update the FORM_FIELDS object in CalendarBooking.tsx with these entry IDs</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Set Up Apps Script</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In your Google Form, click the three dots → "Script editor"</li>
              <li>Delete the default code and paste the script below</li>
              <li>Replace 'your-admin-email@gmail.com' with your actual email</li>
              <li>Save the script (Ctrl+S)</li>
            </ol>
            
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                <code>{appsScriptCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(appsScriptCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 4: Set Up Trigger</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In Apps Script, click "Triggers" (clock icon) in the left sidebar</li>
              <li>Click "+ Add Trigger"</li>
              <li>Configure:
                <ul className="list-disc list-inside ml-4">
                  <li>Function: onFormSubmit</li>
                  <li>Event source: From form</li>
                  <li>Event type: On form submit</li>
                </ul>
              </li>
              <li>Click "Save" and authorize the permissions</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 5: Update Configuration</h3>
            <p className="text-sm">
              Update the GOOGLE_FORM_URL and FORM_FIELDS in CalendarBooking.tsx with your form's details.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">What You'll Get:</h4>
            <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
              <li>Instant email notifications when someone books a demo</li>
              <li>Automatic Google Calendar events created</li>
              <li>Confirmation emails sent to customers</li>
              <li>All booking data stored in Google Sheets</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleFormSetup;
