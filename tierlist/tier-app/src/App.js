import React, { Component } from 'react';
import './App.css';
var groupBy = require('lodash.groupby');
const _ = require('lodash');

const base = 'http://localhost:4200/api/v1/'
const path = base + 'characters/'; //rename
const imagepath = (id) => path + id + '/image/'

const SOURCES = {
    GameWith: {
        name: 'GameWith', //attribute name
        //api: '/GameWith', 
        //site: '',
    },
    //{name: 'GBF Gaijins', api: '/Gaijins', site: ''}
};


const ELEMENTS = ['fire', 'water', 'earth', 'wind', 'light', 'dark']; //need to match actual values characters have!
//const GAIJINSTIERS = ['QoL', 'SS', 'S', 'A1', 'A2', 'B', 'C'];
//const WEAPONS = ['sabre', 'dagger', 'spear', 'axe', 'staff', 'gun', 'melee', 'bow', 'harp', 'katana'];
const STYLES = ['attack', 'balanced', 'defense', 'heal', 'special',];
const GENDERS = ['m', 'f',];
const RACES = ['human', 'erune', 'draph', 'harvin', 'unknown', 'primal'];
const RARITIES = ['r', 'sr', 'ssr'];
//const OBTAIN = [ '', 'halloween', 'normal', 'premium', 'christmas,', 'collab', ]; 

const colors = {
    'fire' : "#ff9999",
    'water': "#99ccff",
    'earth': "#d2a679",
    'wind': "#bbff99",
    'light': "#ffff99",
    'dark': "#cc99ff",
    'any': "#d9d9d9",
};

const attributes = { //key names need to match character keys
    //element: ELEMENTS,
    //weapons: WEAPONS, //characters don't have weapon values atm
    style: STYLES,
    //gender
    race: RACES,
    //obtain
    rarity: RARITIES,
}

const defaultVal = '-';

  const newFilterChoice = (attribute, filterType) => (prevState) => {
    const { filterStates } = prevState;
   return(
        { filterStates: {...filterStates, [filterType]: attribute} } // eg ...filterStates, style: 'attack'. //does filterType evaluate?
    );
  }
  const newSourceChoice = (sourcename) => (prevState) => {
    const { sourceState } = prevState;
   return(
        { source: SOURCES[sourcename] }
    );
  }

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: false,
        result: null,  
        error: null,

        popup: false,
        popupResult: null,
        
        sorts: null,
        filterStates: _.mapValues(attributes, () => null),
        // filterStates: attributeselectionobj(),
        source: SOURCES[0], //GameWith
        sources: SOURCES, 
      };
      this.fetchTierlistResults = this.fetchTierlistResults.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.updateSource = this.updateSource.bind(this);
      this.componentDidMount = this.componentDidMount.bind(this);
      //this.onPopupDismiss = this.onPopupDismiss.bind(this);
  }

  updateFilter(event, filterType) {
    const attribute = (event.target.value != defaultVal) ? event.target.value : null;

    console.log('UPDATE FILTER');
    this.setState(newFilterChoice(attribute, filterType));
  }

  updateSource(event) {
    const source = (event.target.value != defaultVal) ? event.target.value : null;

    console.log('UPDATE SOURCE');
    this.setState(newSourceChoice(source));
  }

  componentDidMount() { //setstate which depends on state should maybe be refactored but ...except... only goes once right so no
    //const { source } = this.state;
    //this.setState({sourceKey: source});
    this.fetchTierlistResults(); 
  }

  fetchTierlistResults() { //rename
    this.setState({ isLoading: true });
    console.log('fetch characters');
    fetch(path)
        .then(response => response.json())
        .then(result => this.setState({result: result}))
        .catch(e => this.setState({error: e}));
  }


  //onPopupDismiss(event) {}

  render() {
    const {
        sorts, filterStates, source, sources,
        result,
        popup, popupResult,
        error,
        isLoading,
      } = this.state;
      //console.log('error' + error);

    const list = (result) || [];
    console.log('result');
    console.log(result);
    console.log(error);
    //if (list.length == 0 && error!=true){this.setState({error: true});}
    //console.log(result);
    console.log('sources');
    console.log(sources);
    console.log(Object.keys(sources));

    return (
      <div className="page">

        <div className="interactions">

        {
        Object.keys(filterStates).map(filterType => 
            <Filter
                filterValue = {filterStates[filterType]}
                filterType = {filterType}
                onChange = {(e) => this.updateFilter(e, filterType)}
            />
        )}
        <DropDown
            items = {Object.keys(sources)}
            currentItem = {source ? source.name : defaultVal}
            onChange = {(e) => this.updateSource(e)}
        />
        {/*     //
            _.mapValues(filterStates, (value, type) =>
                <Filter
                    filterValue = { value }
                    filterType = { type }
                    onChange = { (e) => this.updateFilter(e, type) }
                >
                </Filter>
            )
        */}
        </div>

        {error
            ? <div className="interactions">
              <p>Something went wrong.</p>
              </div>
            : <Table 
                 //sorts = {sorts}
                 filterStates = {filterStates}
                 list = {list}
                 source = {source}
            /> }

        {popup &&

          <Popup 
            source = {source}
            list = {popupResult}
            onDismiss={this.onPopupDismiss}
          /> }

      </div>
    );
  }
}

