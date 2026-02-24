import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Role } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Users, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const roleBadgeVariant = (role: Role) => {
	switch (role) {
		case "ADMIN":
			return "destructive";
		case "MANAGER":
			return "default";
		case "CASHIER":
			return "secondary";
	}
};

interface UserForm {
	name: string;
	email: string;
	role: Role;
	password: string;
}

const emptyForm: UserForm = {
	name: "",
	email: "",
	role: "CASHIER",
	password: "",
};

export default function UsersPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [form, setForm] = useState<UserForm>(emptyForm);
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => usersApi.list(),
	});

	const createMutation = useMutation({
		mutationFn: (data: UserForm) => usersApi.create(data),
		onSuccess: () => {
			toast({ title: "User created" });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			closeDialog();
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<UserForm> }) =>
			usersApi.update(id, data),
		onSuccess: () => {
			toast({ title: "User updated" });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			closeDialog();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => usersApi.delete(id),
		onSuccess: () => {
			toast({ title: "User deleted" });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setDeleteTarget(null);
		},
	});

	const closeDialog = () => {
		setDialogOpen(false);
		setEditingUser(null);
		setForm(emptyForm);
	};

	const openCreate = () => {
		setEditingUser(null);
		setForm(emptyForm);
		setDialogOpen(true);
	};

	const openEdit = (u: User) => {
		setEditingUser(u);
		setForm({ name: u.name, email: u.email, role: u.role, password: "" });
		setDialogOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim() || !form.email.trim()) return;
		if (editingUser) {
			const { password, ...rest } = form;
			updateMutation.mutate({
				id: editingUser.id,
				data: password ? form : rest,
			});
		} else {
			if (!form.password) return;
			createMutation.mutate(form);
		}
	};

	const updateField = <K extends keyof UserForm>(
		key: K,
		value: UserForm[K],
	) => setForm((prev) => ({ ...prev, [key]: value }));

	return (
		<div className="space-y-6 animate-slide-in">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Users
					</h1>
					<p className="text-sm text-muted-foreground">
						Manage system users and roles
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className="mr-2 h-4 w-4" /> Add User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Users className="h-4 w-4" /> All Users
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-12" />
							))}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead className="w-28 text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.users?.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center text-muted-foreground py-8"
										>
											No users
										</TableCell>
									</TableRow>
								)}
								{data?.users?.map((u) => (
									<TableRow key={u.id}>
										<TableCell className="font-medium">
											{u.name}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{u.email}
										</TableCell>
										<TableCell>
											<Badge
												variant={roleBadgeVariant(
													u.role,
												)}
												className="gap-1"
											>
												<Shield className="h-3 w-3" />{" "}
												{u.role}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => openEdit(u)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												onClick={() =>
													setDeleteTarget(u)
												}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Dialog */}
			<Dialog open={dialogOpen} onOpenChange={(v) => !v && closeDialog()}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingUser ? "Edit User" : "New User"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label>Name</Label>
							<Input
								value={form.name}
								onChange={(e) =>
									updateField("name", e.target.value)
								}
								placeholder="Full name"
							/>
						</div>
						<div className="space-y-2">
							<Label>Email</Label>
							<Input
								value={form.email}
								onChange={(e) =>
									updateField("email", e.target.value)
								}
								placeholder="email@example.com"
								type="email"
							/>
						</div>
						<div className="space-y-2">
							<Label>Role</Label>
							<Select
								value={form.role}
								onValueChange={(v) =>
									updateField("role", v as Role)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ADMIN">Admin</SelectItem>
									<SelectItem value="MANAGER">
										Manager
									</SelectItem>
									<SelectItem value="CASHIER">
										Cashier
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>
								{editingUser
									? "Password (leave blank to keep)"
									: "Password"}
							</Label>
							<Input
								value={form.password}
								onChange={(e) =>
									updateField("password", e.target.value)
								}
								placeholder="••••••••"
								type="password"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={closeDialog}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									createMutation.isPending ||
									updateMutation.isPending
								}
							>
								{editingUser ? "Update" : "Create"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirm */}
			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(v) => !v && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete "{deleteTarget?.name}"?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove this user.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								deleteTarget &&
								deleteMutation.mutate(deleteTarget.id)
							}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
