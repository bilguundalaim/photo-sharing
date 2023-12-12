import React from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import "./styles.css";
import axios from "axios";
import UserContext from "../../contexts/userContext";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginNameLogin: "",
      passwordLogin: "",
      loginNameReg: "",
      passwordReg1: "",
      passwordReg2: "",
      firstName: "",
      lastName: "",
      location: "",
      description: "",
      occupation: "",
      open: false,
      openSnackbar: false,
      snackBarSeverity: "",
    };
  }

  handleOpenDialog = () => {
    this.setState({ open: true });
  };

  handleCloseDialog = () => {
    this.setState({ open: false });
  };

  handleRegister = () => {
    const checkPassword = this.state.passwordReg1 === this.state.passwordReg2;
    const checkRequired =
      this.state.passwordReg1 &&
      this.state.passwordReg2 &&
      this.state.firstName &&
      this.state.lastName;

    if (!checkPassword || !checkRequired) {
      let snackBarMsg = "";
      if (!checkPassword) {
        snackBarMsg = "Passwords do not match";
      }
      if (!checkRequired) {
        snackBarMsg = "Missing required fields";
      }

      this.setState({
        openSnackbar: true,
        snackBarMsg: snackBarMsg,
        snackBarSeverity: "warning",
      });
    } else {
      axios
        .post("http://localhost:3000/user", {
          login_name: this.state.loginNameReg,
          password: this.state.passwordReg1,
          first_name: this.state.firstName,
          last_name: this.state.lastName,
          location: this.state.location,
          description: this.state.description,
          occupation: this.state.occupation,
        })
        .then((response) => {
          console.log(response.data);
          this.handleCloseDialog();
          this.setState({
            loginNameReg: "",
            passwordReg1: "",
            passwordReg2: "",
            firstName: "",
            lastName: "",
            location: "",
            description: "",
            occupation: "",
            openSnackbar: true,
            snackBarMsg: "User added successfully",
            snackBarSeverity: "success",
          });
        })
        .catch((error) => console.error(error));
    }
  };

  handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      openSnackbar: false,
      snackBarMsg: "",
      snackBarSeverity: "",
    });
  };

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.loginNameLogin || !this.state.passwordLogin) {
      let snackBarMsg = "Required fields: ";
      if (!this.state.loginNameLogin) {
        snackBarMsg += "Login name ";
      }
      if (!this.state.passwordLogin) {
        snackBarMsg += "Password";
      }

      this.setState({
        openSnackbar: true,
        snackBarMsg: snackBarMsg,
        snackBarSeverity: "warning",
      });
    } else {
      axios
        .post("http://localhost:3000/admin/login", {
          login_name: this.state.loginNameLogin,
          password: this.state.passwordLogin,
        })
        .then((response) => {
          this.context.setUser(response.data);
          this.props.history.push(`/users/${response.data._id}`);
        })
        .catch((error) => {
          console.error("Error logging user: ", error);
          this.setState({
            openSnackbar: true,
            snackBarMsg: error.response.data,
            snackBarSeverity: "error",
          });
        });
    }
  };

  render() {
    return (
      <Container maxWidth="xs">
        <Typography variant="h4" align="center">
          Login
        </Typography>
        <form onSubmit={this.handleSubmit} className="login">
          <TextField
            fullWidth
            label="Login Name"
            variant="outlined"
            name="loginNameLogin"
            value={this.state.loginNameLogin}
            onChange={this.handleInputChange}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            variant="outlined"
            name="passwordLogin"
            value={this.state.passwordLogin}
            onChange={this.handleInputChange}
          />
          <Button type="submit" fullWidth variant="contained" color="primary">
            Submit
          </Button>
        </form>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleOpenDialog}
        >
          Register Me
        </Button>

        <Dialog open={this.state.open} onClose={this.handleCloseDialog}>
          <DialogTitle>Registration</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                fullWidth
                margin="dense"
                label="Login Name"
                variant="outlined"
                name="loginNameReg"
                value={this.state.loginNameReg}
                onChange={this.handleInputChange}
              />
              <TextField
                required
                fullWidth
                type="password"
                margin="dense"
                label="Password"
                variant="outlined"
                name="passwordReg1"
                value={this.state.passwordReg1}
                onChange={this.handleInputChange}
              />
              <TextField
                required
                fullWidth
                type="password"
                margin="dense"
                label="Password"
                variant="outlined"
                name="passwordReg2"
                value={this.state.passwordReg2}
                onChange={this.handleInputChange}
              />
              <TextField
                required
                fullWidth
                margin="dense"
                label="First Name"
                variant="outlined"
                name="firstName"
                value={this.state.firstName}
                onChange={this.handleInputChange}
              />
              <TextField
                required
                fullWidth
                margin="dense"
                label="Last Name"
                variant="outlined"
                name="lastName"
                value={this.state.lastName}
                onChange={this.handleInputChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Location"
                variant="outlined"
                name="location"
                value={this.state.location}
                onChange={this.handleInputChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Description"
                variant="outlined"
                name="description"
                value={this.state.description}
                onChange={this.handleInputChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Occupation"
                variant="outlined"
                name="occupation"
                value={this.state.occupation}
                onChange={this.handleInputChange}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDialog}>Cancel</Button>
            <Button onClick={this.handleRegister}>Register</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={this.state.openSnackbar}
          autoHideDuration={6000}
          onClose={this.handleCloseSnackBar}
        >
          <Alert
            onClose={this.handleCloseSnackBar}
            severity={this.state.snackBarSeverity}
          >
            {this.state.snackBarMsg}
          </Alert>
        </Snackbar>
      </Container>
    );
  }
}

LoginRegister.contextType = UserContext;

export default LoginRegister;
