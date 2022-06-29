import { Button, ButtonProps } from "@fluentui/react-northstar";
import { Link } from "react-router-dom";

import './LinkButton.scss';
const LinkButton = (props: {
   path: string;
} & ButtonProps): JSX.Element => {
   const { path, ...btnProps } = props;

   return (
      <Button
         as={Link}
         {...btnProps}
         className={`mmt-link-btn ui-button`}
         to={{ pathname: `${path}` }}
      />
   );
};

export default LinkButton;
