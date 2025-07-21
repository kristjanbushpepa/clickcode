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
import { Plus, Edit, Trash2, EyeOff, Tag, Utensils, X } from 'lucide-react';
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
  sizes?: MenuItemSize[];
}

interface MenuItemSize {
  name: string;
  price: number;
}

export function MenuManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Menu item not found');
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
    
    // Parse sizes from form data
    const sizes: MenuItemSize[] = [];
    const sizeInputs = e.currentTarget.querySelectorAll('[data-size-name]');
    sizeInputs.forEach((input) => {
      const nameInput = input as HTMLInputElement;
      const priceInput = e.currentTarget.querySelector(`[data-size-price="${nameInput.dataset.sizeName}"]`) as HTMLInputElement;
      if (nameInput.value.trim() && priceInput && priceInput.value) {
        sizes.push({
          name: nameInput.value.trim(),
          price: parseFloat(priceInput.value)
        });
      }
    });
    
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
      image_path: formData.get('image_path') as string || null,
      sizes: sizes.length > 0 ? sizes : undefined
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
          <p className="text-muted-foreground">Menaxho kategoritë dhe artikujt e menusë së restorantit tuaj</p>
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
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50 rounded-lg gap-1">
          <TabsTrigger 
            value="menu" 
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium"
          >
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Artikujt e Menusë</span>
            <span className="sm:hidden">Menu</span>
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium"
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Kategoritë</span>
            <span className="sm:hidden">Categories</span>
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
          <CardContent className="space-y-3 p-4">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              className="w-full justify-start h-10"
              onClick={() => setSelectedCategory(null)}
            >
              Të gjitha artikujt
            </Button>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Button
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="flex-1 justify-start h-10 min-w-0"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="truncate">
                    {category.name_sq || category.name}
                  </span>
                  {!category.is_active && <EyeOff className="h-4 w-4 ml-2 flex-shrink-0" />}
                </Button>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
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
                    className="h-8 w-8 p-0"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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

      </Tabs>
    </div>
  );
}

// Category Dialog Component with Image Upload
function CategoryDialog({ 
  category, 
  onSubmit, 
  onClose 
}: { 
  category: Category | null; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; 
  onClose: () => void; 
}) {
  const [imagePath, setImagePath] = useState<string | null>(category?.image_path || null);

  // Update imagePath when category changes
  useEffect(() => {
    setImagePath(category?.image_path || null);
  }, [category]);

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
              defaultValue={category?.name_sq || ''}
              required
              placeholder="Emri në shqip"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Emri (Anglisht)</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name || ''}
              required
              placeholder="Emri në anglisht"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description_sq">Përshkrimi (Shqip)</Label>
            <Textarea
              id="description_sq"
              name="description_sq"
              defaultValue={category?.description_sq || ''}
              rows={3}
              placeholder="Përshkrimi në shqip"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Përshkrimi (Anglisht)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description || ''}
              rows={3}
              placeholder="Përshkrimi në anglisht"
            />
          </div>
        </div>

        <ImageUpload
          currentImagePath={imagePath}
          onImageChange={setImagePath}
          label="Imazhi i Kategorisë"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display_order">Renditja</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={category?.display_order || 0}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={category?.is_active ?? true}
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

// Menu Item Dialog Component with Size Options
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
  const [imagePath, setImagePath] = useState<string | null>(item?.image_path || null);
  const [sizes, setSizes] = useState<MenuItemSize[]>(item?.sizes || []);

  // Update imagePath and sizes when item changes
  useEffect(() => {
    setImagePath(item?.image_path || null);
    setSizes(item?.sizes || []);
  }, [item]);

  const addSize = () => {
    setSizes([...sizes, { name: '', price: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof MenuItemSize, value: string | number) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = { ...updatedSizes[index], [field]: value };
    setSizes(updatedSizes);
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
            <Select name="category_id" defaultValue={item?.category_id || ''} required>
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
            <Label htmlFor="price">Çmimi Bazë (ALL)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={item?.price || ''}
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name_sq">Emri (Shqip)</Label>
            <Input
              id="name_sq"
              name="name_sq"
              defaultValue={item?.name_sq || ''}
              required
              placeholder="Emri në shqip"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Emri (Anglisht)</Label>
            <Input
              id="name"
              name="name"
              defaultValue={item?.name || ''}
              required
              placeholder="Emri në anglisht"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description_sq">Përshkrimi (Shqip)</Label>
            <Textarea
              id="description_sq"
              name="description_sq"
              defaultValue={item?.description_sq || ''}
              rows={3}
              placeholder="Përshkrimi në shqip"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Përshkrimi (Anglisht)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description || ''}
              rows={3}
              placeholder="Përshkrimi në anglisht"
            />
          </div>
        </div>

        {/* Size Options Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Madhësitë e Disponueshme</Label>
            <Button type="button" onClick={addSize} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Shto Madhësi
            </Button>
          </div>
          
          {sizes.map((size, index) => (
            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="flex-1">
                <Input
                  data-size-name={index}
                  placeholder="p.sh. Gjysmë, E plotë, 1kg, etc."
                  value={size.name}
                  onChange={(e) => updateSize(index, 'name', e.target.value)}
                />
              </div>
              <div className="w-32">
                <Input
                  data-size-price={index}
                  type="number"
                  step="0.01"
                  placeholder="Çmimi"
                  value={size.price || ''}
                  onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button 
                type="button" 
                onClick={() => removeSize(index)} 
                size="sm" 
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {sizes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nëse nuk shtoni madhësi, do të përdoret vetëm çmimi bazë.
            </p>
          )}
        </div>

        <ImageUpload
          currentImagePath={imagePath}
          onImageChange={setImagePath}
          label="Imazhi i Artikullit"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="allergens">Alergjenet (të ndara me presje)</Label>
            <Input
              id="allergens"
              name="allergens"
              defaultValue={item?.allergens?.join(', ') || ''}
              placeholder="gluten, qumësht, arra, etj."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preparation_time">Koha e përgatitjes (min)</Label>
            <Input
              id="preparation_time"
              name="preparation_time"
              type="number"
              defaultValue={item?.preparation_time || ''}
              placeholder="15"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              name="is_available"
              defaultChecked={item?.is_available ?? true}
            />
            <Label htmlFor="is_available">E disponueshme</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              name="is_featured"
              defaultChecked={item?.is_featured ?? false}
            />
            <Label htmlFor="is_featured">E veçantë</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Renditja</Label>
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

// Menu Item Card Component with Size Display
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
            
            {/* Display sizes if available */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Madhësitë:</p>
                <div className="flex flex-wrap gap-1">
                  {item.sizes.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {size.name}: {size.price} ALL
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
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
