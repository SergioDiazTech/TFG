import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Navbar from "./components/Navbar"
import TwitterAPI from "./components/Twitter_API"
import Dataset from "./components/Dataset"
import Data from "./components/Data";
import Overview from "./components/Overview";
import Users from "./components/Users";
import Heatmap from "./components/Heatmap"
import Pointmap from "./components/Pointmap"
import About from "./components/About"


function App() {

  return (
    <Router>
      <Navbar/>
      <div className="container p-4">
        <Routes>
          <Route path="/twitterapi" element={<TwitterAPI/>}/>
          <Route path="/dataset" element={<Dataset/>}/>
          <Route path="/tweetsData" element={<Data/>}/>
          <Route path="/overview" element={<Overview/>}/>
          <Route path="/users" element={<Users/>}/>
          <Route path="/heatmap" element={<Heatmap/>}/>
          <Route path="/pointmap" element={<Pointmap/>}/>
          <Route path="/about" element={<About/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
