import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import Posts from '../components/posts';
import {getMoviesList} from '../utils'
import {Link, Ref} from '../utils/transition';

const listStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
  padding: '10px',
  width: '25%',
  fontSize: '13px'
}

const Main = () => {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    (async() => {
      const {data: {data: {movies}}} = await getMoviesList({limit: 3});
      setMovies(movies);
    })();
  }, []);

  return <div>
    <Ref.section name='main1'></Ref.section>
    <Ref.section name='main2'></Ref.section>
    <Link to='/post' seed='fadeInOut'>goto post</Link>
    <div style={{margin: '30px 0'}}>
      {/* {movies && movies.map((movie, i) => 
        <Ref.div to='/post' name="wrapper" key={i}>
          <Ref.img src={movie.small_cover_image} alt={movie.title} preload={true} name="img" />
          <br/>
          <Ref.h3 name="text" className="title"><span>[{movie.year}]</span> {movie.title}</Ref.h3>
        </Ref.div>
      )} */}
    </div>
  </div>
}

export default Main;