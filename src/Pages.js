import React from 'react';
import {Route} from 'react-router-dom';

import Main from './pages/main';
import Detail from './pages/detail';

const Pages = ({name}) => <>
  <Route exact path='/' render={_=><Main name={name} />} />
  <Route path='/post/:id' render={_=><Detail name={name} />} />
</>

export default Pages
