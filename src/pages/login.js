import React from "react";
import { Typography, Button, TextField, Box, Paper } from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import * as Yup from "yup";

import { instance } from "../utils/api/api";
import { ContextState } from "./_app";

const LOGIN_SCHEMA = Yup.object().shape({
  username: Yup.string().required("Поле обязательное"),
  password: Yup.string().required("Поле обязательное"),
});

export const Login = () => {
  const context = React.useContext(ContextState);
  const classes = useStyles();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: LOGIN_SCHEMA,
    onSubmit: (values) => {
      instance
        .post("login", {
          user: { username: values.username, password: values.password },
        })
        .then(({ data }) => {
          context.setState({ ...context.state, user: data.user });
          localStorage.setItem("user", JSON.stringify(data.user));
        })
        .catch(() =>
          formik.setErrors({
            username: " ",
            password: "неправильный логин или пароль",
          })
        );
    },
  });

  return (
    <>
      <Box className={classes.titleBox}>
        <Typography variant="h3" component="h2" gutterBottom>
          Войти
        </Typography>
      </Box>
      <Paper className={classes.root}>
        <form className={classes.formControl} onSubmit={formik.handleSubmit}>
          <TextField
            className={classes.textField}
            error={!!formik.errors.username}
            id="username"
            name="username"
            type="text"
            placeholder="логин"
            helperText={formik.errors.username}
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
          <TextField
            className={classes.textField}
            error={!!formik.errors.password}
            id="password"
            name="password"
            type="text"
            placeholder="пароль"
            helperText={formik.errors.password}
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.password}
          />

          <Button type="submit">Войти</Button>
        </form>
      </Paper>
    </>
  );
};

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    cursor: "pointer",
    padding: "50px",
  },
  formControl: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textField: {
    width: "60%",
    marginBottom: "30px",
  },
  titleBox: {
    marginTop: "50px",
    marginBottom: "50px",
  },
});
