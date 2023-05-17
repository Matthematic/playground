import * as React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList, FixedSizeList } from 'react-window';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';

const LISTBOX_PADDING = 8; // px

const Row = ({ style, item }) => {
    return (    
        <div style={style} title={item.id}>
            { item.label }
            <img src={`https://static.runelite.net/cache/item/icon/${item.id}.png`} onDragStart={(e) => e.preventDefault() } /> 
        </div>
    )
};

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, items } = props;
  const itemData = [];
  children.forEach((item) => {
    itemData.push(item);
    itemData.push(...(item.children || []));
  });

  console.log(itemData.length, children.length)

  return (
    <div ref={ref}>
      {/* <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider> */}
      <FixedSizeList
        height={300}
        itemCount={itemData.length}
        itemSize={35}
        itemData={itemData}
        >
        {({ index, style }) => <Row style={style} item={items[index]} />}
        </FixedSizeList>
    </div>
  );
});

export default function VirtualAutocomplete(props) {
  return (
    <Autocomplete
      {...props}
      ListboxComponent={ListboxComponent}
      ListboxProps={{ items: props.options }}
    />
  );
}