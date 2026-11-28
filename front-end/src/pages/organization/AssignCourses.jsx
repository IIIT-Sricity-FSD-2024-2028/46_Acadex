import SearchableSelect from '../../components/common/SearchableSelect';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  assignCourseInstructors,
  clearCourseErrors,
  fetchAssignmentOptions,
} from '../../store/actions/coursesActions';
import { fetchWorkspaceNotifications } from '../../store/actions/notificationsActions';
import {
  AdminHeader,
  AdminDataState,
  AdminSearch,
  AdminEmpty,
} from '../../components/admin/AdminUI';
export default function AssignCourses() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.courses.assignmentOptions);
  const busy = useAppSelector((s) => s.courses.actionLoading);
  const error = useAppSelector((s) => s.courses.actionError);
  const [params] = useSearchParams();
  const fixedId = params.get('courseId');
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(fixedId || ''),
    [instructorIds, setInstructorIds] = useState(
      params.get('instructorId') ? [params.get('instructorId')] : []
    ),
    [search, setSearch] = useState('');
  useEffect(() => {
    dispatch(clearCourseErrors());
    dispatch(fetchAssignmentOptions());
  }, [dispatch]);
  const data = state.data,
    course = data?.courses.find((c) => c.id === (fixedId || courseId));
  const eligibleIds = instructorIds.filter(
    (id) =>
      data?.instructors.some((i) => i.id === id && i.status === 'Active') &&
      !course?.instructorIds.includes(id)
  );
  async function assign(e) {
    e.preventDefault();
    if (!course) return;
    try {
      await dispatch(
        assignCourseInstructors({
          courseIds: [course.id],
          instructorIds: eligibleIds,
        })
      ).unwrap();
      dispatch(fetchWorkspaceNotifications());
      navigate(`/org/courses/${course.id}`);
    } catch {
      // handled by coursesSlice
    }
  }
  return (
    <OrgLayout>
      <div className="admin-page">
        <Link
          className="admin-count-label"
          to={fixedId ? `/org/courses/${fixedId}` : '/org/courses'}
        >
          <ArrowLeft size={14} />
          Back to course
        </Link>
        <AdminHeader
          title={
            course
              ? `Assign instructors · ${course.title}`
              : 'Assign instructors'
          }
        />
        <AdminDataState
          loading={state.loading}
          error={state.error}
          refresh={() => dispatch(fetchAssignmentOptions())}
        />
        {data && !state.error && (
          <form className="grid gap-5" onSubmit={assign}>
            {!fixedId && (
              <section className="admin-card">
                <SearchableSelect
                  label="Course"
                  required
                  value={courseId}
                  onChange={(v) => {
                    setCourseId(v);
                    setInstructorIds(
                      params.get('instructorId')
                        ? [params.get('instructorId')]
                        : []
                    );
                  }}
                  options={data.courses.map((c) => ({
                    value: c.id,
                    label: c.title,
                  }))}
                  placeholder="Select a course"
                />
              </section>
            )}
            {fixedId && !course && (
              <AdminEmpty
                title="Course unavailable"
                description="Choose a current course from your course list."
              />
            )}
            {course && (
              <>
                <div className="admin-toolbar">
                  <AdminSearch
                    value={search}
                    onChange={setSearch}
                    placeholder="Search instructors…"
                  />
                </div>
                <section className="admin-card">
                  <div className="admin-section-header">
                    <h2>
                      Choose instructors{' '}
                      <span className="required-marker" aria-hidden="true">
                        *
                      </span>
                    </h2>
                    <span>{eligibleIds.length} selected</span>
                  </div>
                  <div className="assignment-options">
                    {data.instructors
                      .filter((i) =>
                        `${i.name} ${i.email}`
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                      .map((i) => {
                        const assigned = course.instructorIds.includes(i.id),
                          disabled = assigned || i.status !== 'Active';
                        return (
                          <label
                            className={`assignment-choice ${disabled ? 'is-disabled' : ''}`}
                            key={i.id}
                          >
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={assigned || eligibleIds.includes(i.id)}
                              onChange={() =>
                                setInstructorIds((ids) =>
                                  ids.includes(i.id)
                                    ? ids.filter((id) => id !== i.id)
                                    : [...ids, i.id]
                                )
                              }
                            />
                            <span>
                              <strong>{i.name}</strong>
                              <small>{i.email}</small>
                            </span>
                            <span className="admin-muted">
                              {i.status !== 'Active'
                                ? i.status
                                : assigned
                                  ? 'Already assigned'
                                  : ''}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                  {!data.instructors.length && (
                    <AdminEmpty title="No associated instructors" />
                  )}
                </section>
                {error && (
                  <p role="alert" className="workspace-error">
                    {error}
                  </p>
                )}
                <div className="assignment-footer">
                  <p>
                    Assignments give active instructors immediate access to this
                    course.
                  </p>
                  <button
                    className="admin-button admin-button-primary"
                    disabled={busy || !eligibleIds.length}
                  >
                    <Check size={15} />
                    {busy ? 'Assigning…' : 'Assign instructors'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </OrgLayout>
  );
}
