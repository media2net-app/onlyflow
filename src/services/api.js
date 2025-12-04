const API_BASE_URL = 'http://localhost:3001/api'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Influencers API
export const influencersAPI = {
  getAll: (search, filter) => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (filter) params.append('filter', filter)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiCall(`/influencers${query}`)
  },
  
  getById: (id) => apiCall(`/influencers/${id}`),
  
  create: (data) => apiCall('/influencers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiCall(`/influencers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  setProfileFromContent: (id, contentId) => apiCall(`/influencers/${id}/set-profile-from-content`, {
    method: 'POST',
    body: JSON.stringify({ contentId }),
  }),
  
  delete: (id) => apiCall(`/influencers/${id}`, {
    method: 'DELETE',
  }),
}

// Content API
export const contentAPI = {
  getAll: () => apiCall('/content'),
  
  getById: (id) => apiCall(`/content/${id}`),
  
  getByInfluencer: (influencerId) => apiCall(`/content/influencer/${influencerId}`),
  
  create: (data) => apiCall('/content', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/content/${id}`, {
    method: 'DELETE',
  }),
}

// Generation API
export const generationAPI = {
  generate: (data) => apiCall('/generation/content', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getStatus: (jobId) => apiCall(`/generation/status/${jobId}`),
  
  getQueue: () => apiCall('/generation/queue'),
}

// AI API
export const aiAPI = {
  generateProfile: (influencerData) => apiCall('/ai/generate-profile', {
    method: 'POST',
    body: JSON.stringify({ influencerData }),
  }),
  
  generateTrainingImages: (influencerData, count = 25) => apiCall('/ai/generate-training-images', {
    method: 'POST',
    body: JSON.stringify({ influencerData, count }),
  }),
  
  getCredits: () => apiCall('/ai/credits'),
}

// Health check
export const healthCheck = () => apiCall('/health')

export default {
  influencers: influencersAPI,
  content: contentAPI,
  generation: generationAPI,
  ai: aiAPI,
  healthCheck,
}

