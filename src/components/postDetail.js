import React from 'react';
import styled from 'styled-components';
import {Link, Ref} from '../utils/transition';

const StyledDetail = styled.div`
  text-align: center;
  position: relative;
  .thumbnail {
    position: relative;
    ::before {
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      background: rgba(0,0,0,0.25);
    }
    img {width: 100%};
    h3 {
      position: absolute;
      left: 30px;
      bottom: 50px;
      color: #fff;
      font-weight: bold;
      font-size: 23px;
    }
  }
  .content {
    text-align: left;
    font-size: 15px;
    line-height: 24px;
    padding: 30px;
    background: #fff;
    box-shadow: 0px 4px 8px rgba(0,0,0,.15);
  }
  .goBack {
    display: block;
    position: absolute;
    right: 30px;
    top: 30px;
    border: none;
    background: transparent;
    z-index: 1;
    cursor: pointer;
    color: #fff;
    font-size: 25px;
    outline: none;
  }
`;

const PostDetail = ({detail}) => {
  return <StyledDetail>
    <Link to="/"> ✖ </Link>
    <div className="thumbnail">
      <img src={detail.background_image} alt={detail.title} />
      <h3><span>[{detail.year}]</span> {detail.title}</h3>
    </div>
    <div className="content">
      <div>{detail.description_full}</div>
      <div>{detail.description_full}</div>
      <div>{detail.description_full}</div>
    </div>
  </StyledDetail>
}

export default PostDetail;