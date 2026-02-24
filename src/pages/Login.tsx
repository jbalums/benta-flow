import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@stockpilot.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signedInUser = await login(email, password);
      navigate(signedInUser.role === 'CASHIER' ? '/pos' : '/my-store');
    } catch {
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-md)]">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">BentaFlow</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New to BentaFlow?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)]">
          <p className="text-xs font-medium text-muted-foreground mb-2">Demo accounts</p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">admin@stockpilot.com · <span className="text-foreground font-medium">Admin</span></p>
            <p className="text-xs text-muted-foreground">manager@stockpilot.com · <span className="text-foreground font-medium">Manager</span></p>
            <p className="text-xs text-muted-foreground">cashier@stockpilot.com · <span className="text-foreground font-medium">Cashier</span></p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Password: <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded-md text-[11px]">password</code></p>
        </div>
      </div>
    </div>
  );
}
