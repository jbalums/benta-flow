import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, locationsApi, productsApi } from '@/services/apiClient';
import type { Product } from '@/types';
import DataTable from '@/components/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface ProductFormState {
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  unit: string;
  description: string;
  price: string;
  cost: string;
  taxRate: string;
  reorderLevel: string;
  categoryId: string;
  locationId: string;
  active: boolean;
}

const emptyForm: ProductFormState = {
  sku: '',
  barcode: '',
  name: '',
  brand: '',
  unit: 'Piece',
  description: '',
  price: '',
  cost: '',
  taxRate: '12',
  reorderLevel: '10',
  categoryId: '',
  locationId: '',
  active: true,
};

export default function ProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.list(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, statusFilter, categoryFilter, locationFilter, page],
    queryFn: () =>
      productsApi.list({
        search,
        status: statusFilter !== 'all' ? statusFilter : '',
        categoryId: categoryFilter !== 'all' ? categoryFilter : '',
        locationId: locationFilter !== 'all' ? locationFilter : '',
        page: String(page),
      }),
  });

  const upsertMutation = useMutation({
    mutationFn: (payload: Partial<Product>) =>
      editProduct ? productsApi.update(editProduct.id, payload) : productsApi.create(payload),
    onSuccess: () => {
      toast({ title: editProduct ? 'Product updated' : 'Product created' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posProducts'] });
      closeForm();
    },
    onError: () => {
      toast({
        title: 'Unable to save product',
        description: 'Please review your product details and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Product deleted' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posProducts'] });
      setDeleteProduct(null);
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Could not delete this product.',
        variant: 'destructive',
      });
    },
  });

  const categoryNameById = useMemo(
    () => new Map((categories?.data || []).map((c) => [c.id, c.name])),
    [categories],
  );
  const locationNameById = useMemo(
    () => new Map((locations?.data || []).map((l) => [l.id, l.name])),
    [locations],
  );

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      brand: product.brand || '',
      unit: product.unit || 'Piece',
      description: product.description || '',
      price: String(product.price),
      cost: String(product.cost),
      taxRate: String(product.taxRate ?? 12),
      reorderLevel: String(product.reorderLevel ?? 10),
      categoryId: String(product.categoryId),
      locationId: String(product.locationId ?? ''),
      active: product.active,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.categoryId || !form.locationId) {
      toast({
        title: 'Missing required fields',
        description: 'Please choose both a store and a category.',
        variant: 'destructive',
      });
      return;
    }

    const price = Number(form.price);
    const cost = Number(form.cost);
    const reorderLevel = Number(form.reorderLevel);
    const taxRate = Number(form.taxRate);

    if (Number.isNaN(price) || Number.isNaN(cost) || price <= 0 || cost < 0) {
      toast({
        title: 'Invalid pricing',
        description: 'Price must be greater than 0 and cost cannot be negative.',
        variant: 'destructive',
      });
      return;
    }

    if (Number.isNaN(reorderLevel) || reorderLevel < 0 || Number.isNaN(taxRate) || taxRate < 0) {
      toast({
        title: 'Invalid inventory fields',
        description: 'Reorder level and tax rate must be zero or higher.',
        variant: 'destructive',
      });
      return;
    }

    upsertMutation.mutate({
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      unit: form.unit,
      description: form.description.trim(),
      price,
      cost,
      taxRate,
      reorderLevel,
      categoryId: Number(form.categoryId),
      locationId: Number(form.locationId),
      active: form.active,
    });
  };

  const columns = [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Product' },
    {
      key: 'locationId',
      header: 'Store',
      render: (row: Product) => <span>{row.locationId ? locationNameById.get(row.locationId) || '—' : '—'}</span>,
    },
    {
      key: 'categoryId',
      header: 'Category',
      render: (row: Product) => <span>{categoryNameById.get(row.categoryId) || '—'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: Product) => <span className="tabular-nums">₱{row.price.toFixed(2)}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (row: Product) => <span className="tabular-nums">₱{row.cost.toFixed(2)}</span>,
    },
    {
      key: 'reorderLevel',
      header: 'Reorder',
      render: (row: Product) => <span className="tabular-nums">{row.reorderLevel ?? 10}</span>,
    },
    {
      key: 'active',
      header: 'Status',
      render: (row: Product) => (
        <Badge variant={row.active ? 'default' : 'secondary'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Product) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteProduct(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Full product CRUD with store, category, and inventory details.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            {locations?.data.map((location) => (
              <SelectItem key={location.id} value={String(location.id)}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.data.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<Product>
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search by name, SKU, barcode, brand..."
        page={page}
        totalPages={data ? Math.ceil(data.meta.total / data.meta.perPage) : 1}
        onPageChange={setPage}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" value={form.barcode} onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} placeholder="Optional brand" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store</Label>
                <Select value={form.locationId} onValueChange={(value) => setForm((prev) => ({ ...prev, locationId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                  <SelectContent>
                    {locations?.data.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.data.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(value) => setForm((prev) => ({ ...prev, unit: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Cup">Cup</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Bowl">Bowl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min={0}
                  value={form.reorderLevel}
                  onChange={(e) => setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Product details shown in catalog and reports."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" type="number" min={0} step="0.01" value={form.cost} onChange={(e) => setForm((prev) => ({ ...prev, cost: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" min={0} step="0.01" value={form.taxRate} onChange={(e) => setForm((prev) => ({ ...prev, taxRate: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Active product</p>
                <p className="text-xs text-muted-foreground">Inactive products are hidden from checkout.</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(value) => setForm((prev) => ({ ...prev, active: value }))} />
            </div>

            <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteProduct
                ? `This will permanently remove "${deleteProduct.name}" from your catalog.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
