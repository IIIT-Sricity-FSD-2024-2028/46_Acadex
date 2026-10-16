import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Star,
  ChevronRight,
  Mail,
  Send,
  BookOpen,
  UserSearch,
  Users,
  CheckCircle2,
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';

export default function Instructors() {
  const { instructors, info } = useOrg();
  const [search, setSearch] = useState('');

  const affiliatedInstructors = instructors.filter((instructor) =>
    instructor.organizationId === info?.id ||
    (info?.id === 'org-1' && instructor.organizationId === 'org-101') ||
    (info?.id === 'org-2' && instructor.organizationId === 'org-102') ||
    Boolean(info?.name && instructor.organizationName === info.name),
  );

  const filteredInstructors = affiliatedInstructors.filter(
    (inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      (inst.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
      inst.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Instructors' }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Instructors</h1>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search faculty by name, topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Grid of Affiliated Instructors */}
        {filteredInstructors.length === 0 ? (
          affiliatedInstructors.length === 0 ? (
            /* No affiliated instructors yet — guide user to invite */
            <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-extrabold text-on-surface">No Affiliated Instructors Yet</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Instructors appear here after they <strong>accept</strong> a teaching request sent by your organization.
                  Start by inviting an instructor via the Requests page.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/org/instructor-requests"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
                >
                  <UserSearch className="w-4 h-4" />
                  <span>Invite Instructor by Email</span>
                </Link>
                <Link
                  to="/org/courses/assign"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Assign Courses to Faculty</span>
                </Link>
              </div>
              {/* How it works */}
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                {[
                  { step: '1', title: 'Invite by Email', desc: 'Go to Requests → Enter instructor\'s registered email.' },
                  { step: '2', title: 'Instructor Reviews', desc: 'They see the request in their dashboard and Accept or Reject.' },
                  { step: '3', title: 'They Appear Here', desc: 'Once accepted, the instructor is affiliated and shown in this list.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="bg-surface-container p-4 rounded-2xl border border-outline-variant/60 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary/15 text-primary font-black text-xs flex items-center justify-center">{step}</div>
                    <h4 className="text-xs font-bold text-on-surface">{title}</h4>
                    <p className="text-[11px] text-on-surface-variant leading-normal">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Has affiliated instructors but search returned nothing */
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-outline mx-auto" />
              <p className="font-bold text-on-surface">No instructors match your search</p>
              <p className="text-xs text-on-surface-variant">Try a different name, email, or specialization.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((inst) => (
              <div
                key={inst.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <Link to={`/org/instructors/${inst.id}`} className="flex items-center gap-3 group">
                      <img src={inst.avatar} alt={inst.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      <div>
                        <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{inst.name}</h3>
                        <p className="text-[11px] text-primary font-semibold">{inst.educatorType}</p>
                        <span className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {inst.email}
                        </span>
                      </div>
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inst.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inst.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-surface-container text-[11px] font-bold text-on-surface">
                      {inst.specialization}
                    </span>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {inst.bio}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-outline-variant/60 text-center text-xs my-2">
                    <div>
                      <span className="text-[10px] text-outline uppercase block font-medium">Courses</span>
                      <span className="font-bold text-on-surface">{inst.coursesCount ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline uppercase block font-medium">Learners</span>
                      <span className="font-bold text-on-surface">{inst.enrolledStudents ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline uppercase block font-medium">Rating</span>
                      <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" /> {inst.avgRating ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      to={`/org/instructors/${inst.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/org/courses/assign?instructorId=${inst.id}`}
                      className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      title="Assign a course to this professor"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </OrgLayout>
  );
}
