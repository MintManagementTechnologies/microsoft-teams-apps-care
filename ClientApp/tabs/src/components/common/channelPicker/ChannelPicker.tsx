import { Button, Text, Flex } from "@fluentui/react-northstar";
import { useTypedSelector, RootState } from "../../../store";
import Loader from "../Loader";

import './ChannelPicker.scss';
const ChannelPicker = (props: { channelId?: string, onChange: (_channelId: string) => void }): JSX.Element => {
   const { channelId, onChange } = props;

   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const items = teamChannels.channels || [];
   return (
      <Flex fill gap="gap.small" className={`mmt-channelPicker-container`}>
         {items && items.length > 0 ?
               items.map((x, i) => <Button className={`mmt-channel-btn`} key={`btn-channel-${i}`}
                  content={x.displayName === 'General' ? 'Unassigned' : x.displayName} primary={x.id === channelId} onClick={(event) => onChange(x.id)} />) :
               <Text content={'ERROR'} error />
            
         }
      </Flex>
   );
};

export default ChannelPicker;
