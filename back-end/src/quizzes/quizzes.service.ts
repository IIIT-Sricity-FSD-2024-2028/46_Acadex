import { Injectable, NotFoundException } from '@nestjs/common';
import { quizzes } from '../data';

@Injectable()
export class QuizzesService {
  findAll() {
    return quizzes;
  }

  findOne(id: string) {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) {
      // If quiz doesn't exist yet, return a default quiz structure
      return {
        id,
        courseId: '1',
        title: 'Quiz: Assessment',
        passingScore: 80,
        showExplanations: true,
        questions: [
          {
            id: 1,
            text: 'Sample question text...',
            points: 10,
            explanation: 'Explanation for the answer.',
            options: [
              { id: 'opt_1', text: 'Option A', isCorrect: true },
              { id: 'opt_2', text: 'Option B', isCorrect: false },
            ]
          }
        ]
      };
    }
    return quiz;
  }

  create(createQuizDto: any) {
    const id = createQuizDto.id || String(Date.now());
    const newQuiz = { ...createQuizDto, id };
    quizzes.push(newQuiz);
    return newQuiz;
  }

  update(id: string, updateQuizDto: any) {
    const index = quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      const newQuiz = { ...updateQuizDto, id };
      quizzes.push(newQuiz);
      return newQuiz;
    }
    quizzes[index] = { ...quizzes[index], ...updateQuizDto };
    return quizzes[index];
  }
}
