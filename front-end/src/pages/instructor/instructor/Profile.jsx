import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Avatar } from "../../../components/instructor/ui/Avatar";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Camera, Building2, CheckCircle2, LogOut, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../../utils/api";

export function Profile() {
  const instructorId = localStorage.getItem('nexuspay_instructor_id') || 'inst-1';
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [orgStatusMessage, setOrgStatusMessage] = useState("");
  const [isAffiliated, setIsAffiliated] = useState(true);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    title: "Lead Instructor, Computer Science",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    orgName: "",
    orgDepartment: "",
    orgRole: "",
    orgWorkEmail: "",
    orgWebsite: "",
    orgJoined: "",
    skills: "",
    education: "",
    experience: "Teaching and software engineering leader.",
  });

  useEffect(() => {
    api.get(`/instructors/${instructorId}`, "instructor")
      .then((data) => {
        if (data) {
          setFormData({
            fullName: data.name || '',
            title: data.educatorType || data.specialization || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            website: data.website || '',
            bio: data.bio || '',
            orgName: data.organization || '',
            orgDepartment: data.orgDepartment || '',
            orgRole: data.orgRole || data.educatorType || '',
            orgWorkEmail: data.orgWorkEmail || data.email || '',
            orgWebsite: data.orgWebsite || '',
            orgJoined: data.orgJoined || data.joinedDate || '',
            skills: Array.isArray(data.expertise) ? data.expertise.join(', ') : (data.expertise || data.specialization || ''),
            education: data.qualification || '',
            experience: data.experience || '',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching instructor profile:", err);
        setLoading(false);
      });
  }, [instructorId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    api.patch(`/instructors/${instructorId}`, {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      website: formData.website,
      bio: formData.bio,
      organization: formData.orgName,
      expertise: formData.skills,
      qualification: formData.education,
    }, "instructor")
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      })
      .catch((err) => console.error("Error updating profile:", err));
  };

  const handleLeaveOrganization = () => {
    setIsAffiliated(false);
    setFormData((prev) => ({
      ...prev,
      orgName: "",
      orgDepartment: "",
      orgRole: "Independent Instructor",
      orgWorkEmail: "",
      orgWebsite: "",
      orgJoined: "",
    }));
    setShowLeaveModal(false);
    setOrgStatusMessage("You have successfully left the organization.");
    setTimeout(() => setOrgStatusMessage(""), 5000);
  };

  const handleRejoinOrg = () => {
    setIsAffiliated(true);
    setFormData((prev) => ({
      ...prev,
      orgName: "University of Tech",
      orgDepartment: "Department of Computer Science & Engineering",
      orgRole: "Admin & Lead Faculty",
      orgWorkEmail: "s.jenkins@univ.edu",
      orgWebsite: "https://univ.edu",
      orgJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    setOrgStatusMessage("Re-affiliated with organization.");
    setTimeout(() => setOrgStatusMessage(""), 4000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Instructor Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your public academic credentials, personal details, and institutional affiliation.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Saved successfully!
            </div>
          )}
          {orgStatusMessage && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#0056D2]" />
              {orgStatusMessage}
            </div>
          )}
          <Button type="submit">Save Changes</Button>
        </div>
      </div>

      {/* Header Profile Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar fallback={formData.fullName || "Dr. Sarah Jenkins"} size="xl" className="h-24 w-24 text-2xl font-bold bg-blue-50 text-[#0056D2] border border-blue-200/60" />
              <button type="button" className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <Input 
                    value={formData.fullName} 
                    onChange={(e) => handleChange("fullName", e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Professional Title</label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => handleChange("title", e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details Card */}
      <Card className="border-blue-100 shadow-2xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0056D2] border border-blue-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Institutional Organization Affiliation</CardTitle>
                <CardDescription>Your affiliated university or institutional department account.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isAffiliated ? "success" : "default"}>
                {isAffiliated ? "Active Affiliation" : "Independent"}
              </Badge>
              {isAffiliated ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLeaveModal(true)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Leave Organization
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleRejoinOrg}
                >
                  <Building2 className="w-4 h-4 mr-1.5" />
                  Join Organization
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6">
          {isAffiliated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization Name</label>
                <Input 
                  value={formData.orgName} 
                  onChange={(e) => handleChange("orgName", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Faculty</label>
                <Input 
                  value={formData.orgDepartment} 
                  onChange={(e) => handleChange("orgDepartment", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Role in Organization</label>
                <Input 
                  value={formData.orgRole} 
                  onChange={(e) => handleChange("orgRole", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Institutional Email</label>
                <Input 
                  type="email" 
                  value={formData.orgWorkEmail} 
                  onChange={(e) => handleChange("orgWorkEmail", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization Website</label>
                <Input 
                  type="url" 
                  value={formData.orgWebsite} 
                  onChange={(e) => handleChange("orgWebsite", e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Joined Date</label>
                <Input 
                  value={formData.orgJoined} 
                  readOnly 
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">You are currently an Independent Instructor</p>
              <p className="text-xs text-slate-500 mt-1">You are not affiliated with any university or institutional organization account.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Organization Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Leave Organization?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to leave <span className="font-semibold text-slate-800">{formData.orgName}</span>? You will lose access to institutional resources and faculty privileges.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleLeaveOrganization}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm & Leave
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Contact Details</CardTitle>
          <CardDescription>Direct contact channels visible to affiliated administrators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Personal Email</label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <Input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => handleChange("phone", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Location / Campus</label>
              <Input 
                value={formData.location} 
                onChange={(e) => handleChange("location", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Website / Portfolio</label>
              <Input 
                type="url" 
                value={formData.website} 
                onChange={(e) => handleChange("website", e.target.value)} 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Bio</label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] min-h-[100px]"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Credentials</CardTitle>
          <CardDescription>Specializations, qualifications, and curriculum leadership history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Expertise / Core Domains</label>
            <Input 
              value={formData.skills} 
              onChange={(e) => handleChange("skills", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Education & Degrees</label>
            <Input 
              value={formData.education} 
              onChange={(e) => handleChange("education", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience & Leadership</label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] min-h-[80px]"
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
