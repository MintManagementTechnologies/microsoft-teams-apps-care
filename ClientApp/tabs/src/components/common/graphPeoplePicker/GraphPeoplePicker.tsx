import { useEffect, useState } from "react";
import { Dropdown, FormDropdown } from "@fluentui/react-northstar";

import { useSearchGraphUsersQuery } from "../../../services/msGraph/graphApiService";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-i18next";
import { ISimpleUserModel } from "../../../common/types/user";
import { defaultAvatar } from "../../../common/utils/commonVariables";
import { log } from "../../../common/utils/customConsoleLog";

import './GraphPeoplePicker.scss';

const GraphPeoplePicker = (props: {
   fieldId: string,
   multiple?: boolean,
   defaultSelected?: ISimpleUserModel | ISimpleUserModel[],
   disabled?: boolean,
   label?: string,
   onChange: (selected: ISimpleUserModel | ISimpleUserModel[], _extraOptions?: any) => void
}): JSX.Element => {
   const { fieldId, multiple, defaultSelected, disabled, label } = props;
   const { t, i18n } = useTranslation();
   const defaultSelectedType = Array.isArray(defaultSelected) ? 'array' : typeof defaultSelected;

   let tmpDefaultValue;
   let tmpSearchQuery = '';
   switch (defaultSelectedType) {
      case "object":
         tmpDefaultValue = {
            header: (defaultSelected as ISimpleUserModel).title,
            image: (defaultSelected as ISimpleUserModel).image || defaultAvatar,
            content: (defaultSelected as ISimpleUserModel).upn,
            key: (defaultSelected as ISimpleUserModel).id,
            selected: true,
            active: true,
            disabled: disabled
         }
         tmpSearchQuery = tmpDefaultValue.header;
         break;
      case "array":
         tmpDefaultValue = (defaultSelected as ISimpleUserModel[]).map(x => ({
            header: x.title,
            image: x.image || defaultAvatar,
            content: x.upn,
            key: x.id,
            disabled: disabled
         }));
         break;
      default:
         break;
   }

   const defaultValue = tmpDefaultValue;

   const [searchQuery, setSearchQuery] = useState(tmpSearchQuery);
   const { data, isFetching } = useSearchGraphUsersQuery(searchQuery || skipToken);

   useEffect(() => {
      if (defaultSelected && !Array.isArray(defaultSelected)) {
         setSearchQuery((defaultSelected as any).title);
      }
   }, [defaultSelected]);

   const mapValueToSingleUser = (value: any) => {
      if (!value) return;
      let userProperties = data!.find(y => y.id === value.key);
      return userProperties;
   }

   const mapValueToMultipleUsers = (value: any) => {
      let tmpSelectedUsers = value ?
         value.map((x: any) => {
            let userProperties = data!.find(y => y.id === x.key);
            if(userProperties) return userProperties;
            return {
               title: x.header,
               image: x.image || defaultAvatar, 
               upn: x.content,
               id: x.key,
            }
         })
         : [];
      return tmpSelectedUsers;
   }

   const handleOnChange = (event: any, value: any) => {
      if (event !== null) event.preventDefault();
      let tmpSelectedUsers = multiple ? mapValueToMultipleUsers(value) : mapValueToSingleUser(value);
      props.onChange(tmpSelectedUsers, fieldId);
   }

   const handleOnSearchQuery = (searchText: string) => {
      if (searchText.length > 1) {
         //@ts-ignore
         setSearchQuery(searchText || '');
      }
   }

   // @ts-ignore
   let dropdownOptions: dropdownOption[] = [];
   if (data && data?.length > 0) {
      dropdownOptions = data?.map(x => ({
         header: x.title,
         image: x.image || defaultAvatar, //'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/CameronEvans.jpg',
         content: x.upn,
         key: x.id,
      }));
   }
   const entity = t('common:entity.user', { count: 1 });
   const entityPlural = t('common:entity.user', { count: 0 });
   return (
      <FormDropdown
         className="mmt-graphPeoplePicker"
         fluid
         label={label}
         loading={isFetching}
         loadingMessage={t('common:loading', { entity: entityPlural })}
         multiple={multiple}
         search
         defaultValue={defaultValue}
         defaultSearchQuery={searchQuery}
         //value={defaultValue}
         // itemToString={(item:any) => {
         //    if(item && item.header.includes(searchQuery)){
         //       return item.header;
         //    }
         //    return item.content;
         // }}
         disabled={disabled}
         items={dropdownOptions}
         placeholder={t('common:dropdown.search', { entity: entityPlural })}
         noResultsMessage={t('common:error.noItems', { entity: entity })}
         onSearchQueryChange={(event, { searchQuery }) => { handleOnSearchQuery(searchQuery || '') }}
         onChange={(event, { value }) => handleOnChange(event, value)}
      />
   );
}

export default GraphPeoplePicker;