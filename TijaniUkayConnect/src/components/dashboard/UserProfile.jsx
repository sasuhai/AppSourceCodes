import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { User, Mail, Phone, MapPin, Lock, Save, Building } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const UserProfile = ({ user }) => {
      const { toast } = useToast();
      const [email, setEmail] = useState('');
      const [formData, setFormData] = useState({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        unit_number: user.unit_number || '',
      });
      const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
      });
      const [loading, setLoading] = useState(false);
      const [passwordLoading, setPasswordLoading] = useState(false);

      useEffect(() => {
        const getUserEmail = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setEmail(user.email);
          }
        };
        getUserEmail();
      }, []);

      const handleInfoChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
      };

      const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            unit_number: formData.unit_number,
          })
          .eq('id', user.id);

        if (error) {
          toast({
            title: "Update Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Profile Updated! ✅",
            description: "Your profile information has been saved.",
          });
        }
        setLoading(false);
      };

      const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }
        if (passwordData.newPassword.length < 6) {
          toast({
            title: "Password Too Short",
            description: "Password should be at least 6 characters.",
            variant: "destructive",
          });
          return;
        }

        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword,
        });

        if (error) {
          toast({
            title: "Password Reset Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password Reset Successful! 🔐",
            description: "Your password has been changed.",
          });
          setPasswordData({ newPassword: '', confirmPassword: '' });
        }
        setPasswordLoading(false);
      };

      return (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="full_name" value={formData.full_name} onChange={handleInfoChange} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="email" type="email" value={email} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100" readOnly />
                  </div>
                </div>
                 <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Number</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="unit_number" value={formData.unit_number} onChange={handleInfoChange} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="phone" value={formData.phone} onChange={handleInfoChange} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea name="address" value={formData.address} onChange={handleInfoChange} rows="3" className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Reset Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl" placeholder="Enter new password" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl" placeholder="Confirm new password" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={passwordLoading} variant="outline" className="w-full flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {passwordLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </motion.div>
        </div>
      );
    };

    export default UserProfile;