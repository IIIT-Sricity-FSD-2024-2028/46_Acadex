import { Card, CardContent, Button, Input } from "../../../components/common";
import { Star, MessageSquare, Search, X, Send, ShieldAlert, Clock, CheckCircle2, AlertTriangle, Calendar, User } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";
import { useInstructor } from "../../../hooks/useInstructor";

const STATUS_CONFIGS = {
  Pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending Review' },
  'In Progress': { bg: 'bg-blue-50 text-[#0056D2] border-blue-200', icon: Clock, label: 'Under Investigation' },
  Resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Resolved' },
  Rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: X, label: 'Declined' },
};

export function Reviews() {
  const { instructor } = useInstructor();
  const [activeMainTab, setActiveMainTab] = useState('reviews'); // 'reviews' | 'disputes'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedRating, setSelectedRating] = useState("All Ratings");
  const [sortBy, setSortBy] = useState("Newest First");

  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: [],
  });
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply form states for reviews
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Reply form states for disputes
  const [disputeReplyText, setDisputeReplyText] = useState({});
  const [sendingDisputeReply, setSendingDisputeReply] = useState(false);

  const loadReviews = () => {
    const q = instructor?.id ? `?instructorId=${instructor.id}` : '';
    api.get(`/reviews${q}`, 'instructor')
      .then(data => {
        const rawList = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : (Array.isArray(data?.data) ? data.data : []));
        const normalized = rawList.map(r => ({
          ...r,
          id: r.id,
          name: r.name || r.learnerName || r.user || 'Verified Learner',
          avatar: r.avatar || r.learnerAvatar || '',
          course: r.course || r.courseTitle || 'Enterprise Masterclass',
          rating: Number(r.rating) || 5,
          content: r.content || r.comment || '',
          date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
          timestamp: r.timestamp || (r.createdAt ? new Date(r.createdAt).getTime() : Date.now()),
          response: r.response || r.instructorReply || '',
        }));

        const total = normalized.length;
        const avg = total > 0 ? (normalized.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;
        
        const breakdown = [5, 4, 3, 2, 1].map(stars => {
          const count = normalized.filter(r => Math.round(r.rating) === stars).length;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return { stars, count, percent };
        });

        setReviewsData({
          reviews: normalized,
          averageRating: avg,
          totalReviews: total,
          ratingBreakdown: breakdown,
        });
      })
      .catch(err => console.error('Error fetching reviews:', err))
      .finally(() => setLoading(false));
  };

  const loadDisputes = () => {
    api.get('/disputes', 'instructor')
      .then(data => {
        const rawList = Array.isArray(data) ? data : (data?.items || []);
        // Scope to instructor courses if possible
        const filtered = rawList.filter(d => 
          !instructor?.id || 
          d.instructorId === instructor.id || 
          !d.instructorId ||
          (d.course && d.course.toLowerCase().includes('object oriented'))
        );
        setDisputes(filtered.length > 0 ? filtered : rawList);
      })
      .catch(() => setDisputes([]));
  };

  useEffect(() => {
    loadReviews();
    loadDisputes();
  }, [instructor?.id]);

  const { reviews, ratingBreakdown: ratings } = reviewsData;

  const uniqueCourses = useMemo(() => {
    const list = reviews.map(r => r.course).filter(Boolean);
    return Array.from(new Set(list));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter(review => {
        if (selectedCourse !== "All Courses" && review.course !== selectedCourse) return false;
        if (selectedRating !== "All Ratings") {
          const r = review.rating;
          if (selectedRating === "5 Stars" && r !== 5) return false;
          if (selectedRating === "4 Stars" && r !== 4) return false;
          if (selectedRating === "3 Stars" && r !== 3) return false;
          if (selectedRating === "1-2 Stars" && r > 2) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = review.name?.toLowerCase().includes(q);
          const matchContent = review.content?.toLowerCase().includes(q);
          const matchCourse = review.course?.toLowerCase().includes(q);
          if (!matchName && !matchContent && !matchCourse) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest First") return (b.timestamp || 0) - (a.timestamp || 0);
        if (sortBy === "Oldest First") return (a.timestamp || 0) - (b.timestamp || 0);
        return 0;
      });
  }, [reviews, searchQuery, selectedCourse, selectedRating, sortBy]);

  const handleStartReply = (id, existingResponse = "") => {
    setReplyingId(id);
    setReplyText(existingResponse || "");
  };

  const handleCancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const handleSubmitReply = (id) => {
    if (!replyText.trim()) return;
    api.post(`/reviews/${id}/reply`, { response: replyText.trim() }, 'instructor')
      .then(() => {
        loadReviews();
        setReplyingId(null);
        setReplyText("");
      })
      .catch(err => console.error('Error submitting reply:', err));
  };

  const handleDeleteReply = (id) => {
    api.delete(`/reviews/${id}/reply`, 'instructor')
      .then(() => {
        loadReviews();
        if (replyingId === id) {
          setReplyingId(null);
          setReplyText("");
        }
      })
      .catch(err => console.error('Error deleting reply:', err));
  };

  const handleSendDisputeComment = async (disputeId) => {
    const text = (disputeReplyText[disputeId] || '').trim();
    if (!text) return;
    setSendingDisputeReply(true);
    try {
      await api.post(`/disputes/${disputeId}/comments`, {
        author: instructor?.name || 'Course Instructor',
        message: text,
        isAdmin: false,
      });
      setDisputeReplyText(prev => ({ ...prev, [disputeId]: '' }));
      loadDisputes();
    } catch (err) {
      console.error('Error sending dispute comment:', err);
    } finally {
      setSendingDisputeReply(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ratings, Reviews & Student Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review student feedback, respond to course questions, and address student curriculum dispute inquiries.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveMainTab('reviews')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMainTab === 'reviews'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Reviews ({reviewsData.totalReviews})
          </button>
          <button
            onClick={() => setActiveMainTab('disputes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMainTab === 'disputes'
                ? 'bg-[#0056D2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Course Disputes ({disputes.length})
          </button>
        </div>
      </div>

      {activeMainTab === 'reviews' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-extrabold text-slate-900 mb-2">
                    {reviewsData.totalReviews > 0 ? reviewsData.averageRating : '—'}
                  </div>
                  <div className="flex justify-center gap-1 mb-2 text-amber-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Course Rating ({reviewsData.totalReviews} reviews)</p>
                </div>
                
                <div className="space-y-3">
                  {ratings.map(item => (
                    <div key={item.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                        {item.stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                      <span className="w-10 text-right text-slate-400 font-medium">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search reviews..."
                  className="pl-10 pr-8 h-9 text-xs bg-slate-50/60"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                {uniqueCourses.length > 0 && (
                  <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="border border-slate-200 rounded-xl text-xs font-semibold px-2.5 py-1.5 bg-white outline-none max-w-[140px] truncate text-slate-700 shadow-2xs"
                  >
                    <option value="All Courses">All Courses</option>
                    {uniqueCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
                <select
                  value={selectedRating}
                  onChange={e => setSelectedRating(e.target.value)}
                  className="border border-slate-200 rounded-xl text-xs font-semibold px-2.5 py-1.5 bg-white outline-none text-slate-700 shadow-2xs"
                >
                  <option value="All Ratings">All Ratings</option>
                  <option value="5 Stars">5 Stars</option>
                  <option value="4 Stars">4 Stars</option>
                  <option value="3 Stars">3 Stars</option>
                  <option value="1-2 Stars">1-2 Stars</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-slate-200 rounded-xl text-xs font-semibold px-2.5 py-1.5 bg-white outline-none text-slate-700 shadow-2xs"
                >
                  <option value="Newest First">Newest First</option>
                  <option value="Oldest First">Oldest First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                Loading reviews...
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                        <p className="text-xs text-slate-500">{review.course} · {review.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4 font-normal">{review.content}</p>

                    {review.response && replyingId !== review.id && (
                      <div className="bg-blue-50/60 p-3.5 rounded-xl border-l-4 border-l-[#0056D2] mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-900">Your Official Faculty Response</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleStartReply(review.id, review.response)} className="text-xs font-semibold text-[#0056D2] hover:underline">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteReply(review.id)} className="text-xs font-semibold text-rose-600 hover:underline">
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{review.response}</p>
                      </div>
                    )}

                    {replyingId === review.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write your response to the student..."
                          rows={2}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelReply} className="h-7 text-xs font-semibold">
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSubmitReply(review.id)} className="h-7 text-xs font-semibold">
                            <Send className="w-3 h-3 mr-1" /> Send Reply
                          </Button>
                        </div>
                      </div>
                    ) : !review.response && (
                      <Button variant="outline" size="sm" onClick={() => handleStartReply(review.id)} className="h-8 text-xs font-semibold">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Reply to Review
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500">No reviews found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Course Disputes & Student Issues View */
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No course dispute tickets logged</h3>
              <p className="text-xs text-slate-500">All student course submissions and lab tickets are in good standing.</p>
            </div>
          ) : (
            disputes.map((d) => {
              const statusCfg = STATUS_CONFIGS[d.status] || STATUS_CONFIGS.Pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded">
                        {d.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {d.type || d.disputeType || 'Course Issue'}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-800">{d.course || d.courseTitle}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusCfg.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {statusCfg.label || d.status}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {d.priority} Priority
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{d.subject}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Raised by <span className="font-semibold text-slate-700">{d.raisedBy}</span> ({d.raisedByRole || 'Student'})
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </p>
                    <div className="mt-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {d.description}
                    </div>
                    {d.desiredResolution && (
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-bold text-slate-700">Requested Outcome:</span> {d.desiredResolution}
                      </p>
                    )}
                  </div>

                  {/* Resolution if present */}
                  {d.resolutionNote && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                      <p className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Administrative Decision:
                      </p>
                      <p className="text-slate-700 mt-0.5">{d.resolutionNote}</p>
                    </div>
                  )}

                  {/* Dialogue thread */}
                  {(d.comments || []).length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Dialogue Thread</span>
                      {d.comments.map((c, i) => (
                        <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-0.5">
                          <div className="flex justify-between items-center font-bold text-slate-700">
                            <span>{c.author}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-slate-600">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Instructor Response Form */}
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={disputeReplyText[d.id] || ''}
                      onChange={(e) => setDisputeReplyText({ ...disputeReplyText, [d.id]: e.target.value })}
                      placeholder="Add an educator note or update for this student inquiry..."
                      className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0056D2]"
                    />
                    <Button
                      size="sm"
                      disabled={sendingDisputeReply || !(disputeReplyText[d.id] || '').trim()}
                      onClick={() => handleSendDisputeComment(d.id)}
                      className="h-9 px-4 text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Post Note
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
