import * as React from 'react';
import { Text, Avatar, Flex } from "@fluentui/react-northstar";
import { stringToHslColor } from '../../common/utils/sharedFunctions';

interface IUser {
   displayName: string;
   image?: string;
   jobTitle?: string;
   email?: string;
   presence?: string;
   telephoneNumber?: string;
}

const UserPill = (props: { title: string, image?: string, size?: string }): JSX.Element => {
   const { title, image, size } = props;

   const avatarSize = size ? size : 'medium';

   const avatarColors = stringToHslColor(title);

   return (
      <Flex space="between" gap='gap.smaller' vAlign="center">
         <Avatar name={title} size={avatarSize as any}
            image={image || undefined}
            label={{
               styles: {
                  color: avatarColors.color,
                  backgroundColor: avatarColors.backgroundColor,
               },
            }}
         />
         <Flex column vAlign="center">
            <Text className="mmt-label mmt-themeColorOverride" content={title} truncated />
         </Flex>
      </Flex>
   );
}

export default UserPill;