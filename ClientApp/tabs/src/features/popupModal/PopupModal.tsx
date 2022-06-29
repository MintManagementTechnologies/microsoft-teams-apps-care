import { Flex, Segment } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';
import { getRouteParams } from '../../common/utils/sharedFunctions';
import ErrorMessage from '../../components/common/ErrorMessage';
import CustomerCase from '../customerCases/CustomerCase';
import ITTicket from '../itTickets/ITTicket';

import './PopupModal.scss';
import PopupModalFooter from './PopupModalFooter';
const PopupModal = (): JSX.Element => {
   const { userScope, view, action, id } = getRouteParams(window.location.hash);
   const { t, i18n } = useTranslation();
   const itemId = id || 'notFound';

   const renderView = () => {
      switch (view) {
         case 'customer':
            return <CustomerCase />;
         case 'it':
            return <ITTicket />;
         default:
            return <ErrorMessage message={t('error.modal.view')} messageDetails={`Could not find the view ${view} in for the PopupModal`} />;
      }
   }
   return (
      <>
         <Flex
            className={`mmt-taskModule mmt-${view}-${action}`}
            gap="gap.medium"
            padding="padding.medium"
            column
            fill
         >
            <Flex padding="padding.medium" column fill className={`mmt-taskModule-body`}>
               {itemId === 'notFound' ?
                  <ErrorMessage message={t('error.modal.view')} messageDetails={`No Item ID found in the PopupModal for ${view}.`} />
                  : renderView()
               }
            </Flex>
         </Flex>
      </>
   );
}

export default PopupModal;