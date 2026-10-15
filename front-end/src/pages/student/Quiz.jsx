// =========================================================================================
// FDFED M2026 - Student Module: Graded Module Quiz & Academic Assessment (Lab 2 Implementation)
// Student: Vujja Punith Sai (S20240010260) | IIIT Sri City
// 
// Component Hierarchy:
// Quiz (Common Parent / Lifted State Owner)
//  ├── PageLayout
//  │    ├── QuizHeader (Child)
//  │    │    └── Props: quizData, isSubmitted | Callback: onSubmitClick
//  │    ├── QuizResultSummary (Child - Rendered on Completion)
//  │    │    └── Props: score, passingScore, questionsList, selectedAnswers, targetCourseId | Callback: onRetake
//  │    ├── Active Quiz Two-Column Layout (Child - Rendered during Exam)
//  │    │    ├── QuestionNavigator (Child Sidebar)
//  │    │    │    └── Props: questions, currentIdx, selectedAnswers, flaggedQuestions | Callback: onSelectQuestion
//  │    │    └── QuestionCard (Child Main Area)
//  │    │         └── Props: question, currentIdx, totalQuestions, selectedOption, isFlagged, timeLeftFormatted, progressPercent
//  │    │             Callbacks: onSelectOption, onToggleFlag, onClearSelection, onPrev, onNext, onSubmitClick
//  │    └── SubmitConfirmationModal (Child Dialogue)
//  │         └── Props: isOpen, answeredCount, totalQuestions | Callbacks: onClose, onConfirmSubmit
//
// Lifted State (Managed by Common Parent Quiz):
// - currentIdx: Currently active question index
// - selectedAnswers: Student answers dictionary { [questionIndex]: optionIndex }
// - flaggedQuestions: List of question indices flagged for subsequent review
// - timeLeft: Remaining exam time in seconds
// - isSubmitted: Boolean state confirming exam submission
// - score: Calculated grade percentage
// - showSubmitModal: Boolean modal visibility state
// =========================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

// Dedicated Subcomponents (components/student/quiz/)
import QuizHeader from '../../components/student/quiz/QuizHeader';
import QuestionNavigator from '../../components/student/quiz/QuestionNavigator';
import QuestionCard from '../../components/student/quiz/QuestionCard';
import QuizResultSummary from '../../components/student/quiz/QuizResultSummary';
import SubmitConfirmationModal from '../../components/student/quiz/SubmitConfirmationModal';

