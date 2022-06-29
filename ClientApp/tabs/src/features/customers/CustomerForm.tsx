import { Flex, Form, FormDropdown, FormInput, FormTextArea } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";
import { customerUpdated } from "./customerSlice";
import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ICustomerModel } from "./types";
import { useAppDispatch, useTypedSelector, RootState } from "../../store";
import './Customers.scss';
const CustomerForm = (props: { item: ICustomerModel, formMode: string }): JSX.Element => {
   const { item, formMode } = props;
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const [ itemState, setItemState ] = useState(item);
   const townsState = useTypedSelector((state: RootState) => state.towns);
   const townOptions = (townsState.towns || []).map(t => ({ header: t.townName, key: t.id }));
   const [ mobileNo, setMobileNo ] = useState(item.mobileNo);
   const [ mobileNoValid, setMobileNoValid] = useState(true);
   const [ mobileNoAlt, setMobileNoAlt ] = useState(item.alternativeNo);
   const [ mobileNoAltValid, setMobileNoAltValid ] = useState(true); 


   useEffect(() => {
      if (!itemState) return;

      const newState = { ...itemState, mobileNo: mobileNo, alternativeNo: mobileNoAlt }

      dispatch(customerUpdated(newState));
   }, [itemState, dispatch]);

   const handleMultiInputChange = (event: any, keyValuePair: { field: string, value: any }[]) => {
      if (event !== null) event.preventDefault();

      let _item = { ...itemState };
      keyValuePair.forEach(x => {
         //@ts-ignore
         _item[x.field] = x.value;
      });
      setItemState(_item);
   }

   useEffect(() => {
      const regex = /^(\+27|0)(6|7|8){1}[0-9]{1}[0-9]{7}$/;
      if (mobileNo !== '') {
         const isMobileValid = regex.test(mobileNo);
         setMobileNoValid(isMobileValid);
         if (isMobileValid) {
            handleMultiInputChange(null, [ { field: 'mobileNo', value: mobileNo } ]);
         }
      }
      if (mobileNoAlt !== '') {
         const isMobileValid = regex.test(mobileNoAlt);
         setMobileNoAltValid(isMobileValid);
         if (isMobileValid) {
            handleMultiInputChange(null, [ { field: 'alternativeNo', value: mobileNoAlt } ]);
         }
      } else {
         setMobileNoAltValid(true);
         handleMultiInputChange(null, [ { field: 'alternativeNo', value: '' } ]);
      }
   }, [ mobileNo, mobileNoAlt ] )


   const idMsg = formMode === 'new' ? 'New customer will be created with the above ID number.' : '';
   const viewingOnly = formMode === 'view';
   return (
      <>
            <Form className={`mmt-form-customer`} >
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-id`}>
                        <FormInput
                           defaultValue={item.idNo}
                           disabled={viewingOnly}
                           fluid
                           required
                           label={`${t('form.customerIdNo.label')}`}
                           placeholder={t('form.customerIdNo.placeholder')}
                           message={{ content: idMsg, error: true }}
                           onChange={(event, ctrl) =>
                              handleMultiInputChange(event,
                                 [{ field: `id`, value: ctrl?.value || '' }])
                           }
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-firstName`}>
                        <FormInput
                           defaultValue={item.name}
                           disabled={viewingOnly}
                           fluid
                           required
                           label={`${t('form.firstName.label')}`}
                           placeholder={t('form.firstName.placeholder')}
                           onChange={(event, ctrl) =>
                              handleMultiInputChange(event,
                                 [{ field: `name`, value: ctrl?.value || '' }])
                           }
                        />
                     </Flex>
                  </Col>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-lastName`}>
                        <FormInput
                           defaultValue={item.surname}
                           disabled={viewingOnly}
                           fluid
                           required
                           label={`${t('form.lastName.label')}`}
                           placeholder={t('form.lastName.placeholder')}
                           onChange={(event, ctrl) =>
                              handleMultiInputChange(event,
                                 [{ field: `surname`, value: ctrl?.value || '' }])
                           }
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-mobileNo`}>
                        <FormInput
                           defaultValue={item.mobileNo}
                           disabled={viewingOnly}
                           fluid
                           required
                           errorMessage={ mobileNoValid ? '' : t('form.mobileNo.errorMessage') }
                           label={`${t('form.mobileNo.label')}`}
                           placeholder={t('form.mobileNo.placeholder')}
                           onChange={(event, ctrl) => setMobileNo(ctrl?.value || '')}
                        />
                     </Flex>
                  </Col>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-alternativeNo`}>
                        <FormInput
                           defaultValue={item.alternativeNo}
                           disabled={viewingOnly}
                           fluid
                           errorMessage={ mobileNoAltValid ? '' : t('form.alternativeNo.errorMessage') }
                           label={`${t('form.alternativeNo.label')}`}
                           placeholder={t('form.alternativeNo.placeholder')}
                           onChange={(event, ctrl) => setMobileNoAlt(ctrl?.value || '')}
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-physicalAddress`}>
                        <FormTextArea
                           label={t('form.physicalAddress.label')}
                           placeholder={t('form.physicalAddress.placeholder')}
                           fluid
                           className="mmt-textArea mmt-textArea-100"
                           defaultValue={item.physicalAddress}
                           onChange={(event, ctrl) =>
                              handleMultiInputChange(event,
                                 [{ field: `physicalAddress`, value: ctrl?.value || '' }])
                           }
                           disabled={viewingOnly}
                           required
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-town`}>
                        <FormDropdown
                           label={`${t('form.town.label')}*`}
                           fluid
                           items={townOptions}
                           placeholder={`${t('form.town.placeholder')}`}
                           defaultValue={townOptions.find(x => x.key === item.town)}
                           onChange={(event, { value }) =>
                              handleMultiInputChange(event,
                                 [{ field: `town`, value: value ? (value as any).key : '' }])
                           }
                        />
                     </Flex>
                  </Col>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-postalCode`}>
                        <FormInput
                           defaultValue={item.postalCode}
                           disabled={viewingOnly}
                           fluid
                           label={`${t('form.postalCode.label')}*`}
                           placeholder={t('form.postalCode.placeholder')}
                           onChange={(event, ctrl) =>
                              handleMultiInputChange(event,
                                 [{ field: `postalCode`, value: ctrl?.value || '' }])
                           }
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                  </Col>
               </Row>
            </Form>
      </>
   );
}

export default CustomerForm;