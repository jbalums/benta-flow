import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/apiClient';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import type { SaleRecord, TopProduct } from '@/types';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('2026-02-16');
  const [dateTo, setDateTo] = useState('2026-02-22');
  const [page, setPage] = useState(1);

  const { data: summary } = useQuery({
    queryKey: ['reportSummary', dateFrom, dateTo],
    queryFn: () => reportsApi.summary({ dateFrom, dateTo, locationId: '1' }),
  });

  const { data: sales, isLoading } = useQuery({
    queryKey: ['reportSales', dateFrom, dateTo, page],
    queryFn: () => reportsApi.sales({ dateFrom, dateTo, page: String(page) }),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['topProducts', dateFrom, dateTo],
    queryFn: () => reportsApi.topProducts({ dateFrom, dateTo }),
  });

  const exportCSV = () => {
    if (!sales) return;
    const header = 'Sale No,Cashier,Location,Total,Date\n';
    const rows = sales.data.map(s => `${s.saleNo},${s.cashierName},${s.locationName},${s.grandTotal},${s.createdAt}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateFrom}-${dateTo}.csv`;
    a.click();
  };

  const salesColumns = [
    { key: 'saleNo', header: 'Sale #' },
    { key: 'cashierName', header: 'Cashier' },
    { key: 'locationName', header: 'Location' },
    { key: 'grandTotal', header: 'Total', render: (r: SaleRecord) => <span>₱{r.grandTotal.toFixed(2)}</span> },
    { key: 'createdAt', header: 'Date', render: (r: SaleRecord) => new Date(r.createdAt).toLocaleString() },
  ];

  const topColumns = [
    { key: 'productName', header: 'Product' },
    { key: 'qtySold', header: 'Qty Sold' },
    { key: 'revenue', header: 'Revenue', render: (r: TopProduct) => <span>₱{r.revenue.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Sales data and analytics</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Sales Total</p><p className="text-xl font-bold">₱{summary.salesTotal.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Orders</p><p className="text-xl font-bold">{summary.ordersCount}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Order Value</p><p className="text-xl font-bold">₱{summary.avgOrderValue.toFixed(2)}</p></CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales List</TabsTrigger>
          <TabsTrigger value="top">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <DataTable<SaleRecord & Record<string, unknown>>
            columns={salesColumns as any}
            data={(sales?.data ?? []) as any}
            loading={isLoading}
            page={page}
            totalPages={sales ? Math.ceil(sales.meta.total / sales.meta.perPage) : 1}
            onPageChange={setPage}
            actions={<Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>}
          />
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <DataTable<TopProduct & Record<string, unknown>>
            columns={topColumns as any}
            data={(topProducts?.data ?? []) as any}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
