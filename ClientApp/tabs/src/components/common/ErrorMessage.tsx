import * as React from 'react';
import { useState } from 'react';
import { Alert, ExclamationTriangleIcon, Text, Flex } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getRouteParams } from '../../common/utils/sharedFunctions';

const ErrorMessage = (props: { message?: string, messageDetails?: string, children?: React.ReactNode }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { pathname } = useLocation();
   const {
      userScope,
      view,
      action,
      id
   } = getRouteParams(pathname);

   const [showDetails, setShowDetails] = useState(false);

   const { message, messageDetails } = props;

   return (
      <>
         <Alert icon={<ExclamationTriangleIcon />}
            variables={{
               urgent: true,
            }} content={message}
            actions={[
               {
                  content: t('common:button.view', { action: 'Details' }),
                  key: 'errorDetails',
                  onClick: (event) => setShowDetails(!showDetails)
               }
            ]} />
         <Flex fill column gap='gap.medium' className={showDetails ? '' : 'mmt-hidden'}>
            <Flex hAlign='center' column gap='gap.medium' className={'mmt-messageDetails'}>
               <Text content={messageDetails} error />
               <Text content={`Path: ${pathname}`} />
            </Flex>
            <Flex fill column gap='gap.medium' className={'mmt-additionalInfo'}>
               {props.children}
            </Flex>
         </Flex>

      </>
   );
}

export default ErrorMessage;