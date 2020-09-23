import React from 'react';
import styled from 'styled-components';
import {Link, Ref} from '../utils/transition';

const StyledPosts = styled.ul`
  li {
    display: inline-block;
    vertical-align: top;
    padding: 10px;
    width: 25%;
  }
  .inner {
    position: relative;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0,0,0,.25);
    background: #fff;
    cursor: pointer;
    .thumbnail {
      padding-bottom: 100%;
      overflow: hidden;
      border-radius: 10px 10px 0 0;
    }
    h3 {
      width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 13px;
      font-weight: bold;
      padding: 12px;
      span {
        font-weight: normal;
      }
    }
  }
`

const Posts = ({posts}) => {
  return <StyledPosts>
    {posts.map((movie, i) => <li key={`movie-${i}`}>
      <Link to={`/post/${movie.id}`}>
        <div className="inner">
          <div className="thumbnail" style={{background: `url(${movie.background_image}) no-repeat center / cover`}}></div>
          <h3 className="title"><span>[{movie.year}]</span> {movie.title}</h3>
        </div>
      </Link>
    </li>)}
  </StyledPosts>
}

export default Posts;