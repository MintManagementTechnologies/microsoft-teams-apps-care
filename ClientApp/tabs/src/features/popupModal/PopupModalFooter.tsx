import * as React from 'react';
import { Flex, Segment } from '@fluentui/react-northstar';

const PopupModalFooter = (props: { children?: React.ReactNode }): JSX.Element => {
   return (
      <Segment className={"mmt-footer-container"}>
         <Flex fill hAlign="end" gap="gap.small">
            {props.children}
         </Flex>
      </Segment>)
}

export default PopupModalFooter;