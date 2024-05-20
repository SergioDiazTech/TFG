import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Navbar from "./views/NavbarView"
import TwitterAPI from "./views/TwitterClientView"
import Dataset from "./views/DatasetImporterView"
import Overview from "./views/DashboardView";
import Heatmap from "./views/HeatmapView"
import Pointmap from "./views/PointmapView"
import Trendingtopics from "./views/TrendingTopicsView"
import About from "./views/AboutView"
import HomePage from "./views/HomePageView"


function App() {

  return (
    <Router>
      <Navbar/>
      <div className="container p-4">
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/twitterapi" element={<TwitterAPI/>}/>
          <Route path="/dataset" element={<Dataset/>}/>
          <Route path="/overview" element={<Overview/>}/>
          <Route path="/heatmap" element={<Heatmap/>}/>
          <Route path="/pointmap" element={<Pointmap/>}/>
          <Route path="/trendingtopics" element={<Trendingtopics/>}/>
          <Route path="/about" element={<About/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
