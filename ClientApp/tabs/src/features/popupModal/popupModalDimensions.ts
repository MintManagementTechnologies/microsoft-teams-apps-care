const modalHeaderHeight = 70;

const defaultModal = {
   view: 'default',
   action: 'default',
   dimensions: {
      height: 250,
      width: 680
   }
}

// subtract 70  height for taskModule header
const modals = [
   {
      view: 'it',
      action: 'new',
      dimensions: {
         height: 565-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'it',
      action: 'edit',
      dimensions: {
         height: 565-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'it',
      action: 'view',
      dimensions: {
         height: 639-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'it',
      action: 'action',
      dimensions: {
         height: 609-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'it',
      action: 'assign',
      dimensions: {
         height: 374-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'customer',
      action: 'search',
      dimensions: {
         height: 234-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'customer',
      action: 'new',
      dimensions: {
         height: 565-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'customer',
      action: 'edit',
      dimensions: {
         height: 565-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'customer',
      action: 'view',
      dimensions: {
         height: 639-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'customer',
      action: 'action',
      dimensions: {
         height: 609-modalHeaderHeight,
         width: 680
      }
   },
   {
      view: 'customer',
      action: 'assign',
      dimensions: {
         height: 374-modalHeaderHeight,
         width: 680
      }
   },
]

export const getDimensions = (_view: string = '', _action: string = ''): { height: number, width: number } => {
   const modalProps = modals.find(x => x.view === _view && x.action === _action);
   let result = modalProps ? modalProps.dimensions : defaultModal.dimensions;
   return result;
}