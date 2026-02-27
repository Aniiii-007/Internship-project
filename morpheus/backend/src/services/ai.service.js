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


/**
 * AI Chatbot generator: Acts as a cool, helpful tutor.
 * Supports passing chat history and reading OCR text extracted from images.
 */
export async function generateChatbotResponse(history, currentQuestion, ocrText) {
    const messages = [
        {
            role: "system",
            content: `You are Morpheus, an extremely cool, patient, and highly intelligent expert tutor designed to help students learn. 
            Do NOT give generic LLM outputs. Your goal is to guide the student step-by-step through their problem.
            If they provide an OCR text dump from an image, deduce the context, formulate the exact question, and break the solution down logically. 
            Use markdown formatting for code, math equations, and lists to make it very readable.`
        }
    ];

    // Push past conversational context
    for (const msg of history) {
        // Groq/Llama roles are 'user' or 'assistant'. Our DB stores 'user' or 'model'.
        messages.push({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.content
        });
    }

    // Append the current turn
    let turnContent = currentQuestion;
    if (ocrText) {
        turnContent += `\n\n[OCR Extracted Text from Uploaded Image]:\n${ocrText}`;
    }

    messages.push({
        role: "user",
        content: turnContent
    });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: MODEL,
            temperature: 0.6,
            max_completion_tokens: 2048,
            stream: false,
        });

        return chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't formulate a response. Could you provide more details?";
    } catch (error) {
        console.error('[AI Chatbot Error]:', error);
        throw new Error('Failed to generate chatbot response');
    }
}

/**
 * AI Moderation Service
 * Evaluates a community message to ensure it is safe (no toxicity, no NSFW)
 * and relevant to an educational environment.
 * 
 * Returns an object: { isApproved: boolean, reason?: string }
 */
export async function moderateCommunityMessage(content) {
    const prompt = `
        You are an AI content moderator for an educational community chat application.
        Your job is to strictly evaluate the following message sent by a student.
        
        Rules for REJECTION:
        1. Contains profanity, toxicity, bullying, or harassment.
        2. Contains NSFW, nudity references, or sexually explicit content.
        3. Promotes self-harm, violence, or illegal acts.
        4. (Optional) Completely irrelevant spam text.
        
        Message to evaluate:
        "${content}"
        
        Respond ONLY with a valid JSON object in this exact format:
        {
            "isApproved": true/false,
            "reason": "Short explanation if rejected, otherwise null"
        }
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Need a fast, reliable model for JSON out
            temperature: 0.1, // Low temp for deterministic output
            max_completion_tokens: 100,
            response_format: { type: "json_object" },
            stream: false,
        });

        const resultStr = chatCompletion.choices[0]?.message?.content;
        const result = JSON.parse(resultStr);
        return {
            isApproved: result.isApproved ?? true,
            reason: result.reason || null
        };
    } catch (error) {
        console.error('[AI Moderation Error]:', error);
        // Fail-open or fail-close? For safety, we block if moderation fails,
        // or let it through if we want to avoid breaking the chat. We'll fail-close here.
        return { isApproved: false, reason: "Message could not be verified by moderation systems." };
    }
}