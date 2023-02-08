import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useMatch, PathMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getMovies,
  getMoviesPopular,
  getMoviesTopRates,
  IGetMovieResult,
} from "../api";
import { makeImagePath, ratingToPercent } from "../utlis";

const Wrapper = styled.div`
  overflow-x: hidden;
`;

const Loader = styled.div`
  height: 20vh;
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ $bgPhoto: string }>`
  display: flex;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.$bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 50px;
  margin-bottom: 20px;
`;

const OverView = styled.p`
  font-size: 20px;
  width: 50%;
`;

const Category = styled.div`
  position: relative;
  top: -110px;
  font-size: 25px;
  left: 60px;
  font-weight: 600;
`;

const Slider = styled.div`
  position: relative;
  top: -450px;
  margin: 0px 40px 0px 40px;
  display: flex;
  justify-content: space-between;
  margin-top: 350px;
`;

const LastSlider = styled.div`
  position: relative;
  top: -450px;
  margin: 0px 40px -63px 40px;
  display: flex;
  justify-content: space-between;
  margin-top: 350px;
`;

const ArrowButton = styled(motion.button)`
  position: relative;
  top: 120px;
  display: flex;
  justify-content: center;
  width: 30px;
  background-color: transparent;
  color: ${(props) => props.theme.white.lighter};
  font-size: 50px;
  margin: 0 -20px;
  border: 0;
  cursor: pointer;
`;

const Row = styled(motion.div)`
  display: grid;
  /* grid-template-columns: 35px 220px 220px 220px 220px 220px 220px 50px; */
  grid-template-columns: repeat(6, 1fr);
  width: 100%;
  position: absolute;
`;

const Box = styled(motion.div)<{ $bgPhoto: string }>`
  background-color: transparent;
  background-image: url(${(props) => props.$bgPhoto});
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
  height: 280px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  position: absolute;
  width: 85%;
  background-color: ${(props) => props.theme.black.darker};
  right: 16px;
  bottom: 0;
  opacity: 0;
  padding: 10px;
  text-align: center;
  font-size: 13px;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${(props) => props.theme.black.lighter};
  z-index: 2;
`;

const BigMovieImage = styled.div`
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center center;
`;

const BigMoviePoster = styled.div`
  position: relative;
  background-size: cover;
  background-position: center center;
  top: -100px;
  left: 40px;
  width: 30%;
  height: 280px;
`;

const BigMovieTitle = styled.div`
  color: ${(props) => props.theme.white.lighter};
  font-size: 22px;
  width: 60%;
  position: relative;
  top: -370px;
  left: 220px;
  padding: 20px;
`;

const BigMovieOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  display: -webkit-inline-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 8;
  overflow: hidden;
  position: relative;
  top: -360px;
  left: 220px;
  width: 60%;
  font-size: 15px;
  padding: 20px;
`;

const Ratings = styled.div`
  position: absolute;
  top: 85%;
  left: 7%;
  font-size: 20px;
`;

const Rate = styled.span`
  font-weight: 500;
`;

const StarRateWrap = styled.div`
  position: relative;
  color: white;
  position: relative;
  unicode-bidi: bidi-override;
  width: max-content;
  font-size: 30px;
  -webkit-text-fill-color: white; /* Will override color (regardless of order) */
  -webkit-text-stroke-width: 1.5px;
  -webkit-text-stroke-color: #2b2a29;
  top: -30px;
  left: 50px;
`;

const YellowStar = styled.div`
  padding: 0;
  position: absolute;
  z-index: 1;
  display: flex;
  top: 0;
  left: 0;
  overflow: hidden;
  -webkit-text-fill-color: gold;
`;

const GrayStar = styled.div`
  position: relative;
  z-index: 0;
  padding: 0;
`;

const RatingNumber = styled.span`
  position: relative;
  top: -60px;
  left: 190px;
`;

const rowVariants = {
  hidden: (direction: boolean) => ({
    x: direction ? window.outerWidth : -window.outerWidth,
    opacity: 0.5,
    scale: 0.8,
  }),
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: boolean) => ({
    x: direction ? -window.outerWidth : window.outerWidth,
    opacity: 0,
    scale: 0.8,
  }),
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.4,
    y: -50,
    transition: { delay: 0.5, type: "tween", duration: 0.3 },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: { delay: 0.5, type: "tween", duration: 0.3 },
  },
};

