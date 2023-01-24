import styled from "styled-components";

const LOADER_HEIGHT = 10;

export const Loader = styled.div`
  width: 40px;
  height: ${LOADER_HEIGHT}px;
  position: absolute;

  top: calc(50% - ${LOADER_HEIGHT}px / 2);

  animation-name: yo;
  animation-duration: 1s;
  animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;

  @keyframes yo {
    from {
      left: 20px;
    }

    to {
      left: calc(100% - 40px - 20px);
    }
  }

  background: white;
`;
