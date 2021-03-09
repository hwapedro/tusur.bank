import React from "react";
import { Typography, Box } from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";

import { ContextState } from "../pages/_app";

export const Title = ({ title }) => {
  const classes = useStyles();
  const { state } = React.useContext(ContextState);

  return (
    <Box className={classes.titleBox}>
      <Typography variant="h3" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="h5"
        component="h5"
        gutterBottom
        className={classes.userName}
      >
        {state.user.name}
      </Typography>
    </Box>
  );
};

const useStyles = makeStyles({
  titleBox: {
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    marginTop: "50px",
    marginBottom: "50px",
  },
});
