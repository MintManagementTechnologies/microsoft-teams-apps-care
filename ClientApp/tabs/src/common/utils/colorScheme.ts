// Got the below colors by using the primary color (themePrimary - #ee3c2e) on the Theme Designer.
// 50 and 1000 was custom (duplicated)
// https://fluentuipr.z22.web.core.windows.net/heads/master/theming-designer/index.html
const brandColors = {
   50: '#fcfbfa',
   100: '#fcfbfa',
   200: '#f2f1eb',
   300: '#e7e5db',
   400: '#d0cbb9',
   500: '#b9b39c',
   600: '#B0A990',
   700: '#9e9882',
   800: '#86816e',
   900: '#635f51',
   1000: '#635f51',
}

// Turquoise - #25AAA0
const complementaryColors1 = {
   50: '#f4fcfb',
   100: '#f4fcfb',
   200: '#d3f2ef',
   300: '#b0e6e1',
   400: '#6dcdc5',
   500: '#39b5ab',
   600: '#25AAA0',
   700: '#229a90',
   800: '#1d8279',
   900: '#156059',
   1000: '#156059',
}

// Magenta - #AA2159
const complementaryColors2 = {
   50: '#fcf3f7',
   100: '#fcf3f7',
   200: '#f2d2df',
   300: '#e6aec5',
   400: '#cd6993',
   500: '#b5346a',
   600: '#AA2159',
   700: '#9a1d51',
   800: '#821944',
   900: '#601232',
   1000: '#601232',
}

// Dark blue - #10206B
const complementaryColors3 = {
   50: '#f1f2f9',
   100: '#f1f2f9',
   200: '#c8cee7',
   300: '#9da7d3',
   400: '#5161a6',
   500: '#1f317d',
   600: '#10206B',
   700: '#0e1d60',
   800: '#0c1951',
   900: '#09123c',
   1000: '#09123c',
}

/*
export const availableColors = [
  'default',
  'black',
  'white',
  'brand',
  'grey',
  'red',
  'yellow',
  'green',
  'pink',
  'orange',
];

*/

