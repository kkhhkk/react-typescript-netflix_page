import { animate, AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getTvOnAir, IGetTVResult } from "../api";
import { makeImagePath } from "../utlis";

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

function Tv() {
  const offset = 6;
  const navigate = useNavigate();
  const useBoxMatch = useMatch("/tv/:tvId");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { data: onAir, isLoading } = useQuery<IGetTVResult>(
    ["Tv", "onAir"],
    getTvOnAir
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

  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
    setDirection(false);
  };

  const boxClick = (TvId: number) => {
    navigate(`/tv/${TvId}`);
  };

  const overlayClick = () => {
    navigate("/tv");
  };
  return (
    <Wrapper>
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
                      variants={boxVariants}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      key={Tv.id}
                      onClick={() => boxClick(Tv.id)}
                      $bgPhoto={makeImagePath(Tv.poster_path)}
                    >
                      <Info>{Tv.name}</Info>
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
            {useBoxMatch ? (
              <>
                <Overlay
                  onClick={overlayClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                ></Overlay>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
