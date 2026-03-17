import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { userService } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/lib/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, FileText, Clock, CheckCircle2, LogOut, Mail, Building2, BadgeCheck } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    userService.getProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statItems = [
    { label: "Total Submitted", value: profile.stats.total_submitted, icon: FileText, bg: "bg-indigo-100", color: "text-indigo-600" },
    { label: "Pending", value: profile.stats.pending, icon: Clock, bg: "bg-amber-100", color: "text-amber-600" },
    { label: "Approved", value: profile.stats.approved, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Card */}
      <Card className="shadow-card border-0 overflow-hidden">
        <div className="h-28 gradient-hero relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white" />
            <div className="absolute bottom-2 right-1/3 w-12 h-12 rounded-full bg-white" />
          </div>
        </div>
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="-mt-12 flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
              <AvatarFallback className="gradient-primary font-heading text-3xl font-bold text-white">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <h2 className="font-heading text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {profile.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
              <BadgeCheck className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Role</p>
                <p className="text-sm font-semibold">{profile.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-3">
              <Building2 className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Department</p>
                <p className="text-sm font-semibold">{profile.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Emp. Code</p>
                <p className="text-sm font-semibold">{profile.employee_code}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="shadow-card border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b">
          <CardTitle className="font-heading text-base">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            {statItems.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="rounded-xl">Edit Profile</Button>
        <Button variant="destructive" onClick={handleLogout} className="rounded-xl">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </motion.div>
  );
}
