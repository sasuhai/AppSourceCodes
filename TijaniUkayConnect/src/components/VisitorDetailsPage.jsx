import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { motion } from 'framer-motion';
    import { User, Phone, Car, Calendar, Clock, Edit3, Home, Shield } from 'lucide-react';

    const VisitorDetailsPage = ({ visitorId }) => {
        const [visitorDetails, setVisitorDetails] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchVisitorDetails = async () => {
                if (!visitorId) {
                    setError("No visitor ID provided.");
                    setLoading(false);
                    return;
                }

                try {
                    const { data, error } = await supabase
                        .from('visitors')
                        .select('*, profiles(full_name, phone, unit_number)')
                        .eq('id', visitorId)
                        .single();

                    if (error) {
                        throw error;
                    }

                    if (data) {
                        setVisitorDetails(data);
                    } else {
                        setError("Visitor not found.");
                    }
                } catch (err) {
                    setError("Could not fetch visitor details. The link may be invalid or expired.");
                    console.error("Error fetching visitor:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchVisitorDetails();
        }, [visitorId]);

        const DetailItem = ({ icon, label, value }) => (
            <div className="flex items-start gap-3 p-2.5 bg-white rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    {React.createElement(icon, { className: "w-4 h-4 text-green-700" })}
                </div>
                <div>
                    <p className="text-xs text-gray-500 leading-tight">{label}</p>
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{value || 'N/A'}</p>
                </div>
            </div>
        );

        if (loading) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-green-600 border-dashed rounded-full animate-spin mx-auto"></div>
                        <p className="text-lg font-semibold text-gray-700 mt-4">Loading Visitor Details...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                    <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
                        <p className="text-gray-600 text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        if (!visitorDetails) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p>No visitor details available.</p>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-amber-50 p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
                        <h1 className="text-2xl font-bold text-center">Visitor Pass</h1>
                        <p className="text-center text-green-200 text-sm mt-1">Tijani Ukay</p>
                    </div>
                    
                    <div className="p-4 space-y-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-green-200 pb-2">Visitor Information</h2>
                            <div className="grid grid-cols-1 gap-2">
                               <DetailItem icon={User} label="Visitor Name" value={visitorDetails.name} />
                               <DetailItem icon={Phone} label="Visitor Phone" value={visitorDetails.phone} />
                               <DetailItem icon={Car} label="Vehicle Plate" value={visitorDetails.vehicle_plate} />
                               <DetailItem icon={Car} label="Vehicle Type" value={visitorDetails.vehicle_type} />
                               <DetailItem icon={Calendar} label="Visit Date" value={new Date(visitorDetails.visit_date).toLocaleDateString()} />
                               <DetailItem icon={Clock} label="Visit Time" value={visitorDetails.visit_time} />
                               <DetailItem icon={Edit3} label="Reason for Visit" value={visitorDetails.purpose} />
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-green-200 pb-2">Host Information</h2>
                            <div className="grid grid-cols-1 gap-2">
                               <DetailItem icon={User} label="Resident Name" value={visitorDetails.profiles?.full_name} />
                               <DetailItem icon={Home} label="Unit Number" value={visitorDetails.profiles?.unit_number} />
                               <DetailItem icon={Phone} label="Resident Phone" value={visitorDetails.profiles?.phone} />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 text-center text-xs text-gray-500 border-t">
                        This QR code is valid for single entry on the specified date.
                    </div>
                </motion.div>
            </div>
        );
    };

    export default VisitorDetailsPage;