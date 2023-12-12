import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import axios from "axios";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
      advancedFeature: this.props.advancedFeature,
    };

    console.log(this.state.users);
  }

  static countUserPhotos(userId) {
    return axios
      .get(`/photosAndCommentsCountOfUser/${userId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching photo count of user: ", error);
      });
  }

  componentDidMount() {
    axios
      .get("http://localhost:3000/user/list")
      .then((response) => {
        const users = response.data;
        Promise.all(
          users.map((user) => UserList.countUserPhotos(user._id))
        ).then((counts) => {
          const usersWithCounts = users.map((user, index) => ({
            ...user,
            photoCount: counts[index].photoCount,
            commentCount: counts[index].commentCount,
          }));
          this.setState({ users: usersWithCounts });
        });
      })
      .catch((error) => {
        console.error("Error fetching user list: ", error);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.advancedFeature !== prevProps.advancedFeature) {
      this.setState({ advancedFeature: this.props.advancedFeature });
    }
  }

  render() {
    return (
      <div>
        {this.state.users && (
          <List component="nav">
            {this.state.users.map((user) => {
              const fullName = `${user.first_name} ${user.last_name}`;
              return (
                <div key={user._id} className="user-container">
                  <div>
                    <ListItem button component={Link} to={`/users/${user._id}`}>
                      <ListItemText primary={fullName} />
                    </ListItem>
                    {this.state.advancedFeature && (
                      <>
                        <Typography
                          variant="body1"
                          className="green"
                          component={Link}
                          to={`/userComments/${user._id}`}
                        >
                          {user.commentCount}
                        </Typography>
                        <div>{user.photoCount}</div>
                      </>
                    )}
                  </div>
                  <Divider />
                </div>
              );
            })}
          </List>
        )}
      </div>
    );
  }
}

export default UserList;
