import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { IGetMovieResult, IGetTVResult } from "../api";
import { makeImagePath } from "../utlis";

const Wrapper = styled.div`
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
`;

const SearchResult = styled.div`
  font-size: 30px;
  height: 90vh;
  color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-weight: 500;
`;

const SearchSpan = styled.span`
  font-size: 20px;
  margin-top: 30px;
  font-weight: 400;
`;

const Catergory = styled.div`
  position: relative;
  top: 70px;
  left: 200px;
  font-size: 30px;
  margin-bottom: -50px;
  font-weight: 500;
`;
const SearchUl = styled.ul`
  position: relative;
  display: flex;
  flex-direction: column;
  top: 100px;
  left: 200px;
  width: 70%;
`;

const List = styled.li`
  background-color: rgba(255, 255, 255, 0.15);
  height: 300px;
  margin-top: 40px;
  display: flex;
  align-items: center;
  padding: 20px 10px;
  border-radius: 20px;
  &:last-child {
    margin-bottom: 150px;
  }
`;

const ListImage = styled.div<{ $bgPhoto: string }>`
  width: 250px;
  height: 250px;
  padding: 120px;
  background-image: url(${(props) => props.$bgPhoto});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
`;

const ListRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: space-between;
`;

const ListTitle = styled.div`
  font-size: 25px;

  font-weight: 500;
  margin-bottom: 40px;
`;

const ListOverView = styled.p`
  font-size: 15px;
  width: 600px;
  height: 70%;
  display: -webkit-inline-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 8;
  overflow: hidden;
`;

function Search() {
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search).get("keyword");
  const SearchMovies = async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=62620eba53fbae0d384ff615a59438b0&language=ko-KR&query=${searchParam}`
    );
    return await response.json();
  };
  const SearchTv = async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=62620eba53fbae0d384ff615a59438b0&language=ko-KR&page=1&query=${searchParam}`
    );
    return await response.json();
  };
  const { data: movies } = useQuery<IGetMovieResult>(
    ["search", "movies"],
    SearchMovies
  );
  const { data: tv } = useQuery<IGetTVResult>(["search", "Tv"], SearchTv, {
    enabled: !!SearchMovies,
  });
  return (
    <Wrapper>
      {searchParam === null ||
      Number(movies?.results.length) + Number(tv?.results.length) === 0 ? (
        <SearchResult>
          검색결과가 없습니다.
          <SearchSpan>다른 검색어를 입력하세요.</SearchSpan>
        </SearchResult>
      ) : (
        <>
          {" "}
          {movies?.results.length === 0 ? null : (
            <>
              <Catergory>영화</Catergory>
              <SearchUl>
                {movies?.results.map((movie) => (
                  <List>
                    <ListImage
                      $bgPhoto={makeImagePath(movie.poster_path, "w500")}
                    />
                    <ListRight>
                      <ListTitle>
                        {movie.title}{" "}
                        <div>
                          {movie.title === movie.original_title
                            ? ""
                            : "(" + movie.original_title + ")"}
                        </div>
                      </ListTitle>
                      <ListOverView>{movie.overview}</ListOverView>
                    </ListRight>
                  </List>
                ))}
              </SearchUl>
            </>
          )}
          {tv?.results.length === 0 ? null : (
            <>
              <Catergory>드라마</Catergory>
              <SearchUl>
                {tv?.results.map((tv) => (
                  <List>
                    <ListImage
                      $bgPhoto={makeImagePath(tv.poster_path, "w500")}
                    />
                    <ListRight>
                      <ListTitle>
                        {tv.name} <div>({tv.original_name})</div>
                      </ListTitle>
                      <ListOverView>{tv.overview}</ListOverView>
                    </ListRight>
                  </List>
                ))}
              </SearchUl>
            </>
          )}
        </>
      )}
    </Wrapper>
  );
}

export default Search;
