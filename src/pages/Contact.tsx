import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    budget: '',
    numberOfTables: '',
    currentMenuType: '',
    features: [] as string[],
    additionalInfo: ''
  });

  const budgetRanges = [
    { value: 'under-1000', label: 'Under $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: 'over-10000', label: 'Over $10,000' }
  ];

  const desiredFeatures = [
    'QR Code Menus',
    'Multi-language Support',
    'Online Ordering',
    'Customer Reviews',
    'Analytics Dashboard',
    'Social Media Integration',
    'Custom Branding',
    'Mobile App'
  ];

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create Google Forms URL with pre-filled data
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdKxVTg8ZXqN_example/formResponse";
    const params = new URLSearchParams({
      'entry.123456789': formData.name,
      'entry.987654321': formData.email,
      'entry.456789123': formData.phone,
      'entry.789123456': formData.restaurantName,
      'entry.321654987': formData.budget,
      'entry.654987321': formData.numberOfTables,
      'entry.147258369': formData.currentMenuType,
      'entry.258369147': formData.features.join(', '),
      'entry.369147258': formData.additionalInfo
    });

    // Open Google Form in new tab
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    
    toast({
      title: "Thank you for your interest!",
      description: "We'll get back to you within 24 hours with a personalized quote.",
    });
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
          <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 15px hsl(var(--primary) / 0.3))' }} />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Us for <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get a personalized quote based on your restaurant's specific needs. 
            Fill out this quick questionnaire and we'll get back to you within 24 hours.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-md border border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Restaurant Information Questionnaire</CardTitle>
            <CardDescription className="text-center">
              Help us understand your needs so we can provide the best solution for your restaurant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
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
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name *</Label>
                    <Input
                      id="restaurantName"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Restaurant Details</h3>
                
                <div className="space-y-2">
                  <Label>What's your budget range for this project? *</Label>
                  <RadioGroup
                    value={formData.budget}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                    className="grid grid-cols-2 gap-4"
                  >
                    {budgetRanges.map((range) => (
                      <div key={range.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={range.value} id={range.value} />
                        <Label htmlFor={range.value} className="font-normal cursor-pointer">
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tables">How many tables does your restaurant have? *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfTables: value }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select number of tables" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 tables</SelectItem>
                        <SelectItem value="11-20">11-20 tables</SelectItem>
                        <SelectItem value="21-50">21-50 tables</SelectItem>
                        <SelectItem value="50+">50+ tables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentMenu">What type of menu do you currently use? *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, currentMenuType: value }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select current menu type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Physical/Paper menus only</SelectItem>
                        <SelectItem value="simple-digital">Simple digital menu</SelectItem>
                        <SelectItem value="qr-basic">Basic QR code menu</SelectItem>
                        <SelectItem value="none">No menu system yet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Desired Features</h3>
                <div className="space-y-2">
                  <Label>Which features are you most interested in? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {desiredFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={feature}
                          className="rounded border-border"
                          onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                        />
                        <Label htmlFor={feature} className="font-normal cursor-pointer">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Tell us more about your specific needs or requirements</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={4}
                    className="bg-background/50"
                    placeholder="Any specific customizations, integrations, or special requirements you have in mind..."
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ boxShadow: 'var(--glow-primary)' }}
              >
                <Send className="h-4 w-4 mr-2" />
                Get My Custom Quote
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;