import * as React from 'react';
import { Flex, Loader, LoaderProps } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';

const LoaderHOC = (props: { message?: string } & LoaderProps): JSX.Element => {
   const { t } = useTranslation();
   const { message, ...otherProps } = props;
   const entity = message || '';
   return (
      <Flex hAlign='center' fill>
         <Loader label={t('common:loading', {entity: entity})} {...otherProps} />
      </Flex>
   );
}

export default LoaderHOC;