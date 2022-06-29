import { useEffect, useMemo, useState } from "react";
import { AcceptIcon, ApprovalsAppbarIcon, Button, EditIcon, EyeFriendlierIcon, Flex, gridCellWithFocusableElementBehavior, Loader as FluentLoader, Pill, Popup, Table, Text, TrashCanIcon } from "@fluentui/react-northstar";
import { getBaseUrl, getLocaleDate, upperFirstLetter } from "../../common/utils/sharedFunctions";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import Loader from "../../components/common/Loader";
import { useTypedSelector, RootState } from "../../store";
import { IUserModel } from "../../common/types/user";
import { differenceInDays, formatDistance, formatRelative } from "date-fns";
import { useGetAllUsersQuery } from "./userService";
import { defaultAvatar } from "../../common/utils/commonVariables";
import { useLazyGetManyGraphUsersQuery } from "../../services/msGraph/graphApiService";
import { IDetailedUserModel } from "../../common/types/user";
import * as microsoftTeams from "@microsoft/teams-js";
import { createSelector } from "@reduxjs/toolkit";
import './UsersList.scss';

export interface IHeader {
   key: string;
   items: {
      content: string;
      key: string;
   }[];
}

export interface ICell {
   content: string | JSX.Element;
   key: string;
   truncateContent?: boolean;
}

