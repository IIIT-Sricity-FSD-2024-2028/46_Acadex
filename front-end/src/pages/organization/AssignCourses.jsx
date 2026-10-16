import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Check,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Send,
  Calendar,
  Mail
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';

export default function AssignCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { instructors: allInstructors, courses: allCourses, sendCourseTeachingRequest, info: organization } = useOrg();
  const courses = allCourses.filter((c) => c.organizationId === organization?.id);
  const instructors = allInstructors.filter((i) => !i.organizationId || i.organizationId === organization?.id);

  // Only use an explicit URL selection; otherwise start with no selections.
  const queryParams = new URLSearchParams(location.search);
  const preselectedInstId = queryParams.get('instructorId');
  const preselectedCourseId = queryParams.get('courseId');

  const [selectedInstructorIds, setSelectedInstructorIds] = useState(
    preselectedInstId ? [preselectedInstId] : []
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState(
    preselectedCourseId ? [preselectedCourseId] : []
  );
  const [semester, setSemester] = useState('');
  const [creditHours, setCreditHours] = useState('');
  const [proposedTerms, setProposedTerms] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const [instructorSearch, setInstructorSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  const selectedInstructors = instructors.filter(i => selectedInstructorIds.includes(i.id));

  const toggleCourse = (id) => {
    setSelectedCourseIds(prev =>
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const toggleInstructor = (id) => {
    setSelectedInstructorIds(prev =>
      prev.includes(id) ? prev.filter(instructorId => instructorId !== id) : [...prev, id]
    );
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (selectedInstructors.length === 0) {
      addToast('Please select at least one faculty instructor', 'error');
      return;
    }
    if (selectedCourseIds.length === 0) {
      addToast('Please select at least one course to assign', 'error');
      return;
    }

    {
      const promises = [];
      // Send one request for every selected instructor-course pairing.
      selectedCourseIds.forEach(cId => {
        const course = courses.find(c => c.id === cId);
        selectedInstructors.forEach(instructor => {
          promises.push(
            sendCourseTeachingRequest({
              instructorId: instructor.id,
              courseId: course?.id,
              semester: semester.trim() || undefined,
              creditHours: creditHours.trim() || undefined,
              proposedTerms: proposedTerms.trim() || undefined,
              message: customMessage.trim() || undefined,
              organizationId: organization?.id,
              organizationName: organization?.name,
            })
          );
        });
      });

      const results = await Promise.allSettled(promises);
      const failed = results.filter((r) => r.status === 'rejected');
      const sent = results.length - failed.length;
      if (sent) addToast(`${sent} invitation(s) sent`, 'success');
      if (failed.length) addToast(`${failed.length} not sent: ${failed[0].reason?.message || 'server error'}`, 'error');
      if (!failed.length) navigate('/org/instructor-requests');
    }
  };

  const filteredInstructors = instructors.filter(i =>
    (i.name || '').toLowerCase().includes(instructorSearch.toLowerCase()) ||
    (i.specialization || '').toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    (c.title || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Courses', path: '/courses' },
        { label: 'Assign Course to Instructor' }
      ]}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Link to="/org/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-on-surface">Assign Courses</h1>
        </div>

        <form onSubmit={handleAssignSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Step 1: Select Faculty Instructor (5 cols) */}
            <div className="lg:col-span-5 h-full bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
                  <h2 className="text-sm font-bold text-on-surface">Select Faculty Instructors</h2>
                </div>
                <span className="text-[11px] text-outline font-semibold">{instructors.length} Available</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search faculty by name or domain..."
                  value={instructorSearch}
                  onChange={(e) => setInstructorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
                />
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {filteredInstructors.map((inst) => {
                  const isSelected = selectedInstructorIds.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      onClick={() => toggleInstructor(inst.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          : 'border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={inst.avatar} alt={inst.name} className="w-10 h-10 rounded-2xl object-cover" />
                        <div>
                          <h3 className="font-bold text-xs text-on-surface">
                            {inst.name}
                            {!inst.organizationId && <span className="ml-1.5 text-[9px] font-bold text-amber-700">Not affiliated</span>}
                          </h3>
                          <p className="text-[10px] text-primary font-semibold">{inst.specialization}</p>
                          <span className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                            <Mail className="w-2.5 h-2.5" /> {inst.email}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Target Course(s) (7 cols) */}
            <div className="lg:col-span-7 h-full bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">2</span>
                  <h2 className="text-sm font-bold text-on-surface">Select Course(s) to Assign</h2>
                </div>
                <span className="text-xs text-primary font-bold">{selectedCourseIds.length} Course(s) Selected</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search course catalog..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
                />
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {filteredCourses.map((c) => {
                  const isSelected = selectedCourseIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleCourse(c.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          : 'border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <img src={c.thumbnail} alt={c.title} className="w-12 h-9 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-xs text-on-surface line-clamp-1">{c.title}</h3>
                          <p className="text-[10px] text-outline">
                            {[c.category, c.totalHours, c.instructorName ? `Currently: ${c.instructorName}` : 'No instructor yet'].filter(Boolean).join(' • ')}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-emerald-700">₹{c.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Step 3: Optional terms */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
            <h2 className="text-sm font-bold text-on-surface pb-3 border-b border-outline-variant flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">3</span>
              <span>Invitation details (optional)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ['Term / semester', semester, setSemester, 'e.g. Spring 2027'],
                ['Credits or hours', creditHours, setCreditHours, 'e.g. 4 credits / 45 hours'],
                ['Compensation', proposedTerms, setProposedTerms, 'e.g. ₹40,000 per term'],
              ].map(([label, value, setter, placeholder]) => (
                <div key={label}>
                  <label className="text-xs font-bold text-on-surface block mb-1">{label}</label>
                  <input
                    type="text"
                    value={value}
                    maxLength={120}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1">Message to the instructor</label>
              <textarea
                value={customMessage}
                maxLength={1000}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Tell the instructor what you expect: schedule, batch size, start date."
                rows={3}
                className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-outline font-medium">Assignment Overview:</span>
              <p className="text-sm font-bold text-on-surface">
                Assigning <strong className="text-primary">{selectedCourseIds.length} course(s)</strong> to <strong className="text-primary">{selectedInstructors.length} instructor(s)</strong>
              </p>
              <p className="text-xs text-outline mt-0.5">
                {semester ? `Term: ${semester} • ` : ''}{selectedInstructors.length * selectedCourseIds.length} invitation(s) will be sent
              </p>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Assign Courses & Dispatch Outreach</span>
            </button>
          </div>
        </form>

      </div>
    </OrgLayout>
  );
}