const Loading = () => <div>Loading ...</div>

const Filter = ({ filterValue, filterType, onChange }) => {
    const items = [defaultVal, ...attributes[filterType]];
    const value = filterValue || defaultVal;
    console.log('filter: items');
    console.log(items);
    return(
        <DropDown
            items = {items}
            currentItem = {value}
            onChange = {onChange}
        />
    );
}

const DropDown = ({items, currentItem, onChange}) => {
    console.log('currentitem');
    console.log(currentItem);
    console.log('ITEMS');
    console.log(items);
    //items = [];
    items = [defaultVal, ...items];
    return(
        <select onChange={onChange}>
            {items.map(item => 
                {if(item==currentItem){
                    return (<option value={item} selected>{item}</option>);}
                 else {
                    return (<option value={item}>{item}</option>);}
                }
            )}
        </select>
    );
}

const Table = ({ filterStates, list, source }) => { 
        //const filteredList = (list) => filters.reduce( (acc, curr) => {return acc.filter(FILTERS[curr])}, list ); //starting with list, for each filter, remove items from the list
        
        const columntypes = ELEMENTS;                                                   //grouping

        const elecolumnsobj = {'fire': [], 'water': [], 'earth': [], 'wind': [], 'light': [], 'dark': []}

        const filterList = (list) => { //filtering by eg. race, rarity
            const filtered = 
                list.filter(function(character){
                    let val=
                    Object.keys(filterStates).every(function(attrName){
                        //console.log(character[attrName]);
                        //console.log(filterStates[attrName]);
                        let val =((!filterStates[attrName])) || character[attrName].includes(filterStates[attrName]);
                        return val;
                    });
                    return val;
                }
                )
            return filtered;
        }

        const tierNumbersOnly = (groupings) =>
        {
            let keys = Object.keys(groupings);
            console.log(keys);
            for (var i = keys.length - 1; i >= 0; i--) {
                if (isNaN(keys[i])){delete groupings[keys[i]];}
            }
            console.log(Object.keys(groupings));
            return groupings;
        }

        const groupByTier = (charaArr) => {
            if(source){
                return tierNumbersOnly(groupBy(charaArr, chara => chara[source.name]));
                }          //grouping
            else{ return groupBy(charaArr, chara => chara['-']);} //we assume no characters have this value.
        }

        const groupByEle = (charaArr) => {return {...elecolumnsobj, ...groupBy(charaArr, chara => chara.element)};}

        const groupList = (list) => {
        	let grouped2 = {};
        	let grouped1 = 	groupByEle(list);	                                     //grouping
			Object.keys(grouped1).map(function(objectKey, index) {//
			    var charaArr = grouped1[objectKey];
                grouped2[objectKey] =  groupByTier(charaArr);                        //grouping
            });
        	return grouped2;
        }

        const getColRowHeightNums = (finishedList) => //takes eg. {wind: {9.0: [chara1, chara2]}}. returns biggest number of characters in a tier for any element.
        {
            let heights = {};
            Object.keys(finishedList).forEach(function(elegroup){
                Object.keys(finishedList[elegroup]).forEach(function(tiergroup){
                    let len = finishedList[elegroup][tiergroup].length;
                    //console.log(elegroup + ' ' + tiergroup + ' ' + len)
                    if (!heights[tiergroup]) {heights[tiergroup] = len;}
                    else{
                        if(heights[tiergroup]<len){heights[tiergroup] = len;}
                        else{}//do nothing
                    }
                });
            });
            //console.log(heights);
            return heights;
        }
        const addEmptyTierRows = (tierHeights, finishedList) =>{
             Object.keys(finishedList).forEach(function(elegroup){
                //if(elegroup!='any'){ // this is "arbitrary". it's not one of the big 6 elements, so it's off by itself and looks bad with the extra height.
                Object.keys(tierHeights).forEach(function(tier){
                    if(!finishedList[elegroup][tier]){finishedList[elegroup][tier]={};}
                    else{}//nothing
                });
                //}
             });
             return finishedList;
        }

		//console.log("fl:"+ console.log(JSON.stringify(finishedList)));		           					       
        const column  = {width: (100/columntypes.length)+'%', float: 'left', textAlign: 'center'};
        
        const filteredList = filterList(list);
        //console.log(filteredList);
        const groupedFilteredList = groupList(filteredList);
        //console.log('finshkeys '+ Object.keys(finishedList));
        const colRowHeightNums = getColRowHeightNums(groupedFilteredList);
        const finishedList = addEmptyTierRows(colRowHeightNums, groupedFilteredList); //warning: hard-codes tier as left sorting value
        console.log('colrowheightnums');
        console.log(colRowHeightNums);
        console.log(finishedList);
        const sortedKeys = Object.keys(finishedList); 
        console.log("sortedKeys" + sortedKeys);

        console.log(colors);
        console.log(colors['fire']);

        const removeAnyMax =(ele, maxnums) => {if(ele!='any'){return colRowHeightNums;} else {return 0;}}

        return (
            <div className="table">

               <div className="table-header">
               		{columntypes.map(col =>
                        <div style={column}>
                          	{col}{/*put an image here later*/}
                        </div>)}
                </div>

                <div>
                {sortedKeys.map((ele, index) =>
                	<span style={column}>
		                <ElementColumn
                                color = {colors[ele]}
                                index = {index}
    							charactergroups={(finishedList)[ele]}
                                colrowmaxsize={removeAnyMax(ele)}
    							>
    					</ElementColumn>
					</span>
				)}
				</div>

            </div>
        );
}

