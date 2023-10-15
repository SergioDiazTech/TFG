import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Navbar from "./components/Navbar"
import TwitterAPI from "./components/TwitterAPI"
import Dataset from "./components/Dataset"
import Tweets from "./components/Tweets";
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
          <Route path="/tweets" element={<Tweets/>}/>
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
