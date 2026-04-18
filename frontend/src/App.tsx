import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import History from "./pages/History";
import USA from "./pages/USA";
import China from "./pages/China";
import MissionDetail from "./pages/Mission";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-space-900 starfield">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/usa" element={<USA />} />
          <Route path="/china" element={<China />} />
          <Route path="/mission/:id" element={<MissionDetail />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
