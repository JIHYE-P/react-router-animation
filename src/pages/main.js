import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import Posts from '../components/posts';
import {getMoviesList} from '../utils'
import {Ref} from '../utils/VirtualRouter';

const Main = () => {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    (async() => {
      const {data: {data: {movies}}} = await getMoviesList({limit: 10});
      setMovies(movies);
    })();
  }, []);
  
  return <Ref name={`post-transform`}>
    <Layout>
      <section style={{padding: '60px 0'}}>
        <Posts posts={movies} />
      </section>
    </Layout>
  </Ref>
}

export default Main;