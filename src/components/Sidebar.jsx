import { useLocation, Link } from 'react-router-dom'
import { 
  HiOutlineHome,
  HiOutlineUser, 
  HiOutlineDocumentText, 
  HiOutlineTrendingUp,
  HiOutlineDocument,
  HiOutlineShare,
  HiOutlineClipboardCheck,
  HiOutlineCreditCard,
  HiOutlineBookOpen,
  HiOutlineCurrencyDollar,
  HiOutlineQuestionMarkCircle,
  HiOutlineUserGroup
} from 'react-icons/hi'

function Sidebar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome },
    { name: 'My Influencers', path: '/influencers', icon: HiOutlineUser },
    { name: 'Generated Content', path: '/content', icon: HiOutlineDocumentText },
    { name: 'Trends Studio', path: '/trends', icon: HiOutlineTrendingUp },
    { name: 'Single Content', path: '/single', icon: HiOutlineDocument },
    { name: 'Social Media', path: '/social', icon: HiOutlineShare },
    { name: 'Audits', path: '/audits', icon: HiOutlineClipboardCheck },
  ]

  const lowerMenuItems = [
    { name: 'My Subscription', path: '/subscription', icon: HiOutlineCreditCard },
    { name: 'Guides', path: '/guides', icon: HiOutlineBookOpen },
    { name: 'Monetize', path: '/monetize', icon: HiOutlineCurrencyDollar },
    { name: 'Support & Help', path: '/support', icon: HiOutlineQuestionMarkCircle },
    { name: 'Affiliates', path: '/affiliates', icon: HiOutlineUserGroup },
  ]

  return (
    <div className="w-1/5 h-screen bg-dark-surface backdrop-blur-xl gradient-border-right flex flex-col">
      {/* Logo - Same height as Header */}
      <div className="px-6 py-4 gradient-border-bottom flex items-center h-[72px] box-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
          OnlyFlow
        </h1>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 border border-purple-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card/30 hover:border-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Lower Menu */}
      <div className="p-4 gradient-border-top space-y-2">
        {lowerMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 border border-purple-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card/30 hover:border-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar

