import React from 'react';
import styled from 'styled-components';

const StyledLayout = styled.section`
  width: 1020px;
  margin: 0 auto;
`;

const Layout = React.forwardRef((props, ref) => {
  return <StyledLayout ref={ref} {...props}>
    {props.children}
  </StyledLayout>
});

export default Layout;