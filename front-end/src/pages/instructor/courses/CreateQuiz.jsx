import '../../../styles/curriculum-controls.css';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
} from '../../../components/common';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { showToast } from '../../../store/actions/toastActions';
import {
  addQuestion,
  createEmptyOption,
  deleteQuestion,
  expandInvalidQuestions,
  fetchQuizById,
  initNewQuiz,
  moveQuestion,
  saveQuiz,
  setQuizCourseId,
  setQuizTitle,
  setShowExplanations,
  updateQuestion,
} from '../../../store/actions/quizzesActions';
import {
  Plus,
  Trash2,
  Settings,
  HelpCircle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Save,
  AlertCircle,
  Lock,
  Sparkles,
  X,
  Check,
  Layers,
  Target,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { cn } from '../../../utils/cn';

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── Correct Answer Indicator ───────────────────────────────────────────────────
function CorrectAnswerRadio({ isCorrect, isLocked, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1',
        isCorrect
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 focus:ring-emerald-400 scale-110'
          : isLocked
            ? 'bg-slate-100 text-slate-300 cursor-not-allowed focus:ring-slate-200'
            : 'bg-white border-2 border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 focus:ring-emerald-300'
      )}
      title={
        isCorrect
          ? 'This is the correct answer'
          : isLocked
            ? 'Another option is already marked as correct'
            : 'Mark as correct answer'
      }
    >
      {isCorrect ? (
        <Check className="w-4 h-4" strokeWidth={3} />
      ) : isLocked ? (
        <Lock className="w-3 h-3" />
      ) : (
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-emerald-300 transition-colors" />
      )}
    </button>
  );
}

// ─── Option Row ─────────────────────────────────────────────────────────────────
function OptionRow({
  option,
  index,
  hasCorrectAnswer,
  onToggleCorrect,
  onUpdateText,
  onDelete,
  totalOptions,
}) {
  const letter = OPTION_LETTERS[index] || String(index + 1);
  const isLocked = hasCorrectAnswer && !option.isCorrect;
  const isOptionEmpty = !option.text.trim();

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-300 group',
          isOptionEmpty
            ? 'border-rose-300 bg-rose-50/20'
            : option.isCorrect
              ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-emerald-50/30 shadow-sm shadow-emerald-100'
              : isLocked
                ? 'border-slate-100 bg-slate-50/30 opacity-60'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        )}
      >
        {/* Correct Answer Toggle */}
        <CorrectAnswerRadio
          isCorrect={option.isCorrect}
          isLocked={isLocked}
          onClick={() => onToggleCorrect(option.id)}
          disabled={false}
        />

        {/* Option Letter */}
        <span
          className={cn(
            'text-sm font-bold w-7 text-center shrink-0 transition-colors duration-200',
            option.isCorrect
              ? 'text-emerald-700'
              : isLocked
                ? 'text-slate-300'
                : 'text-slate-500'
          )}
        >
          {letter}.
        </span>

        {/* Option Text */}
        <input
          type="text"
          value={option.text}
          onChange={(e) => onUpdateText(option.id, e.target.value)}
          placeholder={`Option ${letter}`}
          className={cn(
            'flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-300 transition-colors',
            option.isCorrect
              ? 'text-emerald-900 placeholder:text-emerald-300'
              : isLocked
                ? 'text-slate-400'
                : 'text-slate-800'
          )}
        />

        {/* Status / Delete */}
        <div className="flex items-center gap-1.5 shrink-0">
          {option.isCorrect && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
              CORRECT
            </span>
          )}
          {isLocked && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Lock className="w-3 h-3" />
            </span>
          )}
          {totalOptions > 2 && (
            <button
              onClick={() => onDelete(option.id)}
              className="p-1 text-slate-300 hover:text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Remove option"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {isOptionEmpty && (
        <p className="text-xs text-rose-600 font-medium pl-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> Option {letter} text is
          required
        </p>
      )}
    </div>
  );
}

