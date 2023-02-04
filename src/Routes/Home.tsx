import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useMatch, PathMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getMovies, IGetMovieResult } from "../api";
import { makeImagePath } from "../utlis";

const Wrapper = styled.div`
  overflow-x: hidden;
  padding-bottom: 250px;
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

const Slider = styled.div`
  position: relative;
  top: -100px;
  margin: 0px 40px 00px 40px;
  display: flex;
  justify-content: space-between;
`;

const ArrowButton = styled(motion.div)`
  position: relative;
  top: 130px;
  display: flex;
  justify-content: center;
  width: 30px;
  background-color: transparent;
  color: ${(props) => props.theme.white.lighter};
  font-size: 40px;
  margin: 0 -20px;
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
`;

const BigMovieImage = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center center;
`;

const BigMovieTitle = styled.div`
  color: ${(props) => props.theme.white.lighter};
  font-size: 25px;
  position: relative;
  top: -50px;
  padding: 20px;
`;

const BigMovieOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  top: -70px;
  font-size: 15px;
  padding: 20px;
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
  const { data, isLoading } = useQuery<IGetMovieResult>(
    ["movie", "nowPlaying"],
    getMovies
  );
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState(false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      setLeaving(true);
      setDirection(true);

      const moviesLength = data?.results.length - 1;
      const maxIndex = Math.floor(moviesLength / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreseIndex = () => {
    if (data) {
      if (leaving) return;
      setLeaving(true);
      setDirection(false);
      const moviesLength = data?.results.length - 1;
      const maxIndex = Math.floor(moviesLength / offset) - 1;
      if (index === 0) {
        setIndex(maxIndex);
      } else {
        setIndex(index - 1);
      }
    }
  };
  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
    setDirection(false);
  };
  const boxClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };
  const overlayClick = () => {
    navigate("/");
  };
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            $bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <OverView>{data?.results[0].overview}</OverView>
          </Banner>
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
                {data?.results
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
            <ArrowButton onClick={decreseIndex}>〈</ArrowButton>
            <ArrowButton onClick={increaseIndex}>〉</ArrowButton>
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
                      <BigMovieTitle>{clickedMovie.title}</BigMovieTitle>
                      <BigMovieOverview>
                        {clickedMovie.overview}
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
