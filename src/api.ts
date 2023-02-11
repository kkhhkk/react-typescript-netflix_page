const API_KEY: string = "62620eba53fbae0d384ff615a59438b0";
const BASE_PATH: string = "https://api.themoviedb.org/3";

interface IMovie {
  id: number;
  backdrop_path: string;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  original_title: string;
}

export interface IGetMovieResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  results: IMovie[];
}

interface ITv {
  backdrop_path: string;
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  vote_average: number;
}

export interface IGetTVResult {
  results: ITv[];
  total_pages: number;
  total_results: number;
}

export async function getMovies() {
  const response = await fetch(
    `${BASE_PATH}/movie/now_playing?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}

export async function getMoviesTopRates() {
  const response = await fetch(
    `${BASE_PATH}/movie/top_rated?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}

export async function getMoviesPopular() {
  const response = await fetch(
    `${BASE_PATH}/movie/popular?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}

export async function getTvOnAir() {
  const response = await fetch(
    `${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}

export async function getTvTopRates() {
  const response = await fetch(
    `${BASE_PATH}/tv/top_rated?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}

export async function getTvPopular() {
  const response = await fetch(
    `${BASE_PATH}/tv/popular?api_key=${API_KEY}&language=ko-KR`
  );
  return await response.json();
}
