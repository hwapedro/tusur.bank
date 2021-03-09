import React from "react";
import { CardMedia } from "@material-ui/core/";

import { makeStyles } from "@material-ui/core/styles";

import sberIcon from "../assets/img/icons/sber.svg";
import vtbIcon from "../assets/img/icons/vtb.svg";

const data = {
  sberbank: {
    img: sberIcon,
  },
  vtb: {
    img: vtbIcon,
  },
};

export const Logo = ({ id }) => {
  const classes = useStyles();

  return (
    <>
      <CardMedia className={classes.media} image={data[id].img} title="bank" />
    </>
  );
};

const useStyles = makeStyles({
  media: {
    height: "100px",
    width: "40%",
    backgroundSize: "300px 100px",
  },
});
