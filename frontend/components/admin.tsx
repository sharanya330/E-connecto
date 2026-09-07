"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Building2, MapPin, Phone, Mail } from "lucide-react";

interface PendingRecycler {
    _id: string;
    businessName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: { street: string; city: string; state: string; pinCode: string };
    ewasteTypes: string[];
    operatingHours: string;
    certifications?: string;
    website?: string;
    businessLicense: string;
    verificationStatus: string;
    createdAt: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "recycler" | "admin";
}

export default function Admin() {
    // State
    const [pendingRecyclers, setPendingRecyclers] = useState<PendingRecycler[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState("");

    // Effects
    useEffect(() => {
        fetchPendingRecyclers();
        fetchUsers();
    }, []);

    // API Calls
    const fetchPendingRecyclers = async () => {
        try {
            const res = await fetch("/api/admin/recyclers");
            if (res.ok) {
                const data = await res.json();
                setPendingRecyclers(data);
            } else if (res.status === 403) {
                setError("Access denied. Admin only.");
            } else {
                setError("Failed to fetch pending recyclers");
            }
        } catch (e) {
            console.error(e);
            setError("Failed to fetch pending recyclers");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            } else if (res.status === 403) {
                setError("Access denied. Admin only.");
            } else {
                setError("Failed to fetch users");
            }
        } catch (e) {
            console.error(e);
            setError("Failed to fetch users");
        }
    };

    // Recycler Handlers
    const handleApprove = async (id: string) => {
        setProcessing(id);
        try {
            const res = await fetch(`/api/admin/recyclers/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "approve" })
            });
            if (res.ok) {
                setPendingRecyclers(prev => prev.filter(r => r._id !== id));
                alert("Recycler approved successfully!");
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to approve recycler");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to approve recycler");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Enter reason for rejection (optional):");
        setProcessing(id);
        try {
            const res = await fetch(`/api/admin/recyclers/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject", reason })
            });
            if (res.ok) {
                setPendingRecyclers(prev => prev.filter(r => r._id !== id));
                alert("Recycler rejected");
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to reject recycler");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to reject recycler");
        } finally {
            setProcessing(null);
        }
    };

    // User Handlers
    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
                alert("User role updated");
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to update role");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u._id !== userId));
                alert("User deleted");
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to delete user");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to delete user");
        }
    };

    // Animations
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    // Render
    if (loading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center"><p className="text-muted-foreground">Loading data...</p></div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center"><p className="text-red-600">{error}</p></div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Review and manage recyclers & users</p>
                </motion.div>

                {/* Stats */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-border">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" /> Pending Recyclers</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-foreground">{pendingRecyclers.length}</p></CardContent>
                    </Card>
                </motion.div>

                {/* Pending Recycler List */}
                {pendingRecyclers.length > 0 && (
                    <motion.div variants={containerVariants} className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground">Pending Recycler Applications</h3>
                        {pendingRecyclers.map(recycler => (
                            <motion.div key={recycler._id} variants={itemVariants}>
                                <Card className="border-border hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />{recycler.businessName}</CardTitle>
                                                <CardDescription className="mt-1">Applied on {new Date(recycler.createdAt).toLocaleDateString()}</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-lg"><Clock className="w-4 h-4 text-yellow-600" /><span className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Pending</span></div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2"><h4 className="font-semibold text-sm text-foreground">Contact Information</h4><p className="flex items-center gap-2 text-sm text-foreground"><Mail className="w-4 h-4 text-primary flex-shrink-0" />{recycler.email}</p><p className="flex items-center gap-2 text-sm text-foreground"><Phone className="w-4 h-4 text-primary flex-shrink-0" />{recycler.phone}</p><p className="text-sm text-muted-foreground">Contact Person: {recycler.contactPerson}</p></div>
                                            <div className="space-y-2"><h4 className="font-semibold text-sm text-foreground">Address</h4><p className="flex items-start gap-2 text-sm text-foreground"><MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><span>{recycler.address.street}, {recycler.address.city}<br />{recycler.address.state} - {recycler.address.pinCode}</span></p></div>
                                        </div>
                                        {recycler.website && (
                                            <div><h4 className="font-semibold text-sm text-foreground mb-1">Website</h4><a href={recycler.website.startsWith('http') ? recycler.website : `https://${recycler.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{recycler.website}</a></div>
                                        )}
                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <Button onClick={() => handleApprove(recycler._id)} disabled={processing === recycler._id} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-4 h-4 mr-2" />{processing === recycler._id ? 'Processing...' : 'Approve'}</Button>
                                            <Button onClick={() => handleReject(recycler._id)} disabled={processing === recycler._id} variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><XCircle className="w-4 h-4 mr-2" />Reject</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* User Management Section */}
                <motion.div variants={itemVariants} className="mt-12">
                    <h3 className="text-2xl font-bold text-foreground mb-6">User Management</h3>
                    {users.length === 0 ? (
                        <p className="text-muted-foreground">No users found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map(u => (
                                <Card key={u._id} className="border-border hover:shadow-lg transition-all">
                                    <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg"><span>{u.name} ({u.email})</span><select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="border rounded p-1 text-sm"><option value="user">User</option><option value="recycler">Recycler</option><option value="admin">Admin</option></select></CardTitle></CardHeader>
                                    <CardContent className="flex justify-end pt-2"><Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u._id)}>Delete</Button></CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

            </motion.div>
        </section>
    );
}
