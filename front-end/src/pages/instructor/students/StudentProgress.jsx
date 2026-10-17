import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, Badge, Button, Avatar } from "../../../components/common";
import { MessageSquare, Mail, Calendar, ChevronLeft, BookOpen } from "lucide-react";
import { api } from "../../../utils/api";

export function StudentProgress() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/learners/${id}`, 'instructor'),
      api.get(`/learners/${id}/enrollments`, 'instructor'),
    ])
      .then(([l, e]) => {
        setStudent(l);
        const learnerEnrollments = (Array.isArray(e) ? e : e?.items || []).filter(
          (en) => en.learnerId === id || en.learnerId === Number(id) || en.learner === l?.name || en.learnerName === l?.name
        );
        setEnrollments(learnerEnrollments);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching student progress:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading student progress...</div>;
  }

  if (!student) {
    return <div className="p-12 text-center text-slate-500">Student not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link to="/instructor/students" className="text-xs font-bold text-slate-500 hover:text-[#0056D2] flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-4">
          <Avatar fallback={student.name?.charAt(0)} size="xl" className="h-20 w-20 text-xl font-bold bg-blue-50 text-[#0056D2] border border-blue-200/60" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{student.name}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {student.institution || 'Independent Learner'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-[#0056D2] mb-1">
              {student.enrolledCoursesCount ?? student.enrolledCourses ?? enrollments.length}
            </div>
            <p className="text-xs text-slate-500 font-semibold">Tracks Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-emerald-600 mb-1">
              {student.completedCoursesCount ?? student.completedCourses ?? enrollments.filter(e => e.progress === 100).length}
            </div>
            <p className="text-xs text-slate-500 font-semibold">Tracks Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-purple-600 mb-1">
              {student.avgScore != null ? (typeof student.avgScore === 'string' && student.avgScore.includes('%') ? student.avgScore : `${student.avgScore}%`) : '—'}
            </div>
            <p className="text-xs text-slate-500 font-semibold">Avg Quiz Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-amber-600 mb-1">
              {student.learningHours != null ? `${student.learningHours}h` : '—'}
            </div>
            <p className="text-xs text-slate-500 font-semibold">Learning Time</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Course Progress & Modules</h3>

      {enrollments.length > 0 ? (
        <div className="space-y-4">
          {enrollments.map((en, idx) => (
            <Card key={en.id || idx} className="border-l-4 border-l-[#0056D2]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{en.course || en.courseTitle || 'Course Track'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Enrolled on {en.enrolledDate || en.enrollmentDate || 'Recent'}</p>
                      </div>
                      <Badge variant={en.progress === 100 ? "success" : "primary"}>
                        {en.status || (en.progress === 100 ? 'Completed' : 'In Progress')}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-600">Track Progress</span>
                        <span className="text-[#0056D2] font-bold">{en.progress ?? 0}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0056D2] rounded-full transition-all duration-500" style={{ width: `${en.progress ?? 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No active course enrollments</p>
          <p className="text-xs text-slate-400 mt-1">This student has not yet enrolled in any tracked curriculum modules.</p>
        </div>
      )}
    </div>
  );
}
