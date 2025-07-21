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
  const {
    toast
  } = useToast();
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
  const budgetRanges = [{
    value: 'under-1000',
    label: 'Under $1,000'
  }, {
    value: '1000-5000',
    label: '$1,000 - $5,000'
  }, {
    value: '5000-10000',
    label: '$5,000 - $10,000'
  }, {
    value: 'over-10000',
    label: 'Over $10,000'
  }];
  const desiredFeatures = ['QR Code Menus', 'Multi-language Support', 'Online Ordering', 'Customer Reviews', 'Analytics Dashboard', 'Social Media Integration', 'Custom Branding', 'Mobile App'];
  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked ? [...prev.features, feature] : prev.features.filter(f => f !== feature)
    }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://zijfbnubzfonpxngmqqz.supabase.co/functions/v1/submit-contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          restaurantName: formData.restaurantName,
          budget: formData.budget,
          numberOfTables: formData.numberOfTables,
          currentMenuType: formData.currentMenuType,
          features: formData.features,
          additionalInfo: formData.additionalInfo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Thank you for your interest!",
          description: "We've received your submission and will get back to you within 24 hours with a personalized quote."
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          restaurantName: '',
          budget: '',
          numberOfTables: '',
          currentMenuType: '',
          features: [],
          additionalInfo: ''
        });
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your form. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background">
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
          <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" style={{
          filter: 'drop-shadow(0 0 15px hsl(var(--primary) / 0.3))'
        }} />
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
                    <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))} required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))} required className="bg-background/50" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name *</Label>
                    <Input id="restaurantName" value={formData.restaurantName} onChange={e => setFormData(prev => ({
                    ...prev,
                    restaurantName: e.target.value
                  }))} required className="bg-background/50" />
                  </div>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Restaurant Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Estimated Budget *</Label>
                    <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberOfTables">Number of Tables *</Label>
                    <Input 
                      id="numberOfTables" 
                      type="number" 
                      value={formData.numberOfTables} 
                      onChange={e => setFormData(prev => ({ ...prev, numberOfTables: e.target.value }))} 
                      required 
                      className="bg-background/50" 
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Menu Type *</Label>
                  <RadioGroup 
                    value={formData.currentMenuType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currentMenuType: value }))}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physical" id="physical" />
                      <Label htmlFor="physical">Physical Menu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="basic-digital" id="basic-digital" />
                      <Label htmlFor="basic-digital">Basic Digital</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced-digital" id="advanced-digital" />
                      <Label htmlFor="advanced-digital">Advanced Digital</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Desired Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {desiredFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={formData.features.includes(feature)}
                        onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor={feature}>{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Tell us more about your specific needs</Label>
                  <Textarea 
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={e => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Any specific requirements, current challenges, or questions you'd like us to address..."
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300" 
                style={{
                  boxShadow: 'var(--glow-primary)'
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Get My Custom Quote'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Contact;