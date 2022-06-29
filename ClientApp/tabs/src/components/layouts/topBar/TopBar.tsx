import * as React from 'react';
import { Segment, Flex, Text } from "@fluentui/react-northstar";
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation } from "react-router-dom";
import { getRouteParams } from '../../../common/utils/sharedFunctions';
import TopActionsBar from './TopActionsBar';


import "./TopBar.scss";
const TopBar = (props: { loading: boolean }): JSX.Element => {
   const { pathname } = useLocation();
   const { loading } = props;
   const {
      userScope,
      view,
      action,
      id
   } = getRouteParams(pathname);

   return (
      <Flex className='mmt-topBar' column>
         <Segment>
            <TopActionsBar loading={loading} />
         </Segment>
      </Flex>
   );
}

export default TopBar;