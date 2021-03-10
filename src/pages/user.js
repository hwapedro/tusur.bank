import React, { useState } from "react";
import { Typography, Box, Grid } from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";

import { ContextState } from "../pages/_app";
import { Title } from "../common/title";
import { instance } from "../utils/api/api";

export const User = () => {
  const { state } = React.useContext(ContextState);
  const classes = useStyles();
  const [credits, setCredits] = useState(null);

  React.useEffect(() => {
    if (!credits) {
      instance
        .get(`getCredits?username=${state.user.username}`)
        .then(({ data }) => {
          setCredits(data.credits);
        });
    }
  }, [credits]);

  return (
    <>
      <Title title="Профиль" />
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Box className={classes.tabContainer}>
            <Typography className={classes.tabTitle}>
              Пользовательское имя
            </Typography>
          </Box>
          <Box className={classes.tabContainer}>
            <Typography className={classes.tabText}>
              {state.user.username}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box className={classes.tabContainer}>
            <Typography className={classes.tabTitle}>Имя, Фамилия</Typography>
          </Box>
          <Box className={classes.tabContainer}>
            <Typography className={classes.tabText}>
              {state.user.name}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      {!!credits && credits.map((el) => <div>{el.MONTH_AMOUNT}</div>)}
    </>
  );
};

const useStyles = makeStyles({
  tabContainer: {
    textAlign: "left",
  },
  tabText: {
    fontSize: 23,
    fontWeight: 500,
    marginBottom: 12,
  },
});
