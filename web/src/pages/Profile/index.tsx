import React, { useContext, useState, useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import { MdGridOn } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router";

import { ISocketFollowingProps } from "../../interfaces/ISocket";
import IUser from "../../interfaces/IUser";
import Loading from "../../components/Loading";
import FollowButton from "../../components/Follow";
import { useSocket } from "../../contexts/SocketProvider";
import AuthContext from "../../contexts/AuthProvider";
import api from "../../services/api";
import "./styles.scss";

const Profile = () => {
  const { user: currentUser } = useContext<any>(AuthContext);
  const socket = useSocket();
  const { pathname } = useLocation();
  const username = pathname.replace("/profile/", "");
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<IUser[]>([] as IUser[]);
  const [user, setUser] = useState<IUser>({
    _id: "",
    name: "",
    email: "",
    profilePhoto: {
      url: "",
      publicId: "",
    },
    username: "",
    friends: [],
    followers: [],
  });

  useEffect(() => {
    if (socket == null) return;
    socket.on(
      "following",
      ({ user: followingUser, friendUser }: ISocketFollowingProps) => {
        if (username === followingUser.username) {
          setUser(followingUser);
        } else if (username === friendUser.username) {
          setUser(friendUser);
        }
      }
    );
  }, [pathname, socket, user, user.username, username]);

  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      const { data: userData } = await api.get(`/user/${username}`);
      const { data: posts } = await api.get(`/posts/${username}`);
      setIsLoading(false);
      setUserPosts(posts);
      setUser(userData);
    }
    loadUserData();
  }, [username]);

  return (
    <>
      {isLoading && <Loading />}
      <div className="profile">
        <main className="profile__main">
          <div className="profile__main__image">
            {isLoading ? (
              <FaUserCircle />
            ) : (
              <img src={user.profilePhoto.url} alt="user" />
            )}
          </div>
          <div className="profile__main__info">
            <div className="profile__main__info__username">
              {user.username}
              {user.username !== currentUser.username ? (
                <FollowButton key={user._id} user={user} />
              ) : (
                <>
                  <button>Editar Perfil</button> <FiSettings />
                </>
              )}
            </div>
            <div className="profile__main__info__social">
              <div className="profile__main__info__social__item">
                <strong>{userPosts.length}</strong> publicações
              </div>
              <div className="profile__main__info__social__item">
                <strong> {user.followers.length} </strong>
                seguidores
              </div>
              <div className="profile__main__info__social__item">
                <strong>{user.friends ? user.friends.length : 0}</strong>{" "}
                seguindo
              </div>
            </div>
            <div className="profile__main__info__name">
              <strong>{user.name}</strong>
            </div>
          </div>
        </main>
        <div className="profile__bar">
          <div className="profile__bar__item active">
            <MdGridOn /> Publicações
          </div>
          {/* <div className="profile__bar__item">
                {" "}
                <MdFlashOn /> IGTV
              </div>
              <div className="profile__bar__item">
                <BsBookmark /> Salvos
              </div>
              <div className="profile__bar__item">
                <BiUserPin />
                Marcados
              </div> */}
        </div>
        <div className="profile__content">
          <div className="profile__content__publications">
            {userPosts &&
              userPosts.map((post: any) => (
                <div key={post._id}>
                  {post.postUrl.includes(".mp4") ? (
                    <video src={post.postUrl} />
                  ) : (
                    <img src={post.postUrl} alt="" />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
