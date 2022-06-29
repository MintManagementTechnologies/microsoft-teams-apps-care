import { Flex, Text, TextArea } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";
import { Row, Col } from "react-bootstrap";
import { ICustomerModel } from "./types";

const CustomerDetails = (props: { item: ICustomerModel }): JSX.Element => {
   const { item } = props;
   const { t, i18n } = useTranslation();

   return (
      <>
         <Flex className={`mmt-customer-details`} fill column>
            <Row xl={2} lg={2} md={2}>
               <Col>
                  <Flex gap="gap.small" column fill className={`mmt-col-left`}>
                     <Flex column fill className={`mmt-fieldviewGroup mmt-name-surname`}>
                        <Text content={`${t('form.name.label')}`} className={`mmt-field mmt-label`} weight={'semibold'}/>
                        <Text content={`${item.name} ${item.surname}`} className={`mmt-field mmt-value`} timestamp/>
                     </Flex>
                     <Flex column fill className={`mmt-fieldviewGroup mmt-idNo`}>
                        <Text content={`${t('form.customerIdNo.label')}`} className={`mmt-field mmt-label`} weight={'semibold'}/>
                        <Text content={`${item.idNo}`} className={`mmt-field mmt-value`} timestamp/>
                     </Flex>
                  </Flex>
               </Col>
               <Col>
                  <Flex gap="gap.small" column fill className={`mmt-col-right`}>
                     <Flex column fill className={`mmt-fieldviewGroup mmt-physicalAddress`}>
                        <Text content={t('form.physicalAddress.label')} className={`mmt-field mmt-label`} weight={'semibold'}/>
                        <TextArea value={`${item.physicalAddress}`} className={`mmt-field mmt-value`} disabled />
                     </Flex>
                  </Flex>
               </Col>
            </Row>
            <Row xl={2} lg={2} md={2} className='mmt-rowGutter-10'>
               <Col>
                  <Flex gap="gap.small" column fill className={`mmt-col-left`}>
                     <Flex column fill className={`mmt-fieldviewGroup mmt-mobileNo`}>
                        <Text content={`${t('form.mobileNo.label')}`} className={`mmt-field mmt-label`} weight={'semibold'}/>
                        <Text content={`${item.mobileNo}`} className={`mmt-field mmt-value`} timestamp/>
                     </Flex>
                  </Flex>
               </Col>
               <Col>
                  <Flex gap="gap.small" column fill className={`mmt-col-right`}>
                     <Flex column fill className={`mmt-fieldviewGroup mmt-alternativeNo`}>
                        <Text content={`${t('form.alternativeNo.label')}`} className={`mmt-field mmt-label`} weight={'semibold'}/>
                        <Text content={`${item.alternativeNo}`} className={`mmt-field mmt-value`} timestamp/>
                     </Flex>
                  </Flex>
               </Col>
            </Row>
         </Flex>
      </>
   );
}

export default CustomerDetails;