import React, { useState, useEffect, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Users, Building, FileText, Bell, Camera, Video, Shield, LogOut, CheckCircle, XCircle, ArrowLeftRight, PlusCircle, Trash2, Edit, Upload, Link, CalendarDays, Phone, ArrowUpDown, QrCode, Menu, X, Search } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Textarea } from "@/components/ui/textarea";
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

    const GenericCrud = ({ tableName, title, formFields, columns, bucketName = null }) => {
        const [items, setItems] = useState([]);
        const [editingItem, setEditingItem] = useState(null);
        const [isDialogOpen, setIsDialogOpen] = useState(false);
        const { toast } = useToast();
    
        const fetchItems = async () => {
            const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
            if (error) toast({ title: `Error fetching ${title}`, description: error.message, variant: "destructive" });
            else setItems(data);
        };
    
        useEffect(() => { fetchItems(); }, []);
    
        const handleDelete = async (id, fileInfo = null) => {
            if (fileInfo && fileInfo.path && fileInfo.bucket) {
                const { error: storageError } = await supabase.storage.from(fileInfo.bucket).remove([fileInfo.path]);
                if (storageError) {
                    toast({ title: "Storage Error", description: `Failed to delete file: ${storageError.message}`, variant: "destructive" });
                    return;
                }
            }
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
            else {
                toast({ title: `${title.slice(0, -1)} Deleted!` });
                fetchItems();
            }
        };
    
        const handleUpsert = async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
    
            let fileUrl = editingItem?.file_url || editingItem?.image_url;
            if (tableName === 'documents' || tableName === 'forms') {
                data.file_name = editingItem?.file_name;
            }
            
            const file = formData.get('file');
            if (file && file.size > 0) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const uploadBucket = bucketName || (tableName === 'photos' ? 'photos' : 'documents');
                const { data: uploadData, error: uploadError } = await supabase.storage.from(uploadBucket).upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
    
                if (uploadError) {
                    toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
                    return;
                }
                const { data: publicUrlData } = supabase.storage.from(uploadBucket).getPublicUrl(uploadData.path);
                fileUrl = publicUrlData.publicUrl;
                if(tableName === 'documents' || tableName === 'forms') data.file_name = file.name;
            }
            
            if((tableName === 'documents' || tableName === 'forms') && fileUrl) data.file_url = fileUrl;
            if(tableName === 'photos' && fileUrl) data.image_url = fileUrl;
    
            delete data.file;
            const upsertData = { ...data, id: editingItem?.id };

            if((tableName === 'documents' || tableName === 'forms') && !upsertData.file_url && editingItem?.file_url) {
                upsertData.file_url = editingItem.file_url;
            }
            if(tableName === 'photos' && !upsertData.image_url && editingItem?.image_url) {
                upsertData.image_url = editingItem.image_url;
            }


            const { error } = await supabase.from(tableName).upsert(upsertData);
    
            if (error) toast({ title: "Save Failed", description: error.message, variant: "destructive" });
            else {
                toast({ title: `${title.slice(0, -1)} Saved!` });
                fetchItems();
                setIsDialogOpen(false);
                setEditingItem(null);
            }
        };
    
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{`Manage ${title}`}</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingItem(null)}>
                                <PlusCircle className="w-5 h-5 mr-2" /> Add New
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? `Edit ${title.slice(0, -1)}` : `Add New ${title.slice(0, -1)}`}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpsert} className="space-y-4">
                                {formFields.map(field => (
                                    <div key={field.name}>
                                        <Label htmlFor={field.name}>{field.label}</Label>
                                        {field.type === 'textarea' ?
                                            <Textarea id={field.name} name={field.name} placeholder={field.placeholder} defaultValue={editingItem?.[field.name]} /> :
                                        field.type === 'file' ? 
                                            <Input id={field.name} name={field.name} type="file" /> :
                                            <Input id={field.name} name={field.name} type={field.type} placeholder={field.placeholder} defaultValue={editingItem?.[field.name]} />}
                                    </div>
                                ))}
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b-2">{columns.map(c => <th key={c.key} className="p-3">{c.label}</th>)}<th className="p-3">Actions</th></tr></thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="border-b">
                                    {columns.map(c => <td key={c.key} className="p-3">{c.key.includes('_url') ? <a href={item[c.key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">{item[c.key]}</a> : item[c.key]}</td>)}
                                    <td className="p-3 flex gap-2">
                                        <Button size="icon" variant="outline" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the item.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => {
                                                        const fileBucket = bucketName || (item.file_url ? 'documents' : (item.image_url && !item.image_url.startsWith('http')) ? 'photos' : null);
                                                        const filePath = item.file_url?.split('/').pop() || (item.image_url && !item.image_url.startsWith('http') ? item.image_url?.split('/').pop() : null);
                                                        const fileInfo = (filePath && fileBucket) ? { bucket: fileBucket, path: filePath } : null;
                                                        handleDelete(item.id, fileInfo);
                                                    }}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const AdminManageUsers = ({ adminUser }) => {
        const [users, setUsers] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
        const { toast } = useToast();

        useEffect(() => { fetchUsers(); }, []);

        const fetchUsers = async () => {
            const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
            if (profilesError) {
                toast({ title: "Error fetching profiles", description: profilesError.message, variant: "destructive" });
                return;
            }

            const { data: authData, error: authError } = await supabase.functions.invoke('get-users');
            if (authError || (authData && authData.error)) {
                toast({ title: "Error fetching auth users", description: authError?.message || authData?.error, variant: "destructive" });
                return;
            }

            const combinedUsers = profilesData.map(profile => {
                const authUser = authData.users.find(u => u.id === profile.id);
                return {
                    ...profile,
                    email: authUser?.email,
                };
            });

            setUsers(combinedUsers);
        };

        const handleStatusChange = async (userId, newStatus) => {
            if (userId === adminUser.id) {
                toast({ title: "Action Forbidden", description: "You cannot change your own status.", variant: "destructive" });
                return;
            }
            const { error } = await supabase.from('profiles').update({ status: newStatus, approved_at: newStatus === 'Active' ? new Date().toISOString() : null }).eq('id', userId);
            if (error) toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
            else { toast({ title: "User status updated!" }); fetchUsers(); }
        };

        const handleRoleChange = async (userId, newRole) => {
            if (userId === adminUser.id) {
                toast({ title: "Action Forbidden", description: "You cannot change your own role.", variant: "destructive" });
                return;
            }
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
            if (error) toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
            else { toast({ title: "User role updated!" }); fetchUsers(); }
        };

        const requestSort = (key) => {
            let direction = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        };

        const sortedAndFilteredUsers = useMemo(() => {
            let sortableItems = [...users];
            if (sortConfig.key !== null) {
                sortableItems.sort((a, b) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }
            if (!searchTerm) return sortableItems;
            return sortableItems.filter(user =>
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [users, searchTerm, sortConfig]);

        const SortableHeader = ({ columnKey, title }) => (
            <th className="p-3">
                <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-2 py-1 h-auto text-left">
                    {title}
                    <ArrowUpDown className="w-4 h-4 ml-2 inline-block" />
                </Button>
            </th>
        );

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-gray-800">Manage Residents</h3>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                            placeholder="Search residents..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-10"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2">
                                <SortableHeader columnKey="full_name" title="Name" />
                                <SortableHeader columnKey="unit_number" title="Unit" />
                                <SortableHeader columnKey="email" title="Email" />
                                <SortableHeader columnKey="status" title="Status" />
                                <SortableHeader columnKey="role" title="Role" />
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredUsers.map(user => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-3">{user.full_name}</td>
                                    <td className="p-3">{user.unit_number}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></td>
                                    <td className="p-3">{user.role}</td>
                                    <td className="p-3 space-x-2">
                                        {user.id !== adminUser.id && (
                                            <>
                                                {user.status === 'Active' ? (<Button variant="destructive" size="sm" onClick={() => handleStatusChange(user.id, 'Not Active')}>Deactivate</Button>)
                                                    : (<Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(user.id, 'Active')}>Activate</Button>)}
                                                
                                                {user.role === 'admin' ? 
                                                    (<Button variant="outline" size="sm" onClick={() => handleRoleChange(user.id, 'user')}>Demote</Button>) : 
                                                    (<Button variant="outline" size="sm" onClick={() => handleRoleChange(user.id, 'admin')}>Promote</Button>)
                                                }
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const AdminBookingList = () => {
        const [bookings, setBookings] = useState([]);
        const [sortConfig, setSortConfig] = useState({ key: 'booking_date', direction: 'descending' });
        const { toast } = useToast();

        const fetchBookings = async () => {
            let query = supabase
                .from('bookings')
                .select('*, profiles(full_name), facilities(name)');

            if (sortConfig.key) {
                const isAscending = sortConfig.direction === 'ascending';
                if (sortConfig.key === 'resident') {
                    query = query.order('profiles(full_name)', { ascending: isAscending });
                } else if (sortConfig.key === 'facility') {
                    query = query.order('facilities(name)', { ascending: isAscending });
                } else {
                    query = query.order(sortConfig.key, { ascending: isAscending });
                }
            }

            const { data, error } = await query;

            if (error) {
                toast({ title: "Error fetching bookings", description: error.message, variant: "destructive" });
            } else {
                setBookings(data);
            }
        };

        useEffect(() => {
            fetchBookings();
        }, [sortConfig]);

        const handleDelete = async (bookingId) => {
            const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
            if (error) {
                toast({ title: "Failed to delete booking", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Booking deleted successfully!" });
                fetchBookings();
            }
        };

        const requestSort = (key) => {
            let direction = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        };

        const SortableHeader = ({ columnKey, title }) => (
            <th className="p-3">
                <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-2 py-1 h-auto">
                    {title}
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
            </th>
        );

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <CalendarDays className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Booking List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2">
                                <SortableHeader columnKey="facility" title="Facility" />
                                <SortableHeader columnKey="resident" title="Resident" />
                                <SortableHeader columnKey="booking_date" title="Date" />
                                <th className="p-3">Time</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id} className="border-b">
                                    <td className="p-3">{booking.facilities?.name || 'N/A'}</td>
                                    <td className="p-3">{booking.profiles?.full_name || 'N/A'}</td>
                                    <td className="p-3">{new Date(booking.booking_date).toLocaleDateString()}</td>
                                    <td className="p-3">{booking.booking_time}</td>
                                    <td className="p-3">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the booking.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(booking.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const AdminVisitorList = () => {
        const [visitors, setVisitors] = useState([]);
        const [sortConfig, setSortConfig] = useState({ key: 'visit_date', direction: 'descending' });
        const [searchTerm, setSearchTerm] = useState('');
        const { toast } = useToast();
    
        const fetchVisitors = async () => {
            let query = supabase.from('visitors').select('*, profiles(full_name, unit_number, phone)');
            
            if (sortConfig.key) {
                const isAscending = sortConfig.direction === 'ascending';
                if (sortConfig.key === 'resident_name') {
                    query = query.order('profiles(full_name)', { ascending: isAscending });
                } else {
                    query = query.order(sortConfig.key, { ascending: isAscending });
                }
            }

            const { data, error } = await query;
    
            if (error) {
                toast({ title: "Error fetching visitors", description: error.message, variant: "destructive" });
            } else {
                setVisitors(data);
            }
        };
    
        useEffect(() => {
            fetchVisitors();
        }, [sortConfig]);
    
        const requestSort = (key) => {
            let direction = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        };
    
        const filteredVisitors = useMemo(() => {
            if (!searchTerm) return visitors;
            return visitors.filter(visitor =>
                visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (visitor.profiles && visitor.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                visitor.vehicle_plate?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [visitors, searchTerm]);
    
        const SortableHeader = ({ columnKey, title }) => (
            <th className="p-3">
                <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-2 py-1 h-auto text-left">
                    {title}
                    <ArrowUpDown className="w-4 h-4 ml-2 inline-block" />
                </Button>
            </th>
        );
    
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <QrCode className="w-8 h-8 text-green-600" />
                        <h3 className="text-2xl font-bold text-gray-800">Visitor List</h3>
                    </div>
                    <Input 
                        placeholder="Search by visitor, resident, or plate..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2">
                                <SortableHeader columnKey="name" title="Visitor Name" />
                                <th className="p-3">Phone</th>
                                <SortableHeader columnKey="vehicle_plate" title="Vehicle Plate" />
                                <SortableHeader columnKey="visit_date" title="Visit Date & Time" />
                                <SortableHeader columnKey="resident_name" title="Resident Name" />
                                <th className="p-3">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVisitors.map(visitor => (
                                <tr key={visitor.id} className="border-b">
                                    <td className="p-3">{visitor.name}</td>
                                    <td className="p-3">{visitor.phone}</td>
                                    <td className="p-3">{visitor.vehicle_plate || 'N/A'}</td>
                                    <td className="p-3">{new Date(visitor.visit_date).toLocaleDateString()} {visitor.visit_time}</td>
                                    <td className="p-3">{visitor.profiles?.full_name || 'N/A'}</td>
                                    <td className="p-3">{visitor.profiles?.unit_number || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const AdminDashboard = ({ user, onLogout, onSwitchView }) => {
      const [pendingUsers, setPendingUsers] = useState([]);
      const [activeTab, setActiveTab] = useState('registrations');
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (activeTab === 'registrations') loadPendingUsers();
      }, [activeTab]);

      const loadPendingUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('approved', false).neq('role', 'admin');
        if (error) toast({ title: "Error loading users", description: error.message, variant: "destructive" }); 
        else setPendingUsers(data);
      };

      const handleApprove = async (userId) => {
        const { error } = await supabase.from('profiles').update({ approved: true, approved_at: new Date().toISOString(), status: 'Active' }).eq('id', userId);
        if (error) toast({ title: "Approval Failed", description: error.message, variant: "destructive" }); 
        else { loadPendingUsers(); toast({ title: "User Approved! ✅", description: "The resident can now access the portal." }); }
      };

      const handleReject = async (userId) => {
        const { data: userToDelete, error: getUserError } = await supabase.from('profiles').select('id').eq('id', userId).single();
        if (getUserError && getUserError.code !== 'PGRST116') { toast({ title: "Error find ing user", description: getUserError.message, variant: "destructive" }); return; }
        
        if (userToDelete) {
            const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);
            if(authError && authError.message !== 'User not found'){ 
                toast({ title: "Rejection Partially Failed", description: `Failed to delete auth user: ${authError.message}`, variant: "destructive" }); 
                return; 
            }
            
            const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
            if (profileError) {
                toast({ title: "Rejection Failed", description: profileError.message, variant: "destructive" });
                return;
            }
        }
        loadPendingUsers(); 
        toast({ title: "Registration Rejected", description: "The registration has been removed.", variant: "destructive" }); 
      };

      const renderContent = () => {
        switch (activeTab) {
          case 'registrations':
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-3 mb-6"><Users className="w-8 h-8 text-green-600" /><h2 className="text-3xl font-bold text-gray-800">Pending Registrations</h2></div>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-xl"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><p className="text-gray-600 text-lg">No pending registrations!</p></div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((p) => (
                      <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl p-6 border-l-4 border-amber-500 shadow-lg">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div><p className="text-sm text-gray-600">Name</p><p className="font-bold text-gray-800">{p.full_name}</p></div>
                          <div><p className="text-sm text-gray-600">Unit</p><p className="font-bold text-gray-800">{p.unit_number}</p></div>
                          <div><p className="text-sm text-gray-600">Email</p><p className="font-bold text-gray-800">{p.email}</p></div>
                          <div><p className="text-sm text-gray-600">Phone</p><p className="font-bold text-gray-800">{p.phone}</p></div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button onClick={() => handleApprove(p.id)} className="flex-1 bg-green-600 hover:bg-green-700"><CheckCircle className="w-5 h-5 mr-2" />Approve</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="flex-1"><XCircle className="w-5 h-5 mr-2" />Reject</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to reject this registration?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the user and their registration data.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReject(p.id)}>Reject</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          case 'users': return <AdminManageUsers adminUser={user} />;
          case 'facilities': return (
            <div>
                <GenericCrud 
                    tableName="facilities" 
                    title="Facilities" 
                    formFields={[
                        { name: 'name', label: 'Facility Name', type: 'text', placeholder: 'e.g., Tennis Court' }, 
                        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Booking details...' }
                    ]} 
                    columns={[
                        { label: 'Name', key: 'name' }, 
                        { label: 'Description', key: 'description' }
                    ]} 
                />
                <AdminBookingList />
            </div>
          );
          case 'visitors': return <AdminVisitorList />;
          case 'documents': return <GenericCrud tableName="documents" title="Documents" formFields={[{ name: 'title', label: 'Title', type: 'text', placeholder: 'e.g., Annual Report 2024' }, { name: 'file', label: 'Document File', type: 'file' }]} columns={[{ label: 'Title', key: 'title' }, { label: 'File Name', key: 'file_name' }]} bucketName="documents" />;
          case 'announcements': return <GenericCrud tableName="announcements" title="Announcements" formFields={[{ name: 'title', label: 'Title', type: 'text', placeholder: 'e.g., Pool Maintenance' }, { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Details about the announcement...' }]} columns={[{ label: 'Title', key: 'title' }, { label: 'Content', key: 'content' }]} />;
          case 'photos': return <GenericCrud tableName="photos" title="Photos" formFields={[{ name: 'title', label: 'Title', type: 'text', placeholder: 'e.g., Community BBQ' }, { name: 'image_url', label: 'Photo Link', type: 'text', placeholder: 'https://example.com/photo.jpg' }]} columns={[{ label: 'Title', key: 'title' }, { label: 'Link', key: 'image_url' }]} />;
          case 'videos': return <GenericCrud tableName="videos" title="Videos" formFields={[{ name: 'title', label: 'Title', type: 'text', placeholder: 'e.g., New Year Celebration' }, { name: 'video_url', label: 'Video URL', type: 'text', placeholder: 'https://youtube.com/watch?v=...' }]} columns={[{ label: 'Title', key: 'title' }, { label: 'URL', key: 'video_url' }]} />;
          case 'forms': return <GenericCrud tableName="forms" title="Forms" formFields={[{ name: 'title', label: 'Form Title', type: 'text', placeholder: 'e.g., Renovation Application' }, { name: 'file', label: 'Form File', type: 'file' }]} columns={[{ label: 'Title', key: 'title' }, { label: 'File Name', key: 'file_name' }]} bucketName="documents" />;
          case 'contacts': return <GenericCrud tableName="contacts" title="Contacts" formFields={[{ name: 'name', label: 'Name', type: 'text', placeholder: 'e.g., Management Office' }, { name: 'phone', label: 'Phone', type: 'text', placeholder: '+60 3-1234 5678' }, { name: 'email', label: 'Email', type: 'email', placeholder: 'management@example.com' }, { name: 'address', label: 'Address', type: 'text', placeholder: 'Block A, Ground Floor' }, { name: 'whatsapp', label: 'WhatsApp', type: 'text', placeholder: '+60123456789' }]} columns={[{ label: 'Name', key: 'name' }, { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' }]} />;
          default: return <div>Not implemented</div>;
        }
      };

      const adminTabs = [
        { id: 'registrations', label: 'Registrations', icon: CheckCircle },
        { id: 'users', label: 'Residents', icon: Users },
        { id: 'visitors', label: 'Visitors', icon: QrCode },
        { id: 'facilities', label: 'Facilities', icon: Building },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'photos', label: 'Photos', icon: Camera },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'forms', label: 'Forms', icon: FileText },
        { id: 'contacts', label: 'Contacts', icon: Phone },
      ];
      
      const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false);
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
          <nav className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">Admin Panel</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-gray-700 font-medium">{user?.full_name}</span>
                   <Button variant="outline" onClick={onSwitchView} className="hidden md:flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" />User View</Button>
                  <Button variant="ghost" size="icon" onClick={onLogout} className="hidden md:flex items-center gap-2"><LogOut className="w-5 h-5" /></Button>
                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex">
             <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg overflow-y-auto z-30`}>
                <div className="p-4 space-y-2">
                    {adminTabs.map(tab => (
                        <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'text-gray-700 hover:bg-green-50'}`}>
                            <tab.icon className="w-5 h-5" /><span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                    <div className="pt-4 border-t md:hidden">
                        <Button variant="outline" onClick={onSwitchView} className="w-full flex items-center gap-2 mb-2"><ArrowLeftRight className="w-4 h-4" />User View</Button>
                        <Button variant="ghost" onClick={onLogout} className="w-full flex items-center gap-2"><LogOut className="w-5 h-5" />Logout</Button>
                    </div>
                </div>
             </aside>
             <main className="flex-1 p-4 md:p-8">
                 <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
             </main>
          </div>
        </div>
      );
    };

    export default AdminDashboard;