import React from 'react';
import {Route} from 'react-router-dom';

import Main from './pages/main';
import Detail from './pages/detail';

const Pages = () => <>
  <Route exact path='/' render={_=><Main />} />
  <Route path='/post/:id' render={_=><Detail />} />
</>

export default Pages
