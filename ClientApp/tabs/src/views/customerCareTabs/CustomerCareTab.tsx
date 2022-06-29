import { Flex } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';
import { getRouteParams } from '../../common/utils/sharedFunctions';
import ErrorMessage from '../../components/common/ErrorMessage';
import MyCasesWrapper from './MyCasesWrapper';
import TeamCasesWrapper from './TeamCasesWrapper';
const CustomerCareTab = (): JSX.Element => {
   const { userScope } = getRouteParams(window.location.hash);
   const { t, i18n } = useTranslation();

   const renderView = () => {
      switch (userScope) {
         case 'me':
            return <MyCasesWrapper />;
         case 'team':
            return <TeamCasesWrapper />;
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

export default CustomerCareTab;