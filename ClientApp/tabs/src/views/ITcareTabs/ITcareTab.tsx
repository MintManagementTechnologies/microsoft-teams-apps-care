import { Flex } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';
import { getRouteParams } from '../../common/utils/sharedFunctions';
import ErrorMessage from '../../components/common/ErrorMessage';
import MyRequestsWrapper from './MyRequestsWrapper';
import TeamRequestsWrapper from './TeamRequestsWrapper';
import "./ITcareTab.scss";
const ITcareTab = (): JSX.Element => {
   const { userScope } = getRouteParams(window.location.hash);
   const { t, i18n } = useTranslation();

   const renderView = () => {
      switch (userScope) {
         case 'me':
            return <MyRequestsWrapper />;
         case 'team':
            return <TeamRequestsWrapper />;
         default:
            return <ErrorMessage message={t('error.modal.action')} messageDetails={`Could not find the userScope ${userScope} in for the ModalContainer`} />;
      }
   }

   return (
      <>
         <Flex>
            {renderView()}
         </Flex>
      </>
   );
}

export default ITcareTab;