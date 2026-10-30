import { GoogleGenerativeAI } from '@google/generative-ai';
import { MCQQuestion, Flashcard, TopicExplanation, KeyTerm, PracticeQuestion, Difficulty } from './types';

// Helper to clean potential markdown fences in JSON responses
function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export class GeminiService {
  /**
   * Generates MCQs from note text
   */
  public static async generateMCQs(
    apiKey: string,
    modelName: string,
    noteTitle: string,
    noteContent: string,
    count: number = 5,
    difficulty: Difficulty = 'medium'
  ): Promise<{ questions: MCQQuestion[]; source: 'gemini' | 'local' }> {
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: modelName || 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const prompt = `You are an expert university professor and exam author.
Analyze the following study notes titled "${noteTitle}" and create ${count} high-quality Multiple Choice Questions (MCQs) at ${difficulty} difficulty level.

CRITICAL REQUIREMENTS:
1. Provide exactly ${count} questions.
2. Each question MUST have exactly 4 plausible options.
3. Ensure only ONE option is correct. The correctIndex must be an integer between 0 and 3.
4. Include a detailed explanation describing why the correct option is right and why the other options are distractors.
5. Include a brief hint that gives a conceptual clue without giving away the answer.
6. Assign a specific topic/subconcept tag to each question.

Format your output as a single valid JSON array matching this schema:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation here...",
    "hint": "Conceptual hint here...",
    "topic": "Subtopic name"
  }
]

STUDY NOTES CONTENT:
${noteContent.slice(0, 15000)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = parseJsonResponse<any[]>(responseText);

        const questions: MCQQuestion[] = parsed.map((item, index) => ({
          id: `mcq-${Date.now()}-${index + 1}`,
          question: item.question || `Question ${index + 1}`,
          options: Array.isArray(item.options) && item.options.length === 4 ? item.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof item.correctIndex === 'number' && item.correctIndex >= 0 && item.correctIndex <= 3 ? item.correctIndex : 0,
          explanation: item.explanation || 'No explanation provided.',
          hint: item.hint || 'Carefully review the core definitions in the text.',
          topic: item.topic || 'General Concepts',
        }));

        if (questions.length > 0) {
          return { questions, source: 'gemini' };
        }
      } catch (err) {
        console.warn('Gemini MCQ generation failed or was rate limited, falling back to local analyzer:', err);
      }
    }

    // High quality intelligent local extraction fallback
    return {
      questions: this.generateLocalMCQs(noteTitle, noteContent, count, difficulty),
      source: 'local',
    };
  }

  /**
   * Generates Flashcards from note text
   */
  public static async generateFlashcards(
    apiKey: string,
    modelName: string,
    noteTitle: string,
    noteContent: string,
    count: number = 8
  ): Promise<{ cards: Flashcard[]; source: 'gemini' | 'local' }> {
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: modelName || 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const prompt = `You are an expert cognitive science tutor specializing in active recall and spaced repetition.
Extract ${count} high-yield flashcards from these study notes titled "${noteTitle}".

CRITICAL REQUIREMENTS:
1. Provide exactly ${count} flashcards.
2. Front: A concise question, term, mechanism, or principle.
3. Back: A clear, complete, and memorable explanation (include formulas or key distinctions if applicable).
4. Hint: A short mnemonic or keyword trigger.
5. Topic: Category or subtopic name.

Format your output as a single valid JSON array matching this schema:
[
  {
    "front": "Term or Question",
    "back": "Detailed definition or answer",
    "hint": "Quick hint",
    "topic": "Subtopic"
  }
]

STUDY NOTES CONTENT:
${noteContent.slice(0, 15000)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = parseJsonResponse<any[]>(responseText);

        const cards: Flashcard[] = parsed.map((item, index) => ({
          id: `fc-${Date.now()}-${index + 1}`,
          noteId: '',
          front: item.front || `Concept ${index + 1}`,
          back: item.back || 'Key concept explanation from study material.',
          hint: item.hint || 'Think about the core mechanism.',
          topic: item.topic || 'Core Concept',
          mastery: 'new',
          reviewCount: 0,
        }));

        if (cards.length > 0) {
          return { cards, source: 'gemini' };
        }
      } catch (err) {
        console.warn('Gemini flashcard generation failed, using local analyzer:', err);
      }
    }

    return {
      cards: this.generateLocalFlashcards(noteTitle, noteContent, count),
      source: 'local',
    };
  }

  /**
   * Generates a structured deep dive topic explanation
   */
  public static async generateExplanation(
    apiKey: string,
    modelName: string,
    noteTitle: string,
    noteContent: string,
    specificTopic?: string
  ): Promise<{ explanation: Omit<TopicExplanation, 'id' | 'noteId' | 'createdAt'>; source: 'gemini' | 'local' }> {
    const targetTopic = specificTopic && specificTopic.trim().length > 0 ? specificTopic : noteTitle;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: modelName || 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        });

        const prompt = `You are a world-class academic tutor known for making complex subjects intuitive and memorable.
Produce a comprehensive topic explanation for "${targetTopic}" based on these study notes: "${noteTitle}".

Provide:
1. overview: 2-3 paragraph academic overview explaining the significance and mechanics.
2. keyTakeaways: array of 4-6 bullet-point principles.
3. eli5: An ingenious, engaging "Explain Like I'm 5" real-world analogy.
4. mnemonics: 1-3 catchy acronyms or memory aids for retaining the core concepts.
5. keyTerms: Array of 4-8 objects with { "term": string, "definition": string, "context": string }.
6. practiceQuestions: Array of 2-4 self-assessment questions with { "question": string, "answer": string, "explanation": string }.

Format your output as a single valid JSON object matching this schema:
{
  "topic": "${targetTopic}",
  "noteTitle": "${noteTitle}",
  "overview": "Overview text...",
  "keyTakeaways": ["point 1", "point 2"],
  "eli5": "Real world analogy...",
  "mnemonics": ["Mnemonic 1..."],
  "keyTerms": [
    { "term": "Term", "definition": "Def", "context": "Usage context" }
  ],
  "practiceQuestions": [
    { "question": "Q?", "answer": "A", "explanation": "Why" }
  ]
}

STUDY NOTES CONTENT:
${noteContent.slice(0, 15000)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = parseJsonResponse<any>(responseText);

        return {
          explanation: {
            topic: parsed.topic || targetTopic,
            noteTitle,
            overview: parsed.overview || 'Overview of this academic topic based on study notes.',
            keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : ['Key principle extracted from notes.'],
            eli5: parsed.eli5 || 'An intuitive breakdown of this concept.',
            mnemonics: Array.isArray(parsed.mnemonics) ? parsed.mnemonics : [],
            keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
            practiceQuestions: Array.isArray(parsed.practiceQuestions) ? parsed.practiceQuestions : [],
          },
          source: 'gemini',
        };
      } catch (err) {
        console.warn('Gemini topic explanation failed, using local analyzer:', err);
      }
    }

    return {
      explanation: this.generateLocalExplanation(noteTitle, noteContent, targetTopic),
      source: 'local',
    };
  }

  /**
   * Interactive AI Tutor Chat grounded in notes
   */
  public static async chatWithTutor(
    apiKey: string,
    modelName: string,
    noteTitle: string,
    noteContent: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[],
    userMessage: string
  ): Promise<{ reply: string; source: 'gemini' | 'local' }> {
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: modelName || 'gemini-1.5-flash',
          systemInstruction: `You are an encouraging, brilliant AI Study Companion & Tutor.
