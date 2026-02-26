import { Groq } from 'groq-sdk';
import { env } from '../config/env.js';

const groq = new Groq({
    apiKey: env.GROQ_API_KEY
});

const MODEL = "llama-3.3-70b-versatile";

/**
 * AI Service for generating tutor competence tests using Groq.
 */
export async function generateTutorTest(subjectName, level) {
    const prompt = `
        You are an expert educational examiner. Create a comprehensive tutor competence test for the subject: ${subjectName} at level: ${level}.
        
        The test should have:
        1. A clear title and description.
        2. Exactly 5 challenging questions.
        3. A mix of Multi-Choice (MCQ - single answer) and Multi-Select (MSQ - multiple answers).
        4. Each question must have a 'marks' value (total marks should be around 50).
        5. Return the payload in STRICT JSON format like this:
        {
          "title": "...",
          "description": "...",
          "questions": [
            {
              "id": 1,
              "type": "mcq",
              "question": "...",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": "Exact string from options",
              "marks": 10
            },
            {
              "id": 2,
              "type": "msq",
              "question": "...",
              "options": ["W", "X", "Y", "Z"],
              "correctAnswers": ["X", "Y"],
              "marks": 10
            }
          ],
          "totalMarks": 50
        }
        
        Only provide the JSON. No other text.
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.7,
            max_completion_tokens: 4096,
            stream: false,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('[AI] Test generation failed:', error);
        throw new Error('Failed to generate test via AI');
    }
}

/**
 * AI Service for evaluating tutor competence tests using Groq.
 */
export async function evaluateTutorTest(questions, submissions) {
    // We handle the basic scoring logic locally for accuracy and cost-saving, 
    // but we can use AI to provide feedback based on the performance.

    let score = 0;
    const details = [];

    questions.forEach(q => {
        const userAns = submissions[q.id];
        let correct = false;

        if (q.type === 'mcq') {
            if (userAns === q.correctAnswer) {
                score += q.marks;
                correct = true;
            }
        } else if (q.type === 'msq') {
            const correctSet = new Set(q.correctAnswers);
            const userSet = new Set(Array.isArray(userAns) ? userAns : [userAns].filter(Boolean));
            if (correctSet.size === userSet.size && [...correctSet].every(val => userSet.has(val))) {
                score += q.marks;
                correct = true;
            }
        }

        details.push({
            questionId: q.id,
            correct,
            userAnswer: userAns,
            correctAnswers: q.type === 'mcq' ? [q.correctAnswer] : q.correctAnswers
        });
    });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = (score / totalMarks) * 100;
    const passed = percentage >= 70;

    // Optional: Get AI feedback
    let feedback = passed ? "Great job! Your knowledge is sufficient." : "Keep practicing and try again later.";

    try {
        const feedbackPrompt = `
            A tutor just took a test in ${questions[0]?.question || 'a subject'}.
            Score: ${score}/${totalMarks} (${percentage.toFixed(1)}%).
            Passed: ${passed ? 'Yes' : 'No'}.
            Write a short (2-sentence) professional feedback for the tutor's dashboard.
        `;

        const feedbackCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: feedbackPrompt }],
            model: MODEL,
            temperature: 0.5,
            max_completion_tokens: 100,
        });

        feedback = feedbackCompletion.choices[0]?.message?.content.trim() || feedback;
    } catch (err) {
        console.error('[AI] Feedback generation failed:', err);
    }

    return {
        score,
        totalMarks,
        percentage,
        passed,
        feedback,
        details
    };
}
