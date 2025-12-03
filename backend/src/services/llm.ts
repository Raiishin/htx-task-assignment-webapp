import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface SkillDetectionResult {
  skills: string[];
}

export async function detectSkillsFromTitle(title: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a technical task analyzer. Analyze the following task description and determine which skills are required from these options: "Frontend", "Backend", or both.

Task: "${title}"

Rules:
- If the task involves UI/UX, responsive design, user interface, visual elements, or client-side interactions, it requires "Frontend" skill.
- If the task involves databases, APIs, server-side logic, data processing, security, or backend systems, it requires "Backend" skill.
- Some tasks may require both skills.
- Respond ONLY with a JSON object in this exact format: {"skills": ["Frontend"]} or {"skills": ["Backend"]} or {"skills": ["Frontend", "Backend"]}
- Do not include any explanation, just the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log('LLM Response:', text);

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as SkillDetectionResult;
    
    // Validate the skills
    const validSkills = ['Frontend', 'Backend'];
    const detectedSkills = parsed.skills.filter(skill => 
      validSkills.includes(skill)
    );

    if (detectedSkills.length === 0) {
      console.warn('No valid skills detected, defaulting to Backend');
      return ['Backend'];
    }

    console.log('Detected skills:', detectedSkills);
    return detectedSkills;
  } catch (error) {
    console.error('Error detecting skills with LLM:', error);
    // Default to Backend if LLM fails
    return ['Backend'];
  }
}
