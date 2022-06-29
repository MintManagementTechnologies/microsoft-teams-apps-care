import { Flex, Button, Text, Pill, FlexItem } from "@fluentui/react-northstar";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getLocaleDate } from "../../../common/utils/sharedFunctions";
import StatusPill from "../statusPill/StatusPill";

import { IUpdateActionModel } from "./types";

const ActionLevel = (props: { level: number, stateEnum: number, items: IUpdateActionModel[] }): JSX.Element => {
   const { level, stateEnum, items } = props;
   const { t, i18n } = useTranslation();

   let statusResult = 'opened';
   const state = stateEnum.toString();

   switch (state) {
      case `inProgress`:
      case `1`:
         statusResult = 'inProgress';
         break;
      case `resolved`:
      case `2`:
         statusResult = 'resolved';
         break;
      case `closed`:
      case `3`:
         statusResult = 'closed';
         break;
      default:
         break;
   }

   return (
      <>
         <Flex gap="gap.small" padding="padding.medium" className={`mmt-actionLevel-container mmt-${statusResult}`} fill column>
            <Flex hAlign='center' className={`mmt-actionLevel-title`}>
               <StatusPill stateEnum={stateEnum} />
            </Flex>
            <Flex gap="gap.small" fill>
               <FlexItem shrink>
                  <Text content={level} weight={'semibold'} size="largest" className={`mmt-actionLevel`} />
               </FlexItem>
               <Flex fill column className={`mmt-actionLevel-entries`}>
                  {items.map((x, i) =>
                  (<Flex fill column className={`mmt-actionLevel-entry`} key={`mmt-actionLevel-entry-${i}`}>
                     <Text content={`${x.timestamp} (${x.createdByUPN})`} timestamp size='smaller' className={`mmt-value`}/>
                     <Text content={x.message} size='small' className={`mmt-valuevalue`} />
                  </Flex>)
                  )}
               </Flex>
            </Flex>
         </Flex>
      </>
   );
}

export default ActionLevel;