
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, EyeOff, Languages, Utensils, Tag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  name_sq?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_sq?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  price: number;
  currency: string;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  preparation_time?: number;
  display_order: number;
}

export function MenuManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu_items', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('*').order('display_order');
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MenuItem[];
    }
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast({ title: 'Category created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast({ title: 'Category updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    }
  });

  // Menu item mutations
  const createItemMutation = useMutation({
    mutationFn: async (item: Partial<MenuItem>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      setShowItemDialog(false);
      setEditingItem(null);
      toast({ title: 'Menu item created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating menu item', description: error.message, variant: 'destructive' });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      setShowItemDialog(false);
      setEditingItem(null);
      toast({ title: 'Menu item updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating menu item', description: error.message, variant: 'destructive' });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast({ title: 'Menu item deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting menu item', description: error.message, variant: 'destructive' });
    }
  });

  const handleCategorySubmit = (formData: FormData) => {
    const categoryData: Partial<Category> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'on'
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ ...categoryData, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const handleItemSubmit = (formData: FormData) => {
    const itemData: Partial<MenuItem> = {
      category_id: formData.get('category_id') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      currency: formData.get('currency') as string || 'EUR',
      is_available: formData.get('is_available') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      allergens: (formData.get('allergens') as string)?.split(',').map(a => a.trim()).filter(Boolean) || [],
      preparation_time: parseInt(formData.get('preparation_time') as string) || undefined,
      display_order: parseInt(formData.get('display_order') as string) || 0
    };

    if (editingItem) {
      updateItemMutation.mutate({ ...itemData, id: editingItem.id });
    } else {
      createItemMutation.mutate(itemData);
    }
  };

  if (categoriesLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant's menu categories and items</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Tag className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <CategoryDialog
              category={editingCategory}
              onSubmit={handleCategorySubmit}
              onClose={() => setShowCategoryDialog(false)}
            />
          </Dialog>

          <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Utensils className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <MenuItemDialog
              item={editingItem}
              categories={categories}
              onSubmit={handleItemSubmit}
              onClose={() => setShowItemDialog(false)}
            />
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedCategory(null)}
            >
              All Items
            </Button>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Button
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="flex-1 justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                  {!category.is_active && <EyeOff className="h-4 w-4 ml-2" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingCategory(category);
                    setShowCategoryDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="lg:col-span-3 space-y-4">
          {itemsLoading ? (
            <div className="flex justify-center p-8">Loading menu items...</div>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your menu by adding your first item
                </p>
                <Button onClick={() => setShowItemDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  categories={categories}
                  onEdit={(item) => {
                    setEditingItem(item);
                    setShowItemDialog(true);
                  }}
                  onDelete={(id) => deleteItemMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Category Dialog Component
function CategoryDialog({ 
  category, 
  onSubmit, 
  onClose 
}: { 
  category: Category | null; 
  onSubmit: (data: FormData) => void; 
  onClose: () => void; 
}) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {category ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogDescription>
          {category ? 'Update category information' : 'Create a new menu category'}
        </DialogDescription>
      </DialogHeader>
      
      <form action={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (English)</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name || ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={category?.display_order || 0}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (English)</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={category?.description || ''}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            name="is_active"
            defaultChecked={category?.is_active ?? true}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {category ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Menu Item Dialog Component
function MenuItemDialog({ 
  item, 
  categories, 
  onSubmit, 
  onClose 
}: { 
  item: MenuItem | null; 
  categories: Category[]; 
  onSubmit: (data: FormData) => void; 
  onClose: () => void; 
}) {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {item ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <DialogDescription>
          {item ? 'Update menu item information' : 'Create a new menu item'}
        </DialogDescription>
      </DialogHeader>
      
      <form action={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select name="category_id" defaultValue={item?.category_id || ''} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name (English)</Label>
            <Input
              id="name"
              name="name"
              defaultValue={item?.name || ''}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (English)</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={item?.description || ''}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={item?.price || ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select name="currency" defaultValue={item?.currency || 'EUR'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preparation_time">Prep Time (min)</Label>
            <Input
              id="preparation_time"
              name="preparation_time"
              type="number"
              defaultValue={item?.preparation_time || ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergens">Allergens (comma-separated)</Label>
          <Input
            id="allergens"
            name="allergens"
            defaultValue={item?.allergens?.join(', ') || ''}
            placeholder="gluten, dairy, nuts, etc."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              name="is_available"
              defaultChecked={item?.is_available ?? true}
            />
            <Label htmlFor="is_available">Available</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              name="is_featured"
              defaultChecked={item?.is_featured ?? false}
            />
            <Label htmlFor="is_featured">Featured</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={item?.display_order || 0}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? 'Update' : 'Create'} Menu Item
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Menu Item Card Component
function MenuItemCard({ 
  item, 
  categories, 
  onEdit, 
  onDelete 
}: { 
  item: MenuItem; 
  categories: Category[]; 
  onEdit: (item: MenuItem) => void; 
  onDelete: (id: string) => void; 
}) {
  const category = categories.find(c => c.id === item.category_id);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{item.name}</h3>
              {item.is_featured && <Badge variant="secondary">Featured</Badge>}
              {!item.is_available && <Badge variant="destructive">Unavailable</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{category?.name}</p>
            <p className="text-sm mb-2">{item.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">{item.price} {item.currency}</span>
              {item.preparation_time && (
                <span className="text-muted-foreground">{item.preparation_time} min</span>
              )}
            </div>
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.allergens.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
