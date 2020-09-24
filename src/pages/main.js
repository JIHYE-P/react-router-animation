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

  return <Ref.section name='main'>
    <Link to='/post' seed='fadeInOut'>goto post</Link>
    <div style={{margin: '30px 0'}}>
      {movies && movies.map((movie, i) => 
        // 클릭한 포스트 index 값..필요
        <Ref.div key={i} group={['postThumb', i]} to='/post' name="wrapper">
          <Ref.img group={['postThumb', i]} src={movie.small_cover_image} preload={true} name="img" />
          <Ref.h3 group={['postThumb', i]} name="text" className="title">{movie.title}</Ref.h3>
        </Ref.div>
      )}
    </div>
    {/* <div style={{margin:'30px 0'}}>
      <Ref.div group={['notice', 0]} to='/post' name="wrapper">
        <Ref.img src="https://picsum.photos/300/200" preload={true} />
      </Ref.div>
    </div> */}
  </Ref.section>
}

export default Main;