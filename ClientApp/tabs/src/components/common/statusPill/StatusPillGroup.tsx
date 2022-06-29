import { Pill, PillGroup, PillProps } from "@fluentui/react-northstar";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import './StatusPill.scss';

export const allStates = [
   { key: 'opened', value: 0 },
   { key: 'inProgress', value: 1 },
   { key: 'resolved', value: 2 },
   { key: 'closed', value: 3 },
]

const StatusPillGroup = (props: { stateEnum: number, onStateChange: (newState: any) => void, allowResolve: boolean, allowClose: boolean }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { stateEnum, onStateChange } = props;
   const [currentState, setCurrentState] = useState(stateEnum);
   console.log('StatusPillGroup');
   let statusResult = 'opened';
   const state = stateEnum;

   switch (state) {
      case 0:
         statusResult = 'opened';
         break;
      case 1:
         statusResult = 'inProgress';
         break;
      case 2:
         statusResult = 'resolved';
         break;
      case 3:
         statusResult = 'closed';
         break;
      default:
         statusResult = 'inactive';
         break;
   }

   const handleOnSelect = (event: any, _newStatusEnum: any) => {
      event.preventDefault();
      setCurrentState(_newStatusEnum);
      onStateChange(_newStatusEnum);
   }

   const checkEnabled = (checkStatus: number): boolean => {
      let additionalCheck: boolean = true;
      if (checkStatus === 2) {
         additionalCheck = props.allowResolve;
      } else if (checkStatus === 3) {
         additionalCheck = props.allowClose;
      }

      
      return (stateEnum <= checkStatus) && additionalCheck;

   }

   return (
      <PillGroup className="mmt-statusPillGroup">
         {allStates.map(x => 
            
            <Pill key={`statusPill-${x.value}`} 
               onSelectionChange={(event) => { handleOnSelect(event, x.value) }} 
               actionable={ checkEnabled(x.value) } 
               selectable={ checkEnabled(x.value) } 
               className={`mmt-statusPill mmt-${x.key} ${currentState < x.value ? 'mmt-inactive' : ''}`}>{t(`form.status.value.${x.key}`)}</Pill>
         )}
      </PillGroup>
   );
};

export default StatusPillGroup;