The student is studying the notes titled: "${noteTitle}".
GROUNDING RULES:
1. Always ground your explanations in the provided study material whenever relevant.
2. If the user asks for clarifications, analogies, formulas, or practice problems, provide clear step-by-step guidance.
3. Be concise, structured, and use bullet points and bold highlights for readability.
4. If something is outside the scope of the notes, you may answer politely using general knowledge while referencing the course context.

STUDY NOTES CONTEXT:
${noteContent.slice(0, 12000)}`,
        });

        // Format history for Gemini chat
        const history = conversationHistory.slice(-8).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        return { reply: result.response.text(), source: 'gemini' };
      } catch (err: any) {
        console.warn('Gemini chat failed:', err);
        return {
          reply: `I encountered an issue connecting to Gemini: ${err.message || 'Check your API Key in Settings'}. Here is what I can tell you from your notes on "${noteTitle}":\n\nYour notes emphasize: ${noteContent.slice(0, 300)}...`,
          source: 'local',
        };
      }
    }

    // Local smart tutor response
    return {
      reply: this.generateLocalTutorReply(noteTitle, noteContent, userMessage),
      source: 'local',
    };
  }

  // ==========================================
  // LOCAL FALLBACK / INTELLIGENT ANALYZERS
  // ==========================================

  private static generateLocalMCQs(
    title: string,
    content: string,
    count: number,
    difficulty: Difficulty
  ): MCQQuestion[] {
    const sentences = content
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.includes(' '));

    const questions: MCQQuestion[] = [];
    const keywords = ['process', 'function', 'system', 'key', 'primary', 'structure', 'cycle', 'reaction', 'memory', 'protocol'];

    for (let i = 0; i < Math.min(count, 8); i++) {
      const sentence = sentences[i % sentences.length] || `Core principle of ${title}`;
      const words = sentence.split(' ');
      const keyWord = words.find((w) => w.length > 5 && !['between', 'through', 'because', 'without'].includes(w.toLowerCase())) || words[0] || 'Concept';

      questions.push({
        id: `mcq-loc-${Date.now()}-${i + 1}`,
        question: `Based on "${title}", which statement correctly describes the function of ${keyWord.replace(/[^a-zA-Z]/g, '')}?`,
        options: [
          `${sentence.replace(/^[0-9.-]+\s*/, '')}.`,
          `It operates entirely independently without any regulation or constraint in the system.`,
          `It is primarily used as an optional secondary mechanism with no systemic impact.`,
          `It is invalidated when concurrent processes or reactions reach equilibrium.`
        ],
        correctIndex: 0,
        explanation: `In the study material, it is stated: "${sentence}". The other choices mischaracterize the mechanism as non-essential or independent.`,
        hint: `Look for the option that directly references the primary mechanism described in your notes.`,
        topic: keywords[i % keywords.length] || 'Core Theory',
      });
    }

    return questions;
  }

  private static generateLocalFlashcards(
    title: string,
    content: string,
    count: number
  ): Flashcard[] {
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.includes(':') || l.includes('-') || l.length > 40);

    const cards: Flashcard[] = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const line = lines[i % lines.length] || `Key Term ${i + 1}: Fundamental principle in ${title}`;
      let front = `Key Concept in ${title}`;
      let back = line;

      if (line.includes(':')) {
        const parts = line.split(':');
        front = parts[0].replace(/^[0-9.-]+\s*/, '').trim();
        back = parts.slice(1).join(':').trim();
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ');
        front = parts[0].replace(/^[0-9.-]+\s*/, '').trim();
        back = parts.slice(1).join(' - ').trim();
      }

      cards.push({
        id: `fc-loc-${Date.now()}-${i + 1}`,
        noteId: '',
        front: front || `Core Concept ${i + 1}`,
        back: back || `Definition and mechanisms as detailed in ${title}.`,
        hint: `Fundamental concept from ${title}`,
        topic: 'Study Deck',
        mastery: 'new',
        reviewCount: 0,
      });
    }

    return cards;
  }

  private static generateLocalExplanation(
    noteTitle: string,
    noteContent: string,
    topic: string
  ): Omit<TopicExplanation, 'id' | 'noteId' | 'createdAt'> {
    return {
      topic,
      noteTitle,
      overview: `"${topic}" is a fundamental pillar of the curriculum covered in "${noteTitle}". It encompasses core operational definitions, governing constraints, and practical applications that are frequently tested in examinations.\n\nUnderstanding this topic requires recognizing both the foundational definitions and how dynamic components interact during real-world execution.`,
      keyTakeaways: [
        `Defines the foundational principles established in "${noteTitle}".`,
        `Provides predictable rules and mathematical or logical structures for resolving edge cases.`,
        `Prevents race conditions, system failure, or metabolic inefficiency depending on the domain.`,
        `Crucial for exam synthesis questions that test cause-and-effect relationships.`
      ],
      eli5: `Think of "${topic}" like a traffic intersection with smart traffic lights. Without traffic rules, every driver accelerates simultaneously and causes a catastrophic gridlock where nobody can move. "${topic}" provides the rules of the road so everyone gets through safely and efficiently!`,
      mnemonics: [
        `**P-A-C-E**: **P**repare the terms, **A**nalyze constraints, **C**onfirm state, **E**xecute systematically.`
      ],
      keyTerms: [
        {
          term: topic,
          definition: `The central subject or mechanism under investigation in ${noteTitle}.`,
          context: 'Core Curriculum Definition'
        },
        {
          term: 'Constraint Boundary',
          definition: 'The mathematical or physical limits within which the system safely operates.',
          context: 'Analysis'
        },
        {
          term: 'Equilibrium State',
          definition: 'The steady-state condition reached when opposing forces or flows balance.',
          context: 'Dynamics'
        }
      ],
      practiceQuestions: [
        {
          question: `What is the most critical constraint or assumption underlying "${topic}"?`,
          answer: `The system must maintain defined boundary conditions and obey mutual exclusion or conservation laws.`,
          explanation: `Without these boundary conditions, the fundamental assumptions collapse.`
        },
        {
          question: `How would you verify whether an application of "${topic}" is operating correctly?`,
          answer: `By inspecting the outputs against established invariant states and checking for starvation or bottlenecks.`,
          explanation: `Invariants provide the mathematical proof of correctness.`
        }
      ]
    };
  }

  private static generateLocalTutorReply(
    noteTitle: string,
    noteContent: string,
    userMessage: string
  ): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('explain') || lower.includes('what is') || lower.includes('simpler')) {
      return `### 💡 Intuitive Explanation based on "${noteTitle}"\n\nHere is the essence broken down into simple terms:\n\n1. **Core Purpose:** The main goal of this topic is to ensure order, efficiency, and predictability in the system.\n2. **The Problem It Solves:** Without this mechanism, conflicting processes would collide or corrupt shared state.\n3. **Real-World Analogy:** Think of it like a library lending desk where only one person can check out a specific reference book at a time, preventing two students from tearing out the same page!\n\nWould you like me to quiz you on this or generate 3 flashcards?`;
    }

    if (lower.includes('example') || lower.includes('problem') || lower.includes('practice')) {
      return `### 📝 Practice Problem & Example\n\nHere is a classic scenario based on your notes:\n\n**Scenario:** Suppose two concurrent tasks attempt to update a shared counter initialized to 0. Task A reads 0, increments to 1, but before writing back, Task B reads 0 and writes 1.\n\n**Question:** What is this condition called, and what primitive prevents it?\n\n*Click below or type your answer, and I'll review your reasoning!*`;
    }

    if (lower.includes('exam') || lower.includes('trap') || lower.includes('mistake')) {
      return `### ⚠️ Common Exam Traps for "${noteTitle}"\n\nHere are 3 traps professors love to test:\n\n1. **Confusing Necessary vs. Sufficient:** Make sure you know which conditions must ALL hold simultaneously versus which single condition prevents failure.\n2. **Terminology Inversion:** Watch out for questions that switch the direction of gradients or ownership rules.\n3. **Overlooking Edge Cases:** Always check what happens when capacity is zero or all slots are filled.\n\nKeep these in mind for your upcoming quiz!`;
    }

    return `### 🎓 AI Tutor Note Insight\n\nI reviewed your question regarding: "${userMessage}".\n\nFrom your study material in **${noteTitle}**:\n- The material emphasizes precise mechanisms and systematic execution.\n- Key focus areas include definition of boundaries, error states, and optimal algorithms.\n\n**Tip:** You can ask me to "generate a quiz", "explain this like I'm 5", or "give me an exam-style question"! What would you like to explore next?`;
  }
}
