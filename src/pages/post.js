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
  return <div>
    <Ref.section name='post1'></Ref.section>
    <Ref.section name='post2'></Ref.section>
    <Link to='/' seed='fadeInOut'>goto main</Link>
  </div>
}

export default Post;