import React from "react";
import { Typography, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import axios from "axios";
import Mentioned from "../Mentioned/index.jsx";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
function toCamelCase(string) {
  string = string.replace(/_/g, " ");
  return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetail: null,
    };
  }
  
  getUserDetail = (callback) => {
    axios.get(`http://localhost:3000/user/${this.props.match.params.userId}`)
      .then(response => {
        this.setState({ userDetail: response.data }, callback);
      })
      .catch(error => {
        console.error('Error fetching user detail: ', error);
      });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.getUserDetail(() => {
        const firstname = this.state.userDetail.first_name;
        const lastname = this.state.userDetail.last_name;
        this.props.callback(`${firstname} ${lastname}`, "userDetail");
      });
    }
  }

  componentDidMount() {
    this.getUserDetail(() => {
      const firstname = this.state.userDetail.first_name;
      const lastname = this.state.userDetail.last_name;
      this.props.callback(`${firstname} ${lastname}`, "userDetail");
    });
  }

  componentWillUnmount() {
    this.props.callback("Welcome");
  }

  render() {
    return (
      this.state.userDetail && (
        <div className="detail-container">
          {Object.keys(this.state.userDetail).map((key) => {
            if (key !== "_id") {
              return (
                <Paper className="detail-item" key={key}>
                  <Typography variant="h6">{toCamelCase(key)}</Typography>
                  <Typography variant="body1">{this.state.userDetail[key]}</Typography>
                </Paper>
              );
            } else {
              return null;
            }
          })}
          <Link to={`/photos/${this.state.userDetail._id}`}>
            <Button variant="contained">PHOTOS</Button>
          </Link>
          <Mentioned userId={this.props.match.params.userId}/>
        </div>
      )
    );
  }
}

export default UserDetail;
