import React from "react";
import { createUseStyles } from "react-jss";
import StreamLeftSide from "./LeftSide";
import StreamRightSide from "./RightSide";

const useStyle = createUseStyles({
  container: {
    display: "flex",
    gap: 16,
  },
  leftSide: {
    width: "30%",
  },
  rightSide: {
    width: "70%",
  },
});

const Stream = () => {
  const classes = useStyle();
  return (
    <div className={classes.container}>
      <div className={classes.leftSide}>
        <StreamLeftSide />
      </div>
      <div className={classes.rightSide}>
        <StreamRightSide />
      </div>
    </div>
  );
};

export default Stream;