function Home() {
  const offset = 6;
  const navigate = useNavigate();
  const bigMovieMatch: PathMatch<string> | null = useMatch("/movies/:movieId");
  const topBigMovieMatch: PathMatch<string> | null = useMatch(
    "/movies/top_rate/:movieId"
  );
  const popularBigMovieMatch: PathMatch<string> | null = useMatch(
    "/movies/popular/:movieId"
  );
  const { data: nowPlaying, isLoading } = useQuery<IGetMovieResult>(
    ["movie", "nowPlaying"],
    getMovies
  );
  const { data: topRate } = useQuery<IGetMovieResult>(
    ["movie", "topRate"],
    getMoviesTopRates,
    {
      enabled: !!nowPlaying,
    }
  );
  const { data: popular } = useQuery<IGetMovieResult>(
    ["movie", "popular"],
    getMoviesPopular,
    { enabled: !!topRate }
  );
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState(false);
  const [index, setIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [popularIndex, setPopularIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [topDirection, setTopDirection] = useState(false);
  const [popularDirection, setPopularDirection] = useState(false);
  const increaseIndex = () => {
    if (nowPlaying) {
      if (leaving) return;
      setLeaving(true);
      setDirection(true);
      const moviesLength = nowPlaying?.results.length - 1;
      const maxIndex = Math.floor(moviesLength / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const topIncreaseIndex = () => {
    if (topRate) {
      if (leaving) return;
      setLeaving(true);
      setTopDirection(true);
      const topRateLength = topRate?.results.length - 1;
      const topRateMaxIndex = Math.floor(topRateLength / offset) - 1;
      setTopIndex((prev) => (prev === topRateMaxIndex ? 0 : prev + 1));
    }
  };

  const popularIncreaseIndex = () => {
    if (popular) {
      if (leaving) return;
      setLeaving(true);
      setPopularDirection(true);
      const popularLength = popular?.results.length - 1;
      const popularMaxIndex = Math.floor(popularLength / offset) - 1;
      setPopularIndex((prev) => (prev === popularMaxIndex ? 0 : prev + 1));
    }
  };

  const decreseIndex = () => {
    if (nowPlaying) {
      if (leaving) return;
      setLeaving(true);
      setDirection(false);
      const moviesLength = nowPlaying?.results.length - 1;
      const maxIndex = Math.floor(moviesLength / offset) - 1;
      if (index === 0) {
        setIndex(maxIndex);
      } else {
        setIndex(index - 1);
      }
    }
  };
  const topDecreaseIndex = () => {
    if (topRate) {
      if (leaving) return;
      setLeaving(true);
      setTopDirection(false);
      const topRateiLength = topRate?.results.length - 1;
      const topRateMaxIndex = Math.floor(topRateiLength / offset) - 1;
      if (topIndex === 0) {
        setTopIndex(topRateMaxIndex);
      } else {
        setTopIndex(topIndex - 1);
      }
    }
  };

  const popularDecreaseIndex = () => {
    if (popular) {
      if (leaving) return;
      setLeaving(true);
      setTopDirection(false);
      const populariLength = popular?.results.length - 1;
      const popularMaxIndex = Math.floor(populariLength / offset) - 1;
      if (popularIndex === 0) {
        setPopularIndex(popularMaxIndex);
      } else {
        setPopularIndex(popularIndex - 1);
      }
    }
  };

  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
    setDirection(false);
    setTopDirection(false);
    setPopularDirection(false);
  };

  const boxClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const topBoxClick = (movieId: number) => {
    navigate(`/movies/top_rate/${movieId}`);
  };

  const popularBoxclick = (movieId: number) => {
    navigate(`/movies/popular/${movieId}`);
  };

  const overlayClick = () => {
    navigate("/");
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    nowPlaying?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId
    );

  const topClickedMovie =
    topBigMovieMatch?.params.movieId &&
    topRate?.results.find(
      (movie) => String(movie.id) === topBigMovieMatch.params.movieId
    );
  const popularClickedMovie =
    popularBigMovieMatch?.params.movieId &&
    popular?.results.find(
      (movie) => String(movie.id) === popularBigMovieMatch.params.movieId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            $bgPhoto={makeImagePath(nowPlaying?.results[0].backdrop_path || "")}
          >
            <Title>{nowPlaying?.results[0].title}</Title>
            <OverView>{nowPlaying?.results[0].overview}</OverView>
          </Banner>
          <Category>현재 상영 중</Category>
          <Slider>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={direction}
            >
              <Row
                custom={direction}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {nowPlaying?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={movie.id}
                      onClick={() => boxClick(movie.id)}
                      $bgPhoto={makeImagePath(movie.poster_path, "w500")}
                    >
                      <Info variants={infoVariants}>{movie.title}</Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <ArrowButton type="button" onClick={decreseIndex}>
              〈
            </ArrowButton>
            <ArrowButton type="button" onClick={increaseIndex}>
              〉
            </ArrowButton>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={bigMovieMatch.params.movieId}
                  style={{ top: scrollY.get() + 80 }}
                >
                  {clickedMovie && (
                    <>
                      <BigMovieImage
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent), url(
                            ${makeImagePath(clickedMovie.backdrop_path, "w500")}
                          )`,
                        }}
                      ></BigMovieImage>
                      <BigMoviePoster
                        style={{
                          backgroundImage: `url(${makeImagePath(
                            clickedMovie.poster_path,
                            "w500"
                          )}
                          )`,
                        }}
                      ></BigMoviePoster>
                      <BigMovieTitle>
                        <div>{clickedMovie.title}</div>(
                        {clickedMovie.original_title})
                      </BigMovieTitle>
                      <BigMovieOverview>
                        {clickedMovie.overview
                          ? clickedMovie.overview
                          : "줄거리 없습니다. 직접 보면서 느끼세요!"}
                      </BigMovieOverview>
                      <Ratings>
                        <Rate>평점 : </Rate>
                        <StarRateWrap>
                          <YellowStar
                            style={{
                              width: `${ratingToPercent(
                                clickedMovie.vote_average
                              )}%`,
                            }}
                          >
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                          </YellowStar>
                          <GrayStar>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                          </GrayStar>
                        </StarRateWrap>
                        <RatingNumber>
                          {clickedMovie.vote_average / 2} / 5
                        </RatingNumber>
                      </Ratings>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
          <Category>평점 순</Category>
          <Slider>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={topDirection}
            >
              <Row
                custom={topDirection}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={topIndex}
              >
                {topRate?.results
                  .slice(offset * topIndex, offset * topIndex + offset)
                  .map((movie) => (
                    <Box
                      layoutId={"rate" + movie.id + ""}
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={movie.id}
                      onClick={() => topBoxClick(movie.id)}
                      $bgPhoto={makeImagePath(movie.poster_path, "w500")}
                    >
                      <Info variants={infoVariants}>{movie.title}</Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <ArrowButton type="button" onClick={topDecreaseIndex}>
              〈
            </ArrowButton>
            <ArrowButton type="button" onClick={topIncreaseIndex}>
              〉
            </ArrowButton>
          </Slider>
          <AnimatePresence>
            {topBigMovieMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={"rate" + topBigMovieMatch.params.movieId}
                  style={{ top: scrollY.get() + 80 }}
                >
                  {topClickedMovie && (
                    <>
                      <BigMovieImage
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent), url(
                            ${makeImagePath(
                              topClickedMovie.backdrop_path,
                              "w500"
                            )}
                          )`,
                        }}
                      ></BigMovieImage>
                      <BigMovieTitle>{topClickedMovie.title}</BigMovieTitle>
                      <BigMovieOverview>
                        {topClickedMovie.overview}
                      </BigMovieOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
          <Category>인기 순</Category>
          <LastSlider>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={popularDirection}
            >
              <Row
                custom={popularDirection}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={popularIndex}
              >
                {popular?.results
                  .slice(offset * popularIndex, offset * popularIndex + offset)
                  .map((movie) => (
                    <Box
                      layoutId={"popular" + movie.id + ""}
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={movie.id}
                      onClick={() => popularBoxclick(movie.id)}
                      $bgPhoto={makeImagePath(movie.poster_path, "w500")}
                    >
                      <Info variants={infoVariants}>{movie.title}</Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <ArrowButton type="button" onClick={popularDecreaseIndex}>
              〈
            </ArrowButton>
            <ArrowButton type="button" onClick={popularIncreaseIndex}>
              〉
            </ArrowButton>
          </LastSlider>
          <AnimatePresence>
            {popularBigMovieMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={"popular" + popularBigMovieMatch.params.movieId}
                  style={{ top: scrollY.get() + 80 }}
                >
                  {popularClickedMovie && (
                    <>
                      <BigMovieImage
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent), url(
                            ${makeImagePath(
                              popularClickedMovie.backdrop_path,
                              "w500"
                            )}
                          )`,
                        }}
                      ></BigMovieImage>
                      <BigMovieTitle>{popularClickedMovie.title}</BigMovieTitle>
                      <BigMovieOverview>
                        {popularClickedMovie.overview}
                      </BigMovieOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}
export default Home;
