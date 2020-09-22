import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import Layout from '../components/layout';
import PostDetail from '../components/postDetail';
import {getMoviesDetail} from '../utils'
import {Ref} from '../utils/contextComp';
import Link from '../utils/link';

const Post = () => {
  // const {pathname} = useLocation();
  // const [movieDetail, setMovieDetail] = useState([]);  
  // useEffect(() => {
  //   const id = pathname.split('/').pop();
  //   (async() => {
  //     const {data: {data: {movie}}} = await getMoviesDetail(id);
  //     setMovieDetail(movie);
  //   })();
  // }, []);
  
  return <Ref.section name='post'>
    <Ref.img src="https://picsum.photos/300/200" preload={true} />
    <br/>
    <Link to='/'>goto main</Link>
    <br/>
    <Ref.img src="https://picsum.photos/300/200?1" preload={true} />
    {/* <PostDetail detail={movieDetail} current='post' next='main' /> */}
  </Ref.section>
}

export default Post;