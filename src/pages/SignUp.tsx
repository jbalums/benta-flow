import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const defaultGoogleSignupUrl = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')}/auth/google/redirect`;

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Sign up failed',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const signedUpUser = await register(name, email, password);
      navigate(signedUpUser.role === 'CASHIER' ? '/pos' : '/my-store');
    } catch {
      toast({
        title: 'Sign up failed',
        description: 'Unable to create account right now',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        const signedUpUser = await register(`Google User`, `google.user.${Date.now()}@stockpilot.com`, 'google-oauth');
        navigate(signedUpUser.role === 'CASHIER' ? '/pos' : '/my-store');
        return;
      }

      const googleSignupUrl = import.meta.env.VITE_GOOGLE_SIGNUP_URL || defaultGoogleSignupUrl;
      window.location.assign(googleSignupUrl);
    } catch {
      toast({
        title: 'Google sign up failed',
        description: 'Google sign-up is not configured yet',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
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
          <p className="mt-1.5 text-sm text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium">Full name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || googleLoading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5a9.5 9.5 0 1 0 0 19 9.2 9.2 0 0 0 9.7-9.6c0-.6-.1-1.1-.2-1.7H12Z" />
            <path fill="#34A853" d="M3.5 7.7l3.2 2.3c.9-2.6 3.4-4.4 6.3-4.4 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5A9.5 9.5 0 0 0 3.5 7.7Z" />
            <path fill="#FBBC05" d="M12 21.5c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.5-1.9.9-3.4.9-2.9 0-5.4-1.9-6.3-4.4l-3.2 2.5A9.5 9.5 0 0 0 12 21.5Z" />
            <path fill="#4285F4" d="M21.7 11.9c0-.6-.1-1.1-.2-1.7H12v3.9h5.5c-.3 1.4-1.2 2.6-2.5 3.4l3 2.4c1.7-1.5 2.7-4 2.7-8Z" />
          </svg>
          {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
