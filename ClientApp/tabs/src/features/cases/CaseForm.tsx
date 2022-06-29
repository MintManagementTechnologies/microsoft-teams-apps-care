import { Flex, Text, Divider, Form, FormInput, FormTextArea, FormDropdown } from "@fluentui/react-northstar";
import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getCaseTypeOptions, getLoggingMethodOptions } from "../../common/utils/formVariables";
import { useAppDispatch, useTypedSelector, RootState } from "../../store";
import { caseUpdated } from "./caseSlice";
import { ICaseModel } from "./types"; 


const CaseForm = (props: { item: ICaseModel, formMode: string }): JSX.Element => {
   const { item, formMode } = props;
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const teamChannelDropDownValues = teamChannels.channels.map(i => ({ header: i.displayName, key: i.id }));
   const [itemState, setItemState] = useState(item);

   useEffect(() => {
      if (!itemState) return;
         dispatch(caseUpdated(itemState));
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

   const dividerHeader = <Text weight={'semibold'} size={'large'} content={`${t('common:header.entityDetails', { entity: t('entity.case', { count: 1 }) })}`} />;
   const viewingOnly = formMode === 'view';
   return (
      <>
         <Divider size={1} color="brand" content={dividerHeader} />
            <Form className={`mmt-form-customer`} >
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-subject`}>
                        <FormInput
                           defaultValue={item.title}
                           disabled={viewingOnly}
                           fluid
                           required
                           label={`${t('form.subject.label')}`}
                           placeholder={t('form.subject.placeholder')}
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
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-caseDescription`}>
                        <FormTextArea
                           label={t('form.caseDescription.label')}
                           placeholder={t('form.caseDescription.placeholder')}
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
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-type`}>
                        <FormDropdown
                           label={`${t('form.caseType.label')}*`}
                           fluid
                           items={getCaseTypeOptions()}
                           placeholder={`${t('form.caseType.placeholder')}`}
                           defaultValue={getCaseTypeOptions().find(x => x.key === item.category)}
                           onChange={(event, { value }) =>
                              handleMultiInputChange(event,
                                 [{ field: `category`, value: value ? (value as any).key : 0 }])
                           }
                        />
                     </Flex>
                  </Col>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-loggingMethod`}>
                        <FormDropdown
                           label={`${t('form.loggingMethod.label')}*`}
                           fluid
                           items={getLoggingMethodOptions()}
                           placeholder={`${t('form.loggingMethod.placeholder')}`}
                           defaultValue={getLoggingMethodOptions().find(x => x.key === item.loggingMethod)}
                           onChange={(event, { value }) =>
                              handleMultiInputChange(event,
                                 [{ field: `loggingMethod`, value: value ? (value as any).key : '' }])
                           }
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-dropdown-assignTo`}>
                        <FormDropdown
                           label={`${t('form.assignTo.label')}*`}
                           fluid
                           items={teamChannelDropDownValues}
                           placeholder={`${t('form.assignTo.placeholder')}`}
                           defaultValue={teamChannelDropDownValues.find(x => x.key === item.channelId)}
                           onChange={(event, { value }) =>
                              handleMultiInputChange(event,
                                 [{ field: `channelId`, value: value ? (value as any).key : '' }])
                           }
                        />
                     </Flex>
                  </Col>
               </Row>
               <Row>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-attachment`}>
                     </Flex>
                  </Col>
                  <Col>
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-uploader-attachment`}>

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

export default CaseForm;