export interface IRow {
   key: string;
   items: ICell[];
}
const UsersList = (): JSX.Element => {
   const { t, i18n } = useTranslation();
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);


   const searchQuery = useTypedSelector((state: RootState) => state.search);
   const selectedFilters = useTypedSelector((state: RootState) => state.filters);
   const selectFilterResults = useMemo(() => {
      // Return a unique selector instance for this page so that
      // the filtered results are correctly memoized
      return createSelector(
         (res: any) => res.data,
         (data) => {
            let dataResult = data ? data as IUserModel[] : undefined;
            let totalFilters = 0; //selectedFilters.map(x => x.value).length === 0 ? '' : `(${selectedFilters.length})`;
            selectedFilters.map(x => x.value).forEach(x => totalFilters += x.length);
            return dataResult ?
               dataResult.filter((x: IUserModel) => x.title.toLowerCase().includes(searchQuery))
               : undefined
         }
      )
   }, [selectedFilters, searchQuery]);


   const { filteredData, isLoading: isLoadingGetUsersByUser, isFetching: isFetchingGetUsersByUser } = useGetAllUsersQuery(undefined, {
      selectFromResult: result => {
         return ({
            ...result,
            filteredData: selectFilterResults(result)
         })
      }
   });
   let allItems: IUserModel[] = filteredData || [];

   const [trigger, result] = useLazyGetManyGraphUsersQuery();
   const allUsers = result.data || [];

   useEffect(() => {
      if (!allItems) return;
      //trigger(allUserUPNs);
   }, [isFetchingGetUsersByUser]);


   // const handleTotalLevelChange = (event: any, increaseLevels: boolean) => {
   //    event.preventDefault();
   //    try {
   //       setAddLevelStatus('pending');
   //       let nxtLvl = allLevels.length + 1;
   //       let defaultLvl = {
   //          endorsementType: "",
   //          level: nxtLvl,
   //          availablePersonas: ['user', 'pa'],
   //          requiredPersonas: ['user'],
   //          users: [],
   //          status: "",
   //          outcome: "",
   //          id: `${nxtLvl}-${new Date().getTime()}`,
   //          title: "User & PA",
   //          createdTimestamp: 0,
   //          modifiedTimestamp: 0,
   //          active: false,
   //       };
   //       dispatch(levelAdded(defaultLvl));
   //    } catch (err) {
   //       console.error('Failed to save the post: ', err)
   //    } finally {
   //       setAddLevelStatus('idle');
   //    }
   // }
   const header = {
      className: 'mmt-header',
      key: 'browseUsers-header',
      items: [
         {
            content: t('common:header.user'),
            key: 'browseUsers-h-user',
            styles: {
               maxWidth: '220px'
            }
         },
         {
            content: t('common:header.personaType'),
            key: 'browseUsers-h-personaType',
            styles: {
               maxWidth: '220px',
            }
         },
         {
            content: '',
            key: 'browseUsers-h-actions',
            styles: {
               maxWidth: '100px',
            }
         },
      ],
   }

   const getStatusControl = (_outcome: string) => {
      let statusColor = 'orange';
      let statusContent = '';
      let outcome = _outcome || 'pending';
      switch (outcome) {
         case 'approved':
            statusContent = `Approved`;
            statusColor = 'green';
            break;
         case 'rejected':
            statusContent = `Rejected`
            statusColor = 'red';
            break;
         case 'withdrawn':
            statusContent = `Withdrawn`
            statusColor = 'grey';
            break;
         default:
            statusContent = `Under Review`
            break;
      }
      return <Text content={statusContent} color={statusColor} />
   }

   const getPersonaTypes = (_personaTypes: string[]) => {
      return (<Flex column>
         {_personaTypes.map((persona,i) => 
            <Text content={t(`form.personaType.value.${persona}`)} key={`${persona}-${i}`} />
         )}
      </Flex>)

   }

   const getUserPill = (_user: IUserModel) => {

      return <Pill className="mmt-userPill" key={`pill-${_user.id}`} image={`${_user.image || defaultAvatar}`} size="small" disabled>
         {_user.title}
      </Pill>
   }

   const getRowActions = (_user: IUserModel) => {

      return (<Button.Group buttons={[{
         icon: <EditIcon size='small' />,
         key: `edit-${_user.id}`,
         iconOnly: true,
         text: true,
         title: 'edit',
         onClick: (event: any) => handleOnActionClick(event, 'edit', _user.id)
      }, {
         icon: <TrashCanIcon size='small' />,
         key: `delete-${_user.id}`,
         iconOnly: true,
         text: true,
         title: 'delete',
         onClick: (event: any) => handleOnActionClick(event, 'delete', _user.id)
      }]} />);
   };

   const getUserRows = (_users: IUserModel[]) => {
      let actingUsers = [..._users].sort((x: IUserModel) => x.modifiedTimestamp);
      const rows = actingUsers.map((x, i) => ({
         className: 'mmt-table-row',
         key: `user-${x.id}`,
         items: [
            {
               content: getUserPill(x),
               truncateContent: true,
               key: `col-createdByDisplayName-index-${i}`,
               styles: {
                  maxWidth: '220px',
               }
            },
            {
               content: getPersonaTypes(x.personaTypes),
               truncateContent: true,
               key: `col-currentApprover-index-${i}`,
               styles: {
                  maxWidth: '220px',
               }
            },
            {
               content: getRowActions(x),
               key: `col-actions-index-${i}`,
               styles: {
                  maxWidth: '100px',
               },
               accessibility: gridCellWithFocusableElementBehavior,
               onClick: (e: any) => {
                  e.stopPropagation()
               }
            },
         ]
      }));
      return rows;
   }

   const handleOnActionClick = (_event: any, _action: string, _id: string) => {

      const submitHandler = (err: any, result: any) => {
         //alert(result);
      };


      const taskInfo = {
         url: getBaseUrl() + `/me/users/${_action}/${_id}`,
         title: `${upperFirstLetter(_action)} User`,
         height: 200,
         width: 500,
      };
      microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }

   const isLoading = isLoadingGetUsersByUser || isFetchingGetUsersByUser || result.isLoading || result.isFetching;
   return (
      <Flex fill column>
         {/* <Text content={t('form.userStatus.label')} className={'ui-form__label'} /> */}
         {(isLoading || !allItems) ? <Loader message={t('common:entity.user', { count: 0 })} />
            :
            (allItems.length > 0 ?
               <Table
                  className={`mmt-table`}
                  header={header as any}
                  rows={getUserRows(allItems)}
                  variables={{ cellContentOverflow: 'none' }}
                  aria-label='Nested navigation'
               />
               :
               <Flex fill hAlign='center' padding='padding.medium'>
                  <Text content={t('common:error.noItems', { entity: t('common:entity.user', { count: 0 }) })} size='large' weight={'semibold'} />
               </Flex>
            )
         }
      </Flex>
   );
}

export default UsersList;