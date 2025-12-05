import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import InfluencersList from './components/InfluencersList'
import Influencers from './components/Influencers'
import GeneratedContent from './components/GeneratedContent'
import SingleContent from './components/SingleContent'
import ContentPlan from './components/ContentPlan'
import EmilypellegriniStrategy from './components/EmilypellegriniStrategy'
import PromptTesting from './components/PromptTesting'
import MinimaxKnowledge from './components/MinimaxKnowledge'
import SocialMedia from './components/SocialMedia'
import Video from './components/Video'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/influencers" element={<InfluencersList />} />
        <Route path="/influencers/train" element={<Influencers />} />
        <Route path="/content" element={<GeneratedContent />} />
        <Route path="/single" element={<SingleContent />} />
        <Route path="/trends" element={<SingleContent />} />
        <Route path="/content-plan" element={<ContentPlan />} />
        <Route path="/emilypellegrini-strategy" element={<EmilypellegriniStrategy />} />
        <Route path="/prompt-testing" element={<PromptTesting />} />
        <Route path="/minimax" element={<MinimaxKnowledge />} />
        <Route path="/social" element={<SocialMedia />} />
        <Route path="/video" element={<Video />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

