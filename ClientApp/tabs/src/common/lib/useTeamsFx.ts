import { useEffect } from 'react';
import { IdentityType, LogLevel, setLogLevel, setLogFunction, TeamsFx, createMicrosoftGraphClient } from "@microsoft/teamsfx";
import { useData } from "./useData";
import { useTeams } from "msteams-react-base-component";
import { getLocale } from "../utils/sharedFunctions";
import { IProvider, Providers, ProviderState } from '@microsoft/mgt-element';
import { TeamsFxProvider } from '@microsoft/mgt-teamsfx-provider';
import { Client } from "@microsoft/microsoft-graph-client";
import { useAppDispatch } from "../../store";
import { userDetailsChanged } from "../../features/users/userSlice";
import { setLocale } from '../utils/i18n';
import { GraphClient } from '../../services/msGraph/graphClientService';

var startLoginPageUrl = process.env.REACT_APP_START_LOGIN_PAGE_URL;
var functionEndpoint = process.env.REACT_APP_FUNC_ENDPOINT;
var clientId = process.env.REACT_APP_CLIENT_ID;
var graphScope = process.env.REACT_APP_GRAPHSCOPE;

// TODO fix this when the SDK stops hiding global state!
let initialized = false;
let ctxInitialized = false;
let userCtx = {
   title: '' as any,
   upn: '',
   id: '' as any,
   locale: '',
   groupId: '',
   channelId: '',
}

export function useTeamsFx() {
   let graphClient:Client|null = null;
   const dispatch = useAppDispatch();
   const [result] = useTeams({});
   let isAuthenticated = false;
   if (result.context && !ctxInitialized) {
      ctxInitialized = true;
      //debugger;
      userCtx = {
         title: undefined,
         upn: result.context?.userPrincipalName ? result.context?.userPrincipalName.toLowerCase() : '',
         id: result.context?.userObjectId || undefined,
         locale: result.context?.locale || getLocale(),
         groupId: result.context?.groupId || '',
         channelId: result.context?.channelId || '',
      }
   }
   useEffect(() => {
      if (ctxInitialized) {
         dispatch(userDetailsChanged(userCtx));
         setLocale(userCtx.locale);
      }
   }, [dispatch, userCtx]);

   const { error, loading, data, reload } = useData(async () => {
      if (!initialized) {
         if (process.env.NODE_ENV === "development") {
            setLogLevel(LogLevel.Verbose);
            setLogFunction((leve: LogLevel, message: string) => { console.log(message); });
         }
         let scope = graphScope ? graphScope.split(' ') : ['User.Read'];
         const teamsfx = new TeamsFx(IdentityType.User);
			graphClient = await createMicrosoftGraphClient(teamsfx, scope);
         isAuthenticated = true;
         GraphClient.setInstance(graphClient);
         await teamsfx.login(scope);
         console.log("Logged in. FINALLY");
         initialized = true;
         return teamsfx
      }
   });
   return { error, reload, loading, teamsfx: data, isAuthenticated, userCtx, graphClient, ...result };
}
