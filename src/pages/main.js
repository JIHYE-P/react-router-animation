import React, {useEffect, useState} from 'react';
import {Link, Ref, groupRefMap} from '../utils/transition';

const Main = () => {
  return <Ref.section name='main'>
    <Link to='/post' seed='fadeInOut'>goto post</Link>
    <br/>
    <div style={{margin: '30px 0'}}>
      {groupRefMap([1,2,3], (item, i, group) => 
        <Ref.div key={i} to='/post' {...group('inner')}>
          <Ref.img src={`https://picsum.photos/200/150?${item}`} preload={true} {...group('img')} />
          <Ref.h3 {...group('text')}>{item}. title~~~</Ref.h3>
        </Ref.div>
      )}
    </div>
  </Ref.section>
}

export default Main;