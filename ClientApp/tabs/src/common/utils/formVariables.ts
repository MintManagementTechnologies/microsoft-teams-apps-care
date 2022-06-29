import i18n from "./i18n";

export const getLoggingMethodOptions = () => {
   return [
      { header: i18n.t('form.loggingMethod.value.email'), key: `email` },
      { header: i18n.t('form.loggingMethod.value.whatsapp'), key: `whatsapp` },
      { header: i18n.t('form.loggingMethod.value.sms'), key: `sms` },
      { header: i18n.t('form.loggingMethod.value.walkin'), key: `walkin` }
   ];
}

export const getStatusOptions = () => {
   return [
      { status: 0, label: i18n.t('shared:status:opened') },
      { status: 1, label: i18n.t('shared:status:inProgress') },
      { status: 2, label: i18n.t('shared:status:resolved') },
      { status: 3, label: i18n.t('shared:status:closed') }
   ];
}

export const getCaseTypeOptions = () => {
   return  [
      { header: i18n.t('form.caseType.value.complaint'), key: 0 }, //`complaint`
      { header: i18n.t('form.caseType.value.query'), key: 1 }, //`query`
      { header: i18n.t('form.caseType.value.request'), key: 2 } //`request`
   ];
}

export const getDirectorateOptions = () => {
   return  [
      { header: 'All Directorates', key: `19:67R4EuE_UCQ1NOQcz6hQHJJAjhSUYmo_BFtTHt2FdSs1@thread.tacv2` },
      { header: 'Social & Rental', key: `19:6f69c6fc90524ddc95a867c922c852f0@thread.tacv2` },
      { header: 'Rental Tribunal', key: `19:4810689c190a4b0e937adfdd4dd526b9@thread.tacv2` },
      { header: 'Emergency Housing', key: `19:72a98105d4e74aaf84f073f583a7fdec@thread.tacv2` }
   ];
}

export const getPriorityOptions = () => {
   return  [
      { header: i18n.t('form.priority.value.low'), key: 0 },
      { header: i18n.t('form.priority.value.medium'), key: 1 },
      { header: i18n.t('form.priority.value.high'), key: 2 },
      { header: i18n.t('form.priority.value.critical'), key: 3 }
   ];
}