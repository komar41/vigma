// NodeService.jsx (or wherever your service is defined)
const NodeService = {
  getTreeNodesData: () => {
      // This will be overridden dynamically
  },
  getTreeNodes: function() {
      return Promise.resolve(this.getTreeNodesData());
  },
  updateData: function(dataObject) {
    this.getTreeNodesData = () => {
        console.log("Entered updateData", dataObject);
        const treeData = Object.entries(dataObject).map(([folderName, insideFolders]) => ({
            key: folderName,
            label: folderName,
            data: `${folderName} Folder`,
            children: Object.entries(insideFolders).map(([insideFolderName, files]) => ({
                key: `${folderName}-${insideFolderName}`,
                label: insideFolderName,
                data: `${insideFolderName} in ${folderName} Folder`,
                children: files.map(file => ({
                    key: `${folderName}-${insideFolderName}-${file}`,
                    label: file,
                    data: `${file} in ${insideFolderName} Folder`
                }))
            }))
        }));
        return treeData;
    };
}


//   updateData: function(dataObject) {
    
//       this.getTreeNodesData = () => {
//         console.log("Entered updateData", dataObject);
//           const treeData = Object.entries(dataObject).map(([folderName, files]) => ({
//               key: folderName,
//               label: folderName,
//               data: `${folderName} Folder`,
//               children: files.map(file => ({
//                   key: `${folderName}-${file}`,
//                   label: file,
//                   data: `${file} in ${folderName} Folder`
//               }))
//           }));
//           return treeData;
//       };
//   }
};

export default NodeService;



// export const NodeService = {
//     getTreeNodesData() {
//       return [
//         {
//           key: '0',
//           label: 'Documents',
//           data: 'Documents Folder',
//           children: [
//             {
//               key: '0-0',
//               label: 'Work',
//               data: 'Work Folder',
//               children: [
//                 {
//                   key: '0-0-0',
//                   label: 'Expenses.doc',
//                   data: 'Expenses Document',
//                 },
//                 {
//                   key: '0-0-1',
//                   label: 'Resume.doc',
//                   data: 'Resume Document',
//                 },
//               ],
//             },
//             {
//               key: '0-1',
//               label: 'Home',
//               data: 'Home Folder',

//               children: [
//                 {
//                   key: '0-1-0',
//                   label: 'Invoices.txt',
//                   data: 'Invoices for this month',
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           key: '1',
//           label: 'Events',
//           data: 'Events Folder',
//           children: [
//             {
//               key: '1-0',
//               label: 'Meeting',
//               data: 'Meeting',
//             },
//             {
//               key: '1-1',
//               label: 'Product Launch',
//               data: 'Product Launch',
//             },
//             {
//               key: '1-2',
//               label: 'Report Review',
//               data: 'Report Review',
//             },
//           ],
//         },
//         {
//           key: '2',
//           label: 'Movies',
//           data: 'Movies Folder',
//           children: [
//             {
//               key: '2-0',
//               label: 'Al Pacino',
//               data: 'Pacino Movies',
//               children: [
//                 {
//                   key: '2-0-0',
//                   label: 'Scarface',
//                   data: 'Scarface Movie',
//                 },
//                 {
//                   key: '2-0-1',
//                   label: 'Serpico',
//                   data: 'Serpico Movie',
//                 },
//               ],
//             },
//             {
//               key: '2-1',
//               label: 'Robert De Niro',
//               data: 'De Niro Movies',
//               children: [
//                 {
//                   key: '2-1-0',
//                   label: 'Goodfellas',
//                   data: 'Goodfellas Movie',
//                 },
//                 {
//                   key: '2-1-1',
//                   label: 'Untouchables',
//                   data: 'Untouchables Movie',
//                 },
//               ],
//             },
//           ],
//         },
//       ];
//     },
  
//     getTreeNodes() {
//       return Promise.resolve(this.getTreeNodesData());
//     },
//   };
  