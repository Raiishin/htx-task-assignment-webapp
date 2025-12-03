import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface SkillDetectionResult {
  skills: string[];
}

export async function detectSkillsFromTitle(title: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a technical architect analyzing user stories to determine required software development skills.

## ARCHITECTURAL PRINCIPLES

**Frontend Skill** - Required when task involves:
- User interface, visual elements, or client-side interactions
- UI/UX design, responsive layouts, user input forms
- Displaying data, navigation, animations

**Backend Skill** - Required when task involves:
- Server-side logic, data persistence, APIs
- Database operations, business logic, authentication
- Data processing, system operations

**CRITICAL - Both Skills Required When:**
- Task involves BOTH user interaction AND data modification/persistence
- User-facing features that create, update, or delete data almost always need both layers
- Remember: Frontend collects input → Backend processes and stores → Frontend displays result

## ANALYSIS FRAMEWORK

Analyze the task step-by-step:
1. Does it involve UI elements the user sees/interacts with?
2. Does it create, update, or delete data?
3. Does it involve background processing or APIs?

## EXAMPLES

**Example 1 - Frontend Only:**
"As a visitor, I want to see a responsive homepage with animations."
→ UI-only, no data persistence → ["Frontend"]

**Example 2 - Backend Only:**
"As a system, I want automated daily database backups."
→ System task, no user interface → ["Backend"]

**Example 3 - Both Skills (CRITICAL PATTERN):**
"As a user, I want to update my profile and upload a profile picture."
→ User interacts with form (Frontend) + data must be persisted (Backend) → ["Frontend", "Backend"]

**Example 4 - Both Skills (Data Display):**
"As a user, I want to view audit logs of my activities."
→ Display in UI (Frontend) + query database via API (Backend) → ["Frontend", "Backend"]

## YOUR TASK

Analyze this user story: "${title}"

Think step-by-step:
- What user-facing components are needed?
- What data operations are required?
- Does this require persistence or just display?

Respond ONLY with JSON: {"skills": ["Frontend"]} or {"skills": ["Backend"]} or {"skills": ["Frontend", "Backend"]}`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let detectedSkills: string[] = [];
    let parsingMethod = '';

    console.log('=== LLM Skill Detection ===');
    console.log('Input:', title);
    console.log('LLM Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));

    // Strategy 1: Try to parse full JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as SkillDetectionResult;
        const validSkills = ['Frontend', 'Backend'];
        detectedSkills = parsed.skills.filter(skill => validSkills.includes(skill));

        if (detectedSkills.length > 0) {
          parsingMethod = 'JSON';
          console.log('Parsing Method: JSON');
          console.log('Detected Skills:', detectedSkills);
          console.log('===========================');
          return detectedSkills;
        }
      }
    } catch (e) {
      // JSON parsing failed, continue to fallbacks
    }

    // Strategy 2: Try regex extraction of skills from text
    if (detectedSkills.length === 0) {
      const skillsInText: string[] = [];
      if (/\bFrontend\b/i.test(text)) skillsInText.push('Frontend');
      if (/\bBackend\b/i.test(text)) skillsInText.push('Backend');

      if (skillsInText.length > 0) {
        detectedSkills = skillsInText;
        parsingMethod = 'Regex';
        console.log('Parsing Method: Regex (found skills in text)');
        console.log('Detected Skills:', detectedSkills);
        console.log('===========================');
        return detectedSkills;
      }
    }

    // Strategy 3: Intelligent keyword-based fallback
    console.log('Parsing Method: Keyword Fallback (LLM parsing failed)');
    detectedSkills = getSkillsFromKeywords(title);
    console.log('Detected Skills:', detectedSkills);
    console.log('===========================');
    return detectedSkills;

  } catch (error) {
    console.error('Error in LLM skill detection:', error);
    // Even on error, use intelligent defaulting
    const fallbackSkills = getSkillsFromKeywords(title);
    console.log('Using keyword fallback due to error:', fallbackSkills);
    return fallbackSkills;
  }
}

// Helper function for intelligent keyword-based skill detection
function getSkillsFromKeywords(title: string): string[] {
  const titleLower = title.toLowerCase();

  // UI/Frontend indicators
  const uiKeywords = /\b(form|button|page|display|view|ui|interface|responsive|animation|navigation|layout|component|design|visual|front-end|frontend|client-side|upload|picture|image|photo|file|input|select|dropdown|modal|dialog|menu)\b/i;

  // Data/Backend indicators
  const dataKeywords = /\b(save|update|delete|create|store|persist|database|api|server|backend|back-end|endpoint|process|authenticate|authorize|audit|log|migration|backup|sync|modify|change|edit|submit|send|post|record)\b/i;

  const hasUIKeywords = uiKeywords.test(titleLower);
  const hasDataKeywords = dataKeywords.test(titleLower);

  // If both UI and data operations → Both skills
  if (hasUIKeywords && hasDataKeywords) {
    return ['Frontend', 'Backend'];
  }

  // If only UI → Frontend
  if (hasUIKeywords) {
    return ['Frontend'];
  }

  // If only data operations → Backend
  if (hasDataKeywords) {
    return ['Backend'];
  }

  // When ambiguous or no clear indicators → default to Both (safest)
  console.log('No clear skill indicators found, defaulting to both');
  return ['Frontend', 'Backend'];
}
