import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";

function App() {
  return (
    <Router>
      <Header></Header>
      <Routes>
        <Route path="/tv" element={<Tv />}></Route>
        <Route path="/tv/:tvId" element={<Tv />}></Route>
        <Route path="/tv/top_rates/:tvId" element={<Tv />}></Route>
        <Route path="/tv/popular/:tvId" element={<Tv />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path="/" element={<Home />}></Route>
        <Route path="/movies/:movieId" element={<Home />}></Route>
        <Route path="/movies/top_rate/:movieId" element={<Home />}></Route>
        <Route path="/movies/popular/:movieId" element={<Home />}></Route>
      </Routes>
    </Router>
  );
}
export default App;
