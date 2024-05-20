import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Navbar from "./views/Navbar"
import TwitterAPI from "./views/Twitter_API"
import Dataset from "./views/Dataset"
import Data from "./views/Data";
import Overview from "./views/Overview";
import Heatmap from "./views/Heatmap"
import Pointmap from "./views/Pointmap"
import Trendingtopics from "./views/Trendingtopics"
import About from "./views/About"
import HomePage from "./views/HomePage"


function App() {

  return (
    <Router>
      <Navbar/>
      <div className="container p-4">
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/twitterapi" element={<TwitterAPI/>}/>
          <Route path="/dataset" element={<Dataset/>}/>
          <Route path="/tweetsData" element={<Data/>}/>
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
