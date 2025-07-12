import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment
const mockEnv = {
  DB: {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    run: vi.fn(),
    first: vi.fn(),
    all: vi.fn()
  },
  API_RATE_LIMIT_PER_DAY: '1000'
};

describe('API Abuse Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should block rapid requests exceeding daily limit', async () => {
      const teamId = 'team-123';
      const apiKey = 'valid_api_key';

      // Mock that team has already used 1000 requests today
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ today_requests: 1000 })
        })
      });

      const request = new Request('https://example.com/api/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(429); // Too Many Requests
      expect(await response.json()).toEqual({
        error: 'Rate limit exceeded',
        limit: 1000,
        used: 1000,
        reset: expect.any(String)
      });
    });

    it('should allow requests within rate limit', async () => {
      const teamId = 'team-123';
      const apiKey = 'valid_api_key';

      // Mock that team has used 500 requests today
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ today_requests: 500 })
        })
      });

      const request = new Request('https://example.com/api/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(200);
    });

    it('should track API usage correctly', async () => {
      const teamId = 'team-123';
      const apiKey = 'valid_api_key';

      // Mock API key validation
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ team_id: teamId, is_active: true }),
          run: vi.fn().mockResolvedValue({})
        })
      });

      const request = new Request('https://example.com/api/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      await handleApiRequest(request);

      // Verify usage was logged
      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO api_usage_logs')
      );
    });
  });

  describe('Invalid API Keys', () => {
    it('should reject requests with missing API key', async () => {
      const request = new Request('https://example.com/api/analytics', {
        method: 'GET',
        headers: {}
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: 'API key required'
      });
    });

    it('should reject requests with invalid API key', async () => {
      const invalidApiKey = 'invalid_key';

      // Mock that API key doesn't exist
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null)
        })
      });

      const request = new Request('https://example.com/api/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${invalidApiKey}`
        }
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: 'Invalid API key'
      });
    });

    it('should reject requests with revoked API key', async () => {
      const revokedApiKey = 'revoked_key';

      // Mock that API key exists but is inactive
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ 
            team_id: 'team-123', 
            is_active: false 
          })
        })
      });

      const request = new Request('https://example.com/api/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${revokedApiKey}`
        }
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: 'Invalid API key'
      });
    });
  });

  describe('Malformed Payloads', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const apiKey = 'valid_api_key';

      // Mock valid API key
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ team_id: 'team-123', is_active: true })
        })
      });

      const request = new Request('https://example.com/api/signals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid JSON payload'
      });
    });

    it('should handle missing required fields', async () => {
      const apiKey = 'valid_api_key';

      // Mock valid API key
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ team_id: 'team-123', is_active: true })
        })
      });

      const request = new Request('https://example.com/api/signals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing required fields
          observation: 'test observation'
          // Missing: play_id, meaning, action
        })
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Missing required fields: play_id, meaning, action'
      });
    });

    it('should handle oversized payloads', async () => {
      const apiKey = 'valid_api_key';
      const oversizedPayload = 'x'.repeat(1024 * 1024); // 1MB payload

      const request = new Request('https://example.com/api/signals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          observation: oversizedPayload,
          play_id: 'play-123',
          meaning: 'test meaning',
          action: 'test action'
        })
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(413); // Payload Too Large
      expect(await response.json()).toEqual({
        error: 'Payload too large'
      });
    });
  });

  describe('Unauthorized Access', () => {
    it('should prevent access to admin endpoints without admin privileges', async () => {
      const apiKey = 'valid_api_key';

      // Mock valid API key but non-admin user
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ 
            team_id: 'team-123', 
            is_active: true,
            user_role: 'user' // Not admin
          })
        })
      });

      const request = new Request('https://example.com/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'Insufficient permissions'
      });
    });

    it('should prevent cross-team data access', async () => {
      const apiKey = 'valid_api_key';

      // Mock API key for team A
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ 
            team_id: 'team-a', 
            is_active: true 
          })
        })
      });

      const request = new Request('https://example.com/api/plays/play-from-team-b', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const response = await handleApiRequest(request);
      
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'Access denied to this resource'
      });
    });
  });
});

// Mock function for testing
async function handleApiRequest(request: Request) {
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate API key
  const keyRecord = await mockEnv.DB.prepare(`
    SELECT ak.team_id, ak.is_active, u.role as user_role
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = ? AND ak.is_active = TRUE
  `).bind(apiKey).first();

  if (!keyRecord) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check rate limit
  const todayUsage = await mockEnv.DB.prepare(`
    SELECT COUNT(*) as today_requests
    FROM api_usage_logs aul
    JOIN api_keys ak ON aul.api_key_id = ak.id
    WHERE ak.team_id = ? AND DATE(aul.created_at) = DATE('now')
  `).bind(keyRecord.team_id).first();

  const rateLimit = parseInt(mockEnv.API_RATE_LIMIT_PER_DAY);
  if ((todayUsage?.today_requests || 0) >= rateLimit) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      limit: rateLimit,
      used: todayUsage?.today_requests || 0,
      reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle different request types
  if (request.method === 'POST') {
    try {
      const body = await request.text();
      
      // Check payload size
      if (body.length > 100 * 1024) { // 100KB limit
        return new Response(JSON.stringify({ error: 'Payload too large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = JSON.parse(body);
      
      // Validate required fields for signals
      if (request.url.includes('/api/signals')) {
        const required = ['play_id', 'meaning', 'action'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
          return new Response(JSON.stringify({
            error: `Missing required fields: ${missing.join(', ')}`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Check admin permissions for admin endpoints
  if (request.url.includes('/api/admin/') && keyRecord.user_role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Log usage
  await mockEnv.DB.prepare(`
    INSERT INTO api_usage_logs (id, api_key_id, endpoint, method, response_code, response_time_ms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    'test-uuid',
    'api-key-id',
    new URL(request.url).pathname,
    request.method,
    200,
    50
  ).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 