interface IMessageDetails {
   recipients: string[],
   scope: string,
   msgReferenceAction?: string,
   cardName?: string,
}

export interface INotificationBatch {
   batchId: string,
   notificationData: {
       title: string,
       subtitle: string,
   },
   notificationMedia: {
       avatars: {
           recipient: string,
           image: string,
       }[],
   },
   newMsg: IMessageDetails[],
   updateMsg: IMessageDetails[],
   deleteMsg: IMessageDetails[],
}

export const notificationBatch:INotificationBatch = {
   batchId: "a349a3d5-a444-4a6e-a126-5b969a324037",
   notificationData: { title: "Title", subtitle: "sub" },
   notificationMedia: {
       avatars: [
           {
               recipient: 'abrie@gmail.com',
               image: ''
           },
           {
               recipient: 'jessica@gmail.com',
               image: ''
           },
       ]
   },
   newMsg: [
       {
           recipients: ['abrie@gmail.com'],
           scope: '1',
           msgReferenceAction: 'save',
           cardName: "newRequest"
       },
       {
           recipients: ['jessica@gmail.com'],
           scope: 'lvl2',
           msgReferenceAction: 'none',
           cardName: "approveRequest"
       }
   ],
   updateMsg: [
       {
           recipients: ['jessica@gmail.com'],
           scope: 'lvl2',
           msgReferenceAction: 'delete',
           cardName: "noActionCard"
       }
   ],
   deleteMsg: [
       {
           recipients: ['jessica@gmail.com'],
           scope: 'lvl1',
           msgReferenceAction: 'none',
           cardName: "na"
       }
   ],
}