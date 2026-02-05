
import { GoogleGenAI, Type } from "@google/genai";
import { 
  RTBGenerationConfig, 
  RTBSessionPlan, 
  LessonPlan,
  SchemeGenerationConfig,
  SchemeOfWork,
  HomeworkGenerationConfig,
  Homework,
  REBGenerationConfig,
  REBLessonPlan,
  NurseryGenerationConfig,
  NurseryLessonPlan,
  SlideGenerationConfig,
  Presentation,
  GenerationConfig
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = (text: string | undefined): any => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) cleaned = match[1].trim();
    else cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON Parse Error, attempting recovery...", e);
    try {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(cleaned.substring(start, end + 1));
        }
    } catch (inner) {
        return null;
    }
    return null;
  }
};

async function callGeminiWithRetry(fn: () => Promise<any>, retries = 3, baseDelay = 2000): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      if (isRateLimit && attempt < retries) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
}

export const generateLessonPlan = async (config: GenerationConfig): Promise<LessonPlan> => {
  return await callGeminiWithRetry(async () => {
    const prompt = `ACT AS A SENIOR CURRICULUM DEVELOPER. 
    Generate a highly structured, professional lesson plan based on:
    Subject: ${config.subject}
    Grade Level: ${config.gradeLevel}
    Topic: ${config.topic}
    Duration: ${config.duration}
    Approach: ${config.pedagogicalApproach}

    REQUIREMENTS:
    - Detailed learning objectives (SMART).
    - List of required materials.
    - A step-by-step outline (Introduction, Development, Conclusion) with durations.
    - An assessment method.
    - A relevant homework assignment.

    RESPONSE FORMAT: Strictly JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            outline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            },
            assessment: { type: Type.STRING },
            homework: { type: Type.STRING }
          }
        }
      }
    });

    const data = safeJsonParse(response.text) || {};
    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      subject: config.subject,
      gradeLevel: config.gradeLevel,
      topic: config.topic,
      duration: config.duration,
      createdAt: Date.now(),
      type: 'standard'
    };
  });
};

export const generateRTBSessionPlan = async (config: RTBGenerationConfig): Promise<RTBSessionPlan> => {
  return await callGeminiWithRetry(async () => {
    const userProvidedIC = config.indicativeContent ? config.indicativeContent.trim() : null;
    
    const parts: any[] = [
      { text: `ACT AS AN EXPERT TVET PEDAGOGICAL PLANNER.
      
DEFINITION: A session plan is a teacher’s guide for one session showing successive activities. It answers:
- WHAT will be taught (Topic)
- WHY it is important
- HOW it will be taught (Methodology & Expert View)
- HOW learning will be checked (Conclusion/Assessment)

TOPIC RULES: Must be clear, specific (focused on one idea), short, and level-appropriate.

INDICATIVE CONTENT RULES:
${userProvidedIC ? `CRITICAL: The user has provided specific Indicative Content. You MUST return exactly this text for the "indicativeContent" field: "${userProvidedIC}"` : `Extract Indicative Content from the source document provided.`}

OBJECTIVE RULES:
- Must be SMART (Specific, Measurable, Achievable, Realistic, Time-bound). 
- Formulate the objective text to INCLUDE the "Level of Understanding" (e.g. Knowledge, Understanding, Solving) directly in the paragraph logic. 
- Example format: "Demonstrating [Level], at the end of the session the learner will be able to [action verb]..." or similar natural phrasing.
- DO NOT return the level as a separate badge/label in the final text; it must be part of the sentence.

TAXONOMY FOR DETERMINING LEVEL:
- Knowledge & Understanding: Identify, Name, Define, List, Describe, Explain, Recall.
- Observation/Solving: Observe, Handle, Collect, Select, Inspect, Solve.

DEVELOPMENT RULES: Must include "expertView" for each step describing the trainer's specialized instructional focus.
CONCLUSION RULES: Must include Summary (reflecting objectives), Assessment, and Evaluation.

DATA:
- Topic: ${config.topicOfSession}
- Duration: ${config.durationOfSession} minutes
- Context: Trade: ${config.trade} | Level: ${config.level} | Module: ${config.moduleCodeName}

RESPONSE: Valid JSON only.` }
    ];

    if (config.referenceFile) {
      parts.push({ text: "SOURCE DOCUMENT CONTENT (CURRICULA/TRAINER GUIDE):" });
      parts.push({ inlineData: { data: config.referenceFile.data, mimeType: config.referenceFile.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { 
        temperature: 0.1, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            learningOutcome: { type: Type.STRING },
            indicativeContent: { type: Type.STRING },
            range: { type: Type.STRING },
            durationOfSession: { type: Type.STRING },
            objectivesText: { type: Type.STRING },
            understandingLevel: { type: Type.STRING },
            facilitationTechniques: { type: Type.STRING },
            ksaObjectives: {
              type: Type.OBJECT,
              properties: {
                knowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                attitudes: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            procedure: {
              type: Type.OBJECT,
              properties: {
                introduction: {
                  type: Type.OBJECT,
                  properties: {
                    trainerActivity: { type: Type.STRING },
                    learnerActivity: { type: Type.STRING },
                    trainerResources: { type: Type.STRING },
                    traineeResources: { type: Type.STRING },
                    duration: { type: Type.STRING }
                  }
                },
                development: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      trainerActivity: { type: Type.STRING },
                      learnerActivity: { type: Type.STRING },
                      trainerResources: { type: Type.STRING },
                      traineeResources: { type: Type.STRING },
                      expertView: { type: Type.STRING },
                      duration: { type: Type.STRING }
                    }
                  }
                },
                conclusion: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.OBJECT, properties: { trainerActivity: {type: Type.STRING}, learnerActivity: {type: Type.STRING}, duration: {type: Type.STRING}, trainerResources: {type: Type.STRING}, traineeResources: {type: Type.STRING} } },
                    assessment: { type: Type.OBJECT, properties: { trainerActivity: {type: Type.STRING}, learnerActivity: {type: Type.STRING}, duration: {type: Type.STRING}, trainerResources: {type: Type.STRING}, traineeResources: {type: Type.STRING} } },
                    evaluation: { type: Type.OBJECT, properties: { trainerActivity: {type: Type.STRING}, learnerActivity: {type: Type.STRING}, duration: {type: Type.STRING}, trainerResources: {type: Type.STRING}, traineeResources: {type: Type.STRING} } }
                  }
                }
              }
            },
            crossCuttingIssue: { type: Type.STRING },
            references: { type: Type.STRING },
            appendices: { type: Type.STRING },
            reflection: { type: Type.STRING }
          }
        }
      }
    });

    const rawData = safeJsonParse(response.text) || {};
    
    // Safety check to override if AI hallucinated indicative content despite user input
    if (userProvidedIC) {
      rawData.indicativeContent = userProvidedIC;
    }

    const { referenceFile, ...cleanConfig } = config;
    
    return { 
      ...cleanConfig, 
      ...rawData, 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'rtb', 
      title: config.topicOfSession, 
      createdAt: Date.now(), 
      outline: [], objectives: [], materials: [], assessment: '', homework: '' 
    };
  });
};

export const generateSchemeOfWork = async (config: SchemeGenerationConfig): Promise<SchemeOfWork> => {
  return await callGeminiWithRetry(async () => {
    const parts: any[] = [
      { text: `ACT AS AN EXPERT SENIOR TVET PEDAGOGICAL PLANNER.
      
TASK: Generate a professional modular SCHEME OF WORK (SoW) for the Module: ${config.moduleCodeTitle}.
You must synthesize two sources into one chronological teaching schedule.

SOURCE 1: CHRONOGRAM (File Attached)
- Use this to map out the school calendar: start dates, holidays, and examination weeks.

SOURCE 2: CURRICULA (File Attached)
- Use this to extract Learning Outcomes (LO), Indicative Content (IC), Learning Activities, and Resources.

REQUIREMENTS:
1. Synthesize content into the weekly structure defined by the chronogram for Term: ${config.term}.
2. Ensure strict LO (LO1, LO2) and IC (IC1.1, IC1.2) numbering.
3. If a week is marked as "Assessment" or "Holiday" in the chronogram, the SoW should reflect that in the Indicative Content.

RESPONSE: STRICT JSON OBJECT.` }
    ];

    if (config.chronogramFile) {
      parts.push({ text: "### CHRONOGRAM (DATE SOURCE) ###" });
      parts.push({ inlineData: { data: config.chronogramFile.data, mimeType: config.chronogramFile.mimeType } });
    }
    if (config.curriculaFile) {
      parts.push({ text: "### CURRICULA (CONTENT SOURCE) ###" });
      parts.push({ inlineData: { data: config.curriculaFile.data, mimeType: config.curriculaFile.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rows: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING },
                  dateRange: { type: Type.STRING },
                  learningOutcome: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  indicativeContent: { type: Type.STRING },
                  learningActivities: { type: Type.STRING },
                  resources: { type: Type.STRING },
                  evidences: { type: Type.STRING },
                  learningPlace: { type: Type.STRING },
                  observation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const data = safeJsonParse(response.text) || {};
    return { 
      ...config, 
      ...data, 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'scheme', 
      title: config.moduleCodeTitle, 
      createdAt: Date.now(), 
      outline: [], objectives: [], materials: [], assessment: '', homework: '', 
      rows: data.rows || [] 
    };
  });
};

export const generateHomework = async (config: HomeworkGenerationConfig): Promise<Homework> => {
  return await callGeminiWithRetry(async () => {
    const parts: any[] = [{ text: `Generate assessment on ${config.topic} for ${config.gradeLevel} ${config.subject}. 
    Type: ${config.assessmentType}
    Num Questions: ${config.numQuestions}
    Question Style: ${config.questionType}
    Difficulty: ${config.difficulty}
    
    Include marking schemes and context for each question.` }];

    if (config.referenceFile) {
        parts.push({ text: "REFER TO THIS CONTENT FOR ACCURATE QUESTIONS:" });
        parts.push({ inlineData: { data: config.referenceFile.data, mimeType: config.referenceFile.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instructions: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                  type: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  page: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const data = safeJsonParse(response.text) || {};
    return { ...config, ...data, id: Math.random().toString(36).substr(2, 9), type: config.assessmentType, createdAt: Date.now(), outline: [], objectives: [], materials: [], assessment: '', homework: '', questions: data.questions || [] };
  });
};

export const generateREBLessonPlan = async (config: REBGenerationConfig): Promise<REBLessonPlan> => {
  return await callGeminiWithRetry(async () => {
    const parts: any[] = [{ text: `ACT AS A RWANDA BASIC EDUCATION EXPERT.
    Generate a REB standardized lesson plan for: ${config.lessonTitle}.
    Subject: ${config.subject}, Grade: ${config.gradeLevel}.
    Detailed: ${config.isDetailed}.
    Language: ${config.language}.` }];

    if (config.referenceFile) {
        parts.push({ inlineData: { data: config.referenceFile.data, mimeType: config.referenceFile.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instructionalObjective: { type: Type.STRING },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            assessment: { type: Type.STRING },
            homework: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  teacherActivity: { type: Type.STRING },
                  learnerActivity: { type: Type.STRING },
                  competences: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const data = safeJsonParse(response.text) || {};
    return { ...config, ...data, id: Math.random().toString(36).substr(2, 9), type: 'reb', title: config.lessonTitle, createdAt: Date.now(), outline: [] };
  });
};

export const generateNurseryLessonPlan = async (config: NurseryGenerationConfig): Promise<NurseryLessonPlan> => {
  return await callGeminiWithRetry(async () => {
    const parts: any[] = [{ text: `Generate a NURSERY/KINDERGARTEN lesson plan for: ${config.lessonName}.
    Focus on engagement, play-based learning, and foundational skills.` }];

    if (config.referenceFile) {
        parts.push({ inlineData: { data: config.referenceFile.data, mimeType: config.referenceFile.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            assessment: { type: Type.STRING },
            homework: { type: Type.STRING },
            lessonSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepName: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  activities: { type: Type.STRING },
                  materials: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const data = safeJsonParse(response.text) || {};
    return { ...config, ...data, id: Math.random().toString(36).substr(2, 9), type: 'nursery', title: config.lessonName, createdAt: Date.now(), outline: [] };
  });
};

export const generateSlideOutline = async (config: SlideGenerationConfig): Promise<Presentation> => {
  return await callGeminiWithRetry(async () => {
    const parts: any[] = [{ text: `Create a presentation outline for ${config.topic}. 
    Target Slides: ${config.numSlides}.
    Subject: ${config.subject}, Grade: ${config.gradeLevel}.` }];

    if (config.referenceFile) {
        parts.push({ inlineData: { data: config.referenceFile.data, mimeType: config.referenceFile.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  points: { type: Type.ARRAY, items: { type: Type.STRING } },
                  imagePrompt: { type: Type.STRING },
                  goal: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const data = safeJsonParse(response.text) || {};
    return { ...config, id: Math.random().toString(36).substr(2, 9), type: 'slides', title: config.topic, createdAt: Date.now(), slides: data.slides || [], outline: [], objectives: [], materials: [], assessment: '', homework: '' };
  });
};

export const fillSlideBatchContent = async (titles: string[], config: any): Promise<any[]> => {
  return await callGeminiWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `For these slide titles, generate detailed pedagogical content: ${titles.join(', ')}. Context: ${config.topic} for ${config.subject}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              points: { type: Type.ARRAY, items: { type: Type.STRING } },
              imagePrompt: { type: Type.STRING },
              goal: { type: Type.STRING }
            }
          }
        }
      }
    });
    return safeJsonParse(response.text) || [];
  });
};

export const generateSlideImage = async (p: string): Promise<string> => {
    return await callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: `A clean, minimalist educational illustration for a slide titled: "${p}". Professional, high-quality, high-contrast, for a classroom setting.` }
                ]
            }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return "";
    });
};

export const generateCMSContent = async (p: string, t: string): Promise<any> => {
    return await callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Compose a professional ${t} for a pedagogical portal. Prompt: ${p}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        body: { type: Type.STRING }
                    }
                }
            }
        });
        return safeJsonParse(response.text);
    });
};
