import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/instructor/ui/Tabs";
import { UserPlus, Star, Building2, CheckCircle, Info, Bell } from "lucide-react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications', 'instructor')
      .then(data => {
        setNotifications(Array.isArray(data) ? data : (data?.items || []));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      });
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false, read: true })));
  };

  const getIconConfig = (type) => {
    switch (type) {
      case 'Courses':
      case 'Approvals':
        return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" };
      case 'Reviews':
        return { icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" };
      case 'Organization':
        return { icon: Building2, color: "text-purple-600", bg: "bg-purple-100" };
      case 'student':
        return { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100" };
      default:
        return { icon: Info, color: "text-slate-600", bg: "bg-slate-100" };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Studio Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Stay updated with course approvals, student enrollments, and reviews.</p>
        </div>
        <Button variant="ghost" onClick={markAllRead} className="text-[#0056D2] hover:bg-blue-50 font-semibold text-xs">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const { icon: Icon, color, bg } = getIconConfig(notif.type);
                const isUnread = notif.unread ?? !notif.read;
                return (
                  <Card key={notif.id} className={cn("transition-colors hover:bg-slate-50/70", isUnread ? "bg-blue-50/30 border-blue-200/80" : "bg-white")}>
                    <CardContent className="p-4 flex gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/50", bg, color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm", isUnread ? "text-slate-900 font-bold" : "text-slate-700 font-semibold")}>
                            {notif.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                            {notif.date ? new Date(notif.date).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{notif.message || notif.desc}</p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-[#0056D2] rounded-full mt-2 shrink-0"></div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-500">No notifications available.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
