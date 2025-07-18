import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurantSupabase } from '@/utils/restaurantDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Edit, Trash2, EyeOff, Tag, Utensils, DollarSign, Languages } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CurrencySettings } from './CurrencySettings';
import { LanguageSettings } from './LanguageSettings';
import { TranslationManager } from './TranslationManager';
import { useDashboardForm } from '@/contexts/DashboardFormContext';

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
  image_path?: string;
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
  image_path?: string;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  preparation_time?: number;
  display_order: number;
}

export function MenuManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setFormData, getFormData } = useDashboardForm();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Fetch categories with proper error handling
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const restaurantSupabase = getRestaurantSupabase();
        const { data, error } = await restaurantSupabase
          .from('categories')
          .select('*')
          .order('display_order');
        
        if (error) {
          console.error('Categories fetch error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
    retry: false
  });

  // Fetch menu items with proper error handling
  const { data: menuItems = [], isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['menu_items', selectedCategory],
    queryFn: async () => {
      try {
        const restaurantSupabase = getRestaurantSupabase();
        let query = restaurantSupabase.from('menu_items').select('*').order('display_order');
        
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }
        
        const { data, error } = await query;
        if (error) {
          console.error('Menu items fetch error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        return [];
      }
    },
    retry: false
  });

  // Show error message if tables don't exist
  if (categoriesError || itemsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Menaxhimi i Menusë</h1>
            <p className="text-muted-foreground">Menaxho kategoritë dhe artikujt e menusë së restorantit tuaj</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Databaza e menusë nuk është e disponueshme</h3>
              <p className="text-muted-foreground mb-4">
                Duket se tabelet e menusë nuk janë krijuar ende në databazën tuaj. 
                Kontaktoni administratorin për të konfiguruar databazën e restorantit.
              </p>
              <p className="text-sm text-muted-foreground">
                Gabim: {categoriesError?.message || itemsError?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
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
      toast({ title: 'Kategoria u krijua me sukses' });
    },
    onError: (error: any) => {
      toast({ title: 'Gabim në krijimin e kategorisë', description: error.message, variant: 'destructive' });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
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
      toast({ title: 'Kategoria u përditësua me sukses' });
    },
    onError: (error: any) => {
      toast({ title: 'Gabim në përditësimin e kategorisë', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { error } = await restaurantSupabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Kategoria u fshi me sukses' });
    },
    onError: (error: any) => {
      toast({ title: 'Gabim në fshirjen e kategorisë', description: error.message, variant: 'destructive' });
    }
  });

  // Menu item mutations
  const createItemMutation = useMutation({
    mutationFn: async (item: Partial<MenuItem>) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
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
      toast({ title: 'Artikulli i menusë u krijua me sukses' });
    },
    onError: (error: any) => {
      toast({ title: 'Gabim në krijimin e artikullit', description: error.message, variant: 'destructive' });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { data, error } = await restaurantSupabase
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
      toast({ title: 'Artikulli i menusë u përditësua me sukses' });
    },
    onError: (error: any) => {
      toast({ title: 'Gabim në përditësimin e artikullit', description: error.message, variant: 'destructive' });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const restaurantSupabase = getRestaurantSupabase();
      const { error } = await restaurantSupabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast({ title: 'Artikulli i menusë u fshi me sukses' });
    },
    onError: (error: any) => {
      toast({ title: 'Gabim në fshirjen e artikullit', description: error.message, variant: 'destructive' });
    }
  });

  // Save form data when dialogs close
  useEffect(() => {
    if (!showCategoryDialog && editingCategory) {
      setFormData('categoryForm', null);
    }
    if (!showItemDialog && editingItem) {
      setFormData('itemForm', null);
    }
  }, [showCategoryDialog, showItemDialog, editingCategory, editingItem, setFormData]);

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryData: Partial<Category> = {
      name: formData.get('name') as string,
      name_sq: formData.get('name_sq') as string,
      description: formData.get('description') as string,
      description_sq: formData.get('description_sq') as string,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'on',
      image_path: formData.get('image_path') as string || null
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ ...categoryData, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData: Partial<MenuItem> = {
      category_id: formData.get('category_id') as string,
      name: formData.get('name') as string,
      name_sq: formData.get('name_sq') as string,
      description: formData.get('description') as string,
      description_sq: formData.get('description_sq') as string,
      price: parseFloat(formData.get('price') as string),
      currency: 'ALL',
      is_available: formData.get('is_available') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      allergens: (formData.get('allergens') as string)?.split(',').map(a => a.trim()).filter(Boolean) || [],
      preparation_time: parseInt(formData.get('preparation_time') as string) || undefined,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      image_path: formData.get('image_path') as string || null
    };

    if (editingItem) {
      updateItemMutation.mutate({ ...itemData, id: editingItem.id });
    } else {
      createItemMutation.mutate(itemData);
    }
  };

  if (categoriesLoading) {
    return <div className="flex justify-center p-8">Duke ngarkuar...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menaxhimi i Menusë</h1>
          <p className="text-muted-foreground">Menaxho menunë, kategoritë, monedhën dhe gjuhët</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Tag className="h-4 w-4 mr-2" />
                Shto Kategori
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
                Shto Artikull
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

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Artikujt e Menusë
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Kategoritë
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monedha
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Gjuha
          </TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Përkthimet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Kategoritë
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedCategory(null)}
            >
              Të gjitha artikujt
            </Button>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Button
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="flex-1 justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name_sq || category.name}
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
            <div className="flex justify-center p-8">Duke ngarkuar artikujt e menusë...</div>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ende pa artikuj menuje</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Filloni të ndërtoni menunë tuaj duke shtuar artikullin e parë
                </p>
                <Button onClick={() => setShowItemDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Shto Artikull Menuje
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Menaxhimi i Kategorive
              </CardTitle>
              <CardDescription>
                Krijoni dhe organizoni kategoritë e menusë së restorantit tuaj
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCategory(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Shto Kategori të Re
                    </Button>
                  </DialogTrigger>
                  <CategoryDialog
                    category={editingCategory}
                    onSubmit={handleCategorySubmit}
                    onClose={() => setShowCategoryDialog(false)}
                  />
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{category.name_sq || category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description_sq || category.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? "Aktive" : "Jo aktive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Renditja: {category.display_order}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <CurrencySettings />
        </TabsContent>

        <TabsContent value="language">
          <LanguageSettings />
        </TabsContent>

        <TabsContent value="translations">
          <TranslationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Category Dialog Component with Image Upload and Form Persistence
function CategoryDialog({ 
  category, 
  onSubmit, 
  onClose 
}: { 
  category: Category | null; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; 
  onClose: () => void; 
}) {
  const { setFormData, getFormData } = useDashboardForm();
  const [imagePath, setImagePath] = useState<string | null>(category?.image_path || null);

  // Load saved form data
  useEffect(() => {
    const savedData = getFormData('categoryForm');
    if (savedData && !category) {
      setImagePath(savedData.image_path || null);
    } else {
      setImagePath(category?.image_path || null);
    }
  }, [category, getFormData]);

  // Save form data on change
  const handleFormChange = (field: string, value: any) => {
    const currentData = getFormData('categoryForm') || {};
    setFormData('categoryForm', { ...currentData, [field]: value });
  };

  const handleImageChange = (newImagePath: string | null) => {
    setImagePath(newImagePath);
    handleFormChange('image_path', newImagePath);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {category ? 'Ndrysho Kategorinë' : 'Shto Kategori të Re'}
        </DialogTitle>
        <DialogDescription>
          {category ? 'Përditëso informacionin e kategorisë' : 'Krijo një kategori të re menuje'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="image_path" value={imagePath || ''} />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name_sq">Emri (Shqip)</Label>
            <Input
              id="name_sq"
              name="name_sq"
              defaultValue={category?.name_sq || getFormData('categoryForm')?.name_sq || ''}
              required
              placeholder="Emri në shqip"
              onChange={(e) => handleFormChange('name_sq', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Emri (Anglisht)</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name || getFormData('categoryForm')?.name || ''}
              required
              placeholder="Emri në anglisht"
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description_sq">Përshkrimi (Shqip)</Label>
            <Textarea
              id="description_sq"
              name="description_sq"
              defaultValue={category?.description_sq || getFormData('categoryForm')?.description_sq || ''}
              rows={3}
              placeholder="Përshkrimi në shqip"
              onChange={(e) => handleFormChange('description_sq', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Përshkrimi (Anglisht)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description || getFormData('categoryForm')?.description || ''}
              rows={3}
              placeholder="Përshkrimi në anglisht"
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
          </div>
        </div>

        <ImageUpload
          currentImagePath={imagePath}
          onImageChange={handleImageChange}
          label="Imazhi i Kategorisë"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display_order">Renditja</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={category?.display_order || getFormData('categoryForm')?.display_order || 0}
              onChange={(e) => handleFormChange('display_order', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={category?.is_active ?? getFormData('categoryForm')?.is_active ?? true}
              onCheckedChange={(checked) => handleFormChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Aktive</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Anulo
          </Button>
          <Button type="submit">
            {category ? 'Përditëso' : 'Krijo'} Kategorinë
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Menu Item Dialog Component with Image Upload and Form Persistence
function MenuItemDialog({ 
  item, 
  categories, 
  onSubmit, 
  onClose 
}: { 
  item: MenuItem | null; 
  categories: Category[]; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; 
  onClose: () => void; 
}) {
  const { setFormData, getFormData } = useDashboardForm();
  const [imagePath, setImagePath] = useState<string | null>(item?.image_path || null);

  // Load saved form data
  useEffect(() => {
    const savedData = getFormData('itemForm');
    if (savedData && !item) {
      setImagePath(savedData.image_path || null);
    } else {
      setImagePath(item?.image_path || null);
    }
  }, [item, getFormData]);

  // Save form data on change
  const handleFormChange = (field: string, value: any) => {
    const currentData = getFormData('itemForm') || {};
    setFormData('itemForm', { ...currentData, [field]: value });
  };

  const handleImageChange = (newImagePath: string | null) => {
    setImagePath(newImagePath);
    handleFormChange('image_path', newImagePath);
  };

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {item ? 'Ndrysho Artikullin' : 'Shto Artikull të Ri'}
        </DialogTitle>
        <DialogDescription>
          {item ? 'Përditëso informacionin e artikullit' : 'Krijo një artikull të ri menuje'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="image_path" value={imagePath || ''} />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Kategoria</Label>
            <Select 
              name="category_id" 
              defaultValue={item?.category_id || getFormData('itemForm')?.category_id || ''} 
              required
              onValueChange={(value) => handleFormChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Zgjidh kategorinë" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_sq || category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Çmimi (ALL)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={item?.price || getFormData('itemForm')?.price || ''}
              required
              placeholder="0.00"
              onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name_sq">Emri (Shqip)</Label>
            <Input
              id="name_sq"
              name="name_sq"
              defaultValue={item?.name_sq || getFormData('itemForm')?.name_sq || ''}
              required
              placeholder="Emri në shqip"
              onChange={(e) => handleFormChange('name_sq', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Emri (Anglisht)</Label>
            <Input
              id="name"
              name="name"
              defaultValue={item?.name || getFormData('itemForm')?.name || ''}
              required
              placeholder="Emri në anglisht"
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description_sq">Përshkrimi (Shqip)</Label>
            <Textarea
              id="description_sq"
              name="description_sq"
              defaultValue={item?.description_sq || getFormData('itemForm')?.description_sq || ''}
              rows={3}
              placeholder="Përshkrimi në shqip"
              onChange={(e) => handleFormChange('description_sq', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Përshkrimi (Anglisht)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description || getFormData('itemForm')?.description || ''}
              rows={3}
              placeholder="Përshkrimi në anglisht"
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
          </div>
        </div>

        <ImageUpload
          currentImagePath={imagePath}
          onImageChange={handleImageChange}
          label="Imazhi i Artikullit"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="allergens">Alergjenet (të ndara me presje)</Label>
            <Input
              id="allergens"
              name="allergens"
              defaultValue={item?.allergens?.join(', ') || getFormData('itemForm')?.allergens || ''}
              placeholder="gluten, qumësht, arra, etj."
              onChange={(e) => handleFormChange('allergens', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preparation_time">Koha e përgatitjes (min)</Label>
            <Input
              id="preparation_time"
              name="preparation_time"
              type="number"
              defaultValue={item?.preparation_time || getFormData('itemForm')?.preparation_time || ''}
              placeholder="15"
              onChange={(e) => handleFormChange('preparation_time', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              name="is_available"
              defaultChecked={item?.is_available ?? getFormData('itemForm')?.is_available ?? true}
              onCheckedChange={(checked) => handleFormChange('is_available', checked)}
            />
            <Label htmlFor="is_available">E disponueshme</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              name="is_featured"
              defaultChecked={item?.is_featured ?? getFormData('itemForm')?.is_featured ?? false}
              onCheckedChange={(checked) => handleFormChange('is_featured', checked)}
            />
            <Label htmlFor="is_featured">E veçantë</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Renditja</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={item?.display_order || getFormData('itemForm')?.display_order || 0}
              onChange={(e) => handleFormChange('display_order', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Anulo
          </Button>
          <Button type="submit">
            {item ? 'Përditëso' : 'Krijo'} Artikullin
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Menu Item Card Component with Image Display
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

  function getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    const restaurantSupabase = getRestaurantSupabase();
    const { data } = restaurantSupabase.storage
      .from('restaurant-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  }

  return (
    <Card>
      <CardContent className="p-4">
        {item.image_path && (
          <div className="mb-3">
            <img
              src={getImageUrl(item.image_path)}
              alt={item.name_sq || item.name}
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{item.name_sq || item.name}</h3>
              {item.is_featured && <Badge variant="secondary">E veçantë</Badge>}
              {!item.is_available && <Badge variant="destructive">Jo e disponueshme</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{category?.name_sq || category?.name}</p>
            <p className="text-sm mb-2">{item.description_sq || item.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">{item.price} ALL</span>
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
