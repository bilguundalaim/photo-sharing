import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper, CircularProgress } from "@mui/material";
import {
  HashRouter,
  Route,
  Switch,
  withRouter,
  Redirect,
} from "react-router-dom";
import axios from "axios";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";
import UserContext from "./contexts/userContext";
import PhotoContext from "./contexts/photoContext";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataFromChild: null,
      source: null,
      advancedFeature: localStorage.getItem("advancedFeature") === "true",
      user: null,
      loading: true,
      userContextValue: {
        user: null,
        setUser: this.setUser,
        logoutUser: this.logoutUser,
      },
      photoContextValue: {
        newPhotoCount: 0,
        handleNewPhoto: this.handleNewPhoto,
      },
    };
  }

  componentDidMount() {
    axios.get("http://localhost:3000/checkSession")
      .then((res) => this.setState({
          user: res.data,
          userContextValue: { ...this.state.userContextValue, user: res.data },
          loading: false,
        })
      )
      .catch((err) => {
        console.error(err);
          this.setState({
            loading: false,
          });
      });
  }

  handleNewPhoto = () => {
    this.setState(
      {
        photoContextValue: {
          ...this.state.photoContextValue,
          newPhotoCount: this.state.photoContextValue.newPhotoCount + 1,
        },
      },
      () => {
        console.log(this.state.photoContextValue.newPhotoCount);
      }
    );
  };

  setUser = (user) => {
    this.setState({
      user: user,
      userContextValue: { ...this.state.userContextValue, user: user },
    });
  };

  logoutUser = () => {
    axios
      .post("http://localhost:3000/admin/logout")
      .then(() => {
        this.setState({
          user: null,
          userContextValue: { ...this.state.userContextValue, user: null },
        });
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  parentCallBack = (fromChild, source) => {
    this.setState({ dataFromChild: fromChild });
    this.setState({ source: source });
  };

  topBarCallBack = (fromTopBar) => {
    console.log("topBarCallBack", fromTopBar);
    this.setState({ advancedFeature: fromTopBar });
  };

  render() {
    if (this.state.loading) {
      return <CircularProgress />;
    }

    return (
      <UserContext.Provider value={this.state.userContextValue}>
        <PhotoContext.Provider value={this.state.photoContextValue}>
          <HashRouter>
            <div>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TopBar
                    context={this.state.dataFromChild}
                    source={this.state.source}
                    callback={this.topBarCallBack}
                  />
                </Grid>
                <div className="cs142-main-topbar-buffer" />
                <Grid item sm={3}>
                  <Paper className="cs142-main-grid-item">
                    {this.state.user && (
                      <UserList advancedFeature={this.state.advancedFeature} />
                    )}
                  </Paper>
                </Grid>
                <Grid item sm={9}>
                  <Paper className="cs142-main-grid-item">
                    <Switch>
                      <Route exact path="/">
                        {this.state.user ? (
                          <Typography variant="body1">
                            Welcome to your photosharing app! This{" "}
                            <a href="https://mui.com/components/paper/">
                              Paper
                            </a>{" "}
                            component displays the main content of the
                            application. The {"sm={9}"} prop in the{" "}
                            <a href="https://mui.com/components/grid/">Grid</a>{" "}
                            item component makes it responsively display 9/12 of
                            the window. The Switch component enables us to
                            conditionally render different components to this
                            part of the screen. You don&apos;t need to display
                            anything here on the homepage, so you should delete
                            this Route component once you get started.
                          </Typography>
                        ) : (
                          <Redirect to="/login-register" />
                        )}
                      </Route>
                      <Route 
                        exact path="/users/:userId"
                        render={(props) => (
                          this.state.user ? <UserDetail {...props} callback={this.parentCallBack} /> : <Redirect to="/login-register"/>
                        )}
                      />
                      <Route 
                        exact path="/photos/:userId/:photoId" 
                        render={(props) => (
                          this.state.user ? 
                          <UserPhotos {...props} callback={this.parentCallBack} advancedFeature={this.state.advancedFeature} /> :
                          <Redirect to="/login-register"/>
                        )}
                      />
                      <Route path="/photos/:userId">
                        {this.state.user ? (
                          (props) => (
                            <UserPhotos
                              {...props}
                              callback={this.parentCallBack}
                              advancedFeature={this.state.advancedFeature}
                            />
                          )
                        ) : (
                          <Redirect to="/login-register" />
                        )}
                      </Route>
                      <Route path="/userComments/:userId">
                        {this.state.user ? (
                          (props) => <UserComments {...props} />
                        ) : (
                          <Redirect to="/login-register" />
                        )}
                      </Route>
                      <Route path="/login-register" component={LoginRegister} />
                    </Switch>
                  </Paper>
                </Grid>
              </Grid>
            </div>
          </HashRouter>
        </PhotoContext.Provider>
      </UserContext.Provider>
    );
  }
}

export default withRouter(PhotoShare);

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
