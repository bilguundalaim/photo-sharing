import React from "react";
import { Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import axios from "axios";

class Mentioned extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photosWithMention: [],
    };
  }

  componentDidMount() {
    const userId = this.props.userId;
    this.getData(userId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.getData(this.props.userId);
    }
  }

  getData(userId) {
    axios
      .get(`http://localhost:3000/user/mention/${userId}`)
      .then((response) => {
        this.setState({
          photosWithMention: response.data,
        });
      })
      .catch((error) => {
        console.error("Error fetching mentions:", error);
        this.setState({
          photosWithMention: [],
        });
      });
  }

  render() {
    const { photosWithMention } = this.state;

    return (
      <div className="mentions-container">
        {photosWithMention.length > 0 ? (
          photosWithMention.map((photo) => {
            return (
              <Paper key={photo._id} className="thumbnail-container">
                <Link to={`/photos/${photo.user_id}`}>
                  <img
                    className="mentions-photo"
                    src={`../../images/${photo.file_name}`}
                    alt={photo.file_name}
                  />
                </Link>
                <Typography component={Link} to={`/users/${photo.user_id}`}>
                  Photo owner: {photo.user_name}
                </Typography>
              </Paper>
            );
          })
        ) : (
          <Typography variant="body1">There is no mention</Typography>
        )}
      </div>
    );
  }
}

export default Mentioned;
