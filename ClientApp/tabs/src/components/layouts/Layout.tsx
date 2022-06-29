import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Flex, Text } from '@fluentui/react-northstar';
import { Container } from 'react-bootstrap';
import { getRouteParams } from '../../common/utils/sharedFunctions';
import TopBar from './topBar/TopBar';

import "./Layout.scss";
import { useTeamsFx } from '../../common/lib/useTeamsFx';
const Layout = (): JSX.Element => {
   const { pathname } = useLocation();
   const {
       userScope,
       view,
       action,
       id
   } = getRouteParams(pathname);

   const { context } = useTeamsFx();
   const isTab = context && context?.frameContext === 'content';
   
   return (
      <>
         {isTab &&
            <TopBar loading={false} />
         }
         <Flex fill className={`mmt-layout mmt-${view} mmt-${view}-${action}`}>
            <Container fluid>
               <Outlet />
            </Container>
         </Flex>
      </>
   );
}

export default Layout;