const colorScheme = {
   brand: {
      foreground: brandColors[600],
      foreground1: brandColors[600],          // 600
      foreground2: brandColors[700],          // 700
      foreground3: brandColors[200],          // 200
      background: brandColors[600],           // 600
      background1: brandColors[100],          // 100
      background2: brandColors[900],          // 900
      background3: brandColors[1000],         // 1000
      background4: brandColors[800],          // 800
      background5: brandColors[100],          // 100
      background6: brandColors[600],          // 600
      border1: brandColors[200],              // 200
      border2: brandColors[300],              // 300
      foregroundHover: brandColors[600],      // 600
      foregroundHover2: brandColors[200],     // 200
      borderHover: brandColors[300],          // 300
      backgroundHover: brandColors[700],      // 700
      backgroundHover1: brandColors[50],      // 50
      backgroundHover2: brandColors[100],     // 100
      backgroundHover3: brandColors[100],     // 100
      foregroundPressed: brandColors[800],    // 800
      backgroundPressed: brandColors[800],    // 800
      backgroundPressed1: brandColors[100],   // 100
      backgroundPressed2: brandColors[100],   // 100
      borderPressed: brandColors[300],        // 300
      foregroundActive: brandColors[600],     // 600
      foregroundActive1: brandColors[600],    // 600
      foregroundActive2: brandColors[200],    // 200
      backgroundActive: brandColors[600],     // 600
      backgroundActive1: brandColors[600],    // 600
      borderActive1: brandColors[200],        // 200
      borderActive2: brandColors[300],        // 300

      foregroundFocus: brandColors[600],      // 600
      foregroundFocus1: brandColors[600],     // 600
      foregroundFocus2: brandColors[700],     // 700
      foregroundFocus3: brandColors[200],     // 200

      backgroundFocus: brandColors[600],      // 600
      backgroundFocus1: brandColors[100],     // 100
      backgroundFocus2: brandColors[900],     // 900
      backgroundFocus3: brandColors[1000],    //1000
      borderFocus1: brandColors[600],         // 600
   },
   green: {
      foreground: complementaryColors1[600],
      foreground1: complementaryColors1[600],          // 600
      foreground2: complementaryColors1[700],          // 700
      foreground3: complementaryColors1[200],          // 200
      background: complementaryColors1[600],           // 600
      background1: complementaryColors1[100],          // 100
      background2: complementaryColors1[900],          // 900
      background3: complementaryColors1[1000],         // 1000
      background4: complementaryColors1[800],          // 800
      background5: complementaryColors1[100],          // 100
      background6: complementaryColors1[600],          // 600
      border1: complementaryColors1[200],              // 200
      border2: complementaryColors1[300],              // 300
      foregroundHover: complementaryColors1[600],      // 600
      foregroundHover2: complementaryColors1[200],     // 200
      borderHover: complementaryColors1[300],          // 300
      backgroundHover: complementaryColors1[700],      // 700
      backgroundHover1: complementaryColors1[50],      // 50
      backgroundHover2: complementaryColors1[100],     // 100
      backgroundHover3: complementaryColors1[100],     // 100
      foregroundPressed: complementaryColors1[800],    // 800
      backgroundPressed: complementaryColors1[800],    // 800
      backgroundPressed1: complementaryColors1[100],   // 100
      backgroundPressed2: complementaryColors1[100],   // 100
      borderPressed: complementaryColors1[300],        // 300
      foregroundActive: complementaryColors1[600],     // 600
      foregroundActive1: complementaryColors1[600],    // 600
      foregroundActive2: complementaryColors1[200],    // 200
      backgroundActive: complementaryColors1[600],     // 600
      backgroundActive1: complementaryColors1[600],    // 600
      borderActive1: complementaryColors1[200],        // 200
      borderActive2: complementaryColors1[300],        // 300

      foregroundFocus: complementaryColors1[600],      // 600
      foregroundFocus1: complementaryColors1[600],     // 600
      foregroundFocus2: complementaryColors1[700],     // 700
      foregroundFocus3: complementaryColors1[200],     // 200

      backgroundFocus: complementaryColors1[600],      // 600
      backgroundFocus1: complementaryColors1[100],     // 100
      backgroundFocus2: complementaryColors1[900],     // 900
      backgroundFocus3: complementaryColors1[1000],    //1000
      borderFocus1: complementaryColors1[600],         // 600
   },
   pink: {
      foreground: complementaryColors2[600],
      foreground1: complementaryColors2[600],          // 600
      foreground2: complementaryColors2[700],          // 700
      foreground3: complementaryColors2[200],          // 200
      background: complementaryColors2[600],           // 600
      background1: complementaryColors2[100],          // 100
      background2: complementaryColors2[900],          // 900
      background3: complementaryColors2[1000],         // 1000
      background4: complementaryColors2[800],          // 800
      background5: complementaryColors2[100],          // 100
      background6: complementaryColors2[600],          // 600
      border1: complementaryColors2[200],              // 200
      border2: complementaryColors2[300],              // 300
      foregroundHover: complementaryColors2[600],      // 600
      foregroundHover2: complementaryColors2[200],     // 200
      borderHover: complementaryColors2[300],          // 300
      backgroundHover: complementaryColors2[700],      // 700
      backgroundHover1: complementaryColors2[50],      // 50
      backgroundHover2: complementaryColors2[100],     // 100
      backgroundHover3: complementaryColors2[100],     // 100
      foregroundPressed: complementaryColors2[800],    // 800
      backgroundPressed: complementaryColors2[800],    // 800
      backgroundPressed1: complementaryColors2[100],   // 100
      backgroundPressed2: complementaryColors2[100],   // 100
      borderPressed: complementaryColors2[300],        // 300
      foregroundActive: complementaryColors2[600],     // 600
      foregroundActive1: complementaryColors2[600],    // 600
      foregroundActive2: complementaryColors2[200],    // 200
      backgroundActive: complementaryColors2[600],     // 600
      backgroundActive1: complementaryColors2[600],    // 600
      borderActive1: complementaryColors2[200],        // 200
      borderActive2: complementaryColors2[300],        // 300

      foregroundFocus: complementaryColors2[600],      // 600
      foregroundFocus1: complementaryColors2[600],     // 600
      foregroundFocus2: complementaryColors2[700],     // 700
      foregroundFocus3: complementaryColors2[200],     // 200

      backgroundFocus: complementaryColors2[600],      // 600
      backgroundFocus1: complementaryColors2[100],     // 100
      backgroundFocus2: complementaryColors2[900],     // 900
      backgroundFocus3: complementaryColors2[1000],    //1000
      borderFocus1: complementaryColors2[600],         // 600
   },
   grey: {
      foreground: complementaryColors3[600],
      foreground1: complementaryColors3[600],          // 600
      foreground2: complementaryColors3[700],          // 700
      foreground3: complementaryColors3[200],          // 200
      background: complementaryColors3[600],           // 600
      background1: complementaryColors3[100],          // 100
      background2: complementaryColors3[900],          // 900
      background3: complementaryColors3[1000],         // 1000
      background4: complementaryColors3[800],          // 800
      background5: complementaryColors3[100],          // 100
      background6: complementaryColors3[600],          // 600
      border1: complementaryColors3[200],              // 200
      border2: complementaryColors3[300],              // 300
      foregroundHover: complementaryColors3[600],      // 600
      foregroundHover2: complementaryColors3[200],     // 200
      borderHover: complementaryColors3[300],          // 300
      backgroundHover: complementaryColors3[700],      // 700
      backgroundHover1: complementaryColors3[50],      // 50
      backgroundHover2: complementaryColors3[100],     // 100
      backgroundHover3: complementaryColors3[100],     // 100
      foregroundPressed: complementaryColors3[800],    // 800
      backgroundPressed: complementaryColors3[800],    // 800
      backgroundPressed1: complementaryColors3[100],   // 100
      backgroundPressed2: complementaryColors3[100],   // 100
      borderPressed: complementaryColors3[300],        // 300
      foregroundActive: complementaryColors3[600],     // 600
      foregroundActive1: complementaryColors3[600],    // 600
      foregroundActive2: complementaryColors3[200],    // 200
      backgroundActive: complementaryColors3[600],     // 600
      backgroundActive1: complementaryColors3[600],    // 600
      borderActive1: complementaryColors3[200],        // 200
      borderActive2: complementaryColors3[300],        // 300

      foregroundFocus: complementaryColors3[600],      // 600
      foregroundFocus1: complementaryColors3[600],     // 600
      foregroundFocus2: complementaryColors3[700],     // 700
      foregroundFocus3: complementaryColors3[200],     // 200

      backgroundFocus: complementaryColors3[600],      // 600
      backgroundFocus1: complementaryColors3[100],     // 100
      backgroundFocus2: complementaryColors3[900],     // 900
      backgroundFocus3: complementaryColors3[1000],    //1000
      borderFocus1: complementaryColors3[600],         // 600
   },
}