const DEFAULT_COURSERA_QUIZ = {
  id: null,
  courseId: null,
  courseTitle: '',
  institution: '',
  moduleTitle: '',
  title: '',
  description: '',
  durationMinutes: 25,
  passingScore: 80,
  totalQuestions: 0,
  questions: []
};

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getCorrectAnswerIndex = (q) => {
  if (q.correctAnswer !== undefined) return q.correctAnswer;
  if (typeof q.correctOption === 'string') {
    const char = q.correctOption.toLowerCase();
    if (char >= 'a' && char <= 'd') return char.charCodeAt(0) - 97;
  }
  if (Array.isArray(q.options)) {
    const idx = q.options.findIndex(opt => typeof opt === 'object' && opt.isCorrect);
    if (idx !== -1) return idx;
  }
  return 0;
};

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const targetCourseId = location.state?.courseId || searchParams.get('courseId') || 'crs-1';
  
  // ── LIFTED STATE IN COMMON PARENT ──────────────────────────────────────
  const [quizData, setQuizData] = useState(DEFAULT_COURSERA_QUIZ);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1500); // 25:00
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Reset answers and state whenever quiz mounts or courseId changes
    setSelectedAnswers({});
    setFlaggedQuestions([]);
    setIsSubmitted(false);
    setScore(0);
    setCurrentIdx(0);

    api.quizzes.list()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        if (list.length > 0) {
          const active =
            list.find(q => q.courseId === targetCourseId) ||
            list.find(q => q.id === 'qz-101') ||
            list[0];
          const hasQuestions = Array.isArray(active.questions) && active.questions.length > 0;
          setQuizData({
            ...DEFAULT_COURSERA_QUIZ,
            ...active,
            questions: hasQuestions ? active.questions : [],
            totalQuestions: hasQuestions ? active.questions.length : 0,
          });
          if (active.durationMinutes) {
            setTimeLeft(active.durationMinutes * 60);
          }
        }
      })
      .catch((err) => {
        console.warn('Using default Coursera assessment data:', err.message);
      });
  }, [targetCourseId]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  // ── CALLBACK FUNCTIONS (Child-to-Parent Communication) ─────────────────
  const handleSelectOption = (optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleClearSelection = () => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(currentIdx)) {
        return prev.filter(idx => idx !== currentIdx);
      } else {
        return [...prev, currentIdx];
      }
    });
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setFlaggedQuestions([]);
    setIsSubmitted(false);
    setScore(0);
    setCurrentIdx(0);
    setTimeLeft((quizData.durationMinutes || 25) * 60);
    addToast('Assessment reset. Good luck!', 'info');
  };

  const handleSubmitQuiz = () => {
    const questions = quizData.questions || [];
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const correctIdx = getCorrectAnswerIndex(q);
      if (selectedAnswers[idx] === correctIdx) {
        correctCount += 1;
      }
    });
    const total = questions.length || 1;
    const calculatedPercentage = Math.round((correctCount / total) * 100);
    setScore(calculatedPercentage);
    setIsSubmitted(true);
    setShowSubmitModal(false);
    
    if (calculatedPercentage >= (quizData.passingScore || 80)) {
      addToast(`Congratulations! You passed with ${calculatedPercentage}%!`, 'success');
    } else {
      addToast(`Assessment completed. Score: ${calculatedPercentage}%`, 'info');
    }
  };

  const questionsList = quizData.questions || [];
  const currentQ = questionsList[currentIdx] || questionsList[0];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIdx + 1) / questionsList.length) * 100);

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/student" className="hover:text-coursera transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/student/my-learning" className="hover:text-coursera transition-colors">My Learning</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 truncate max-w-xs">{quizData.courseTitle}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">Graded Assessment</span>
          </nav>

          {/* Child Component 1: QuizHeader */}
          <QuizHeader
            quizData={quizData}
            isSubmitted={isSubmitted}
            onSubmitClick={() => setShowSubmitModal(true)}
          />

          {/* Conditional View: Result Summary vs Active Assessment */}
          {isSubmitted ? (
            /* Child Component 2: QuizResultSummary */
            <QuizResultSummary
              score={score}
              passingScore={quizData.passingScore || 80}
              questionsList={questionsList}
              selectedAnswers={selectedAnswers}
              targetCourseId={targetCourseId}
              onRetake={handleRetakeQuiz}
            />
          ) : (
            /* Active Assessment 2-Column Layout */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Child Component 3: QuestionNavigator (Sidebar) */}
              <QuestionNavigator
                questions={questionsList}
                currentIdx={currentIdx}
                selectedAnswers={selectedAnswers}
                flaggedQuestions={flaggedQuestions}
                onSelectQuestion={(idx) => setCurrentIdx(idx)}
              />

              {/* Child Component 4: QuestionCard (Main Test Area) */}
              <QuestionCard
                question={currentQ}
                currentIdx={currentIdx}
                totalQuestions={questionsList.length}
                selectedOption={selectedAnswers[currentIdx]}
                isFlagged={flaggedQuestions.includes(currentIdx)}
                timeLeftFormatted={formatTimer(timeLeft)}
                progressPercent={progressPercent}
                onSelectOption={handleSelectOption}
                onToggleFlag={handleToggleFlag}
                onClearSelection={handleClearSelection}
                onPrev={() => setCurrentIdx(prev => prev - 1)}
                onNext={() => setCurrentIdx(prev => prev + 1)}
                onSubmitClick={() => setShowSubmitModal(true)}
              />

            </div>
          )}

          {/* Child Component 5: SubmitConfirmationModal */}
          <SubmitConfirmationModal
            isOpen={showSubmitModal}
            answeredCount={answeredCount}
            totalQuestions={questionsList.length}
            onClose={() => setShowSubmitModal(false)}
            onConfirmSubmit={handleSubmitQuiz}
          />

        </div>
      </div>
    </PageLayout>
  );
}
