const API_KEY: string = "62620eba53fbae0d384ff615a59438b0";
const BASE_PATH: string = "https://api.themoviedb.org/3";

interface IMovie {
  id: number;
  backdrop_path: string;
  title: string;
  overview: string;
  poster_path: string;
}

interface IMovieTopRate {
  backdrop_path: string;
  id: number;
  overview: string;
  poster_path: string;
  title: string;
  vote_average: number;
}
export interface IGetMovieTopRate {
  results: IMovieTopRate[];
}

export interface IGetMovieResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  results: IMovie[];
}

export async function getMovies() {
  const response = await fetch(
    `${BASE_PATH}/movie/now_playing?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}

export async function getMoviesTopRates() {
  const response = await fetch(
    `${BASE_PATH}movie/top_rated?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}
