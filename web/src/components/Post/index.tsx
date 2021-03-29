import React, { useContext, useEffect, useState } from "react";
import { BsHeart, BsBookmark } from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdPaperPlane } from "react-icons/io";
import VideoPlayer from "react-video-js-player";
import moment from "moment";
import "moment/min/moment-with-locales";
import { toast } from "react-toastify";

import LikeButton from "../LikeButton";
import AuthContext from "../../contexts/auth";
import api from "../../services/api";
import defaultUser from "../../assets/defaultUser.png";
import "./styles.scss";

const Post: React.FC<any> = ({ post }) => {
  const { user, signOut } = useContext<any>(AuthContext);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isPostImage, setIsPostImage] = useState(true);
  const [postUser, setPostUser] = useState<any>({});

  useEffect(() => {
    async function getPostUser() {
      const { data } = await api.get(`/user/${post.username}`);
      setPostUser(data);
    }
    getPostUser();
  }, [post.createdAt, post.postUrl, post.user, user]);

  useEffect(() => {
    if (post.postUrl.includes(".mp4")) {
      setIsPostImage(false);
    }
  }, [post.createdAt, post.postUrl]);

  async function handleComment() {
    try {
      await api.post(`/comment/${post._id}`, { body: comment });
      setComment("");
    } catch (err) {
      console.log(err.response.data.errors);
      if (err.response.data.errors.invalid_token) {
        signOut();
        toast.warn("sua sessão acabou!");
      } else {
        toast.error("não foi possível comentar!");
      }
    }
  }

  function handleShowComments() {
    setShowComments(!showComments);
  }

  return (
    <div className="post">
      <div className="post__header">
        <div className="post__header__user">
          <img
            src={
              postUser.profilePhoto ? postUser.profilePhoto.url : defaultUser
            }
            alt="user profile"
          />
          <p>{post.username}</p>
        </div>
        <div className="post__header__options">
          <HiDotsHorizontal />
        </div>
      </div>
      <div className="post__content">
        {isPostImage ? (
          <img src={post.postUrl} alt="" />
        ) : (
          <VideoPlayer width="100%" height="500px" src={post.postUrl} />
        )}
      </div>
      <div className="post__like-section">
        <div className="post__like-section__main-icons">
          <LikeButton user={user} post={post} />
          <span>
            <AiOutlineMessage />
          </span>
          <span>
            <IoMdPaperPlane />
          </span>
        </div>
        <div className="post__like-section__favorite-icon">
          <span>
            <BsBookmark />
          </span>
        </div>
      </div>
      <div className="post__likes">
        <p>{post.likes.length} curtidas</p>
      </div>
      {post.comments.length > 1 ? (
        <div className="post__show-comments">
          <button onClick={handleShowComments}>
            Ver todos os {post.comments.length} comentários
          </button>
        </div>
      ) : (
        ""
      )}

      <div className="post__comments">
        {!showComments && post.comments.length > 0 ? (
          <p>
            <strong>{post.comments[0].username}</strong> {post.comments[0].body}{" "}
            <span className="hour">
              {moment(post.comments[0].createdAt).fromNow(true)}
            </span>
          </p>
        ) : (
          post.comments.map((comment: any) => (
            <p>
              <strong>{comment.username}</strong> {comment.body}{" "}
              <span className="hour">
                {moment(comment.createdAt).fromNow(true)}
              </span>
            </p>
          ))
        )}
      </div>
      <div className="post__hours">
        <p>{moment(post.createdAt).fromNow(true)}</p>
      </div>
      <div className="post__comment"></div>
      <div className="post__add-comment">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          type="text"
          placeholder="Adicione um comentário..."
        />
        <button onClick={handleComment}>Publicar</button>
      </div>
    </div>
  );
};

export default Post;
