import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import About from "./components/About"
import Tweets from "./components/Tweets";
import Navbar from "./components/Navbar"
import Heatmap from "./components/Heatmap"
import TwitterAPI from "./components/TwitterAPI"
import Dataset from "./components/Dataset"

function App() {

  return (
    <Router>
      <Navbar/>
      <div className="container p-4">
        <Routes>
          <Route path="/tweets" element={<Tweets/>}/>
          <Route path="/twitterapi" element={<TwitterAPI/>}/>
          <Route path="/heatmap" element={<Heatmap/>}/>
          <Route path="/dataset" element={<Dataset/>}/>
          <Route path="/about" element={<About/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
