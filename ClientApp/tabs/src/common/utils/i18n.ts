import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';

export const defaultLocale = () => {
	return 'en-GB';
}

export const setLocale = (_locale: string = defaultLocale()) => {
	i18n.changeLanguage(_locale);
};

i18n
	// load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
	.use(Backend)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		fallbackLng: defaultLocale(),
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
		react: { 
		  useSuspense: false //   <---- this will do the magic
		},
      ns: ['common', 'shared'],
      defaultNS: 'shared'
	});
export default i18n;
