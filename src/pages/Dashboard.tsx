import { useQuery } from '@tanstack/react-query';
import { reportsApi, inventoryApi } from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDailySales, mockTopProducts } from '@/services/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['reportSummary'],
    queryFn: () => reportsApi.summary({ dateFrom: '2026-02-16', dateTo: '2026-02-22', locationId: '1' }),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => inventoryApi.lowStock({ locationId: '1' }),
  });

  const stats = [
    { label: 'Total Sales', value: summary ? `₱${summary.salesTotal.toLocaleString()}` : '—', icon: DollarSign, bg: 'bg-primary/10', color: 'text-primary' },
    { label: 'Orders', value: summary?.ordersCount ?? '—', icon: ShoppingBag, bg: 'bg-info/10', color: 'text-info' },
    { label: 'Avg Order', value: summary ? `₱${summary.avgOrderValue.toFixed(2)}` : '—', icon: TrendingUp, bg: 'bg-success/10', color: 'text-success' },
    { label: 'Low Stock Items', value: lowStock?.data.length ?? '—', icon: AlertTriangle, bg: 'bg-warning/10', color: 'text-warning' },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview for Feb 16 – Feb 22, 2026</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                {isLoading ? <Skeleton className="mt-1 h-7 w-20 rounded-lg" /> : (
                  <p className="stat-value text-foreground">{s.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Sales Last 7 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockDailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-md)',
                    fontSize: 13,
                  }}
                />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockTopProducts.slice(0, 5).map((p, i) => (
              <div key={p.productId} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{p.productName}</span>
                </div>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">₱{p.revenue.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Low stock */}
      {lowStock && lowStock.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStock.data.map(item => (
                <Badge key={item.productId} variant="outline" className="border-warning/30 text-warning bg-warning/5 rounded-lg px-3 py-1">
                  {item.name}: {item.onHand} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
