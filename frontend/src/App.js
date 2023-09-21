import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import About from "./components/About"
import Tweets from "./components/Tweets";
import Navbar from "./components/Navbar"
import Pointmap from "./components/Pointmap"
import TwitterAPI from "./components/TwitterAPI"
import Dataset from "./components/Dataset"

function App() {

  return (
    <Router>
      <Navbar/>
      <div className="container p-4">
        <Routes>
          <Route path="/twitterapi" element={<TwitterAPI/>}/>
          <Route path="/dataset" element={<Dataset/>}/>
          <Route path="/tweets" element={<Tweets/>}/>
          <Route path="/pointmap" element={<Pointmap/>}/>
          <Route path="/about" element={<About/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
