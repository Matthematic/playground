import React, { useEffect, useRef, useState } from "react";
import "./Grid.css";
import { 
  Grid,
  TextField,
  Paper,
  ThemeProvider,
  createTheme,
  Container,
  Autocomplete, 
  Button,
  IconButton,
  Snackbar,
  Checkbox,
  FormGroup,
  FormControlLabel, 
  Tooltip
} from '@mui/material'
import { createFilterOptions } from '@mui/material/Autocomplete';
import styled from 'styled-components';
import fill from 'lodash.fill';
import cloneDeep from 'lodash.clonedeep';
import chunk from 'lodash.chunk';
import flatten from 'lodash.flatten';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VirtualAutocomplete from "./virtual.list"

const theme = createTheme({
  palette: {
   mode: 'dark',
  },
});

const CopyToClipboardButton = ({ text, valid }) => {
  const [open, setOpen] = useState(false)
  const handleClick = () => {
    setOpen(true)
    if (valid) {
      navigator.clipboard.writeText(text)
    }
  }
  
  return (
      <>
        <Button onClick={handleClick} sx={{ textTransform: 'unset', overflowWrap: 'anywhere' }}>{text}</Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          message={valid ? "Copied to clipboard" : "Choose a name first"}
        />
      </>
  )
}

const ImportFromClipboardButton = ({ onCopy }) => {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const handleClick = async () => {
    try {
      await navigator.clipboard.readText().then(onCopy).then(() => setSuccess(true))
    }
    catch(e) {
      console.log(e)
      setSuccess(false)      
    }
    setOpen(true)
  }
  
  return (
      <>
        <Button onClick={handleClick} sx={{ textTransform: 'unset', overflowWrap: 'anywhere' }}>Import</Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          message={success ? "Imported from clipboard" : "Error - Unable to import"}
        />
      </>
  )
}

const FlipYButton = ({ onFlip }) => {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const handleClick = () => {
    try {
      onFlip()
    }
    catch(e) {
      console.log(e)
      setSuccess(false)      
    }
    setOpen(true)
  }
  
  return (
      <>
        <Button onClick={handleClick} sx={{ textTransform: 'unset', overflowWrap: 'anywhere' }}>Flip Y</Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          message={success ? "Flipped" : "Error - Unable to flip"}
        />
      </>
  )
}

const FlipXButton = ({ onFlip }) => {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const handleClick = () => {
    try {
      onFlip()
    }
    catch(e) {
      console.log(e)
      setSuccess(false)      
    }
    setOpen(true)
  }
  
  return (
      <>
        <Button onClick={handleClick} sx={{ textTransform: 'unset', overflowWrap: 'anywhere' }}>Flip X</Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          message={success ? "Flipped" : "Error - Unable to flip"}
        />
      </>
  )
}

const TransposeButton = ({ onTranspose }) => {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const handleClick = () => {
    try {
      onTranspose()
    }
    catch(e) {
      console.log(e)
      setSuccess(false)      
    }
    setOpen(true)
  }
  
  return (
      <>
        <Button onClick={handleClick} sx={{ textTransform: 'unset', overflowWrap: 'anywhere' }}>Transpose</Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          message={success ? "Transposed" : "Error - Unable to transpose"}
        />
      </>
  )
}


