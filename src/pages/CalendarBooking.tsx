
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Phone, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const CalendarBooking = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Form configuration
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
  const FORM_FIELDS = {
    name: 'entry.123456789',
    email: 'entry.987654321',
    phone: 'entry.456789123',
    date: 'entry.789123456',
    time: 'entry.321654987',
    restaurantName: 'entry.654321789',
    additionalInfo: 'entry.147258369'
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const submitToGoogleForm = async (data: any) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (FORM_FIELDS[key as keyof typeof FORM_FIELDS]) {
        formData.append(FORM_FIELDS[key as keyof typeof FORM_FIELDS], value as string);
      }
    });

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('Error submitting to Google Form:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "Both date and time are required to schedule your demo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Please fill required fields",
        description: "Name, email, and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const submissionData = {
      ...formData,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime
    };

    console.log('Submitting demo booking:', submissionData);

    const success = await submitToGoogleForm(submissionData);

    if (success) {
      toast({
        title: "Demo Scheduled Successfully!",
        description: `Your demo request has been submitted for ${format(selectedDate, 'PPP')} at ${selectedTime}. You'll receive a confirmation email shortly.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        restaurantName: '',
        additionalInfo: ''
      });
      setSelectedDate(undefined);
      setSelectedTime('');
    } else {
      toast({
        title: "Submission Error",
        description: "There was an issue submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <CalendarIcon className="h-16 w-16 text-primary mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 15px hsl(var(--primary) / 0.3))' }} />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Schedule Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Demo</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Book a personalized demo session to see how Click Code can transform your restaurant's digital presence.
          </p>
        </div>

        {/* Setup Instructions Card */}
        <Card className="max-w-4xl mx-auto mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <ExternalLink className="h-5 w-5 mr-2" />
              Google Form Setup Required
            </CardTitle>
            <CardDescription className="text-blue-600">
              To receive instant notifications, you need to set up a Google Form first.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-2">
              <strong>Current Status:</strong> Form submissions will be logged to console until Google Form is configured.
            </p>
            <p>
              Please check the browser console or contact your administrator to complete the Google Form integration.
            </p>
          </CardContent>
        </Card>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <Card className="bg-card/80 backdrop-blur-md border border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Select Date & Time</CardTitle>
              <CardDescription>Choose your preferred date and time slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  className="rounded-md border border-border"
                />
              </div>
              
              {selectedDate && (
                <div className="space-y-3">
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information Form */}
          <Card className="bg-card/80 backdrop-blur-md border border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Contact Information</CardTitle>
              <CardDescription>We'll use this to confirm your demo session</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="bg-background/50 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="bg-background/50 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                    className="bg-background/50"
                    placeholder="Any specific questions or requirements for the demo..."
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Schedule Demo'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarBooking;
