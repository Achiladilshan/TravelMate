import Home from './pages/Home';
import MapsPage from './pages/Maps';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
      <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/maps" element={<MapsPage/>} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
