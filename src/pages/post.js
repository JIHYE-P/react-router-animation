import React from 'react';
import {Link, Ref} from '../utils/transition';

const Post = () => {
  return <Ref.section name='post'>
    <Link to='/' seed='fadeInOut'>goto main</Link> <br />
    <div style={{textAlign: 'center'}}>
      <Ref.img src="https://picsum.photos/450/300?1" preload={true} name="postImg" />
    </div>
  </Ref.section>
}

export default Post;