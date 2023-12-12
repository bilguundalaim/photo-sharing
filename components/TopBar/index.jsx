import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";

import "./styles.css";
import axios from "axios";
import UserContext from "../../contexts/userContext";
import PhotoContext from "../../contexts/photoContext";
/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      context: "Welcome",
      version: null,
      checked: localStorage.getItem("advancedFeature") === "true",
      open: false,
      openSnackbar: false,
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:3000/test/info")
      .then((response) => {
        this.setState({ version: response.data.__v });
      })
      .catch((error) => {
        console.error("Error fetching version: ", error);
      });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.context !== this.props.context) {
      const newContext =
        this.props.source === "photo"
          ? `${this.props.context}'s photo`
          : this.props.context;
      this.setState({
        context: newContext,
      });
    }
  }

  handleCheckBox = (event) => {
    this.setState({ checked: event.target.checked }, () => {
      localStorage.setItem("advancedFeature", this.state.checked);
      this.props.callback(this.state.checked);
    });
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleCloseSnackBar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ openSnackbar: false });
  };

  handleUploadButtonClick = (e, photoContextValue) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then(response => {
          console.log(response);
        })
        .catch(error => console.log(`POST ERR: ${error}`));
    }
    this.handleClose();
    photoContextValue.handleNewPhoto();
    this.setState({ openSnackbar: true });
  };

  render() {
    return (
      <UserContext.Consumer>
        {userContextValue => (
          <PhotoContext.Consumer>
            {photoContextValue => (
              <AppBar className="cs142-topbar-appBar" position="absolute">
                <Toolbar className="toolbar">
                  <div>
                    <Typography variant="h5" color="inherit">
                      Version: {this.state.version}
                    </Typography>
                    <Typography variant="h5">
                      {userContextValue.user
                        ? `Hi, ${userContextValue.user.first_name}`
                        : "Please Login"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="h5" color="inherit">
                      {this.state.context}
                    </Typography>
                    <FormControlLabel
                      control={<Checkbox onChange={this.handleCheckBox} color="default" checked={this.state.checked}/>}
                      label="Enable Advanced Feature"
                    />
                    {userContextValue.user && (
                      <>
                        <Button
                          variant="outlined"
                          style={{ backgroundColor: "white" }}
                          onClick={userContextValue.logoutUser}
                          >
                          Logout
                        </Button>
                        <Button
                          variant="outlined"
                          style={{ backgroundColor: "white" }}
                          onClick={this.handleOpen}
                          >
                          Add Photo
                        </Button>
                        <Dialog open={this.state.open} onClose={this.handleClose}>
                          <DialogTitle>Add New Photo</DialogTitle>
                          <DialogContent>
                            <input
                              type="file"
                              accept="image/*"
                              ref={(domFileRef) => {this.uploadInput = domFileRef;}}
                            />
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={this.handleClose}>
                              Cancel
                            </Button>
                            <Button onClick={(e) => this.handleUploadButtonClick(e, photoContextValue)}>
                              Upload
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    )}
                  </div>
                </Toolbar>
                <Snackbar
                  open={this.state.openSnackbar}
                  autoHideDuration={6000}
                  onClose={this.handleCloseSnackBar}
                >
                  <Alert 
                    onClose={this.handleCloseSnackBar}
                    severity="success"
                  >
                    Photo added successfully
                  </Alert>
                </Snackbar>
              </AppBar>
            )}
          </PhotoContext.Consumer>
        )}
      </UserContext.Consumer>
    );
  }
}

export default TopBar;
