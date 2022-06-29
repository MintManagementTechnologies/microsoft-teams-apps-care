import * as microsoftTeams from "@microsoft/teams-js";
import { Flex, Form, FormInput, FormTextArea, FormDropdown, Checkbox, ChatIcon, Button } from "@fluentui/react-northstar";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ISimpleUserModel } from "../../common/types/user";
import { getPriorityOptions } from "../../common/utils/formVariables";
import GraphPeoplePicker from "../../components/common/graphPeoplePicker/GraphPeoplePicker";
import { useSearchGraphUsersQuery } from "../../services/msGraph/graphApiService";
import { useAppDispatch, useTypedSelector, RootState } from "../../store";
import Attachments from "../attachment/Attachments";
import { ticketUpdated } from "./ticketSlice";
import { ITicketModel } from "./types";
import './TicketForm.scss'
import { getPrimaryChannel } from "../../common/utils/teamsChannelHelper";

const TicketForm = (props: { item: ITicketModel, formMode: string }): JSX.Element => {
   const { item, formMode } = props;
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const { groupId, id } = useParams<{ action: string, view: string, groupId: string, id: string }>(); 

   const [ itemState, setItemState ] = useState(item); 
   const [ technicians, setTechnicians ] = useState<{header:string, key:string}[]>();
   const [ selectedTechnician, setSelectedTechnician ] = useState('');
   const [ currentUserIsTech, setCurrentUserIsTech ] = useState(false);
   const [ isVisible, setIsVisible ] = useState(true);
   const { data: graphUser, isLoading: isLoadingGraphUser, isFetching: isFetchingGraphUser } = useSearchGraphUsersQuery((formMode === 'new') ? skipToken : item.requesterUPN);

   const ticketCategories = useTypedSelector((state: RootState) => state.ticketCategories);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const ticketCategoriesDropDown = ticketCategories.ticketCategories.map(i => ( { header: i.categoryName, key: i.id } ));
   const [ requestor, setRequestor ] = useState<ISimpleUserModel | undefined>(undefined);

   useEffect(() => {
      if (!itemState) return;

      setIsVisible(itemState.isVisible);   
      dispatch(ticketUpdated(itemState));
   }, [itemState, dispatch]);

   useEffect(() => {
      if ((teamChannels?.channels?.length ?? -1 > 0) && !!currentCtx) {
         const primaryChannel = getPrimaryChannel(teamChannels.channels);
         if (primaryChannel !== null) {
            var technicianDropDown = primaryChannel.members.map(i => (
               {
                  header: i.displayName,
                  key: i.upn
               }));
            const checkCurrentTech = (primaryChannel.members.find(x => x.id === currentCtx.id) !== undefined);
            setTechnicians(technicianDropDown);
            setCurrentUserIsTech(checkCurrentTech);

         }
         setSelectedTechnician(itemState.assignedToUPN);

      }
   }, [ teamChannels, currentCtx ])

   useEffect(() => {
      if (!(graphUser && graphUser.length)) 
         return;
      setRequestor(graphUser[0]);
   }, 
   [ graphUser ])

   useEffect(() => {
      handleMultiInputChange(null, [ { field: 'isVisible', value: isVisible } ])
   }, 
   [ isVisible ])

   useEffect(() => {
      handleMultiInputChange(null, [{ field: 'assignedToUPN', value: selectedTechnician }]);
   }, 
   [ selectedTechnician ])
 
   const handleMultiInputChange = (event: any, keyValuePair: { field: string, value: any }[]) => {
      if (event !== null) event.preventDefault();
       
      let _item = { ...itemState };
      keyValuePair.forEach(x => {
         //@ts-ignore
         _item[x.field] = x.value;
      });
      setItemState(_item);
   }

   const handlePickerChange = (_user: ISimpleUserModel | ISimpleUserModel[], _fieldId?: string) => {
      if (!_fieldId || Array.isArray(_user)) return;
      handleMultiInputChange(null, [{ field: _fieldId, value: (_user === undefined ? '' : _user.upn) }]);
   }

   const handleChatClick = () => {
      const message = encodeURI(`Request Reference: ${itemState.referenceNo}`);
      const deepLinkUrl = `https://teams.microsoft.com/l/chat/0/0?users=${itemState.requesterUPN}&message=${message}`;
      microsoftTeams.executeDeepLink(deepLinkUrl);
   }

   const viewingOnly = (formMode === 'view');
   const isNewForm = (formMode === 'new');

   return (
      <>
      <Form className={`mmt-form-request`} >
         <Row>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-subject`}>
                  <FormInput
                     defaultValue={item.title}
                     disabled={viewingOnly}
                     fluid
                     required
                     label={`${t('form.requestTitle.label')}`}
                     placeholder={t('form.requestTitle.placeholder')}
                     onChange={(event, ctrl) =>
                        handleMultiInputChange(event,
                           [{ field: `title`, value: ctrl?.value || '' }])
                     }
                  />
               </Flex>
            </Col>
         </Row>
         <Row>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-type`}>
                  <FormDropdown
                     label={`${t('form.ticketCategory.label')}*`}
                     fluid
                     items={ticketCategoriesDropDown}
                     placeholder={`${t('form.ticketCategory.placeholder')}`}
                     defaultValue={ticketCategoriesDropDown.find(x => x.key === item.category)}
                     disabled={viewingOnly}
                     onChange={(event, { value }) =>
                        handleMultiInputChange(event,
                           [{ field: `category`, value: value ? (value as any).key : 0 }])
                     }
                  />
               </Flex>
            </Col>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-caseDescription`}>
                  <FormInput
                     label={t('form.referenceNo.label')}
                     placeholder={t('form.referenceNo.placeholder')}
                     fluid
                     className="mmt-textArea mmt-textArea-100"
                     defaultValue={item.referenceNo}
                     disabled={true}
                     required
                  />
               </Flex>
            </Col>
         </Row>
         <Row>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-type`}>
                  {isNewForm ? 
                  <>
                     <GraphPeoplePicker
                        label={`${t('form.requestor.label')}`}
                        key={`searchUser-persona`}
                        defaultSelected={ { upn: currentCtx.upn, active: true, id: currentCtx.id, title: currentCtx.title, createdTimestamp: 0, modifiedTimestamp: 0 } }
                        multiple={false}
                        disabled={ (!currentUserIsTech || viewingOnly)}
                        onChange={handlePickerChange}
                        fieldId={`requesterUPN`}
                        />
                  </> : 
                  <>
                     <Flex vAlign="center" fill>
                        <FormInput
                           value={ requestor?.title }
                           disabled={true}
                           fluid
                           required
                           label={`${t('form.requestor.label')}`}
                           placeholder={t('form.requestor.placeholder')}
                           />
                        
                        <Button className={`mnt-chat-icon`} 
                           hidden={ (!requestor || (!!requestor && currentCtx.id === requestor.id) ) }
                           icon={<ChatIcon />} 
                           iconOnly 
                           onClick={(_) => handleChatClick() }
                           primary={true} />
                     </Flex>
                  </>
                  }
               </Flex>
            </Col>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-type`}>
                  <FormDropdown
                     label={`${t('form.technician.label')}`}
                     fluid
                     items={technicians}
                     placeholder={`${t('form.technician.placeholder')}`}
                     value={ technicians?.find(x => x.key.toLowerCase() === selectedTechnician.toLowerCase() )}
                     disabled={ !currentUserIsTech || viewingOnly }
                     onChange={(event, { value }) => setSelectedTechnician( (value as any).key )}
                  />
               </Flex>
            </Col>
         </Row>
         <Row>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-type`}>
                  <FormDropdown
                     label={`${t('form.priority.label')}*`}
                     fluid
                     items={getPriorityOptions()}
                     placeholder={`${t('form.priority.placeholder')}`}
                     defaultValue={getPriorityOptions().find(x => x.key === item.priority)}
                     disabled={ viewingOnly }
                     onChange={(event, { value }) =>
                        handleMultiInputChange(event,
                           [{ field: `priority`, value: value ? (value as any).key : 0 }])
                     }
                  />
               </Flex>
            </Col>
            <Col>
               <Flex gap="gap.small" vAlign="center" fill className={`mmt-inputGroup mmt-dropdown-type`}>
                  <Checkbox 
                     label={`${t('form.visible.label')}`}
                     toggle 
                     hidden={isNewForm || !currentUserIsTech }
                     checked={ isVisible }
                     disabled={ viewingOnly }
                     onChange={(event, checked ) => setIsVisible(( !!checked ? checked.checked : false )) }
                     />
               </Flex>
            </Col>
         </Row>
         <Row>
            <Col>
               <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-caseDescription`}>
                  <FormTextArea
                     label={t('form.requestDescription.label')}
                     placeholder={t('form.requestDescription.placeholder')}
                     fluid
                     className="mmt-textArea mmt-textArea-100"
                     defaultValue={item.description}
                     onChange={(event, ctrl) =>
                        handleMultiInputChange(event,
                           [{ field: `description`, value: ctrl?.value || '' }])
                     }
                     disabled={viewingOnly}
                     required
                  />
               </Flex>
            </Col>
         </Row>
         <Row>
            <Col>
               <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-message mmt-textArea mmt-textArea-100`}>
                  <Attachments canDelete={currentUserIsTech} parentId={id || ''} items={item.attachments || []} maxAttachments={10} />
               </Flex>
            </Col>
         </Row>
      </Form>
      </>
   );
 }
 
 export default TicketForm;