"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let QuizzesService = class QuizzesService {
    constructor(quizzesRepo, questionsRepo, certificatesRepo, learnersRepo) {
        this.quizzesRepo = quizzesRepo;
        this.questionsRepo = questionsRepo;
        this.certificatesRepo = certificatesRepo;
        this.learnersRepo = learnersRepo;
    }
    async findAll() {
        const quizzes = await this.quizzesRepo.find();
        for (const q of quizzes) {
            q.questions = await this.questionsRepo.find({ where: { quizId: q.id } });
        }
        return quizzes;
    }
    async findOne(id) {
        const quiz = await this.quizzesRepo.findById(id);
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz '${id}' not found`);
        }
        quiz.questions = await this.questionsRepo.find({ where: { quizId: id } });
        return quiz;
    }
    async findByCourse(courseId) {
        const quiz = await this.quizzesRepo.findOne({ courseId });
        if (!quiz) {
            return null;
        }
        quiz.questions = await this.questionsRepo.find({ where: { quizId: quiz.id } });
        return quiz;
    }
    async create(dto) {
        const quiz = await this.quizzesRepo.create({
            id: `qiz-${Date.now()}`,
            ...dto,
            status: dto.status || 'Draft',
            questionsCount: 0,
            createdAt: new Date().toISOString(),
        });
        return quiz;
    }
    async update(id, data) {
        const quiz = await this.quizzesRepo.findById(id);
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz '${id}' not found`);
        }
        const questions = Array.isArray(data.questions) ? data.questions : null;
        const updated = await this.quizzesRepo.update(id, {
            title: data.title ?? quiz.title,
            description: data.description ?? quiz.description,
            passingScore: data.passingScore ?? quiz.passingScore,
            durationMinutes: data.durationMinutes ?? quiz.durationMinutes,
            status: data.status ?? quiz.status,
            showExplanations: data.showExplanations ?? quiz.showExplanations,
            questionsCount: questions ? questions.length : quiz.questionsCount,
        });
        if (questions) {
            await this.questionsRepo.deleteMany({ quizId: id });
            for (const [index, question] of questions.entries()) {
                const options = question.options || [];
                const correctIndex = options.findIndex((option) => option.isCorrect);
                await this.questionsRepo.create({
                    id: `qst-${Date.now()}-${index}`,
                    quizId: id,
                    questionText: question.text || question.questionText || '',
                    optionA: options[0]?.text || question.optionA || '',
                    optionB: options[1]?.text || question.optionB || '',
                    optionC: options[2]?.text || question.optionC || '',
                    optionD: options[3]?.text || question.optionD || '',
                    correctOption: correctIndex >= 0 ? 'ABCD'[correctIndex] : question.correctOption || 'A',
                    explanation: question.explanation || '',
                    sequenceNumber: index + 1,
                });
            }
        }
        return updated;
    }
    async addQuestion(dto) {
        const quiz = await this.quizzesRepo.findById(dto.quizId);
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz '${dto.quizId}' not found`);
        }
        const question = await this.questionsRepo.create({
            id: `qst-${Date.now()}`,
            ...dto,
            sequenceNumber: dto.quizId ? (await this.questionsRepo.count({ quizId: dto.quizId })) + 1 : 1,
        });
        await this.quizzesRepo.update(quiz.id, {
            questionsCount: (quiz.questionsCount || 0) + 1,
        });
        return question;
    }
    async submitQuiz(quizId, dto, userId = 'lrn-1') {
        const quiz = await this.findOne(quizId);
        const questions = quiz.questions || [];
        let correctCount = 0;
        const feedback = [];
        for (const q of questions) {
            const selected = dto.answers[q.id];
            const isCorrect = selected === q.correctOption;
            if (isCorrect)
                correctCount++;
            feedback.push({
                questionId: q.id,
                selected,
                correctOption: q.correctOption,
                isCorrect,
                explanation: q.explanation,
            });
        }
        const total = questions.length || 1;
        const scorePct = Math.round((correctCount / total) * 100);
        const passed = scorePct >= (quiz.passingScore || 75);
        if (passed && quiz.courseId) {
            const learner = await this.learnersRepo.findById(userId) || (await this.learnersRepo.find())[0];
            const certId = `cert-${Date.now()}`;
            await this.certificatesRepo.create({
                id: certId,
                learnerId: learner.id,
                learnerName: learner.name,
                courseId: quiz.courseId,
                courseTitle: quiz.courseTitle || 'Mastery Certification',
                credentialId: `NEXUS-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
                issuedAt: new Date().toISOString(),
                status: 'Verified',
                grade: `Score: ${scorePct}%`,
                certificateUrl: `https://nexuspay.enterprise.io/verify/${certId}`,
            });
        }
        return {
            quizId,
            score: scorePct,
            correctCount,
            totalQuestions: total,
            passed,
            feedback,
            certificateIssued: passed,
        };
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.QUIZZES)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.QUIZ_QUESTIONS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.CERTIFICATES)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map