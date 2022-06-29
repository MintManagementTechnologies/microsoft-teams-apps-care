import { Pill, PillProps } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";

import './StatusPill.scss';
const StatusPill = (props: { stateValue?: string, stateEnum?: number } & PillProps): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { stateValue, stateEnum, content, ...pillProps } = props;


   let statusResult = 'opened';
   const state = stateEnum !== undefined ? stateEnum.toString() : (stateValue || content);

   switch (state) {
      case `opened`:
      case `0`:
         statusResult = 'opened';
         break;
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
         statusResult = 'inactive';
         break;
   }

   return (
      <Pill className={`mmt-statusPill mmt-${statusResult}`}>{t(`form.status.value.${statusResult}`)}</Pill>
   );
};

export default StatusPill;
