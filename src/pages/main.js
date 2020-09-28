import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import Posts from '../components/posts';
import {getMoviesList} from '../utils'
import {Button, Link, Ref} from '../utils/transition';

//transition 유틸리티
let groupUid = 0;
const group = (groupUid, index) => refName => ({group: [groupUid, index], name: refName});
const groupMap = (array, f) => {
  const current = 'group-uid-'+groupUid++;
  return array.map((item, i) => f(item, i, group(current, i)));
}

const Main = () => {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    (async() => {
      const {data: {data: {movies}}} = await getMoviesList({limit: 3});
      setMovies(movies);
    })();
  }, []);

  return <Ref.section name='main'>
    <Link to='/post' seed='fadeInOut'>goto post</Link>
    <br/>
    <div style={{margin: '30px 0'}}>
      {groupMap(movies, (movie, i, group) => 
        <Ref.div key={i} to='/post' {...group('wrapper')}>
          <Ref.img src={movie.small_cover_image} preload={true} {...group('img')} />
          <Ref.h3 {...group('text')} className="title">{movie.title}</Ref.h3>
        </Ref.div>
      )}
    </div>
  </Ref.section>
}

export default Main;