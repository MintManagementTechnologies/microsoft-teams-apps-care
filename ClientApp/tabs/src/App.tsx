import * as React from 'react';
import { Provider, teamsTheme, mergeThemes } from "@fluentui/react-northstar";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { TeamsFxContext } from "./Context";
import { useEffect, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useTeamsFx } from './common/lib/useTeamsFx';
import { useTypedSelector, RootState, useAppDispatch } from './store';
import Loader from './components/common/Loader';
import Layout from "./components/layouts/Layout";
import PopupModal from './features/popupModal/PopupModal';
import TabConfigModal from './views/tabConfigModal/TabConfigModalITCare';
import colorScheme from './common/utils/colorScheme';
import { userDetailsChanged } from './features/users/userSlice';
import { useGetGraphUserQuery, useGetTeamChannelDataQuery } from './services/msGraph/graphApiService';

import CustomerCareTab from './views/customerCareTabs/CustomerCareTab';
import ITcareTab from './views/ITcareTabs/ITcareTab';
import { isCustomerCareScope } from './common/utils/sharedFunctions';
import { setTeamChannels } from './common/utils/teamChannelsSlice';
import "./App.scss";
import { useGetTownsQuery } from './services/townService';
import { setTowns } from './common/utils/townSlice';
import { useGetTicketCategoriesQuery } from './services/ticketCategoryService';
import { setTicketCategories } from './common/utils/ticketCategorySlice';
import TabConfigModalCustomerCare from './views/tabConfigModal/TabConfigModalCustomerCare';
import TabConfigModalITCare from './views/tabConfigModal/TabConfigModalITCare';
/**
 * The main app which handles the initialization and routing
 * of the app.
 */
// var graphScope = process.env.REACT_APP_GRAPHSCOPE;

export default function App() {
   const { loading, theme, themeString, teamsfx } = useTeamsFx();
   const dispatch = useAppDispatch();

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const [groupId, setGroupId] = useState('');
   const { data: dataGetUser, isLoading: isLoadingGetUser, isFetching: isFetchingGetUser } = useGetGraphUserQuery(currentUser ? currentUser.upn : skipToken);
   const { data: dataGetChannelsData, isLoading: isLoadingChannelInfo, isFetching: isFetchingChannelInfo } = useGetTeamChannelDataQuery((groupId !== '') ? groupId : skipToken);
   const { data: dataTowns, isLoading: isLoadingTowns, isFetching: isFetchingTowns } = useGetTownsQuery('');
   const { data: dataTicketCategories, isLoading: isLoadingTicketCategories, isFetching: isFetchingTicketCategories } = useGetTicketCategoriesQuery('');
   
   useEffect(() => {
      if(!dataGetUser) return;
      const userCtx = {
         title: dataGetUser.title,
         upn: dataGetUser.upn.toLowerCase(),
         id: dataGetUser.id
      };
      dispatch(userDetailsChanged(userCtx));
      
   }, [dataGetUser, dispatch])

   useEffect(() => {
      if (currentUser === undefined || currentUser === null) return;
      if (currentUser.groupId === '') {
         if (isCustomerCareScope() === true) {
            setGroupId(process.env.REACT_APP_CUSTOMERCARE_GROUPID || '');
         } else {
            setGroupId(process.env.REACT_APP_ITSUPPORT_GROUPID || '');
         }
      } else {
         setGroupId(currentUser.groupId);
      }
   }, 
   [currentUser]);

   useEffect(() => {
      if (dataGetChannelsData === undefined || dataGetChannelsData === null || dataGetChannelsData.length === 0) return;
      dispatch(setTeamChannels(dataGetChannelsData));
   }, [dataGetChannelsData]);

   useEffect(() => {
      if (!dataTowns) return;
      dispatch(setTowns(dataTowns));
   }, [dataTowns])

   useEffect(() => {
      if (!dataTicketCategories) return;
      dispatch(setTicketCategories(dataTicketCategories));
   },
   [ dataTicketCategories ])

   const customTheme = {
      componentVariables: {
         Button: {
            tintedBorderColor: "#e1e1e1",
            tintedBorderColorHover: "transparent",
         },
      },
      siteVariables: {
         colorScheme: colorScheme
      }
   }

   // const { loading: graphLoading, data: graphData, reload: graphReload } = useGraph(
   //    async (graph): Promise<any> => {
   //       console.log('App-setInstance');
   //       GraphClient.setInstance(graph);
   //       return { graphData, graphLoading };
   //    },
   //    { scope: graphScope }
   // );
   // <Button primary content="Authorize" disabled={loading} onClick={graphReload} />
   const mergedTheme = mergeThemes(theme, customTheme);
   // const api_regex = /^\/api\/.*/;
   // if (api_regex.test(window.location.pathname)) {
   //    return <div /> // must return at least an empty div
   // }
   const isLoading = isLoadingGetUser || isFetchingGetUser || loading || 
      isLoadingChannelInfo || isFetchingChannelInfo ||
      isLoadingTowns || isFetchingTowns ||
      isLoadingTicketCategories || isFetchingTicketCategories;
   return (
      <TeamsFxContext.Provider value={{ theme, themeString, teamsfx }}>
         <Provider theme={mergedTheme || teamsTheme}>
            <div className={`mmt-appContainer mmt-${themeString}`} >
               <Router>
                  {isLoading ? (
                     <Loader message={'App'} />
                  ) : (
                     <>
                        <Routes>
                           <Route path="/" element={<Layout />}>
                              <Route path=":userScope" >
                                 <Route path={"customer"} >
                                    <Route path="browse/:pageIndex/" element={<CustomerCareTab />} />
                                 </Route>
                                 <Route path={"it"} >
                                    <Route path="browse/:pageIndex/" element={<ITcareTab />} />
                                 </Route>
                                 <Route path={":view"} >
                                    <Route path={":action"}>
                                       <Route path={":groupId"}>
                                          <Route path=":id" element={<PopupModal />}/>
                                       </Route>
                                       
                                    </Route>
                                 </Route>
                              </Route>
                              <Route path="tabconfigcustomercare" element={<TabConfigModalCustomerCare />} />
                              <Route path="tabconfigitcare" element={<TabConfigModalITCare />} />
                           </Route>
                        </Routes>
                     </>
                  )}
               </Router>
            </div>
         </Provider>
      </TeamsFxContext.Provider>
   );
}
