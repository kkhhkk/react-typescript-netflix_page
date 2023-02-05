import { useLocation } from "react-router-dom";

function Search() {
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search).get("keyword");

  return null;
}

export default Search;
