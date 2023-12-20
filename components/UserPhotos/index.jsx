import React from "react";
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Link } from "react-router-dom";
import { MentionsInput, Mention } from "react-mentions";

import "./styles.css";
import axios from "axios";
import PhotoContext from "../../contexts/photoContext";
import mentionStyle from "../../mentionStyle";
import mentionsInputStyle from "../../mentionsInputStyle";

/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonData: null,
      firstname: null,
      lastname: null,
      currentPhotoIndex: 0,
      advancedFeature: this.props.advancedFeature,
      dialogOpen: false,
      commentText: "",
      currentPhotoId: "",
      users: null,
    };
  }

  getJsonData(callback) {
    const photos = axios.get(
      `http://localhost:3000/photosOfUser/${this.props.match.params.userId}`
    );
    const user = axios.get(
      `http://localhost:3000/user/${this.props.match.params.userId}`
    );
    const users = axios.get("http://localhost:3000/user/list");

    Promise.all([photos, user, users])
      .then(([photosResponse, userResponse, usersResponse]) => {
        this.setState(
          {
            jsonData: photosResponse.data,
            firstname: userResponse.data.first_name,
            lastname: userResponse.data.last_name,
            users: usersResponse.data.map((element) => ({
              id : element._id, 
              display: `${element.first_name} ${element.last_name}`
            })),
          }, 
          callback
        );
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }

  componentDidMount() {
    this.prevContext = this.context;
    this.getJsonData(() => {
      this.props.callback(
        `${this.state.firstname} ${this.state.lastname}`,
        "photo"
      );
      const photo = this.props.match.params.photoId;
      if (photo) {
        const index = this.state.jsonData.findIndex(
          (element) => element._id === photo
        );
        this.setState({
          currentPhotoIndex: index,
        });
        this.props.history.push(
          `/photos/${this.props.match.params.userId}/${photo}`
        );
      } else if (this.state.advancedFeature) {
        this.props.history.push(
          `/photos/${this.props.match.params.userId}/${
            this.state.jsonData[this.state.currentPhotoIndex]._id
          }`
        );
      } else {
        this.props.history.push(`/photos/${this.props.match.params.userId}`);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.advancedFeature !== this.props.advancedFeature) {
      this.setState({ advancedFeature: this.props.advancedFeature }, () => {
        if (!this.state.advancedFeature) {
          this.props.history.push(`/photos/${this.props.match.params.userId}`);
        } else {
          const photo = this.props.match.params.photoId;
          if (photo) {
            const index = this.state.jsonData.findIndex(
              (element) => element._id === photo
            );
            this.setState({ currentPhotoIndex: index });
            console.log(
              "current: ",
              this.props.advancedFeature,
              "prev: ",
              prevProps.advancedFeature,
              "state: ",
              this.state.advancedFeature
            );
          }
          this.props.history.push(
            `/photos/${this.props.match.params.userId}/${
              this.state.jsonData[this.state.currentPhotoIndex]._id
            }`
          );
        }
      });
    }

    if (this.prevContext.newPhotoCount !== this.context.newPhotoCount) {
      this.prevContext = this.context;
      this.getJsonData();
    }
  }

  componentWillUnmount() {
    this.props.callback("Welcome");
  }

  handlePrevButtonClick = () => {
    const prevIndex = this.state.currentPhotoIndex - 1;
    this.setState({ currentPhotoIndex: prevIndex });
    this.props.history.push(
      `/photos/${this.props.match.params.userId}/${this.state.jsonData[prevIndex]._id}`
    );
  };

  handleNextButtonClick = () => {
    const nextIndex = this.state.currentPhotoIndex + 1;
    this.setState({ currentPhotoIndex: nextIndex });
    this.props.history.push(
      `/photos/${this.props.match.params.userId}/${this.state.jsonData[nextIndex]._id}`
    );
  };

  handleOpenDialog = (photo_id) => {
    this.setState({
      dialogOpen: true,
      currentPhotoId: photo_id,
    });
  };

  handleCloseDialog = () => {
    this.setState({
      dialogOpen: false,
      commentText: "",
    });
  };

  handleCommentSubmit = (photo_id) => {
    // Check if there is an mentioned user. If there is extract display and id from comment.
    const mentionRegex = /@\[([^)]+)\]\(([^)]+)\)/;
    const match = this.state.commentText.match(mentionRegex);
    let mentioned_userId;

    // Get mentioned user's id and change comment to only user's name.
    if (match) {
      mentioned_userId = match[2];
    }

    const updatedComment = this.state.commentText.replace(mentionRegex, '@$1');

    this.setState({
      commentText: updatedComment,
    }, () => {
      axios
      .post(`http://localhost:3000/commentsOfPhoto/${photo_id}`, {
        comment: this.state.commentText,
        mentioned_userId: mentioned_userId,
      })
      .then(() => {
        this.handleCloseDialog();
        this.getJsonData();
      })
      .catch((error) => {
        console.error("Error adding new comment: ", error);
      });
    });
  };

  handleCommentChange = (event) => {
    this.setState({
      commentText: event.target.value,
    });
  };

  render() {
    const { jsonData, currentPhotoIndex, advancedFeature } = this.state;

    return (
      <div className="container">
        {advancedFeature
          ? jsonData &&
            jsonData.length > 0 && (
              <div>
                <Paper className="photo" style={{ position: "relative" }}>
                  <div>
                    <img
                      src={`../../images/${
                        jsonData[this.state.currentPhotoIndex].file_name
                      }`}
                      alt=""
                    />
                    <Typography variant="body2" color="textSecondary">
                      {jsonData[this.state.currentPhotoIndex].date_time.slice(
                        0,
                        10
                      )}
                    </Typography>
                  </div>
                  <div>
                    {jsonData[this.state.currentPhotoIndex].comments ? (
                      jsonData[this.state.currentPhotoIndex].comments.map(
                        (comment) => {
                          const commentId = comment._id;
                          const userComment = comment.comment;
                          const commentDatetime = comment.date_time.slice(
                            0,
                            10
                          );
                          const username = comment.user.first_name.toLowerCase();
                          return (
                            <div key={commentId} className="comment">
                              <div>
                                <Typography
                                  variant="subtitle1"
                                  component={Link}
                                  to={`/users/${comment.user._id}`}
                                >
                                  {username}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {commentDatetime}
                                </Typography>
                              </div>
                              <Typography variant="body1">
                                {userComment}
                              </Typography>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <Typography variant="body1">
                        There is no comment.
                      </Typography>
                    )}
                    <Dialog
                      open={this.state.dialogOpen}
                      onClose={this.handleCloseDialog}
                    >
                      <DialogTitle>Add a Comment</DialogTitle>
                      <DialogContent>
                        <MentionsInput 
                          value={this.state.commentText}
                          onChange={this.handleCommentChange}
                          className="mentions-input"
                          style={mentionsInputStyle}
                        >
                          <Mention 
                            trigger="@"
                            data={this.state.users}
                            style={mentionStyle}
                          />
                        </MentionsInput>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={this.handleCloseDialog} color="primary">
                          Cancel
                        </Button>
                        <Button
                          onClick={() => this.handleCommentSubmit(this.state.currentPhotoId)}
                          color="primary"
                        >
                          Submit
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Button
                      onClick={() => this.handleOpenDialog(
                          jsonData[this.state.currentPhotoIndex]._id
                      )}
                      variant="outlined"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        margin: "8px",
                      }}
                    >
                      Add Comment
                    </Button>
                  </div>
                </Paper>
                <div className="button-container">
                  {jsonData.length > 1 && currentPhotoIndex !== 0 && (
                    <Button
                      variant="contained"
                      onClick={this.handlePrevButtonClick}
                    >
                      PREVIOUS
                    </Button>
                  )}
                  {jsonData.length > 1 &&
                    currentPhotoIndex !== jsonData.length - 1 && (
                      <Button
                        style={{ marginLeft: "auto" }}
                        variant="contained"
                        onClick={this.handleNextButtonClick}
                      >
                        NEXT
                      </Button>
                    )}
                </div>
              </div>
            )
          : this.state.jsonData &&
            this.state.jsonData.map((photo) => {
              const id = photo._id;
              const url = `../../images/${photo.file_name}`;
              const datetime = photo.date_time.slice(0, 10);
              const comments = photo.comments;
              return (
                <Paper
                  key={id}
                  className="photo"
                  style={{ position: "relative" }}
                >
                  <div>
                    <img src={url} alt="" />
                    <Typography variant="body2" color="textSecondary">
                      {datetime}
                    </Typography>
                  </div>
                  <div>
                    {comments.length > 0 ? (
                      comments.map((comment) => {
                        const commentId = comment._id;
                        const userComment = comment.comment;
                        const commentDatetime = comment.date_time.slice(0, 10);
                        const username = `${comment.user.first_name} ${comment.user.last_name}`;
                        return (
                          <div key={commentId} className="comment">
                            <div>
                              <Typography
                                variant="subtitle1"
                                component={Link}
                                to={`/users/${comment.user._id}`}
                              >
                                {username}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {commentDatetime}
                              </Typography>
                            </div>
                            <Typography variant="body1">
                              {userComment}
                            </Typography>
                          </div>
                        );
                      })
                    ) : (
                      <Typography variant="body1">
                        There is no comment.
                      </Typography>
                    )}
                  </div>
                  <Dialog
                    open={this.state.dialogOpen}
                    onClose={this.handleCloseDialog}
                  >
                    <DialogTitle>Add a Comment</DialogTitle>
                    <DialogContent>
                      <MentionsInput 
                        value={this.state.commentText}
                        onChange={this.handleCommentChange}
                        className="mentions-input"
                        style={mentionsInputStyle}
                      >
                        <Mention 
                          trigger="@"
                          data={this.state.users}
                          style={mentionStyle}
                        />
                      </MentionsInput>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleCloseDialog} color="primary">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => this.handleCommentSubmit(this.state.currentPhotoId)}
                        color="primary"
                      >
                        Submit
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Button
                    onClick={() => this.handleOpenDialog(id)}
                    variant="outlined"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      margin: "8px",
                    }}
                  >
                    Add Comment
                  </Button>
                </Paper>
              );
            })}
      </div>
    );
  }
}

UserPhotos.contextType = PhotoContext;

export default UserPhotos;
