import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useLocation} from 'react-router-dom';
import Layout from '../components/layout';
import PostDetail from '../components/postDetail';
import {getMoviesDetail} from '../utils'
import {Link, Ref} from '../utils/transition';

const StyledDetail = styled.div`
  width: 400px;
  margin: 50px auto; 
  background: #fff;
  text-align: center;
  position: relative;
`;


const Post = () => {
  return <Ref.section name='post'>
    <Ref.img src="https://picsum.photos/300/200?1" preload={true} />
    <Ref.img src="https://picsum.photos/300/200" preload={true} />
    <br />
    <Link to='/' seed='fadeInOut'>goto main</Link>
  </Ref.section>
}

export default Post;