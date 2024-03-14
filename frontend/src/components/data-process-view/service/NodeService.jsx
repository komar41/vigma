const NodeService = {
    getTreeNodesData: function() {
      // Initially, return an empty array.
      return [];
    },
    getTreeNodes: function() {
      return Promise.resolve(this.getTreeNodesData());
    },

    updateData: function(dataObject) {
        this.getTreeNodesData = () => {
            console.log("Entered updateData", dataObject);
            return Object.entries(dataObject).map(([folderName, insideFolders]) => {
                return {
                    key: folderName,
                    label: folderName,
                    data: `${folderName} Folder`,
                    children: Object.entries(insideFolders).map(([insideFolderName, files]) => {
                        // Create a map to group files by trial number
                        const trialMap = {};
                        files.forEach(file => {
                            let trialKey;
                            if (file.includes('step')) {
                                trialKey = 'step'; // Special key for step files, but we won't use it to create a separate node
                            } else {
                                const match = file.match(/_(\d+)_/); // Extracts trial number
                                trialKey = match ? `Trial ${match[1]}` : 'Unknown';
                            }
    
                            if (!trialMap[trialKey]) {
                                trialMap[trialKey] = {
                                    jnt: null,
                                    grf: null,
                                    step: null // Now includes step as part of trial
                                };
                            }
    
                            if (file.endsWith('jnt.csv')) {
                                trialMap[trialKey].jnt = file;
                            } else if (file.endsWith('grf.csv')) {
                                trialMap[trialKey].grf = file;
                            } else if (file.includes('step')) {
                                // Assign the 'step' file to the trial, but don't create a separate node for it
                                trialMap[trialKey].step = file; 
                            }
                        });
    
                        // Convert the map into a tree structure, excluding standalone 'step' nodes
                        return {
                            key: `${folderName}-${insideFolderName}`,
                            label: insideFolderName,
                            data: `${insideFolderName} in ${folderName} Folder`,
                            children: Object.entries(trialMap).filter(([trialName]) => trialName !== 'step').map(([trialName, { jnt, grf }]) => {
                                const children = [];
                                if (jnt) children.push({ key: `${folderName}-${insideFolderName}-${jnt}`, label: 'JNT', data: jnt });
                                if (grf) children.push({ key: `${folderName}-${insideFolderName}-${grf}`, label: 'GRF', data: grf });
                                return {
                                    key: `${folderName}-${insideFolderName}-${trialName}`,
                                    label: trialName,
                                    data: `${trialName} in ${insideFolderName} Folder`,
                                    children
                                };
                            })
                        };
                    })
                };
            });
        };
    }
    
    
  };
  
  export default NodeService;

