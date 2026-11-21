import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import SubmitComplaint from './pages/SubmitComplaint';
import SubmissionSuccess from './pages/SubmissionSuccess';
import OfficerDashboard from './pages/OfficerDashboard';
import ComplaintDetails from './pages/ComplaintDetails';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/success" element={<SubmissionSuccess />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<OfficerDashboard />} />
                <Route path="/complaints/:id" element={<ComplaintDetails />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
          <footer className="border-t border-line py-6 text-center text-xs text-sub">
            CivicLens · AI-powered civic complaint triage · {new Date().getFullYear()}
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
