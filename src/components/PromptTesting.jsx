import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { 
  HiOutlineUser,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineSparkles
} from 'react-icons/hi'

function PromptTesting() {
  const [activeTab, setActiveTab] = useState('influencer-creating')
  
  // Current profile photo prompt (from aiService.js)
  const defaultProfilePrompt = `professional headshot portrait of {gender}, {age} years old{hairColor}, {location}, high quality photography, studio lighting, professional, 8k, realistic, detailed`
  
  const [profilePrompt, setProfilePrompt] = useState(defaultProfilePrompt)
  const [profileTestValues, setProfileTestValues] = useState({
    gender: 'female',
    age: 24,
    hairColor: 'long brown hair',
    location: 'luxury hotel'
  })

  // Content Generation prompt (from aiService.js)
  const defaultContentPrompt = `{gender}, {activity}, wearing {outfit}, at {location}{hairColor}, {postType}, professional photography, high quality, detailed, 8k, realistic, natural lighting, same person, consistent face`
  
  const [contentPrompt, setContentPrompt] = useState(defaultContentPrompt)
  const [contentTestValues, setContentTestValues] = useState({
    gender: 'female',
    activity: 'relaxing',
    outfit: 'casual summer dress',
    location: 'beach',
    hairColor: 'long brown hair',
    postType: 'feed post style, high quality photography'
  })

  // Training Images prompt template (from aiService.js)
  const defaultTrainingPrompt = `portrait photo of {gender}, {age} years old{hairColor}, wearing {outfit}, in {setting}, {pose}, professional photography, high quality, detailed, 8k, realistic, natural lighting, sexy, alluring, tasteful`
  
  const [trainingPrompt, setTrainingPrompt] = useState(defaultTrainingPrompt)
  const [trainingTestValues, setTrainingTestValues] = useState({
    gender: 'female',
    age: 24,
    hairColor: 'long brown hair',
    outfit: 'black lace lingerie set',
    setting: 'luxury bedroom with silk sheets',
    pose: 'sitting on bed, looking at camera seductively'
  })

  const buildProfilePrompt = () => {
    let prompt = profilePrompt
      .replace('{gender}', profileTestValues.gender)
      .replace('{age}', profileTestValues.age.toString())
      .replace('{hairColor}', profileTestValues.hairColor ? `, ${profileTestValues.hairColor}` : '')
      .replace('{location}', profileTestValues.location ? `, in ${profileTestValues.location}` : '')
    
    // Clean up any double commas or spaces
    prompt = prompt.replace(/\s*,\s*,/g, ',')
    prompt = prompt.replace(/\s+/g, ' ').trim()
    
    return prompt
  }

  const buildContentPrompt = () => {
    let prompt = contentPrompt
      .replace('{gender}', contentTestValues.gender)
      .replace('{activity}', contentTestValues.activity)
      .replace('{outfit}', contentTestValues.outfit)
      .replace('{location}', contentTestValues.location)
      .replace('{hairColor}', contentTestValues.hairColor ? `, ${contentTestValues.hairColor}` : '')
      .replace('{postType}', contentTestValues.postType)
    
    // Clean up any double commas or spaces
    prompt = prompt.replace(/\s*,\s*,/g, ',')
    prompt = prompt.replace(/\s+/g, ' ').trim()
    
    return prompt
  }

  const buildTrainingPrompt = () => {
    let prompt = trainingPrompt
      .replace('{gender}', trainingTestValues.gender)
      .replace('{age}', trainingTestValues.age.toString())
      .replace('{hairColor}', trainingTestValues.hairColor ? `, ${trainingTestValues.hairColor}` : '')
      .replace('{outfit}', trainingTestValues.outfit)
      .replace('{setting}', trainingTestValues.setting)
      .replace('{pose}', trainingTestValues.pose)
    
    // Clean up any double commas or spaces
    prompt = prompt.replace(/\s*,\s*,/g, ',')
    prompt = prompt.replace(/\s+/g, ' ').trim()
    
    return prompt
  }

  const tabs = [
    { id: 'influencer-creating', name: 'Influencer Creating', icon: HiOutlineUser },
    { id: 'content-generation', name: 'Content Generation', icon: HiOutlineDocumentText },
    { id: 'training-images', name: 'Training Images', icon: HiOutlinePhotograph },
  ]

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Prompt Testing</h1>
            
            {/* Tabs */}
            <div className="bg-dark-surface rounded-lg p-2 border border-gray-800/50 mb-6">
              <div className="flex space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30'
                          : 'text-gray-400 hover:text-white hover:bg-dark-card/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'influencer-creating' && (
              <div className="space-y-6">
                {/* Profile Photo Section */}
                <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <HiOutlinePhotograph className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Profile Photo</h2>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-6">
                    Test and optimize the prompt used for generating influencer profile photos
                  </p>

                  {/* Current Prompt Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Prompt Template
                    </label>
                    <textarea
                      value={profilePrompt}
                      onChange={(e) => setProfilePrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm min-h-[120px]"
                      placeholder="Enter prompt template..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Use placeholders: {'{gender}'}, {'{age}'}, {'{hairColor}'}, {'{location}'}
                    </p>
                  </div>

                  {/* Test Values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                      <input
                        type="text"
                        value={profileTestValues.gender}
                        onChange={(e) => setProfileTestValues({...profileTestValues, gender: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="female"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                      <input
                        type="number"
                        value={profileTestValues.age}
                        onChange={(e) => setProfileTestValues({...profileTestValues, age: parseInt(e.target.value) || 24})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
                      <input
                        type="text"
                        value={profileTestValues.hairColor}
                        onChange={(e) => setProfileTestValues({...profileTestValues, hairColor: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="long brown hair"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={profileTestValues.location}
                        onChange={(e) => setProfileTestValues({...profileTestValues, location: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="luxury hotel"
                      />
                    </div>
                  </div>

                  {/* Generated Prompt Preview */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generated Prompt (Preview)
                    </label>
                    <div className="bg-dark-card border border-gray-800/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300 font-mono break-words">
                        {buildProfilePrompt()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <HiOutlineSparkles className="w-5 h-5" />
                      <span>Test Generation</span>
                    </button>
                    <button
                      onClick={() => setProfilePrompt(defaultProfilePrompt)}
                      className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-800/30"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content-generation' && (
              <div className="space-y-6">
                {/* Content Generation Section */}
                <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <HiOutlineDocumentText className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">Content Generation</h2>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-6">
                    Test and optimize the prompt used for generating feed posts, stories, and reels
                  </p>

                  {/* Current Prompt Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Prompt Template
                    </label>
                    <textarea
                      value={contentPrompt}
                      onChange={(e) => setContentPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm min-h-[120px]"
                      placeholder="Enter prompt template..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Use placeholders: {'{gender}'}, {'{activity}'}, {'{outfit}'}, {'{location}'}, {'{hairColor}'}, {'{postType}'}
                    </p>
                  </div>

                  {/* Test Values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                      <input
                        type="text"
                        value={contentTestValues.gender}
                        onChange={(e) => setContentTestValues({...contentTestValues, gender: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="female"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Activity</label>
                      <input
                        type="text"
                        value={contentTestValues.activity}
                        onChange={(e) => setContentTestValues({...contentTestValues, activity: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="relaxing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Outfit</label>
                      <input
                        type="text"
                        value={contentTestValues.outfit}
                        onChange={(e) => setContentTestValues({...contentTestValues, outfit: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="casual summer dress"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={contentTestValues.location}
                        onChange={(e) => setContentTestValues({...contentTestValues, location: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="beach"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
                      <input
                        type="text"
                        value={contentTestValues.hairColor}
                        onChange={(e) => setContentTestValues({...contentTestValues, hairColor: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="long brown hair"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Post Type</label>
                      <select
                        value={contentTestValues.postType}
                        onChange={(e) => setContentTestValues({...contentTestValues, postType: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="feed post style, high quality photography">Feed Post</option>
                        <option value="vertical format, story style, engaging composition">Story</option>
                        <option value="dynamic composition, reel style, engaging">Reel</option>
                      </select>
                    </div>
                  </div>

                  {/* Generated Prompt Preview */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generated Prompt (Preview)
                    </label>
                    <div className="bg-dark-card border border-gray-800/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300 font-mono break-words">
                        {buildContentPrompt()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <HiOutlineSparkles className="w-5 h-5" />
                      <span>Test Generation</span>
                    </button>
                    <button
                      onClick={() => setContentPrompt(defaultContentPrompt)}
                      className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-800/30"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'training-images' && (
              <div className="space-y-6">
                {/* Training Images Section */}
                <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <HiOutlinePhotograph className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-white">Training Images</h2>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-6">
                    Test and optimize the prompt used for generating training images (20 variations)
                  </p>

                  {/* Current Prompt Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Prompt Template
                    </label>
                    <textarea
                      value={trainingPrompt}
                      onChange={(e) => setTrainingPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm min-h-[120px]"
                      placeholder="Enter prompt template..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Use placeholders: {'{gender}'}, {'{age}'}, {'{hairColor}'}, {'{outfit}'}, {'{setting}'}, {'{pose}'}
                    </p>
                  </div>

                  {/* Test Values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                      <input
                        type="text"
                        value={trainingTestValues.gender}
                        onChange={(e) => setTrainingTestValues({...trainingTestValues, gender: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="female"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                      <input
                        type="number"
                        value={trainingTestValues.age}
                        onChange={(e) => setTrainingTestValues({...trainingTestValues, age: parseInt(e.target.value) || 24})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
                      <input
                        type="text"
                        value={trainingTestValues.hairColor}
                        onChange={(e) => setTrainingTestValues({...trainingTestValues, hairColor: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="long brown hair"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Outfit</label>
                      <input
                        type="text"
                        value={trainingTestValues.outfit}
                        onChange={(e) => setTrainingTestValues({...trainingTestValues, outfit: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="black lace lingerie set"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Setting</label>
                      <input
                        type="text"
                        value={trainingTestValues.setting}
                        onChange={(e) => setTrainingTestValues({...trainingTestValues, setting: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="luxury bedroom with silk sheets"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Pose</label>
                      <input
                        type="text"
                        value={trainingTestValues.pose}
                        onChange={(e) => setTrainingTestValues({...trainingTestValues, pose: e.target.value})}
                        className="w-full px-4 py-3 bg-dark-card border border-gray-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="sitting on bed, looking at camera seductively"
                      />
                    </div>
                  </div>

                  {/* Example Training Prompts */}
                  <div className="mb-6 bg-dark-card rounded-lg p-4 border border-gray-800/30">
                    <h3 className="text-sm font-semibold text-white mb-3">Example Training Image Variations (20 total)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>1. black lace lingerie set, luxury bedroom, sitting on bed</div>
                      <div>2. red satin bra and panties, boudoir, leaning against mirror</div>
                      <div>3. white lace bodysuit, modern apartment, standing by window</div>
                      <div>4. black leather corset, dark elegant room, sitting on chair</div>
                      <div>5. sexy red dress, luxury hotel room, standing pose</div>
                      <div>6. black mesh bodysuit, studio, artistic pose</div>
                      <div>7. white silk robe, spa-like bathroom, leaning on vanity</div>
                      <div>8. black lace teddy, bedroom with candlelight, lying on bed</div>
                      <div>9. sexy workout set, modern gym, stretching pose</div>
                      <div>10. black silk slip dress, penthouse, standing by balcony</div>
                      <div className="col-span-2 text-gray-500 mt-2">... and 10 more variations</div>
                    </div>
                  </div>

                  {/* Generated Prompt Preview */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generated Prompt (Preview)
                    </label>
                    <div className="bg-dark-card border border-gray-800/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300 font-mono break-words">
                        {buildTrainingPrompt()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <HiOutlineSparkles className="w-5 h-5" />
                      <span>Test Generation</span>
                    </button>
                    <button
                      onClick={() => setTrainingPrompt(defaultTrainingPrompt)}
                      className="bg-dark-card hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-800/30"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PromptTesting
