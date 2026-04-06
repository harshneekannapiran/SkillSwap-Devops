import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { HomePage } from './pages/Home/HomePage.jsx'
import { AuthPage } from './pages/Auth/AuthPage.jsx'
import { DashboardPage } from './pages/Dashboard/DashboardPage.jsx'
import { SkillMarketplacePage } from './pages/SkillMarketplace/SkillMarketplacePage.jsx'
import { MentorshipPage } from './pages/Mentorship/MentorshipPage.jsx'
import { ChatPage } from './pages/Chat/ChatPage.jsx'
import { ProfilePage } from './pages/Profile/ProfilePage.jsx'
import { OpportunitiesPage } from './pages/Opportunities/OpportunitiesPage.jsx'
import { EventsPage } from './pages/Events/EventsPage.jsx'
import { MyApplications } from './pages/Applications/MyApplications.jsx'
import { ViewApplicants } from './pages/Applications/ViewApplicants.jsx'
import DiscussionForum from './pages/Forum/DiscussionForum.jsx'
import ForumPostDetail from './pages/Forum/ForumPostDetail.jsx'
import MyMentor from './pages/Mentorship/MyMentor.jsx'
import MyStudents from './pages/Mentorship/MyStudents.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="skills" element={<SkillMarketplacePage />} />
            <Route path="mentorship" element={<MentorshipPage />} />
            <Route path="my-mentor" element={<MyMentor />} />
            <Route path="my-students" element={<MyStudents />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="my-applications" element={<MyApplications />} />
            <Route path="view-applicants" element={<ViewApplicants />} />
            <Route path="forum" element={<DiscussionForum />} />
            <Route path="forum/:postId" element={<ForumPostDetail />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
