import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { contentAPI, influencersAPI } from '../services/api'
import { 
  HiOutlineTrash,
  HiOutlineDownload,
  HiChevronDown,
  HiX,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'

function GeneratedContent() {
  const [content, setContent] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterInfluencer, setFilterInfluencer] = useState('all')
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, influencersRes] = await Promise.all([
          contentAPI.getAll(),
          influencersAPI.getAll()
        ])
        setContent(contentRes.data || [])
        setInfluencers(influencersRes.data || [])
      } catch (err) {
        console.error('Error fetching content:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return
    }

    try {
      await contentAPI.delete(id)
      const response = await contentAPI.getAll()
      setContent(response.data || [])
    } catch (err) {
      console.error('Error deleting content:', err)
      alert('Failed to delete content')
    }
  }

  // Filter and sort content (newest first)
  const filteredContent = content
    .filter(item => {
      const matchesSearch = !searchQuery || 
        item.type?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || item.type === filterType
      const matchesInfluencer = filterInfluencer === 'all' || 
        item.influencerId === parseInt(filterInfluencer)
      return matchesSearch && matchesType && matchesInfluencer
    })
    .sort((a, b) => {
      // Sort by createdAt (newest first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA // Descending order (newest first)
    })

  const getContentTypeLabel = (type) => {
    const labels = {
      'feed_post': 'Feed Post',
      'story': 'Story',
      'video': 'Video',
      'reel': 'Reel',
      'trend': 'Trend'
    }
    return labels[type] || type
  }

  const getPlaceholderImage = (type) => {
    // Generate placeholder based on type
    const colors = {
      'feed_post': 'from-purple-500 to-purple-400',
      'story': 'from-pink-500 to-red-500',
      'video': 'from-green-500 to-teal-500',
      'reel': 'from-orange-500 to-yellow-500',
      'trend': 'from-indigo-500 to-purple-500'
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  const openGallery = (index) => {
    setSelectedImageIndex(index)
    setIsGalleryOpen(true)
    // Prevent body scroll when gallery is open
    document.body.style.overflow = 'hidden'
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
    setSelectedImageIndex(null)
    // Restore body scroll
    document.body.style.overflow = 'unset'
  }

  const navigateGallery = (direction) => {
    if (selectedImageIndex === null) return
    
    if (direction === 'prev') {
      const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : filteredContent.length - 1
      setSelectedImageIndex(newIndex)
    } else if (direction === 'next') {
      const newIndex = selectedImageIndex < filteredContent.length - 1 ? selectedImageIndex + 1 : 0
      setSelectedImageIndex(newIndex)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isGalleryOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsGalleryOpen(false)
        setSelectedImageIndex(null)
        document.body.style.overflow = 'unset'
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => {
          if (prev === null) return null
          return prev > 0 ? prev - 1 : filteredContent.length - 1
        })
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => {
          if (prev === null) return null
          return prev < filteredContent.length - 1 ? prev + 1 : 0
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGalleryOpen, filteredContent.length])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar - 20% */}
      <Sidebar />

      {/* Main Content - 80% */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Generated Content</h1>
            <p className="text-gray-400">View and manage all your generated content</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-12 pr-4 py-3 bg-dark-card backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-dark-card backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="feed_post">Feed Posts</option>
                  <option value="story">Stories</option>
                  <option value="video">Videos</option>
                  <option value="reel">Reels</option>
                  <option value="trend">Trends</option>
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Influencer Filter */}
              <div className="relative">
                <select
                  value={filterInfluencer}
                  onChange={(e) => setFilterInfluencer(e.target.value)}
                  className="appearance-none bg-dark-card backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-200"
                >
                  <option value="all">All Influencers</option>
                  {influencers.map(inf => (
                    <option key={inf.id} value={inf.id}>{inf.name}</option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading content...</p>
            </div>
          )}

          {/* Content Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map((item) => {
                const influencer = influencers.find(inf => inf.id === item.influencerId)
                return (
                  <div
                    key={item.id}
                    className="relative group"
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-30 blur-xl"></div>
                    {/* Glass Card */}
                    <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl overflow-hidden gradient-border-card hover:before:opacity-100 transition-all duration-300">
                    {/* Image/Video Preview - Clickable */}
                    <div 
                      className={`aspect-square bg-gradient-to-br ${getPlaceholderImage(item.type)} relative overflow-hidden cursor-pointer group`}
                      onClick={() => {
                        const index = filteredContent.findIndex(c => c.id === item.id)
                        if (index !== -1) openGallery(index)
                      }}
                    >
                      {item.url ? (
                        <>
                          <img 
                            src={item.url.startsWith('http') 
                              ? item.url 
                              : `http://localhost:3001${item.url}`} 
                            alt={`${getContentTypeLabel(item.type)} by ${influencer?.name || 'Unknown'}`}
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.target.style.display = 'none'
                              const placeholder = e.target.nextElementSibling
                              if (placeholder) placeholder.style.display = 'flex'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-400" style={{ display: 'none' }}>
                            <span className="text-4xl font-bold text-white/80">
                              {influencer?.image || influencer?.name?.charAt(0) || '📷'}
                            </span>
                          </div>
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <HiOutlineMagnifyingGlass className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white/80">
                            {influencer?.image || influencer?.name?.charAt(0) || '📷'}
                          </span>
                        </div>
                      )}
                      
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {getContentTypeLabel(item.type)}
                        </span>
                      </div>
                    </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-400">
                            {influencer?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 mt-4">
                        {item.type === 'feed_post' && influencer && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Use this image as profile picture for ${influencer.name}?`)) {
                                try {
                                  await influencersAPI.setProfileFromContent(influencer.id, item.id)
                                  alert('✅ Profile picture updated!')
                                  // Refresh page to show updated profile
                                  window.location.reload()
                                } catch (err) {
                                  console.error('Error updating profile:', err)
                                  alert('Failed to update profile picture')
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20"
                          >
                            <span className="text-sm font-medium">Use as Profile</span>
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const imageUrl = item.url.startsWith('http') 
                              ? item.url 
                              : `http://localhost:3001${item.url}`
                            const link = document.createElement('a')
                            link.href = imageUrl
                            link.download = `${influencer?.name || 'content'}_${item.id}.png`
                            link.click()
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30"
                        >
                          <HiOutlineDownload className="w-4 h-4" />
                          <span className="text-sm font-medium">Download</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full flex items-center justify-center space-x-2 bg-dark-card/50 backdrop-blur-sm hover:bg-red-500/20 text-gray-400 hover:text-red-400 py-2.5 px-4 rounded-xl transition-all duration-200 border border-white/5 hover:border-red-500/30"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No content found</p>
              <p className="text-sm text-gray-500">
                {searchQuery || filterType !== 'all' || filterInfluencer !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Generate your first content to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && selectedImageIndex !== null && filteredContent[selectedImageIndex] && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Close if clicking on backdrop (not on image)
            if (e.target === e.currentTarget) {
              closeGallery()
            }
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-10 bg-dark-surface hover:bg-gray-700 text-white p-3 rounded-full transition-colors border border-gray-800/30"
            aria-label="Close gallery"
          >
            <HiX className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {filteredContent.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateGallery('prev')
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-dark-surface hover:bg-gray-700 text-white p-3 rounded-full transition-colors border border-gray-800/30"
                aria-label="Previous image"
              >
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateGallery('next')
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-dark-surface hover:bg-gray-700 text-white p-3 rounded-full transition-colors border border-gray-800/30"
                aria-label="Next image"
              >
                <HiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            {(() => {
              const currentItem = filteredContent[selectedImageIndex]
              const currentInfluencer = influencers.find(inf => inf.id === currentItem.influencerId)
              const imageUrl = currentItem.url 
                ? (currentItem.url.startsWith('http') 
                    ? currentItem.url 
                    : `http://localhost:3001${currentItem.url}`)
                : null

              return (
                <>
                  {/* Image */}
                  <div className="relative w-full h-full flex items-center justify-center mb-4">
                    {imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt={`${getContentTypeLabel(currentItem.type)} by ${currentInfluencer?.name || 'Unknown'}`}
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="w-full h-96 bg-dark-surface rounded-lg flex items-center justify-center">
                        <span className="text-6xl text-gray-500">
                          {currentInfluencer?.image || currentInfluencer?.name?.charAt(0) || '📷'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="relative group">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-purple-gradient rounded-2xl opacity-30 blur-xl"></div>
                    {/* Glass Card */}
                    <div className="relative bg-dark-surface backdrop-blur-xl rounded-2xl p-6 gradient-border-card w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {currentInfluencer?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {getContentTypeLabel(currentItem.type)}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded ${
                        currentItem.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {currentItem.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>{new Date(currentItem.createdAt).toLocaleDateString()}</span>
                      <span>{selectedImageIndex + 1} / {filteredContent.length}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {currentItem.type === 'feed_post' && currentInfluencer && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (window.confirm(`Use this image as profile picture for ${currentInfluencer.name}?`)) {
                              try {
                                await influencersAPI.setProfileFromContent(currentInfluencer.id, currentItem.id)
                                alert('✅ Profile picture updated!')
                                closeGallery()
                                // Refresh to show updated profile
                                const response = await contentAPI.getAll()
                                setContent(response.data || [])
                              } catch (err) {
                                console.error('Error updating profile:', err)
                                alert('Failed to update profile picture')
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20"
                        >
                          <span className="font-medium">Use as Profile</span>
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          if (imageUrl) {
                            const link = document.createElement('a')
                            link.href = imageUrl
                            link.download = `${currentInfluencer?.name || 'content'}_${currentItem.id}.png`
                            link.click()
                          }
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30"
                      >
                        <HiOutlineDownload className="w-4 h-4" />
                        <span className="font-medium">Download</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(currentItem.id)
                          if (filteredContent.length === 1) {
                            closeGallery()
                          } else {
                            navigateGallery('next')
                          }
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-dark-card/50 backdrop-blur-sm hover:bg-red-500/20 text-gray-400 hover:text-red-400 py-2.5 px-4 rounded-xl transition-all duration-200 border border-white/5 hover:border-red-500/30"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneratedContent

