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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
let ReviewsService = class ReviewsService {
    constructor(reviewsRepo, coursesRepo, learnersRepo, enrollmentsRepo) {
        this.reviewsRepo = reviewsRepo;
        this.coursesRepo = coursesRepo;
        this.learnersRepo = learnersRepo;
        this.enrollmentsRepo = enrollmentsRepo;
    }
    async learnerIdFor(userId) {
        if (!userId)
            return '';
        const learners = await this.learnersRepo.find();
        const learner = learners.find((l) => l.id === userId || l.userId === userId);
        return learner?.id || userId;
    }
    async findAll() {
        return this.reviewsRepo.find();
    }
    async findByCourse(courseId) {
        return this.reviewsRepo.find({ where: { courseId } });
    }
    async create(data, userId) {
        const courseId = data?.courseId || '';
        const learnerId = await this.learnerIdFor(userId);
        if (!courseId)
            throw new common_1.BadRequestException('courseId is required');
        if (!learnerId)
            throw new common_1.BadRequestException('x-user-id header is required');
        const course = await this.coursesRepo.findById(courseId);
        if (!course)
            throw new common_1.NotFoundException(`Course '${courseId}' not found`);
        const enrollment = await this.enrollmentsRepo.findOne({ learnerId, courseId });
        if (!enrollment)
            throw new common_1.ForbiddenException('Only enrolled learners can review this course');
        const existing = await this.reviewsRepo.find({ where: { courseId, learnerId } });
        if (existing.length > 0) {
            throw new common_1.ConflictException('You have already reviewed this course. Edit your existing review.');
        }
        const rating = Math.min(5, Math.max(1, Math.round(Number(data?.rating) || 5)));
        const comment = (data?.comment || data?.content || data?.review || '').trim();
        const review = await this.reviewsRepo.create({
            learnerId,
            learnerName: data?.learnerName || 'Learner',
            learnerAvatar: data?.learnerAvatar || data?.avatar || '',
            courseId,
            courseTitle: course?.title || '',
            rating,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        await this.updateCourseRating(courseId);
        return review;
    }
    async update(id, data, userId) {
        const review = await this.reviewsRepo.findById(id);
        if (!review)
            throw new common_1.NotFoundException(`Review '${id}' not found`);
        if (review.learnerId !== (await this.learnerIdFor(userId))) {
            throw new common_1.ForbiddenException('You can only edit your own reviews');
        }
        const updates = { updatedAt: new Date().toISOString() };
        if (data.rating != null)
            updates.rating = Math.min(5, Math.max(1, Math.round(Number(data.rating))));
        if (data.comment != null)
            updates.comment = data.comment;
        const updated = await this.reviewsRepo.update(id, updates);
        await this.updateCourseRating(review.courseId);
        return updated;
    }
    async delete(id, userId) {
        const review = await this.reviewsRepo.findById(id);
        if (!review)
            throw new common_1.NotFoundException(`Review '${id}' not found`);
        if (review.learnerId !== (await this.learnerIdFor(userId))) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        await this.reviewsRepo.delete(id);
        await this.updateCourseRating(review.courseId);
        return { success: true, message: 'Review deleted' };
    }
    async reply(id, responseText) {
        const review = await this.reviewsRepo.findById(id);
        if (!review)
            throw new common_1.NotFoundException(`Review '${id}' not found`);
        return this.reviewsRepo.update(id, { response: responseText, repliedAt: new Date().toISOString() });
    }
    async deleteReply(id) {
        const review = await this.reviewsRepo.findById(id);
        if (!review)
            throw new common_1.NotFoundException(`Review '${id}' not found`);
        return this.reviewsRepo.update(id, { response: null, repliedAt: null });
    }
    async updateCourseRating(courseId) {
        try {
            const reviews = await this.reviewsRepo.find({ where: { courseId } });
            if (reviews.length === 0) {
                await this.coursesRepo.update(courseId, { rating: null, reviewsCount: 0 });
                return;
            }
            const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
            await this.coursesRepo.update(courseId, {
                rating: Math.round(avg * 10) / 10,
                reviewsCount: reviews.length,
            });
        }
        catch {
        }
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.REVIEWS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.LEARNERS)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map