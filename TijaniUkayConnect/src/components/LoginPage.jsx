import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Mail, Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';
const LoginPage = ({
  onNavigate
}) => {
  const {
    toast
  } = useToast();
  const {
    signIn
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your inbox and confirm your email address to continue.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    setLoading(false);
  };
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    setIsResetting(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/` // Or a specific password reset page
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for a link to reset your password."
      });
      setIsForgotPasswordOpen(false);
      setResetEmail('');
    }
    setIsResetting(false);
  };
  return <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-amber-50">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.5
      }} className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center">
                <Home className="w-9 h-9 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">Tijani Ukay Connect</h2>
            <p className="text-center text-gray-600 mb-8">Login Here</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors" placeholder="your@email.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors" placeholder="Enter your password" required />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button onClick={() => setIsForgotPasswordOpen(true)} className="text-green-600 hover:text-green-700 text-sm font-medium">
                Forgot Password?
              </button>
              <div className="text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => onNavigate('register')} className="text-green-600 hover:text-green-700 font-semibold">
                  Register
                </button>
              </div>
              <div className="pt-3">
                <button onClick={() => onNavigate('landing')} className="text-gray-500 hover:text-gray-700 text-sm">
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reset-email" className="text-right">
                Email
              </Label>
              <Input id="reset-email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="col-span-3" placeholder="you@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleForgotPassword} disabled={isResetting}>
              {isResetting ? 'Sending...' : 'Send Reset Link'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};
export default LoginPage;