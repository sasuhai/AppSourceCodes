import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { MessageSquare, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { linkify } from '@/lib/utils';

    const Feedback = ({ user }) => {
      const [feedbacks, setFeedbacks] = useState([]);
      const [loading, setLoading] = useState(true);
      const [formData, setFormData] = useState({
        subject: 'General Feedback',
        message: '',
      });
      const { toast } = useToast();

      useEffect(() => {
        loadFeedbacks();
      }, [user.id]);

      const loadFeedbacks = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          toast({ title: "Error loading feedback", description: error.message, variant: "destructive" });
        } else {
          setFeedbacks(data);
        }
        setLoading(false);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();

        const { error } = await supabase.from('feedback').insert({
          user_id: user.id,
          subject: formData.subject,
          message: formData.message,
          status: 'New',
        });

        if (error) {
          toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
        } else {
          toast({
            title: "Feedback Submitted! 📝",
            description: "Thank you for your feedback. We'll review it shortly.",
          });
          
          await supabase.functions.invoke('send-email', {
            body: {
              subject: 'New Feedback is Submitted',
              html: '<p>Please login to Tijani Ukay Connect portal to take action.</p>'
            }
          });

          setFormData({ subject: 'General Feedback', message: '' });
          loadFeedbacks();
        }
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800">Feedback & Inquiry</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Submit Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  required
                >
                  <option value="General Feedback">General Feedback</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Incident Report">Incident Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                  rows="6"
                  placeholder="Describe your feedback in detail..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Photos (Optional)</label>
                <button
                  type="button"
                  onClick={() => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-colors flex items-center justify-center gap-2 text-gray-600"
                >
                  <ImageIcon className="w-5 h-5" />
                  Upload Photos
                </button>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Submit Feedback
              </Button>
            </form>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Your Submissions</h3>
            {loading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold capitalize">
                      {feedback.subject}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      feedback.status === 'Resolved' ? 'bg-blue-100 text-blue-700' : 
                      feedback.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: linkify(feedback.message) }} />
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-xl shadow-lg">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No feedback submitted yet</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    export default Feedback;