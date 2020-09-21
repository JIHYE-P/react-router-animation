import React from 'react';
import {Route} from 'react-router-dom';

import Main from './pages/main';
import Post from './pages/post';

const Pages = () => <>
  <Route exact path='/' render={_=><Main />} />
  <Route path='/post' render={_=><Post />} />
</>

export default Pages
