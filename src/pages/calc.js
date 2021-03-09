import React from "react";
import {
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  Grid,
} from "@material-ui/core/";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";

import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import { instance } from "../utils/api/api";
import { Title } from "../common/title";
import { Logo } from "../common/logo";

const LOGIN_SCHEMA = Yup.object().shape({
  amount: Yup.number()
    .required("Поле обязательное")
    .min(10000, "Минимальная сумма кредита 10000 ₽"),
  year: Yup.number()
    .required("Поле обязательное")
    .min(1, "Минимальный срок 1 месяц"),
});

export const Calc = () => {
  const classes = useStyles();
  const { bankId } = useParams();
  const [credits, setCredits] = React.useState(null);
  const [bankColor, setBankColor] = React.useState(null);
  const [selectedCredit, setSelectedCredit] = React.useState(null);
  const [monthAmount, setMonthAmount] = React.useState(null);
  const [alternativeCredits, setAlternativeCredits] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      amount: 0,
      year: 0,
    },
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: LOGIN_SCHEMA,
    onSubmit: (values) => {
      console.log(
        "values.amount > selectedCredit.value.amount * 1000000",
        values.amount > selectedCredit.value.amount * 1000000
      );
      let errors = {};

      if (values.amount > selectedCredit.value.amount * 1000000) {
        errors = {
          ...errors,
          amount: `Максимальная сумма кредита ${
            selectedCredit.value.amount * 1000000
          } ₽`,
        };
      }

      if (values.year / 12 > selectedCredit.value.year) {
        errors = {
          ...errors,
          year: `Максимальный срок  ${selectedCredit.value.year} лет`,
        };
      }

      if (!!errors.amount || !!errors.year) {
        formik.setErrors(errors);
        return;
      }

      instance
        .get(
          `calc?amount=${formik.values.amount}&rate=${selectedCredit.value.rate}&month=${formik.values.year}`
        )
        .then(({ data }) => {
          setMonthAmount(Math.round(data.monthamount));
        });

      instance
        .get(
          `creditList?id=${bankId}&amount=${formik.values.amount}&month=${formik.values.year}`
        )
        .then(({ data }) => {
          setAlternativeCredits(data.alternative);
        });
    },
  });

  React.useEffect(() => {
    if (!credits) {
      instance.get(`banks/credits?bank=${bankId}`).then(({ data }) => {
        setCredits(data.credits);
        setBankColor(data.bankColor);
        setSelectedCredit({
          value: data.credits[0],
          label: `ставка от ${data.credits[0].rate}`,
        });
      });
    }
  }, [credits, bankId]);

  React.useEffect(() => {
    if (!!selectedCredit) {
      formik.setValues({
        amount: (selectedCredit.value.amount / 2) * 1000000,
        year: selectedCredit.value.year * 6,
      });
    }
  }, [selectedCredit]);

  if (!credits || !selectedCredit || !bankColor) {
    return <h2>loading</h2>;
  }

  const options = credits.map((el) => ({
    value: el,
    label: `ставка от ${el.rate}`,
  }));

  return (
    <>
      <Title title="Получить кредит" />
      <Box className={classes.logoWrapper}>
        <Logo id={bankId} />
      </Box>

      <Box className={classes.selectWrapper}>
        <Select
          onChange={(option) => {
            setSelectedCredit(option);
            setAlternativeCredits(null);
            setMonthAmount(null);
          }}
          styles={customStyles}
          options={options}
          value={selectedCredit}
        />
      </Box>

      {credits.map(
        (el) =>
          el.creditId === selectedCredit.value.creditId && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={3}>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabTitle}>Cтавка</Typography>
                  </Box>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabText}>
                      от {el.rate}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabTitle}>
                      Сумма кредита
                    </Typography>
                  </Box>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabText}>
                      до {el.amount} млн ₽
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabTitle}>Срок</Typography>
                  </Box>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabText}>
                      до {el.year} лет
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabTitle}>
                      Решение онлайн
                    </Typography>
                  </Box>
                  <Box className={classes.tabContainer}>
                    <Typography className={classes.tabText}>
                      от 2 минут
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </>
          )
      )}

      <Paper className={classes.calc}>
        <form className={classes.formWrapper} onSubmit={formik.handleSubmit}>
          <Typography variant="h4" className={classes.calcTitle}>
            Кредит наличными{" "}
          </Typography>
          <Typography className={classes.tabTitle}>
            Сумма кредита, ₽{" "}
          </Typography>
          <TextField
            inputProps={{
              style: { textAlign: "center" },
            }}
            className={classes.textField}
            error={!!formik.errors.amount}
            id="amount"
            name="amount"
            type="number"
            placeholder="  Сумма кредита, ₽"
            helperText={formik.errors.amount}
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.amount}
          />
          <Typography className={classes.tabTitle}>Срок, мес </Typography>
          <TextField
            inputProps={{
              style: { textAlign: "center" },
            }}
            className={classes.textField}
            error={!!formik.errors.year}
            id="year"
            name="year"
            type="number"
            placeholder="Срок, мес"
            helperText={formik.errors.year}
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.year}
          />

          <Button type="submit">РАССЧИТАТЬ</Button>
        </form>
        <Box
          style={{
            background: bankColor,
          }}
          className={classes.resultWrapper}
        >
          {!!monthAmount && (
            <>
              <Box className={classes.monthAmountTitle}>
                <Typography className={classes.monthAmountTitle}>
                  Ежемесячный платеж, ₽
                </Typography>
              </Box>
              <Box className={classes.monthAmount}>
                <Typography className={classes.monthAmount}>
                  {monthAmount}
                </Typography>
              </Box>
              <Box className={classes.buttonOffer}>
                <Button className={classes.buttonOffer} type="submit">
                  Оформить
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {!!alternativeCredits && (
        <>
          <Typography className={classes.tabText}>Доступные ставки</Typography>

          {alternativeCredits.map((el) => {
            const credit = credits.find(
              (creditEl) => creditEl.creditId === el[0]
            );

            return (
              <Paper className={classes.alternativeContainer}>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>
                        Cтавка
                      </Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        от {credit.rate}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>
                        Сумма кредита
                      </Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        до {credit.amount} млн ₽
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabTitle}>Срок</Typography>
                    </Box>
                    <Box className={classes.tabContainer}>
                      <Typography className={classes.tabText}>
                        до {credit.year} лет
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
                        {el[1]}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </>
      )}
    </>
  );
};

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    height: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    cursor: "pointer",
  }),
};

const useStyles = makeStyles({
  calc: {
    margin: "50px 0",
    height: "400px",
    display: "flex",
  },
  formWrapper: {
    padding: "30px 50px",
    width: "60%",
    display: "flex",
    flexDirection: "column",
  },
  resultWrapper: {
    color: "#fff",
    width: "40%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    padding: "40px 30px",
  },
  textField: {
    marginBottom: "25px",
  },
  logoWrapper: {
    marginBottom: 25,
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
  selectWrapper: {
    width: "50%",
    marginBottom: 25,
  },
  calcTitle: {
    marginBottom: 15,
  },
  monthAmount: { fontSize: "30px" },
  monthAmountTitle: {
    fontSize: "20px",
  },
  buttonOffer: {
    textAlign: "center",
    width: "100%",
    marginTop: "20px",
    color: "#fff",
  },
  alternativeContainer: {
    marginBottom: "30px",
    padding: "15px 15px",
  },
});
