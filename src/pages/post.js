import React, {useEffect, useState} from 'react';
import {Link, Ref} from '../utils/transition';

const Post = () => {
  return <Ref.section name='post'>
    <Link to='/' seed='fadeInOut'>goto main</Link> <br />
    <Ref.img src="https://picsum.photos/300/200?1" preload={true} name="postImg" />
  </Ref.section>
}

export default Post;