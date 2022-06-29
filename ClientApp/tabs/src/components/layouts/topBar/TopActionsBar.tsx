import * as React from 'react';
import {
   Segment, Flex, Text, Divider, Button
} from "@fluentui/react-northstar";
import * as microsoftTeams from "@microsoft/teams-js";
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';

import { getBaseUrl, getRouteParams, isCustomerCareScope, isTeamsScope, newId } from '../../../common/utils/sharedFunctions';
import Filters from '../../../features/filters/Filters';
import SearchBox from '../../../features/searchBox/SearchBox';
import ViewType from '../../../features/viewType/ViewType';
import { useTranslation } from 'react-i18next';
import { setViewRequireRefresh } from '../../../common/utils/taskResponseSlice';
import DateRangeFilter from '../../../features/filters/DateRangeFilter';

const TopActionsBar = (props: { loading: boolean }): JSX.Element => {
   const { loading } = props;
   const { t, i18n } = useTranslation();
   const { userScope, view, action } = getRouteParams(window.location.hash);
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const customerCareScoped = isCustomerCareScope();
   const dispatch = useAppDispatch();
   const entityName: string = customerCareScoped ? "entity.case" : "entity.request";

   
   const renderViewTypeButtons = () => {
      return <>
               {isCustomerCareScope() ? <ViewType></ViewType> : <></>}
             </> 
   }

   const renderFilterButtons = () => {
      return <><Col>
         <DateRangeFilter></DateRangeFilter>
      </Col>
      <Col>
         <Filters></Filters> 
      </Col></>
   }

   const renderSearchText = () => {
      return <Col>
         <SearchBox></SearchBox>
      </Col>
   }

   const submitHandler = (err: any, result: any) => {
      if (result === "refresh") {
         dispatch(setViewRequireRefresh(true));
      }
   };

   const handleOnClick = (_event: any, _action: string, _id: string) => {
      var groupId = currentCtx.groupId;

      if (customerCareScoped === true) {
         if (groupId === '') groupId = process.env.REACT_APP_CUSTOMERCARE_GROUPID || '';

         let entity = 'Case';
         const taskInfo = {
            url: getBaseUrl() + `/${userScope}/${view}/${_action}/${groupId}/${_id}`,
            title: `New ${entity}`,
            height: microsoftTeams.TaskModuleDimension.Small,
            width: microsoftTeams.TaskModuleDimension.Small, 
         };
         microsoftTeams.tasks.startTask(taskInfo, submitHandler);
      } else {
         if (groupId === '') groupId = process.env.REACT_APP_ITSUPPORT_GROUPID || '';
         let entity = 'Ticket';
         const taskInfo = {
            url: getBaseUrl() + `/${userScope}/${view}/${_action}/${groupId}/${_id}`,
            title: `New ${entity}`,
            height: microsoftTeams.TaskModuleDimension.Medium,
            width: microsoftTeams.TaskModuleDimension.Medium, 
         };
         microsoftTeams.tasks.startTask(taskInfo, submitHandler);
      }
   }

   return (<Container fluid>
      <Row key='topActionsBar-row' className='mmt-topActionsBar'>
         <Col>
            <Flex >
               <Button content={t('common:button.newEntity', {entity: t(entityName, {count:1})})}
                  onClick={(event) => handleOnClick(event, isCustomerCareScope() ? 'search' : 'new', newId())}
                  primary />
               {renderViewTypeButtons()}
            </Flex>
         </Col>
         
         {renderFilterButtons()}
         {renderSearchText()}
      </Row>
   </Container>)

}

export default TopActionsBar;