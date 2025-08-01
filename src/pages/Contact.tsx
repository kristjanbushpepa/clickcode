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
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';
const Contact = () => {
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
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
    label: t('budget.under_1000')
  }, {
    value: '1000-5000',
    label: t('budget.1000_5000')
  }, {
    value: '5000-10000',
    label: t('budget.5000_10000')
  }, {
    value: 'over-10000',
    label: t('budget.over_10000')
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
          'Content-Type': 'application/json'
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
          additionalInfo: formData.additionalInfo
        })
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: t('toast.success_title'),
          description: t('toast.success_desc')
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
        title: t('toast.error_title'),
        description: t('toast.error_desc'),
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
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('contact.back_to_home')}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" style={{
          filter: 'drop-shadow(0 0 15px hsl(var(--primary) / 0.3))'
        }} />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('contact.get_in_touch')}
          </h1>
        </div>

        {/* Contact Information */}
        <div className="flex justify-center">
          <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-8 max-w-lg shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium text-foreground">clickcodemenu@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <div className="space-y-1">
                    <p className="text-lg font-medium text-foreground">+355 68 587 0595</p>
                    <p className="text-lg font-medium text-foreground">+355 68 243 8222</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>;
};
export default Contact;