import { useState } from 'react';
import {
  BellRing,
  Boxes,
  Building2,
  Clock3,
  Globe2,
  MapPin,
  Save,
  ShieldCheck,
  Store,
  Users2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface StoreProfile {
  storeName: string;
  legalName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  address: string;
}

const branchDirectory = [
  { id: 1, name: 'BentaFlow Main', city: 'Makati', manager: 'Alyssa Cruz', staff: 24, sync: 'Realtime', status: 'Healthy' },
  { id: 2, name: 'BentaFlow North', city: 'Quezon City', manager: 'James Tan', staff: 16, sync: '2 min ago', status: 'Healthy' },
  { id: 3, name: 'BentaFlow South', city: 'Taguig', manager: 'Lara Mendoza', staff: 12, sync: '5 min ago', status: 'Attention' },
];

export default function MyStorePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<StoreProfile>({
    storeName: 'BentaFlow Retail Group',
    legalName: 'BentaFlow Commerce Inc.',
    supportEmail: 'support@bentaflow.com',
    supportPhone: '+63 917 555 2100',
    timezone: 'Asia/Manila (UTC+8)',
    address: '8F Commerce Hub, Ayala Avenue, Makati City',
  });

  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [autoReorder, setAutoReorder] = useState(true);
  const [managerApproval, setManagerApproval] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [offlineCheckout, setOfflineCheckout] = useState(true);

  const handleSave = () => {
    toast({
      title: 'Store settings updated',
      description: 'Your my-store management configuration has been saved.',
    });
  };

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">My Store Management</h1>
        <p className="page-description">Manage your business profile, branch operations, and smart inventory policies.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Store className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Active Branches</p>
              <p className="text-xl font-semibold">18</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-info/10 p-2.5 text-info"><Users2 className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Store Staff</p>
              <p className="text-xl font-semibold">146</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-success/10 p-2.5 text-success"><Boxes className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Tracked SKUs</p>
              <p className="text-xl font-semibold">5,230</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-warning/10 p-2.5 text-warning"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Compliance Score</p>
              <p className="text-xl font-semibold">98%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Business Profile
            </CardTitle>
            <CardDescription>Core identity and support details used across POS, receipts, and branch communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Store Group Name</Label>
                <Input
                  id="storeName"
                  value={profile.storeName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, storeName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="legalName">Legal Business Name</Label>
                <Input
                  id="legalName"
                  value={profile.legalName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, legalName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={profile.supportEmail}
                  onChange={(e) => setProfile((prev) => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={profile.supportPhone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, supportPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={profile.timezone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, timezone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address">Head Office Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="h-4 w-4" />
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Operational Rules
            </CardTitle>
            <CardDescription>Set policies that affect inventory, approvals, and branch-level operational controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Allow negative stock</p>
                <p className="text-xs text-muted-foreground">Permits temporary overselling.</p>
              </div>
              <Switch checked={allowNegativeStock} onCheckedChange={setAllowNegativeStock} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Auto-reorder suggestions</p>
                <p className="text-xs text-muted-foreground">Uses sales trends and lead times.</p>
              </div>
              <Switch checked={autoReorder} onCheckedChange={setAutoReorder} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Manager discount approval</p>
                <p className="text-xs text-muted-foreground">Require sign-off for high discounts.</p>
              </div>
              <Switch checked={managerApproval} onCheckedChange={setManagerApproval} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Inventory incident alerts</p>
                <p className="text-xs text-muted-foreground">Notify for risk or stock anomalies.</p>
              </div>
              <Switch checked={incidentAlerts} onCheckedChange={setIncidentAlerts} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Offline checkout mode</p>
                <p className="text-xs text-muted-foreground">Keep POS running during outages.</p>
              </div>
              <Switch checked={offlineCheckout} onCheckedChange={setOfflineCheckout} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Branch Directory
          </CardTitle>
          <CardDescription>Visibility of branch status, local managers, and synchronization health.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {branchDirectory.map((branch) => (
            <div key={branch.id} className="grid gap-2 rounded-2xl border border-border/60 p-4 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr] md:items-center">
              <div>
                <p className="text-sm font-semibold">{branch.name}</p>
                <p className="text-xs text-muted-foreground">{branch.city}</p>
              </div>
              <p className="text-sm text-muted-foreground">Manager: <span className="font-medium text-foreground">{branch.manager}</span></p>
              <p className="text-sm text-muted-foreground">Staff: <span className="font-medium text-foreground">{branch.staff}</span></p>
              <p className="text-sm text-muted-foreground">Sync: <span className="font-medium text-foreground">{branch.sync}</span></p>
              <Badge variant={branch.status === 'Healthy' ? 'secondary' : 'outline'} className={branch.status === 'Healthy' ? 'bg-success/15 text-success border-success/20' : 'border-warning/30 text-warning'}>
                {branch.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-primary" />
              Integrations
            </CardTitle>
            <CardDescription>Connected systems powering your store operations.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge className="bg-info/15 text-info border-info/25">Google Sign-in Connected</Badge>
            <Badge className="bg-primary/15 text-primary border-primary/25">Cloud Backup Active</Badge>
            <Badge className="bg-success/15 text-success border-success/25">Supplier API Synced</Badge>
            <Badge variant="outline">E-invoice Pending</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              Smart Alerts
            </CardTitle>
            <CardDescription>Recent platform alerts that need manager visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              7 products are below safety stock across 3 branches.
            </div>
            <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-info">
              Purchase order PO-2026-1134 is awaiting approval.
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-3 text-sm text-success">
              Daily branch sync completed successfully at 06:00 AM.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
