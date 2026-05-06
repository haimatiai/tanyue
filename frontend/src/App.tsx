import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import History from "./pages/History";
import USA from "./pages/USA";
import China from "./pages/China";
import MissionDetail from "./pages/Mission";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-space-900 starfield">
        <a href="#main-content" className="skip-to-main">
          跳转到主要内容
        </a>
        <Navbar />
        <ScrollToTop />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/usa" element={<USA />} />
            <Route path="/china" element={<China />} />
            <Route path="/mission/:id" element={<MissionDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
