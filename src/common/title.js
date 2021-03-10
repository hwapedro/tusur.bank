import React from "react";
import { useHistory } from "react-router-dom";
import { Typography, Box } from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";

import { ContextState } from "../pages/_app";

export const Title = ({ title }) => {
  const classes = useStyles();
  const history = useHistory();
  const { state, setState } = React.useContext(ContextState);

  return (
    <Box className={classes.titleBox}>
      <Typography variant="h3" component="h2" gutterBottom>
        {title}
      </Typography>
      {history.location.pathname === "/user" ? (
        <Typography
          className={classes.userName}
          variant="h5"
          component="h5"
          gutterBottom
          onClick={() => {
            setState({});
            localStorage.clear();
            history.push("/");
          }}
        >
          Выйти
        </Typography>
      ) : (
        <Typography
          className={classes.userName}
          variant="h5"
          component="h5"
          gutterBottom
          onClick={() => history.push("/user")}
        >
          {state.user.name}
        </Typography>
      )}
    </Box>
  );
};

const useStyles = makeStyles({
  userName: {
    cursor: "pointer",
  },
  titleBox: {
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    marginTop: "50px",
    marginBottom: "50px",
  },
});
