"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Building, Globe, Hash } from "lucide-react";
import { saveUserProfile } from "@/lib/firestore";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
      });
    }
  }, [profile]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Create a payload of safe fields only.
      // We purposefully DO NOT include role, status, permissions, email, etc.
      const safeData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        updatedAt: new Date().toISOString()
      };

      await saveUserProfile(user.uid, safeData);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FFF9FB] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#E8D7C8]/50 rounded-[2rem] p-6 sm:p-10 mb-8 pb-20">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-4xl text-[#3A2428] mb-2">My Profile</h1>
        <p className="text-[#3A2428]/70 text-sm sm:text-base">Manage your personal information and contact details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-champagne" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="neo-input w-full pl-12 py-3"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">Email Address (Read Only)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stoneGray/50" />
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full pl-12 py-3 rounded-2xl bg-stoneGray/5 border border-stoneGray/10 text-stoneGray/70 cursor-not-allowed text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-champagne" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="neo-input w-full pl-12 py-3"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">Address / Street</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-champagne" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="neo-input w-full pl-12 py-3"
                placeholder="123 Luxury Avenue, Suite 100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">City</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-champagne" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="neo-input w-full pl-12 py-3"
                placeholder="Mumbai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">State</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-champagne" />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="neo-input w-full pl-12 py-3"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-champagne ml-2">Pincode</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-champagne" />
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="neo-input w-full pl-12 py-3"
                placeholder="400001"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#B8955E] text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-[#A38250] shadow-[0_4px_14px_rgba(184,149,94,0.3)] hover:shadow-[0_6px_20px_rgba(184,149,94,0.4)] disabled:opacity-70 disabled:cursor-not-allowed tracking-wide"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
