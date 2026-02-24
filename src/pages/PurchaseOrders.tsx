import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi, suppliersApi, locationsApi, productsApi } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, CheckCircle, Trash2 } from 'lucide-react';
import type { PurchaseOrder } from '@/types';

interface LineItem {
  productId: string;
  qty: string;
  unitCost: string;
}

const emptyLine = (): LineItem => ({ productId: '', qty: '', unitCost: '' });

const statusColors: Record<PurchaseOrder['status'], 'secondary' | 'default' | 'outline' | 'destructive'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  RECEIVED: 'outline',
  CANCELLED: 'destructive',
};

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [showReceive, setShowReceive] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PurchaseOrder['status']>('all');

  const [supplierId, setSupplierId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);

  const [receiveQtys, setReceiveQtys] = useState<Record<number, number>>({});

  const { data: pos, isLoading } = useQuery({ queryKey: ['purchaseOrders'], queryFn: () => purchaseOrdersApi.list() });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: () => suppliersApi.list() });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.list() });
  const { data: products } = useQuery({ queryKey: ['productsAll'], queryFn: () => productsApi.list({ perPage: '100' }) });

  const { data: poDetail } = useQuery({
    queryKey: ['po', showDetail ?? showReceive],
    queryFn: () => purchaseOrdersApi.get((showDetail ?? showReceive)!),
    enabled: !!showDetail || !!showReceive,
  });

  const filteredOrders = useMemo(() => {
    const items = pos?.data ?? [];
    const keyword = search.trim().toLowerCase();

    return items.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      if (!matchesStatus) return false;
      if (!keyword) return true;

      return (
        order.poNo.toLowerCase().includes(keyword) ||
        (order.supplierName || '').toLowerCase().includes(keyword) ||
        (order.locationName || '').toLowerCase().includes(keyword) ||
        order.status.toLowerCase().includes(keyword)
      );
    });
  }, [pos, search, statusFilter]);

  const createMutation = useMutation({
    mutationFn: purchaseOrdersApi.create,
    onSuccess: () => {
      toast({ title: 'PO Created' });
      qc.invalidateQueries({ queryKey: ['purchaseOrders'] });
      resetCreate();
    },
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, items }: { id: number; items: { productId: number; qtyReceived: number }[] }) =>
      purchaseOrdersApi.receive(id, { receivedAt: new Date().toISOString(), items }),
    onSuccess: () => {
      toast({ title: 'PO Received' });
      qc.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setShowReceive(null);
      setReceiveQtys({});
    },
  });

  const resetCreate = () => {
    setShowCreate(false);
    setSupplierId('');
    setLocationId('');
    setExpectedDate('');
    setLines([emptyLine()]);
  };

  const updateLine = (idx: number, field: keyof LineItem, value: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setLines(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter(l => l.productId && l.qty && l.unitCost);
    if (validLines.length === 0) return;
    createMutation.mutate({
      supplierId: parseInt(supplierId),
      locationId: parseInt(locationId),
      expectedDate,
      items: validLines.map(l => ({ productId: parseInt(l.productId), qty: parseInt(l.qty), unitCost: parseFloat(l.unitCost) })),
    });
  };

  const openReceive = (id: number) => {
    setShowReceive(id);
    setReceiveQtys({});
  };

  const handleReceive = () => {
    if (!poDetail?.items) return;
    const items = poDetail.items.map(item => ({
      productId: item.productId,
      qtyReceived: receiveQtys[item.productId] ?? item.qty,
    }));
    receiveMutation.mutate({ id: poDetail.id, items });
  };

  return (
    <div className="space-y-4 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">Manage restock orders in a table list view</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search PO #, supplier, location..."
            className="w-72"
          />
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | PurchaseOrder['status'])}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create PO
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-sm)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Expected Date</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground" colSpan={6}>Loading purchase orders...</TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.poNo}</TableCell>
                  <TableCell><Badge variant={statusColors[order.status]}>{order.status}</Badge></TableCell>
                  <TableCell>{order.supplierName || '—'}</TableCell>
                  <TableCell>{order.locationName || '—'}</TableCell>
                  <TableCell>{order.expectedDate}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setShowDetail(order.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(order.status === 'DRAFT' || order.status === 'SENT') && (
                        <Button variant="ghost" size="icon" onClick={() => openReceive(order.id)} className="text-success">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create PO — multi-line items */}
      <Dialog open={showCreate} onOpenChange={v => !v && resetCreate()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers?.data.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations?.data.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expected Date</Label>
              <Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} required />
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
              </div>
              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {idx === 0 && <p className="text-xs text-muted-foreground mb-1">Product</p>}
                      <Select value={line.productId} onValueChange={v => updateLine(idx, 'productId', v)}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products?.data.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.sku})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      {idx === 0 && <p className="text-xs text-muted-foreground mb-1">Qty</p>}
                      <Input type="number" min="1" value={line.qty} onChange={e => updateLine(idx, 'qty', e.target.value)} placeholder="0" />
                    </div>
                    <div className="w-24">
                      {idx === 0 && <p className="text-xs text-muted-foreground mb-1">Unit Cost</p>}
                      <Input type="number" min="0" step="0.01" value={line.unitCost} onChange={e => updateLine(idx, 'unitCost', e.target.value)} placeholder="0.00" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-destructive" onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create PO'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>PO Details</DialogTitle></DialogHeader>
          {poDetail && !showReceive && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">PO #</span><span className="font-medium">{poDetail.poNo}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusColors[poDetail.status]}>{poDetail.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span>{poDetail.supplier?.name || poDetail.supplierName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{poDetail.location?.name || poDetail.locationName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected</span><span>{poDetail.expectedDate}</span></div>
              {poDetail.items && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-2">Line Items</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center w-16">Qty</TableHead>
                        <TableHead className="text-right w-24">Unit Cost</TableHead>
                        <TableHead className="text-right w-24">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poDetail.items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.productName || `Product #${item.productId}`}</TableCell>
                          <TableCell className="text-center">{item.qty}</TableCell>
                          <TableCell className="text-right">₱{item.unitCost.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₱{(item.qty * item.unitCost).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive dialog — item table with expected vs received */}
      <Dialog open={!!showReceive} onOpenChange={() => { setShowReceive(null); setReceiveQtys({}); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Receive Purchase Order</DialogTitle></DialogHeader>
          {poDetail && poDetail.items && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">PO #</span><span className="font-medium">{poDetail.poNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span>{poDetail.supplier?.name || poDetail.supplierName}</span></div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-24 text-center">Expected</TableHead>
                    <TableHead className="w-28 text-center">Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poDetail.items.map(item => {
                    const received = receiveQtys[item.productId] ?? item.qty;
                    const isShort = received < item.qty;
                    return (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.qty}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={received}
                            onChange={e => setReceiveQtys(prev => ({ ...prev, [item.productId]: parseInt(e.target.value) || 0 }))}
                            className={`w-20 mx-auto text-center ${isShort ? 'border-destructive text-destructive' : ''}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Button onClick={handleReceive} className="w-full" disabled={receiveMutation.isPending}>
                {receiveMutation.isPending ? 'Receiving...' : 'Confirm Receipt'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
