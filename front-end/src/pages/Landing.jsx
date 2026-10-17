import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, BookOpen, GraduationCap, Users, Award, Check, Star, Compass, Layers, Menu, X, Quote, ShieldCheck, Building2, MessageCircle } from 'lucide-react';
import { useRemoteData } from '../hooks/useRemoteData';
import { Brand, LearningVisual } from '../components/brand/Brand';
import '../styles/academy.css';
const actors = [
    ['Student', 'For learners', GraduationCap, 'Find your next skill.'],
    ['Instructor', 'For instructors', BookOpen, 'Share what you know.'],
    ['Organization', 'For organizations', Building2, 'Help your people grow.'],
    ['Admin', 'Platform admin', ShieldCheck, 'Keep learning moving.'],
    ['SuperAdmin', 'Super admin', Layers, 'Manage the bigger picture.'],
];
export default function Landing() {
    const state = useRemoteData('/public/landing');
    const { data, loading, error } = state;
    const [menu, setMenu] = useState(false);
    const [category, setCategory] = useState('All');
    const navigate = useNavigate();
    const categories = ['All', ...new Set(data?.courses?.map(c => c.category).filter(Boolean) || [])];
    const courses = (data?.courses || []).filter(c => category === 'All' || c.category === category).slice(0, 6);
    function explore(id) { navigate('/signin?role=Student', { state: { from: { pathname: `/student/course/${id}` } } }); }
    return <div className="academy-public">
    <a className="academy-skip" href="#main">Skip to content</a>
    <header className="academy-navbar">
    <div className="academy-container academy-nav-inner">
    <Brand />
    <button className="academy-menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">{menu ? <X /> : <Menu />}</button>
    <nav className={menu ? 'is-open' : ''} aria-label="Main navigation">{[['Home', '#home'], ['Courses', '#courses'], ['Features', '#features'], ['About', '#about'], ['Contact', '#contact']].map(([label, to]) => <a key={label} href={to} onClick={() => setMenu(false)}>{label}</a>)}</nav>
    <div className="academy-nav-actions">
    <Link to="/signin" className="academy-text-link">Sign in</Link>
    <Link to="/signup" className="academy-btn academy-btn-dark">Get started<ArrowUpRight size={14}/>
    </Link>
    </div>
    </div>
    </header>
    <main id="main">
      <section id="home" className="academy-hero academy-container">
    <div>
    <p className="academy-eyebrow">
    <span />ACADEX LEARNING PLATFORM</p>
    <h1>Your learning platform.<br/><em>One connected workspace.</em>
    </h1>
    <p className="academy-hero-copy">Manage courses, enrollments, assessments, and certificates with dedicated workspaces for every role.</p>
    <div className="academy-hero-actions">
    <a href="#courses" className="academy-btn academy-btn-dark">Find your next course<ArrowUpRight size={16}/>
    </a>
    <a href="#how-it-works" className="academy-text-link">See how it works<ArrowRight size={15}/>
    </a>
    </div>
    <div className="academy-hero-foot">
    <span>
    <Check size={13}/>Learn at your pace</span>
    <span>
    <Check size={13}/>Build real skills</span>
    <span>
    <Check size={13}/>Track your progress</span>
    </div>
    </div>
    <section className="saas-landing-preview"><header><strong>Platform overview</strong></header><div className="preview-metrics">{[['Learners',data?.stats.learners],['Courses',data?.stats.courses],['Instructors',data?.stats.instructors]].map(([label,value])=><article key={label}><small>{label}</small><strong>{value??'—'}</strong></article>)}</div><div className="preview-courses">{(data?.courses||[]).slice(0,3).map(c=><div key={c.id}><BookOpen size={20}/><div><strong>{c.title}</strong><small>{c.instructor||c.organization}</small></div></div>)}</div></section>
    </section>
      <section className="academy-container academy-stats" aria-label="Platform activity">{loading ? <p>Loading platform activity…</p> : error ? <div className="academy-data-error" role="alert">Platform activity is unavailable. <button onClick={state.refresh}>Try again</button>
        </div> : [['Learners', data?.stats.learners, Users], ['Published courses', data?.stats.courses, BookOpen], ['Instructors', data?.stats.instructors, GraduationCap], ['Course completions', data?.stats.completions, Award]].map(([label, value, Icon]) => <div key={label}>
        <Icon size={22} strokeWidth={1.4}/>
        <strong>{value ?? '—'}</strong>
        <span>{label}</span>
        </div>)}</section>
      <section id="courses" className="academy-section academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">FOLLOW YOUR CURIOSITY</p>
    <h2>Small steps. <em>Big possibilities.</em>
    </h2>
    <p>Explore published courses from our learning community.</p>
    </div>
    <Link to="/signin?role=Student" className="academy-text-link">Explore all courses<ArrowUpRight size={16}/>
    </Link>
    </div>
    <div className="academy-tabs" aria-label="Course categories">{categories.map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div>{loading ? <div className="academy-course-grid">{[1, 2, 3].map(i => <div className="academy-course academy-loading" key={i}>Loading courses…</div>)}</div> : error ? <div className="academy-empty" role="alert">We couldn’t load the course library. <button onClick={state.refresh}>Try again</button>
        </div> : <div className="academy-course-grid">{courses.map((c, i) => <article className="academy-course" key={c.id}>
            <button onClick={() => explore(c.id)} className={`academy-course-art art-${i % 4}`} aria-label={`Explore ${c.title}`}>
            <span className="academy-course-art-icon">
            <BookOpen size={64} strokeWidth={.8}/>
            </span>{c.thumbnail && <img src={c.thumbnail} alt="" loading="lazy" onError={e => { e.currentTarget.hidden = true; }}/>}<small>{c.category || 'A NEW PERSPECTIVE'}</small>
            </button>
            <div className="academy-course-body">
            <div className="academy-course-category">
            <span>{c.category || 'General learning'}</span>
            <small>{c.level || 'Course'}</small>
            </div>
            <h3>
            <button onClick={() => explore(c.id)}>{c.title}</button>
            </h3>
            <p>{c.instructor || c.organization || 'Explore the course details'}</p>
            <div className="academy-course-footer">
            <span>{c.rating ? <>
                <Star size={12} fill="currentColor"/>{c.rating.toFixed(1)}<small>({c.reviews} reviews)</small>
                </> : <>
                <Users size={12}/>{c.enrollments} enrolled</>}</span>
            <button onClick={() => explore(c.id)} aria-label={`View ${c.title}`}>
            <ArrowUpRight size={18}/>
            </button>
            </div>
            </div>
            </article>)}</div>}{!loading && !error && !courses.length && <div className="academy-empty">No published courses in this category yet.</div>}</section>
      <section id="features" className="academy-feature-section">
    <div className="academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">MADE FOR YOUR NEXT CHAPTER</p>
    <h2>Learning that fits <em>your life.</em>
    </h2>
    <p>Less friction. More room for the things you want to learn.</p>
    </div>
    </div>
    <div className="academy-feature-grid">{[[Compass, 'Your path, your pace', 'Choose a course that fits your interests and keep learning on your own schedule.'], [BookOpen, 'Learn by doing', 'Explore course lessons, quizzes, and assignments designed to move learning forward.'], [Award, 'See how far you’ve come', 'Track your progress and find your completed-course credentials in one place.']].map(([Icon, title, description]) => <article key={title}>
        <span>
        <Icon size={25} strokeWidth={1.4}/>
        </span>
        <h3>{title}</h3>
        <p>{description}</p>
        </article>)}</div>
    </div>
    </section>
      <section id="how-it-works" className="academy-section academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">GETTING STARTED IS SIMPLE</p>
    <h2>From “what if” to <em>“I did.”</em>
    </h2>
    </div>
    </div>
    <div className="academy-step-grid">{[['01', 'Find your spark', 'Explore the course library and find something that makes you curious.'], ['02', 'Make it your own', 'Create your learner account and enroll in your chosen course.'], ['03', 'Keep growing', 'Work through lessons, track your progress, and complete your course.']].map(([n, title, description]) => <article key={n}>
        <span>{n}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        </article>)}</div>
    </section>
      <section id="about" className="academy-container academy-about">
    <div>
    <p className="academy-eyebrow">ONE COMMUNITY. MANY POSSIBILITIES.</p>
    <h2>A place for everyone<br />who believes in <em>growth.</em>
    </h2>
    <p>Acadex brings learners, instructors, organizations, and platform teams together. Five connected workspaces, with one shared purpose: making learning work.</p>
    </div>
    <div className="academy-actors">{actors.map(([role, title, Icon, description]) => <Link key={role} to={`/signin?role=${role}`}>
        <span>
        <Icon size={20}/>
        </span>
        <div>
        <strong>{title}</strong>
        <small>{description}</small>
        </div>
        <ArrowUpRight size={16}/>
        </Link>)}</div>
    </section>
      <section className="academy-section academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">FROM THE LEARNING COMMUNITY</p>
    <h2>Every learner has <em>a story.</em>
    </h2>
    <p>Course feedback recorded on the platform.</p>
    </div>
    </div>{data?.reviews?.length ? <div className="academy-step-grid">{data.reviews.map(r => <article className="academy-review" key={r.id}>
            <Quote size={25}/>
            <div className="academy-stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: Math.min(5, Math.max(0, Math.round(r.rating))) }, (_, i) => <Star size={13} fill="currentColor" key={i}/>)}</div>
            <blockquote>{r.comment}</blockquote>
            <p>Course review · {r.course}</p>
            </article>)}</div> : <div className="academy-empty">
        <MessageCircle size={25}/>
        <p>{error ? 'Course feedback is temporarily unavailable.' : 'No published course feedback is available yet.'}</p>
        </div>}</section>
      <section id="contact" className="academy-container academy-final-cta">
    <div>
    <p className="academy-eyebrow">YOUR NEXT CHAPTER IS WAITING</p>
    <h2>Start with curiosity.<br />
    <em>See where it takes you.</em>
    </h2>
    <p>Join as a learner, teach what you know, or grow your organization.</p>
    </div>
    <div>
    <Link to="/signup" className="academy-btn academy-btn-light">Find your place<ArrowUpRight size={16}/>
    </Link>
    <Link to="/signin?role=Organization" className="academy-cta-contact">Organization workspace<ArrowRight size={14}/>
    </Link>
    <Link to="/signin?role=Student" className="academy-cta-contact">Existing learner? Sign in for support</Link>
    </div>
    </section>
    </main>
    <footer className="academy-container academy-footer">
    <div>
    <Brand />
    <p>Stay curious. Keep growing.</p>
    </div>
    <div>
    <h3>Explore</h3>
    <a href="#courses">Courses</a>
    <a href="#features">Features</a>
    <a href="#about">About Acadex</a>
    </div>
    <div>
    <h3>Your workspace</h3>{actors.map(([role, title]) => <Link key={role} to={`/signin?role=${role}`}>{title}</Link>)}</div>
    <div>
    <h3>Good to know</h3>
    <Link to="/terms">Terms of service</Link>
    <Link to="/privacy">Privacy policy</Link>
    <Link to="/honor-code">Academic honor code</Link>
    <Link to="/forgot-password">Account recovery</Link>
    </div>
    <div className="academy-footer-bottom">
    <span>© {new Date().getFullYear()} Acadex. Keep learning.</span>
    <span>Built around people. Designed for possibility.</span>
    </div>
    </footer>
  </div>;
}
