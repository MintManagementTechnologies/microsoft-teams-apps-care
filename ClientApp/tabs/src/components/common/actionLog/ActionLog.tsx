import { Flex } from "@fluentui/react-northstar";
import { groupBy } from "../../../common/utils/sharedFunctions";
import { IAction } from "../../../features/cases/types";
import ActionLevel from "./ActionLevel";
import "./ActionLog.scss";

const ActionLog = (props: { parentId: string, items: IAction[] }): JSX.Element => {
   const { items } = props;
   const groupedItems = items ? groupBy(items, 'state') : groupBy([], 'state');
   return (
      <>
         <Flex gap="gap.small" padding="padding.medium" className={`mmt-actionLog-container`} fill column>
            {Object.values(groupedItems).map((item:any, index:number) =>
               <ActionLevel items={item} level={index+1} stateEnum={index} key={`actionLvl-${index}`}/>   
            )}
         </Flex>
      </>
   );
}

export default ActionLog;