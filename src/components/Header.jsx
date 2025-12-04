import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { HiOutlineBell, HiOutlineInformationCircle, HiChevronDown } from 'react-icons/hi'
import { aiAPI } from '../services/api'

function Header() {
  const [credits, setCredits] = useState(null) // null = loading, number = loaded

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const creditsRes = await aiAPI.getCredits()
        if (creditsRes.success && creditsRes.data.credits !== null && creditsRes.data.credits !== undefined) {
          setCredits(creditsRes.data.credits)
        } else {
          setCredits(9.95) // Fallback
        }
      } catch (err) {
        console.warn('Failed to fetch credits in header:', err)
        setCredits(9.95) // Fallback
      }
    }
    fetchCredits()
    
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000)
    return () => clearInterval(interval)
  }, [])
  const location = useLocation()
  const getTitle = () => {
    if (location.pathname.includes('/influencers/train')) return 'Train'
    if (location.pathname === '/influencers') return 'My Influencers'
    if (location.pathname === '/content') return 'Generated Content'
    if (location.pathname === '/single') return 'Single Content'
    if (location.pathname === '/dashboard') return 'Dashboard'
    return 'OnlyFlow'
  }

  return (
    <div className="bg-dark-surface backdrop-blur-xl gradient-border-bottom px-6 py-4 flex items-center justify-between h-[72px] box-border">
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
          OnlyFlow
        </h1>
        {/* Page Title */}
        <h2 className="text-xl font-semibold text-white">{getTitle()}</h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Credits */}
        <div className="flex items-center space-x-2 bg-dark-card backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-200">
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
            ${credits !== null ? (typeof credits === 'number' ? credits.toFixed(2) : credits) : '...'}
          </span>
          <span className="text-sm font-semibold text-gray-300">Credits</span>
        </div>
        
        {/* Bell with notification */}
        <div className="relative group">
          <div className="p-2 rounded-xl hover:bg-dark-card/30 border border-transparent hover:border-white/5 transition-all duration-200 cursor-pointer">
            <HiOutlineBell className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </div>
          <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-purple-600/50 ring-2 ring-dark-bg">
            1
          </span>
        </div>
        
        {/* User Avatar with Info */}
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-dark-card/30 px-2 py-1 rounded-xl transition-all duration-200 border border-transparent hover:border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/20">
            <span className="text-xs font-semibold text-white">i</span>
          </div>
          <HiChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

export default Header

