import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/layout';
import Posts from '../components/posts';
import {getMoviesList} from '../utils'
import {Ref} from '../utils/contextComp';
import Link from '../utils/link';
import {styler, everyFrame, value, listen} from 'popmotion'

const StyledBall = styled.div`
  width: 100%;
  margin: 100px 0;
  div {
    display: inline-block;
    margin: 10px;
    width: 75px;
    height: 75px;
    border-radius: 50%;
    background: olive;
  }
`;

const Main = () => {
  // const [movies, setMovies] = useState([]);
  // useEffect(() => {
  //   (async() => {
  //     const {data: {data: {movies}}} = await getMoviesList({limit: 10});
  //     setMovies(movies);
  //   })();
  // }, []);

  const ball = useRef(null);
  // useEffect(() => {
  //   const target = ball.current;
  //   const ballStylers = Array.from(target.childNodes).map(styler);
  //   const distance = 50;

  //   everyFrame().start(timestamp => ballStylers.map((styler, i) => {
  //     styler.set('y', distance * Math.sin(0.004 * timestamp + (i * 0.5)));
  //   }));
  // }, []);

  return <Ref.section name='main'>
    <Link to='/post' current='main' next='post'>goto post</Link>
    {/* <StyledBall ref={ball}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </StyledBall> */}
    {/* <Posts posts={movies} current='main' next='post' /> */}
  </Ref.section>
}

export default Main;