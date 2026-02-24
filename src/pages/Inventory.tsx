import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi, locationsApi } from '@/services/apiClient';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import type { StockItem, InventoryMovement } from '@/types';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState('1');
  const [movementType, setMovementType] = useState('all');

  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.list() });
  const { data: stocks, isLoading } = useQuery({
    queryKey: ['stocks', locationId, search],
    queryFn: () => inventoryApi.stocks({ locationId, search }),
  });
  const { data: lowStock } = useQuery({
    queryKey: ['lowStock', locationId],
    queryFn: () => inventoryApi.lowStock({ locationId }),
  });
  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ['movements', locationId, movementType],
    queryFn: () => inventoryApi.movements({ locationId, ...(movementType !== 'all' ? { type: movementType } : {}) }),
  });

  const stockColumns = [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Product' },
    { key: 'onHand', header: 'On Hand', render: (r: StockItem) => (
      <span className={r.onHand <= r.reorderLevel ? 'text-destructive font-semibold' : ''}>{r.onHand}</span>
    )},
    { key: 'reorderLevel', header: 'Reorder Level' },
    { key: 'status', header: 'Status', render: (r: StockItem) => (
      r.onHand <= r.reorderLevel
        ? <Badge variant="destructive" className="text-xs">Low</Badge>
        : <Badge variant="secondary" className="text-xs">OK</Badge>
    )},
  ];

  const movementColumns = [
    { key: 'type', header: 'Type', render: (r: InventoryMovement) => <Badge variant="outline">{r.type}</Badge> },
    { key: 'referenceNo', header: 'Reference' },
    { key: 'productName', header: 'Product' },
    { key: 'qtyChange', header: 'Qty', render: (r: InventoryMovement) => (
      <span className={r.qtyChange > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
        {r.qtyChange > 0 ? '+' : ''}{r.qtyChange}
      </span>
    )},
    { key: 'locationName', header: 'Location' },
    { key: 'performedBy', header: 'By', render: (r: InventoryMovement) => r.performedBy.name },
    { key: 'createdAt', header: 'Date', render: (r: InventoryMovement) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">Stock levels and movement history</p>
        </div>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {locations?.data.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {lowStock && lowStock.data.length > 0 && (
        <Card className="border-warning/30">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">Low Stock Alert</p>
              <p className="text-xs text-muted-foreground">{lowStock.data.length} product(s) below reorder level</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="stocks">
        <TabsList>
          <TabsTrigger value="stocks">Stock Levels</TabsTrigger>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="mt-4">
          <DataTable<StockItem & Record<string, unknown>>
            columns={stockColumns as any}
            data={(stocks?.data ?? []) as any}
            loading={isLoading}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or SKU..."
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <div className="mb-4">
            <Select value={movementType} onValueChange={setMovementType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="PURCHASE_RECEIVE">Purchase</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="IN">In</SelectItem>
                <SelectItem value="OUT">Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable<InventoryMovement & Record<string, unknown>>
            columns={movementColumns as any}
            data={(movements?.data ?? []) as any}
            loading={movementsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
