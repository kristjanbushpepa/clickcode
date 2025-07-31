
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface AddRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddRestaurantDialog: React.FC<AddRestaurantDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    owner_full_name: '',
    owner_email: '',
    owner_phone: '',
    business_registration_number: '',
    business_registration_country: '',
    supabase_url: '',
    supabase_anon_key: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('restaurants')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast({
        title: "Success",
        description: "Restaurant added successfully",
      });
      onOpenChange(false);
      setFormData({
        name: '',
        owner_full_name: '',
        owner_email: '',
        owner_phone: '',
        business_registration_number: '',
        business_registration_country: '',
        supabase_url: '',
        supabase_anon_key: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add restaurant",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Register a new restaurant in the digital menu management system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Restaurant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_full_name">Full Name *</Label>
                <Input
                  id="owner_full_name"
                  value={formData.owner_full_name}
                  onChange={(e) => handleInputChange('owner_full_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_email">Email *</Label>
                <Input
                  id="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone">Phone</Label>
                <Input
                  id="owner_phone"
                  value={formData.owner_phone}
                  onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Business Registration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Registration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_registration_number">Registration Number</Label>
                <Input
                  id="business_registration_number"
                  value={formData.business_registration_number}
                  onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_registration_country">Registration Country</Label>
                <Input
                  id="business_registration_country"
                  value={formData.business_registration_country}
                  onChange={(e) => handleInputChange('business_registration_country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Supabase Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Supabase Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabase_url">Supabase URL *</Label>
                <Input
                  id="supabase_url"
                  value={formData.supabase_url}
                  onChange={(e) => handleInputChange('supabase_url', e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase_anon_key">Supabase Anon Key *</Label>
                <Textarea
                  id="supabase_anon_key"
                  value={formData.supabase_anon_key}
                  onChange={(e) => handleInputChange('supabase_anon_key', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Restaurant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRestaurantDialog;
