import React from "react";
import "./style.css";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";

class UserComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: null,
    };
  }

  componentDidMount() {
    this.fetchComments(this.props.match.params.userId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchComments(this.props.match.params.userId);
    }
  }

  fetchComments = (userId) => {
    axios
    .get(`/photosAndCommentsCountOfUser/${userId}`)
    .then((response) => {
      this.setState({ comments: response.data.commentsOfUser });
    })
    .catch((error) => {
      console.error("Error fetching comments of user: ", error);
    });
  };

  render() {
    return(
      <div className="comment-container">
        {this.state.comments && this.state.comments.map((comment) => {
          const id = comment._id;
          const photo_file_name = comment.photo_file_name;
          const commentText = comment.comment;
          return (      
            <Link key={id} to={`/photos/${comment.photo_user_id}/${comment.photo_id}`}>
              <Card style={{ padding: '8px', minHeight: '400px' }}>
                <CardMedia
                  component="img"
                  alt=""
                  image={`../../images/${photo_file_name}`}
                  style={{
                    objectFit: 'cover',
                    width: '400px',
                  }}
                />
                <CardContent
                  style={{
                    width: '400px',
                  }}
                >
                  <Typography variant="body1">{commentText}</Typography>
                </CardContent>
              </Card>
            </Link>
          );})}
      </div>
    );
  }
}

export default UserComments;