const BankTags = () => {
  const ROWS = 10;
  const [names, setNames] = useState([])
  const autocompleteRef = useRef()
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [icon, setIcon] = useState({ id: '952', label: 'Spade' })
  const [tracks, setTracks] = useState([])
  console.log(tracks)
  const [layout, setLayout] = useState(true)
  const [from, setFrom] = useState(null)
  const [items, setItems] = useState(fill(new Array(8*ROWS), { id: -1, label: 'Blank' }, 0, 8*ROWS)) // { id, label, }
  const [tagName, setTagName] = useState('')


  React.useEffect(() => {
    setLoading(true)
    fetch("https://static.runelite.net/cache/item/names.json")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Response is not OK');
      })
      .then((data) => {
        setNames(shapeData(data))
        setLoading(false)
      })
      .catch(e => {
        setLoading(false)
        console.error(e);
      })
  }, [ ]);

  const bankTagString = `${tagName},${icon.id},${items.filter(i => i.id !== -1).map((i) => i.id).join(',')}`
  const bankTagLayoutString = `banktaglayoutsplugin:${tagName},${items.map((i, idx) => `${i.id}:${idx}`).filter(s => !s.startsWith(-1))
  .filter(i => i.id !== -1).join(',')}`

  const shapeData = (data) => {
    const newData = []
    for (const name in data) {
      const found = newData.find(d => d.id === name)
      if (found) {
        console.log("found duplicate id", data[name], found, name)
      }
      //if (!newData.find(d => d.label === data[name])) { // remove duplicates, which are the same items but noted
        newData.push({label: `${data[name]}`, id: name })
      //}
    }
    return newData
  }

  function addItem(e, v) {
    console.log("v", v)
    // find first blank
    if (v) {
      const firstBlank = items.indexOf(items.find(i => i.id === -1))
      const newItems = cloneDeep(items)
      newItems.splice(firstBlank, 1, v)
      setItems(newItems)
      setInput('')
    }
  }

  function swapElements(array, index1, index2) {
    array[index1] = array.splice(index2, 1, array[index1])[0];
};

  function onSelectItem(idx) {
    if (from === null) {
      setFrom(idx)
    }
    else {
      const newItems = cloneDeep(items)
      swapElements(newItems, from, idx)
      setItems(newItems)
      setFrom(null)
    }
  }

  function onRemoveItem(idx) {
    const newItems = cloneDeep(items)
    newItems.splice(idx, 1, { id: -1, label: 'Blank' })
    setItems(newItems)
    setFrom(null)
  }

  function addBlankRow(idx) {
    const newRow = fill(new Array(8), { id: -1, label: 'Blank' }, 0, 8)
    const newItems = chunk(cloneDeep(items), 8)
    newItems.splice(idx+1, 0, newRow)
    setItems(flatten(newItems))
  }

  function removeRow(idx) {
    const newItems = chunk(cloneDeep(items), 8)
    newItems.splice(idx, 1)
    setItems(flatten(newItems))
  }

  function onImport(tag) {
    if (tag.startsWith('banktaglayoutsplugin')) {
      const splitTag = tag.split(',');
      const tagName = splitTag[0].split(':')[1]
      splitTag.splice(0, 1)
      splitTag.splice(splitTag.indexOf(`banktag:${tagName}`))

      let highestPos = 0
      splitTag.forEach(item => {
        const pos = item.split(':')[1]
        if (Number(pos) > highestPos) {
          highestPos = Number(pos)
        }
      })



      const numRows = Math.ceil((highestPos+1) / 8)
      const numItems = numRows*8
      const itemList = fill(new Array(numItems), { id: -1, label: 'Blank' }, 0, numItems)

      for (const i in splitTag) {
        const id = splitTag[i].split(':')[0]
        const position = splitTag[i].split(':')[1]
        const found = names.find(n => n.id === id)
        if (found) {
          itemList[position] = { id, label: found.label }
        }
        else {
          console.error(`no item found for ${id}`)
        }
      }

      setTagName(tagName)
      setItems(itemList)
    }
    else {
      throw new Error("Attempted to import invalid tag")
    }
  }

  function onFlipY() {
    const newItems = chunk(cloneDeep(items), 8)
    newItems.reverse()
    setItems(flatten(newItems))
  }

  const transpose = arr => {
    const copy = cloneDeep(arr)
    for (let i = 0; i < copy.length; i++) {
       for (let j = 0; j < i; j++) {
          const tmp = copy[i][j];
          copy[i][j] = copy[j][i];
          copy[j][i] = tmp;
       };
    }
    return copy
 }

 function onTranspose() {
  const transposed = transpose(cloneDeep(chunk(items, 8)))
  console.log(transposed)
  setItems(flatten(transposed))
 }

  function onFlipX(track) {
    const newItems = chunk(cloneDeep(items), 8)
    for (const row in newItems) {
      newItems[row].reverse()
    }
    setItems(flatten(newItems))
  }
  

  return (
      <ThemeProvider theme={theme}>
        <Paper elevation={1} sx={{ height: '100%', width: '100%' }}>
        <Container>
          <Paper elevation={6} sx={{ width: '1000px', margin: 'auto' }}>
            <FormGroup>
              <Container>
                <SideBySide style={{ marginTop: '20px' }}>
                  <TextField required onChange={(e) => setTagName(e.target.value)}  label="Name your tag" name="name" value={tagName} />
                  <FormControlLabel control={<Checkbox defaultChecked sx={{ marginLeft: '20px' }} onChange={(e) => setLayout(e.target.checked)} />} label="Layout" />
                  <ImportFromClipboardButton onCopy={onImport} />
                  <FlipXButton onFlip={onFlipX} />
                  <FlipYButton onFlip={onFlipY} />
                  <TransposeButton onTranspose={onTranspose}/>
                </SideBySide>
                <Autocomplete
                  ref={autocompleteRef}
                  sx={{ width: '100%', marginTop: '20px', marginBottom: '50px' }}
                  disablePortal
                  value={input}
                  loading={loading}
                  freeSolo
                  clearOnEscape
                  clearOnBlur
                  autoHighlight
                  autoComplete
                  options={names}
                  onChange={addItem}
                  onInputChange={(e) => {
                    if (e) {
                      setInput(e.target.value)
                    }
                  }}
                  filterOptions={createFilterOptions({
                    matchFrom: 'any',
                    limit: 3,
                  })}
                  renderInput={(params) => <TextField {...params} label="Search for an item" />}
                  handleHomeEndKeys
                />
                <Grid container xs={12}>
                  <Grid item xs={3} />
                  <Grid container item xs={6} rowSpacing={1}>
                    <>
                      <Grid item xs={0.5} />
                      { chunk(items, 8)[0].map((item, idx) => (
                        <>
                        <Grid 
                          item 
                          xs={1.375} 
                          key={idx} >
                          <Checkbox onChange={() => setTracks([...tracks, { type: 'column', idx }])} />
                        </Grid>
                        
                        </>
                      )) }
                      <Grid item xs={0.5} /> 
                    </>

                    { chunk(items, 8).map((row, idx) => {
                      
                      return (
                      <>
                        <Grid item xs={0.5}>
                          <IconButton aria-label="add" sx={{ marginLeft: '-20px' }} onClick={() => removeRow(idx)}>
                            <RemoveIcon />
                          </IconButton>
                        </Grid>
                        { row.map((item, itemIdx) => {

                          return (
                          <Grid 
                            item 
                            xs={1.375} 
                            key={idx} 
                            onClick={(e) => {
                              switch (e.detail) {
                                case 1:
                                  onSelectItem((idx*8)+itemIdx)
                                  break;
                                case 2:
                                  onRemoveItem((idx*8)+itemIdx)
                                  break;
                                default:
                                  break;
                              }
                            }
                            }
                          >
                            <Item item={item} selected={from === (idx*8)+itemIdx} />
                          </Grid>
                        )
                          }) }
                        <Grid item xs={0.5}>
                          <SideBySide>
                            <IconButton aria-label="add" onClick={() => addBlankRow(idx)}>
                              <AddIcon />
                            </IconButton>
                            <Checkbox onChange={() => setTracks([...tracks, { type: 'row', idx }])} />
                          </SideBySide>
                        </Grid>
                      </>
                      )
                      }) }
                  </Grid>
                  <Grid item xs={3} />
                </Grid>

                <Paper elevation={7} sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <CopyToClipboardButton text={layout ? `${bankTagLayoutString},banktag:${bankTagString}` : bankTagString} valid={tagName} />
                </Paper>
                
              </Container>
            </FormGroup>
          </Paper>
        </Container>
        </Paper>
      </ThemeProvider>
  );
};

const SideBySide = styled.div`
display: flex;
flex-direction: row;
`

const Item = ({ item, selected }) => {
  return (
    <Tooltip title={`${item.label} ${item.id}`}>
      <Paper elevation={selected ? 18 : 8} sx={{ height: '50px', width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} >
        { item.id !== -1 ? <img src={`https://static.runelite.net/cache/item/icon/${item.id}.png`} onDragStart={(e) => e.preventDefault() } /> : null }
      </Paper>
    </Tooltip>
  )
}


function App() {
  return (
    <div className="app">
      <BankTags />
    </div>
  );
}

export default App;