// From Material design
// 50 is duplicated
// https://material.io/design/color/the-color-system.html#tools-for-picking-colors
const customMaterialTheme = {
   siteVariables: {
      colors: {
         brand: {
            50: '#ffeaed',
            100: '#ffeaed',
            200: '#fecbd0',
            300: '#ed9696',
            400: '#e16e6d',
            500: '#ea4d49',
            600: '#ee3c2e',
            700: '#df302e',
            800: '#ce2628',
            900: '#c11e21',
            1000: '#b20f14',
         }
      }
   }
}

const colorSchemeHardcoded = {
   siteVariables: {
      colorScheme: {
         brand: {
            foreground: '#EE3C2E',           // 600
            foreground1: '#EE3C2E',          // 600
            foreground2: '#D53429',          // 700
            foreground3: '#FCDEDB',          // 200
            background: '#EE3C2E',           // 600
            background1: '#FEF7F6',          // 100
            background2: '#852019',          // 900
            background3: '#852019',          // 1000
            background4: '#B42C22',          // 800
            background5: '#FEF7F6',          // 100
            background6: '#EE3C2E',          // 600
            border1: '#FCDEDB',              // 200
            border2: '#FAC1BD',              // 300
            foregroundHover: '#EE3C2E',      // 600
            foregroundHover2: '#FCDEDB',     // 200
            borderHover: '#FAC1BD',          // 300
            backgroundHover: '#D53429',      // 700
            backgroundHover1: '#FEF7F6',     // 50
            backgroundHover2: '#FEF7F6',     // 100
            backgroundHover3: '#FEF7F6',     // 100
            foregroundPressed: '#B42C22',    // 800
            backgroundPressed: '#B42C22',    // 800
            backgroundPressed1: '#FEF7F6',   // 100
            backgroundPressed2: '#FEF7F6',   // 100
            borderPressed: '#FAC1BD',        // 300
            foregroundActive: '#EE3C2E',     // 600
            foregroundActive1: '#EE3C2E',    // 600
            foregroundActive2: '#FCDEDB',    // 200
            backgroundActive: '#EE3C2E',     // 600
            backgroundActive1: '#EE3C2E',    // 600
            borderActive1: '#FCDEDB',        // 200
            borderActive2: '#FAC1BD',        // 300

            foregroundFocus: '#EE3C2E',      // 600
            foregroundFocus1: '#EE3C2E',     // 600
            foregroundFocus2: '#D53429',     // 700
            foregroundFocus3: '#FCDEDB',     // 200

            backgroundFocus: '#EE3C2E',      // 600
            backgroundFocus1: '#FEF7F6',     // 100
            backgroundFocus2: '#852019',     // 900
            backgroundFocus3: '#852019',     //1000
            borderFocus1: '#EE3C2E',         // 600
         }
      }
   }
}

export default colorScheme