import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "react-query";
import { useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getTvOnAir, getTvPopular, getTvTopRates, IGetTVResult } from "../api";
import { makeImagePath, ratingToPercent } from "../utlis";

const Wrapper = styled.div`
  overflow-x: hidden;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 30px;
`;

const Banner = styled.div<{ $bgPhoto: string }>`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.$bgPhoto});
  background-size: cover;
  justify-content: center;
  padding: 60px;
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

const Row = styled(motion.div)`
  display: grid;
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
    transform-origin: left center;
  }
  &:last-child {
    transform-origin: right center;
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

const ArrowButton = styled.button`
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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigTv = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${(props) => props.theme.black.lighter};
  z-index: 2;
`;

const BigTvImage = styled.div`
  background-size: cover;
  background-position: center center;
  height: 300px;
`;

const BigTVPoster = styled.div`
  position: relative;
  background-size: cover;
  background-position: center center;
  top: -100px;
  left: 40px;
  width: 30%;
  height: 280px;
`;

const BigTVTitle = styled.div`
  color: ${(props) => props.theme.white.lighter};
  font-size: 22px;
  width: 60%;
  position: relative;
  top: -370px;
  left: 220px;
  padding: 20px;
`;

const BigTVOverview = styled.p`
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
  width: max-content;
  font-size: 30px;
  -webkit-text-fill-color: white; /* Will override color (regardless of order) */
  -webkit-text-stroke-width: 1.5px;
  -webkit-text-stroke-color: #2b2a29;
  top: -30px;
  left: 50px;
`;

const YellowStar = styled.div`
  position: absolute;
  padding: 0;
  z-index: 1;
  top: 0;
  left: 0;
  overflow: hidden;
  -webkit-text-fill-color: gold;
`;

const GrayStar = styled.div`
  position: relative;
`;

const RatingNumber = styled.span`
  position: relative;
  top: -60px;
  left: 190px;
`;

const rowVariants = {
  start: (direction: Boolean) => ({
    x: direction ? window.outerWidth : -window.outerWidth,
    opacity: 0.5,
    scale: 0.8,
  }),
  end: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: Boolean) => ({
    x: direction ? -window.outerWidth : window.outerWidth,
    opacity: 0.5,
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

function Tv() {
  const offset = 6;
  const navigate = useNavigate();
  const BigTvMatch = useMatch("/tv/:tvId");
  const BigTopRateTvMatch = useMatch("/tv/top_rates/:tvId");
  const BigPopularTvMatch = useMatch("/tv/popular/:tvId");
  const [index, setIndex] = useState(0);
  const [topRateIndex, setTopRateIndex] = useState(0);
  const [popularIndex, setPopularIndex] = useState(0);
  const [direction, setDirection] = useState(false);
  const [topRateDirection, setTopRateDirection] = useState(false);
  const [popularDirection, setPopularDirection] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { scrollY } = useScroll();
  const { data: onAir, isLoading } = useQuery<IGetTVResult>(
    ["Tv", "onAir"],
    getTvOnAir
  );
  const { data: topRate } = useQuery<IGetTVResult>(
    ["Tv", "topRate"],
    getTvTopRates,
    { enabled: !!onAir }
  );
  const { data: popular } = useQuery<IGetTVResult>(
    ["Tv", "popukar"],
    getTvPopular,
    { enabled: !!topRate }
  );

  const increaseIndex = () => {
    if (onAir) {
      if (leaving) return;
      setLeaving(true);
      setDirection(true);
      const onAirLength = onAir.results.length;
      const MaxIndex = Math.floor(onAirLength / offset) - 1;
      setIndex((prev) => (prev === MaxIndex ? 0 : prev + 1));
    }
  };

  const topRateIncreaseIndex = () => {
    if (topRate) {
      if (leaving) return;
      setLeaving(true);
      setTopRateDirection(true);
      const topRateLength = topRate.results.length;
      const MaxIndex = Math.floor(topRateLength / offset) - 1;
      setTopRateIndex((prev) => (prev === MaxIndex ? 0 : prev + 1));
    }
  };

  const popularIncreaseIndex = () => {
    if (popular) {
      if (leaving) return;
      setLeaving(true);
      setPopularDirection(true);
      const popularLength = popular.results.length;
      const MaxIndex = Math.floor(popularLength / offset) - 1;
      setPopularIndex((prev) => (prev === MaxIndex ? 0 : prev + 1));
    }
  };
  const decreseIndex = () => {
    if (onAir) {
      if (leaving) return;
      setLeaving(true);
      setDirection(false);
      const onAirLength = onAir.results.length;
      const maxIndex = Math.floor(onAirLength / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const topRateDecreseIndex = () => {
    if (topRate) {
      if (leaving) return;
      setLeaving(true);
      setTopRateDirection(false);
      const topRateLength = topRate.results.length;
      const maxIndex = Math.floor(topRateLength / offset) - 1;
      setTopRateIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const popularDecreseIndex = () => {
    if (popular) {
      if (leaving) return;
      setLeaving(true);
      setPopularDirection(false);
      const pouplarLength = popular.results.length;
      const maxIndex = Math.floor(pouplarLength / offset) - 1;
      setPopularIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
    setDirection(false);
    setTopRateDirection(false);
    setPopularDirection(false);
  };

  const boxClick = (TvId: number) => {
    navigate(`/tv/${TvId}`);
  };

  const topRateBoxClick = (TvId: number) => {
    navigate(`/tv/top_rates/${TvId}`);
  };

  const popularBoxClick = (TvId: number) => {
    navigate(`/tv/popular/${TvId}`);
  };

  const overlayClick = () => {
    navigate("/tv");
  };

  const clickedTV =
    BigTvMatch?.params.tvId &&
    onAir?.results.find((tv) => String(tv.id) === BigTvMatch.params.tvId);

  const clickedTopRateTV =
    BigTopRateTvMatch?.params.tvId &&
    topRate?.results.find(
      (tv) => String(tv.id) === BigTopRateTvMatch.params.tvId
    );

  const clickedPopularTV =
    BigPopularTvMatch?.params.tvId &&
    popular?.results.find(
      (tv) => String(tv.id) === BigPopularTvMatch.params.tvId
    );

  return (
    <Wrapper>
      <Helmet>
        <title>넷플릭스 - TV Show</title>
      </Helmet>
      {isLoading ? (
        <Loading>Loading....</Loading>
      ) : (
        <>
          <Banner
            $bgPhoto={makeImagePath(onAir?.results[0].backdrop_path || "")}
          >
            <Title>{onAir?.results[0].name}</Title>
            <OverView>{onAir?.results[0].overview}</OverView>
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
                initial="start"
                animate="end"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {onAir?.results
                  .slice(1)
                  .slice(index * offset, offset * index + offset)
                  .map((Tv) => (
                    <Box
                      layoutId={Tv.id + ""}
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={Tv.id}
                      onClick={() => boxClick(Tv.id)}
                      $bgPhoto={makeImagePath(Tv.poster_path, "w500")}
                    >
                      <Info variants={infoVariants}>{Tv.name}</Info>
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
            {BigTvMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigTv
                  layoutId={BigTvMatch.params.tvId}
                  style={{ top: scrollY.get() + 80 }}
                >
                  {clickedTV && (
                    <>
                      <BigTvImage
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent), url(${makeImagePath(
                            clickedTV.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigTvImage>
                      <BigTVPoster
                        style={{
                          backgroundImage: `url(${makeImagePath(
                            clickedTV.poster_path,
                            "w500"
                          )}
                          )`,
                        }}
                      ></BigTVPoster>
                      <BigTVTitle>
                        <div>{clickedTV.name}</div>({clickedTV.original_name})
                      </BigTVTitle>
                      <BigTVOverview>
                        {clickedTV.overview
                          ? clickedTV.overview
                          : "줄거리 없습니다. 직접 보면서 느끼세요!"}
                      </BigTVOverview>
                      <Ratings>
                        <Rate>평점 : </Rate>
                        <StarRateWrap>
                          <YellowStar
                            style={{
                              width: `${ratingToPercent(
                                clickedTV.vote_average
                              )}%`,
                            }}
                          >
                            <span>★★★★★</span>
                          </YellowStar>
                          <GrayStar>
                            <span>★★★★★</span>
                          </GrayStar>
                        </StarRateWrap>
                        <RatingNumber>
                          {clickedTV.vote_average / 2} / 5
                        </RatingNumber>
                      </Ratings>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
          <Category>평점 순</Category>
          <Slider>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={topRateDirection}
            >
              <Row
                custom={topRateDirection}
                variants={rowVariants}
                initial="start"
                animate="end"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={topRateIndex}
              >
                {topRate?.results
                  .slice(1)
                  .slice(topRateIndex * offset, offset * topRateIndex + offset)
                  .map((Tv) => (
                    <Box
                      layoutId={"topRate" + Tv.id + ""}
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={Tv.id}
                      onClick={() => topRateBoxClick(Tv.id)}
                      $bgPhoto={makeImagePath(Tv.poster_path, "w500")}
                    >
                      <Info variants={infoVariants}>{Tv.name}</Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <ArrowButton type="button" onClick={topRateDecreseIndex}>
              〈
            </ArrowButton>
            <ArrowButton type="button" onClick={topRateIncreaseIndex}>
              〉
            </ArrowButton>
          </Slider>
          <AnimatePresence>
            {BigTopRateTvMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigTv
                  layoutId={"topRate" + BigTopRateTvMatch.params.tvId}
                  style={{ top: scrollY.get() + 80 }}
                >
                  {clickedTopRateTV && (
                    <>
                      <BigTvImage
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent), url(${makeImagePath(
                            clickedTopRateTV.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigTvImage>
                      <BigTVPoster
                        style={{
                          backgroundImage: `url(${makeImagePath(
                            clickedTopRateTV.poster_path,
                            "w500"
                          )}
                          )`,
                        }}
                      ></BigTVPoster>
                      <BigTVTitle>
                        <div>{clickedTopRateTV.name}</div>(
                        {clickedTopRateTV.original_name})
                      </BigTVTitle>
                      <BigTVOverview>
                        {clickedTopRateTV.overview
                          ? clickedTopRateTV.overview
                          : "줄거리 없습니다. 직접 보면서 느끼세요!"}
                      </BigTVOverview>
                      <Ratings>
                        <Rate>평점 : </Rate>
                        <StarRateWrap>
                          <YellowStar
                            style={{
                              width: `${ratingToPercent(
                                clickedTopRateTV.vote_average
                              )}%`,
                            }}
                          >
                            <span>★★★★★</span>
                          </YellowStar>
                          <GrayStar>
                            <span>★★★★★</span>
                          </GrayStar>
                        </StarRateWrap>
                        <RatingNumber>
                          {clickedTopRateTV.vote_average / 2} / 5
                        </RatingNumber>
                      </Ratings>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
          <Category>인기 순</Category>
          <Slider>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={popularDirection}
            >
              <Row
                custom={popularDirection}
                variants={rowVariants}
                initial="start"
                animate="end"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={popularIndex}
              >
                {popular?.results
                  .slice(1)
                  .slice(popularIndex * offset, offset * popularIndex + offset)
                  .map((Tv) => (
                    <Box
                      layoutId={"popular" + Tv.id + ""}
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={Tv.id}
                      onClick={() => popularBoxClick(Tv.id)}
                      $bgPhoto={makeImagePath(Tv.poster_path, "w500")}
                    >
                      <Info variants={infoVariants}>{Tv.name}</Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <ArrowButton type="button" onClick={popularDecreseIndex}>
              〈
            </ArrowButton>
            <ArrowButton type="button" onClick={popularIncreaseIndex}>
              〉
            </ArrowButton>
          </Slider>
          <AnimatePresence>
            {BigPopularTvMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigTv
                  layoutId={"popular" + BigPopularTvMatch.params.tvId}
                  style={{ top: scrollY.get() + 80 }}
                >
                  {clickedPopularTV && (
                    <>
                      <BigTvImage
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent), url(${makeImagePath(
                            clickedPopularTV.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigTvImage>
                      <BigTVPoster
                        style={{
                          backgroundImage: `url(${makeImagePath(
                            clickedPopularTV.poster_path,
                            "w500"
                          )}
                          )`,
                        }}
                      ></BigTVPoster>
                      <BigTVTitle>
                        <div>{clickedPopularTV.name}</div>(
                        {clickedPopularTV.original_name})
                      </BigTVTitle>
                      <BigTVOverview>
                        {clickedPopularTV.overview
                          ? clickedPopularTV.overview
                          : "줄거리 없습니다. 직접 보면서 느끼세요!"}
                      </BigTVOverview>
                      <Ratings>
                        <Rate>평점 : </Rate>
                        <StarRateWrap>
                          <YellowStar
                            style={{
                              width: `${ratingToPercent(
                                clickedPopularTV.vote_average
                              )}%`,
                            }}
                          >
                            <span>★★★★★</span>
                          </YellowStar>
                          <GrayStar>
                            <span>★★★★★</span>
                          </GrayStar>
                        </StarRateWrap>
                        <RatingNumber>
                          {clickedPopularTV.vote_average / 2} / 5
                        </RatingNumber>
                      </Ratings>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
