import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  Box,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

import { instance } from "../utils/api/api";
import { Title } from "../common/title";
import { Logo } from "../common/logo";

export const Banks = () => {
  const classes = useStyles();
  const history = useHistory();
  const [banks, setBanks] = React.useState(null);
  console.log('@@@@@@')
  React.useEffect(() => {
    if (!banks) {
      instance.get("banks").then(({ data }) => setBanks(data.banks));
    }
  }, [banks]);

  if (!banks) {
    return <h2>loading</h2>;
  }

  return (
    <>
      <Title title="Выберете банк" />

      {banks.map((el) => (
        <Card
          key={el.id}
          className={classes.root}
          onClick={() => history.push(`/calc/${el.id}`)}
        >
          <CardContent className={classes.content}>
            <Logo id={el.id} />
            <Box className={classes.bankInfoBox}>
              <Typography
                className={classes.bankName}
                variant="h4"
                component="h4"
                gutterBottom
              >
                {el.name}
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                ставка от<b> {el.rate}</b> %
              </Typography>
              <Typography variant="body2" component="p">
                {el.text}
              </Typography>
            </Box>
          </CardContent>
          <CardActions className={classes.buttonsContainer}>
            <Button size="small">Подробнее</Button>
          </CardActions>
        </Card>
      ))}
    </>
  );
};

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    transition: ".5s",
    cursor: "pointer",
    marginBottom: "30px",
    "&:hover": {
      transform: "scale(1.01)",
    },
  },
  content: {
    display: "flex",
  },
  bankInfoBox: {
    width: "60%",
    margin: "0 auto",
  },
  userName: {
    cursor: "pointer",
    transition: ".5s",
    "&:hover": {
      transform: "scale(1.01)",
    },
  },
  titleBox: {
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    marginTop: "50px",
    marginBottom: "50px",
  },
  media: {
    height: "100px",
    width: "40%",
    backgroundSize: "300px 100px",
    // paddingTop: "56.25%", // 16:9
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  bankName: {
    fontSize: 25,
  },
  buttonsContainer: { display: "block", textAlign: "right" },
  pos: {
    marginBottom: 12,
  },
});
