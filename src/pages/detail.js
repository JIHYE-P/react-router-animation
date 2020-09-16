import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import Layout from '../components/layout';
import PostDetail from '../components/postDetail';
import {getMoviesDetail} from '../utils'
import {Ref} from '../utils/VirtualRouter';

const Detail = ({name}) => {
  const {pathname} = useLocation();
  const [movieDetail, setMovieDetail] = useState([]);  
  useEffect(() => {
    const id = pathname.split('/').pop();
    (async() => {
      const {data: {data: {movie}}} = await getMoviesDetail(id);
      setMovieDetail(movie);
    })();
  }, []);
  
  return <Ref name={`${name}-detail-transform`}>
    <Layout>
      <section style={{padding: '60px 0'}}>
        <PostDetail detail={movieDetail} />
      </section>
    </Layout>
  </Ref>
}

export default Detail;