const ElementColumn = ({ color, index, charactergroups, colrowmaxsize }) => { //Not necessarily Element, but historically Element
  console.log('charactergroups')
  console.log(charactergroups);
  let sortedKeys = Object.keys(charactergroups).sort().reverse();

  const maxcharas = (row) => {
    console.log(row);
    if (!colrowmaxsize){console.log('no max'); return null;} 
    else{return colrowmaxsize[row];}}
  console.log(colrowmaxsize);
	return(
		<div className = {'element-column'}
             style = {{backgroundColor: color}}
         >{/*style = {{width: '100%'}}>*/}
			{sortedKeys.map(row =>
					<CharactersCellTable
                        index = {index}
                        label = {row}
						characters={charactergroups[row]} 
                        maxcharacters={maxcharas(row)}
					>
					</CharactersCellTable>
			)}
		</div>
	);
}

const CharactersCellTable = ({ index, label, characters, maxcharacters }) => { 
    console.log(characters);
    let pairBeginIndex = 0;
    let pairs = [];
    if(label!='undefined' && index==0){
        pairs.push([{label: label}, characters[0]]);
        pairBeginIndex = 1;
    }
    //console.log(pairs[0][0]);
	for(var i = pairBeginIndex; i < characters.length; i += 2){ //i is 1
	    pairs.push(characters.slice(i, i + 2));
	}

    while (pairs.length<Math.ceil(maxcharacters/2)){pairs.push([{}, {}]);}
    let style = {width: "100%"};

    /*if (maxcharacters){
        let rows = Math.ceil(maxcharacters/2);
        let height = rows * 50;
        console.log(height);
        console.log(maxcharacters);
        style['height'] = height; 
    }*/
	return(
		<table style={style}>
       		{pairs.map(pair =>
                <tr style={{display: "block"}}>
                	{pair.map(character =>
	                   <CharacterCell
                       character = {character}
                       >
                       </CharacterCell>
                    )}
                </tr>)
       		}
		</table>
	);
}
const CharacterCell = ({ character }) => { 
    if(character && character.id){return (<th><img src={imagepath(character.id)} alt={character.name} style={{width: "100%", display: "block", width: "70.4px", height: "39.7px"}}></img></th>);} //hardcoding- fix later
    else{
        if(character && character.label){ 
            return(<th><div style={{width: "100%", display: "block", width: "70.4px", height: "39.7px",  color: "#ffffff", backgroundColor: "#424242"}}>{character.label}</div></th>);
        }
        else{
            return (<th><div style={{width: "100%", display: "block", width: "70.4px", height: "39.7px"}}></div></th>);
        }
    }
}

/*
class Rating extends Component {	//Rating drop-down (for later)
    constructor(props){
        super(props);
        this.state = {value: '-'};
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.setState({value: event.target.value});
        //to-do in the future: tells api about new vote, tells api if it needs to "delete" old vote, retrieve new data
    }

    render(){
        const ratings = ['-', 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
        return (
            <select onChange={this.handleChange}>
                {ratings.map(item => 
                    {if(item==this.state.value){
                        return(<option value={item} selected>{item}</option>)
                    }
                    else{return(<option value={item}>{item}</option>)}}
                )}
              </select>
        );
    }
}
*/
const Popup = ({ sourceKey, props }) => {
    return( 
      null
    );
}

export default App;
