import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, FileText,
  TruckIcon, ClipboardList, LogOut, ChevronLeft, ChevronRight, User, Tags, Users, Store
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'My Store', path: '/my-store', icon: Store, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
  { label: 'POS', path: '/pos', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { label: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: TruckIcon, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Adjustments', path: '/adjustments', icon: ClipboardList, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Categories', path: '/categories', icon: Tags, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Reports', path: '/reports', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Users', path: '/users', icon: Users, roles: ['ADMIN'] },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside
      className={`flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      } min-h-screen`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm shrink-0">
          BF
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold text-sidebar-accent-foreground tracking-tight">
            BentaFlow
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
            Menu
          </p>
        )}
        {filteredNav.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-primary/15 text-sidebar-primary shadow-[inset_0_0_0_1px_hsl(var(--sidebar-primary)/0.15)]'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-sidebar-primary' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-2 flex items-center justify-center rounded-xl py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-sidebar-accent transition-all duration-150">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary shrink-0">
                <User className="h-4 w-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-sidebar-foreground">{user?.role}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
