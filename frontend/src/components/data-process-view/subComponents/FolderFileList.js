import React, { useState } from "react";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemText from "@mui/material/ListItemText";
// import Checkbox from "@mui/material/Checkbox";
// import { ExpandLess, ExpandMore } from "@mui/icons-material";
// import Collapse from "@mui/material/Collapse";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Collapse,
} from "@mui/material";

import { ExpandLess, ExpandMore } from "@mui/icons-material";

const parsePaths = (paths, rootPath) => {
    const root = {};
  
    paths.forEach((fullPath) => {
      // Remove the root path and initial backslash to get the relative path
      const relativePath = fullPath.replace(rootPath + '\\', '');
      const parts = relativePath.split('\\');
      let current = root;
  
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? { fullPath: fullPath } : {};
        }
        current = current[part];
      });
    });
  
    return root;
  };
  

const rootPath = 'D:\\Research Assistant\\eMoGis\\BackendFlask\\data\\healthy_controls';

const FileTree = ({ data, level = 0 }) => {
  const [checked, setChecked] = useState([]);
  const [open, setOpen] = useState({});

  const handleToggle = (value) => {
    const newChecked = [...checked];
    const currentIndex = newChecked.indexOf(value);
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleClick = (item) => {
    setOpen({ ...open, [item]: !open[item] });
  };

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}  style={{ paddingLeft: level * 20 }}>
      {Object.entries(data).map(([key, value]) => (
        <React.Fragment key={key}>
          {typeof value === 'object' && value.fullPath ? (
            // It's a file
            <ListItem disablePadding>
              <ListItemButton role={undefined} onClick={() => handleToggle(value.fullPath)} dense>
                <Checkbox
                  edge="start"
                  checked={checked.indexOf(value.fullPath) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={key} /> {/* Display only the file name */}
              </ListItemButton>
            </ListItem>
          ) : (
            // It's a folder
            <>
              <ListItemButton onClick={() => handleClick(key)}>
                <ListItemText primary={key} />
                {open[key] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open[key]} timeout="auto" unmountOnExit>
                <FileTree data={value} level={level + 1} rootPath={`${rootPath}${rootPath ? '\\' : ''}${key}`} />
              </Collapse>
            </>
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default function FolderFileList({ paths }) {
    const parsedData = parsePaths(paths, rootPath);

  return <FileTree data={parsedData} />;
}
