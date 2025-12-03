// Mock must be at the top before any imports
const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

import { detectSkillsFromTitle } from '../../src/services/llm';

describe('LLM Service - detectSkillsFromTitle', () => {
  describe('Keyword Fallback Logic', () => {
    beforeEach(() => {
      // Configure mock to trigger keyword fallback by throwing error
      mockGenerateContent.mockRejectedValue(new Error('API Error'));
    });

    it('should detect Backend for audit logs task', async () => {
      const title = 'As a system administrator, I want audit logs of all data access';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toContain('Backend');
      expect(skills).not.toContain('Frontend');
    });

    it('should detect both Frontend and Backend for profile update task', async () => {
      const title = 'As a user, I want to update my profile information and upload a profile picture';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toContain('Frontend');
      expect(skills).toContain('Backend');
      expect(skills).toHaveLength(2);
    });

    it('should detect Frontend for UI-only task', async () => {
      const title = 'As a visitor, I want to see a responsive homepage with animations';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toContain('Frontend');
      expect(skills).not.toContain('Backend');
    });

    it('should detect Backend for database task', async () => {
      const title = 'Create database migration for user preferences';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toContain('Backend');
    });

    it('should default to both skills for ambiguous task', async () => {
      const title = 'Improve the system performance';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toContain('Frontend');
      expect(skills).toContain('Backend');
    });
  });

  describe('LLM Response Parsing', () => {
    it('should parse valid JSON response from LLM', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '{"skills": ["Frontend", "Backend"]}',
        },
      });

      const title = 'Build a user dashboard';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toEqual(['Frontend', 'Backend']);
    });

    it('should handle LLM response with extra text around JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Based on analysis: {"skills": ["Frontend"]} - This task requires UI work.',
        },
      });

      const title = 'Create a login form';
      const skills = await detectSkillsFromTitle(title);

      expect(skills).toContain('Frontend');
    });
  });
});
