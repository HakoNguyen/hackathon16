import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import components
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Videos from "./pages/Videos";
import Comments from "./pages/Comments";
import Statistics from "./pages/Statistics";
import Sentiment from "./pages/Sentiment";
import SearchForm from "./components/SearchForm";

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <SearchForm />
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/sentiment" element={<Sentiment />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