// ─── Question Card ──────────────────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasCorrectAnswer = question.options.some((o) => o.isCorrect);
  const correctOption = question.options.find((o) => o.isCorrect);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [question.text]);

  // ─── Handlers ───────────────────────────────────────────────────────
  const setCorrectOption = (optionId) => {
    onUpdate({
      ...question,
      options: question.options.map((o) => ({
        ...o,
        isCorrect: o.id === optionId ? !o.isCorrect : false,
      })),
    });
  };

  const updateOptionText = (optionId, text) => {
    onUpdate({
      ...question,
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      ),
    });
  };

  const deleteOption = (optionId) => {
    if (question.options.length <= 2) return;
    onUpdate({
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
    });
  };

  const addOption = () => {
    if (question.options.length >= 8) return;
    onUpdate({
      ...question,
      options: [...question.options, createEmptyOption()],
    });
  };

  const updateQuestionText = (text) => {
    onUpdate({ ...question, text });
  };

  const updatePoints = (points) => {
    onUpdate({ ...question, points: parseInt(points) || 0 });
  };

  const updateExplanation = (explanation) => {
    onUpdate({ ...question, explanation });
  };

  return (
    <div
      className={cn(
        'bg-white border-2 rounded-2xl transition-all duration-300 overflow-hidden',
        collapsed
          ? 'border-slate-200/60 hover:border-slate-300'
          : 'border-slate-200/60 shadow-card hover:shadow-elevated'
      )}
    >
      {/* Question Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 sm:px-6',
          collapsed ? 'py-4' : 'py-5 border-b border-slate-100'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
              collapsed
                ? 'bg-slate-50 text-slate-500 hover:text-slate-700'
                : 'bg-primary-50 text-primary-600'
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {index + 1}
                </div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider hidden sm:inline">
                  Question
                </span>
              </div>

              {collapsed && (
                <span className="text-sm font-medium text-slate-700 truncate">
                  {question.text || (
                    <span className="text-slate-400 italic">
                      Untitled question
                    </span>
                  )}
                </span>
              )}
            </div>

            {collapsed && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {question.options.length} options
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {question.points} pts
                </span>
                {hasCorrectAnswer ? (
                  <Badge variant="success" className="text-[10px] py-0">
                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                    Answer set
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-[10px] py-0">
                    <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                    No answer
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Question Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => onMoveUp()}
            disabled={index === 0}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown()}
            disabled={index === totalQuestions - 1}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete()}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Body */}
      {!collapsed && (
        <div className="px-4 sm:px-6 py-5 space-y-5">
          {/* Question Text */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={question.text}
              onChange={(e) => updateQuestionText(e.target.value)}
              placeholder="Type your question here..."
              className={cn(
                'w-full rounded-xl border-2 px-4 py-3 text-sm font-medium placeholder:text-slate-300 focus:outline-none resize-none min-h-[80px] transition-all duration-200',
                !question.text.trim()
                  ? 'border-rose-300 bg-rose-50/20 text-slate-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/30 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white'
              )}
              rows={2}
            />
            {!question.text.trim() && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Question text
                is required
              </p>
            )}
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                Answer Options <span className="text-rose-500">*</span>
                {hasCorrectAnswer && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full normal-case tracking-normal">
                    <ShieldCheck className="w-3 h-3" />
                    Correct answer selected
                  </span>
                )}
                {!hasCorrectAnswer && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full normal-case tracking-normal animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    Select a correct answer
                  </span>
                )}
              </label>
            </div>

            <div className="space-y-2.5">
              {question.options.map((opt, idx) => (
                <OptionRow
                  key={opt.id}
                  option={opt}
                  index={idx}
                  hasCorrectAnswer={hasCorrectAnswer}
                  onToggleCorrect={setCorrectOption}
                  onUpdateText={updateOptionText}
                  onDelete={deleteOption}
                  totalOptions={question.options.length}
                />
              ))}
            </div>

            {!hasCorrectAnswer && (
              <p className="text-xs text-rose-600 font-medium mt-2.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please select a
                correct answer for this question
              </p>
            )}

            {/* Add Option */}
            {question.options.length < 8 && (
              <button
                onClick={addOption}
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors pl-1 group"
              >
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 group-hover:scale-110 transition-all">
                  <Plus className="w-3 h-3" strokeWidth={3} />
                </div>
                Add option
                <span className="text-slate-300 font-normal">
                  ({question.options.length}/8)
                </span>
              </button>
            )}
          </div>

          {/* Points & Explanation */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
            <div className="w-full sm:w-36">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                <Target className="w-3 h-3 inline mr-1" />
                Points <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={question.points}
                onChange={(e) => updatePoints(e.target.value)}
                min="1"
                className={cn(
                  'h-9 text-sm font-semibold',
                  (isNaN(question.points) || question.points <= 0) &&
                    'border-rose-300 bg-rose-50/20 focus:border-rose-400 focus:ring-rose-500/20'
                )}
              />
              {(isNaN(question.points) || question.points <= 0) && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> Points must be at
                  least 1
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Explanation{' '}
                <span className="text-slate-300 font-normal">
                  (shown after submission)
                </span>
              </label>
              <input
                type="text"
                value={question.explanation}
                onChange={(e) => updateExplanation(e.target.value)}
                placeholder="Why is the correct answer right?"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CreateQuiz Component ──────────────────────────────────────────────────
export function CreateQuiz() {
  const { id: routeQuizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const initialCourseId = searchParams.get('courseId');
  const moduleId = searchParams.get('moduleId');
  const itemId = searchParams.get('itemId');

  const {
    editingQuizId,
    courseId,
    quizTitle,
    passingScore,
    showExplanations,
    questions,
    loading,
    saving,
  } = useAppSelector((s) => s.quizzes.builder);

  useEffect(() => {
    if (!routeQuizId) {
      dispatch(initNewQuiz(initialCourseId));
      return;
    }
    if (initialCourseId) {
      dispatch(setQuizCourseId(initialCourseId));
    }
    dispatch(fetchQuizById(routeQuizId));
  }, [dispatch, routeQuizId, initialCourseId]);

  const handleSaveQuiz = async () => {
    const isTitleValid = quizTitle.trim().length > 0;
    const hasQuestions = questions.length > 0;

    if (!isTitleValid || !hasQuestions || !allQuestionsValid) {
      dispatch(expandInvalidQuestions());
      return;
    }

    if (!courseId) {
      dispatch(
        showToast('Open quiz creation from an assigned course.', 'warning')
      );
      return;
    }
    try {
      const quizPayload = {
        title: quizTitle.trim() || 'Untitled quiz',
        passingScore: passingScore || 80,
        description: showExplanations
          ? 'Explanations are shown after submission.'
          : '',
        showExplanations,
        status: 'Draft',
        questions,
      };
      await dispatch(
        saveQuiz({
          editingQuizId,
          courseId,
          moduleId,
          itemId,
          quizPayload,
        })
      ).unwrap();
      dispatch(
        showToast(
          'Assessment draft saved. Submit the course content for organization approval.',
          'success'
        )
      );
      navigate(`/instructor/courses/${courseId}/content`);
    } catch (err) {
      dispatch(
        showToast(
          `Unable to save assessment: ${(typeof err === 'string' ? err : err?.message) || 'Server error'}`,
          'error'
        )
      );
    }
  };

  // ─── Question Operations ────────────────────────────────────────────
  const handleAddQuestion = () => {
    dispatch(addQuestion());
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    dispatch(updateQuestion(updatedQuestion));
  };

  const handleDeleteQuestion = (questionId) => {
    dispatch(deleteQuestion(questionId));
  };

  const handleMoveQuestion = (fromIndex, direction) => {
    dispatch(moveQuestion({ fromIndex, direction }));
  };

  // ─── Stats ──────────────────────────────────────────────────────────
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const questionsWithAnswer = questions.filter((q) =>
    q.options.some((o) => o.isCorrect)
  ).length;
  const allQuestionsValid =
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.text.trim() &&
        q.options.some((o) => o.isCorrect) &&
        q.options.every((o) => o.text.trim())
    );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto pb-28">
      {/* Main Content */}
      <div className="flex-1 space-y-5">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quiz Builder
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/60 rounded-xl px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">
                  Questions
                </span>
                <span className="font-bold text-slate-900">
                  {questions.length}
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200/50" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">
                  Total Points
                </span>
                <span className="font-bold text-slate-900">{totalPoints}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200/50" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">
                  Answers Set
                </span>
                <span className="font-bold text-slate-900">
                  {questionsWithAnswer}/{questions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Cards */}
        {questions.length === 0 && (
          <div className="p-6 text-center bg-rose-50/40 border-2 border-dashed border-rose-200 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
            <p className="text-sm font-semibold text-rose-700">
              At least one question is required
            </p>
            <p className="text-xs text-rose-500 mt-0.5">
              Click "Add New Question" below to add a question.
            </p>
          </div>
        )}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              totalQuestions={questions.length}
              onUpdate={handleUpdateQuestion}
              onDelete={() => handleDeleteQuestion(q.id)}
              onMoveUp={() => handleMoveQuestion(idx, -1)}
              onMoveDown={() => handleMoveQuestion(idx, 1)}
            />
          ))}
        </div>

        {/* Add Question Button */}
        <button
          onClick={handleAddQuestion}
          className="quiz-add-question w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500 hover:text-primary-700 hover:border-primary-300 hover:bg-primary-50/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-all group-hover:scale-110">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <div>Add New Question</div>
          </div>
        </button>
      </div>

      {/* Right Settings Sidebar */}
      <div className="w-full lg:w-80 space-y-5 lg:sticky lg:top-6 lg:self-start">
        {/* Quiz Settings */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-600" /> Quiz Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={quizTitle}
                onChange={(e) => dispatch(setQuizTitle(e.target.value))}
                placeholder="e.g. Quiz: Core Concepts"
                className={cn(
                  'h-9 text-sm',
                  !quizTitle.trim() &&
                    'border-rose-300 bg-rose-50/20 focus:border-rose-400 focus:ring-rose-500/20'
                )}
              />
              {!quizTitle.trim() && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Quiz title is
                  required
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-slate-700">
                  Show Explanations
                </span>
                <button
                  onClick={() =>
                    dispatch(setShowExplanations(!showExplanations))
                  }
                  className={cn(
                    'w-10 h-5.5 rounded-full transition-all duration-200 relative',
                    showExplanations ? 'bg-primary-600' : 'bg-slate-200'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-200',
                      showExplanations ? 'left-[calc(100%-20px)]' : 'left-0.5'
                    )}
                  />
                </button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
            </h3>

            <button
              onClick={handleAddQuestion}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Add Question
                </div>
                <div className="text-xs text-slate-500">Add a new MCQ</div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0  right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 p-3 px-6 z-10 flex justify-between items-center shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.06)]">
        <Link to={`/instructor/courses/${courseId}/content`}>
          <Button variant="ghost">Cancel</Button>
        </Link>
        <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => handleSaveQuiz(false)}
            disabled={loading || saving}
            className="shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" /> Save Draft
          </Button>
          <Button
            onClick={handleSaveQuiz}
            disabled={loading || saving || !allQuestionsValid}
            className="shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-100 disabled:text-emerald-700 disabled:opacity-100"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" /> Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}
