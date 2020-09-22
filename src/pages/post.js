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
    <Ref.img src="https://picsum.photos/300/200?1" />
    <br/>
    <Link to='/' current='post' next='main'>goto main</Link>
    {/* <PostDetail detail={movieDetail} current='post' next='main' /> */}
  </Ref.section>
}

export default Post;