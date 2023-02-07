import styled from "styled-components";

const StarRateWrap = styled.svg`
  width: 100%;
  margin: 100px 0 0 15px;
  .star_icon {
    display: inline-flex;
    margin-right: 5px;
  }
`;

function Tv() {
  return (
    <div style={{ backgroundColor: "whitesmoke", height: "200vh" }}>
      <h1>TV</h1>
      <StarRateWrap>
        <span className="star_icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="39"
            viewBox="0 0 14 13"
          >
            <path
              id="star"
              d="M9,2l2.163,4.279L16,6.969,12.5,10.3l.826,4.7L9,12.779,4.674,15,5.5,10.3,2,6.969l4.837-.69Z"
              transform="translate(-2 -2)"
              fill="yellow"
            />
          </svg>
        </span>
      </StarRateWrap>
    </div>
  );
}

export default Tv;
