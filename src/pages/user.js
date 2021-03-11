import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  Typography,
  Box,
  Modal,
  TextField,
  Grid,
  Paper,
  CardActions,
  Button,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";

import { ContextState } from "../pages/_app";
import { Title } from "../common/title";
import { instance } from "../utils/api/api";

const CREDIT_SCHEMA = Yup.object().shape({
  amount: Yup.string().required("Поле обязательное"),
});

export const User = () => {
  const { state } = React.useContext(ContextState);
  const classes = useStyles();
  const [credits, setCredits] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [modalOpen, setModalOpen] = useState(null);
  const [modalStyle] = React.useState(getModalStyle);
  //   CREDIT_DATE: "1615466011971"
  // CREDIT_ID: 4
  // FULL_AMOUNT: 3109200
  // INDEX_HISTORY: "0"
  // ISOPEN: 0
  // MONTHS_: 120
  // MONTH_AMOUNT: 25910
  // USERAMOUNT: 0

  //   NEWAMOUNT: 31504
  // NEWMONTHSAMOUNT: 2625
  const formik = useFormik({
    initialValues: {
      amount: 0,
    },
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: CREDIT_SCHEMA,
    onSubmit: (values) => {
      const credit = credits.find(
        (el) => +el.INDEX_HISTORY === modalOpen.index
      );
      if (values.amount > credit.FULL_AMOUNT) {
        formik.setErrors({
          amount: `Максимальная сумма погашения ${credit.FULL_AMOUNT}`,
        });
        return;
      }
      if (values.amount < credit.MONTH_AMOUNT) {
        formik.setErrors({
          amount: `Минимальная сумма погашения ${credit.MONTH_AMOUNT}`,
        });
        return;
      }
      instance
        .post(`repaymentCredit`, {
          index: modalOpen.index,
          amount: values.amount,
        })
        .then(({ data }) => {
          console.log("data", data);
          setCredits((prev) => {
            const copy = [...prev];
            return copy.map((element) => {
              if (+element.INDEX_HISTORY === modalOpen.index) {
                element.FULL_AMOUNT = data.result.NEWAMOUNT;
                element.MONTH_AMOUNT = data.result.NEWMONTHSAMOUNT;
              }
              return element;
            });
          });
          setModalOpen(null);
        });
    },
  });

  React.useEffect(() => {
    if (!credits) {
      instance
        .get(`getCredits?username=${state.user.username}`)
        .then(({ data }) => {
          setCredits(data.credits.reverse());
        });
    }
  }, [credits]);

  const body = (
    <Paper style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Погасить часть кредита</h2>
      <form className={classes.formWrapper} onSubmit={formik.handleSubmit}>
        <div>
          <TextField
            className={classes.textField}
            error={!!formik.errors.amount}
            id="amount"
            name="amount"
            type="number"
            placeholder=""
            helperText={formik.errors.amount}
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.amount}
          />
        </div>

        <Button size="small" type="submit">
          Погасить часть
        </Button>
      </form>
    </Paper>
  );

  return (
    <>
      <Title title="Профиль" />
      <Modal open={!!modalOpen} onClose={() => setModalOpen(null)}>
        {body}
      </Modal>
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

      {!!credits && !!credits.length ? (
        <Box className={classes.tabForCreditsContainer}>
          <Typography
            onClick={() => setShowHistory(false)}
            className={
              !showHistory ? classes.tabForCreditsActive : classes.tabForCredits
            }
          >
            ОТКРЫТЫЕ
          </Typography>
          <Typography
            onClick={() => setShowHistory(true)}
            className={
              showHistory ? classes.tabForCreditsActive : classes.tabForCredits
            }
          >
            ИСТОРИЯ
          </Typography>
        </Box>
      ) : (
        <Typography className={classes.tabText}>Пусто</Typography>
      )}

      {!!credits &&
        credits.map(
          (el) =>
            showHistory === !!el.ISCLOSE && (
              <Paper
                className={
                  !el.ISCLOSE
                    ? classes.alternativeContainer
                    : classes.closeContainer
                }
              >
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>Дата</Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        {new Date(+el.CREDIT_DATE).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>
                        Сумма кредита, ₽
                      </Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        {el.ISCLOSE ? el.USERAMOUNT : el.FULL_AMOUNT}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>Срок</Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        на {el.MONTHS_ / 12} лет
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>
                        Ежемесячный платеж, ₽
                      </Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        {el.MONTH_AMOUNT}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                {!el.ISCLOSE && (
                  <CardActions className={classes.buttonsContainer}>
                    <Button
                      size="small"
                      onClick={() => {
                        formik.setValues({ amount: el.MONTH_AMOUNT });
                        setModalOpen({ index: +el.INDEX_HISTORY });
                      }}
                    >
                      Погасить часть
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        instance
                          .post(`closeCredit`, { index: +el.INDEX_HISTORY })
                          .then(({ data }) => {
                            if (data.success) {
                              setCredits((prev) => {
                                const copy = [...prev];
                                return copy.map((element) => {
                                  if (
                                    +element.INDEX_HISTORY === +el.INDEX_HISTORY
                                  ) {
                                    element.ISCLOSE = 1;
                                    element.USERAMOUNT = element.FULL_AMOUNT;
                                    element.FULL_AMOUNT = 0;
                                  }
                                  return element;
                                });
                              });
                            }
                          })
                      }
                    >
                      Закрыть полностью
                    </Button>
                  </CardActions>
                )}
              </Paper>
            )
        )}
    </>
  );
};

const useStyles = makeStyles({
  formWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  textField: {
    width: "100%",
    marginBottom: 25,
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: "#fff",
    padding: 25,
    border: "none",
  },
  tabContainer: {
    textAlign: "left",
  },
  tabTitle: {
    fontSize: 13,
  },
  tabText: {
    fontSize: 23,
    fontWeight: 500,
    marginBottom: 12,
  },
  alternativeContainer: {
    marginBottom: "30px",
    padding: "15px 15px",
  },
  closeContainer: {
    marginBottom: "30px",
    padding: "15px 15px",
    opacity: "0.6",
  },
  tabForCreditsContainer: {
    marginBottom: 24,
  },
  tabForCredits: {
    cursor: "pointer",
    display: "inline-block",
    fontSize: 20,
    fontWeight: 400,
    marginRight: 10,
  },
  tabForCreditsActive: {
    cursor: "pointer",
    display: "inline-block",
    fontSize: 22,
    fontWeight: 500,
    marginRight: 10,
  },
});

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}
