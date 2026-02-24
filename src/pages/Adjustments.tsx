import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi, locationsApi, productsApi } from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AdjustmentsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ locationId: '', productId: '', qtyChange: '', reason: '', notes: '' });

  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.list() });
  const { data: products } = useQuery({ queryKey: ['productsAll'], queryFn: () => productsApi.list({ perPage: '100' }) });

  const mutation = useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: (res) => {
      toast({ title: 'Adjustment created', description: res.referenceNo });
      setForm({ locationId: '', productId: '', qtyChange: '', reason: '', notes: '' });
    },
    onError: () => toast({ title: 'Failed to create adjustment', variant: 'destructive' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      locationId: parseInt(form.locationId),
      productId: parseInt(form.productId),
      qtyChange: parseInt(form.qtyChange),
      reason: form.reason,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Stock Adjustment</h1>
        <p className="text-sm text-muted-foreground">Record inventory corrections</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={form.locationId} onValueChange={v => setForm({ ...form, locationId: v })}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations?.data.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={v => setForm({ ...form, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products?.data.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity Change (+/-)</Label>
              <Input type="number" value={form.qtyChange} onChange={e => setForm({ ...form, qtyChange: e.target.value })} placeholder="-1 or +5" required />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={form.reason} onValueChange={v => setForm({ ...form, reason: v })}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CORRECTION">Correction</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Adjustment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
