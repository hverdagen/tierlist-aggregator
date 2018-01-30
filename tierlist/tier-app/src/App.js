import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
var groupBy = require('lodash.groupby');

const path = 'http://localhost:4200/api/v1/select'

/*const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};*/ 

const ELEMENTS = ['fire', 'water', 'earth', 'wind', 'light', 'dark']; //need to match actual keys characters have!

const sortByElement = (list) => {
  //do stuff
};

const SORTS = {
	NONE: list => list,
  	ELEMENT: list => sortByElement(list),
};
const FILTERS = {
  //NONE: list => list,
};
const SOURCES = {
  GBFGAIJINS: { URL: 'api stuff here'}
};

const dummyresults = [
  {
    name: 'Sturm',
    url: 'https://gamewith.akamaized.net/article_tools/granbluefantasy/gacha/3114.jpg',
    element: 'Fire',
    tier: 9.5,
    weapon: "Sword",
    writeup: "sample text",
  },
  {
    name: 'Vane',
    url: 'https://gamewith.akamaized.net/article_tools/granbluefantasy/gacha/3116.jpg',
    element: 'Water',
    tier: 9.0,
    weapon: "Spear",
    writeup: "HOI",
  },
  {
    name: 'Uno',
    url: 'https://gamewith.akamaized.net/article_tools/granbluefantasy/gacha/3116.jpg',
    element: 'Water',
    tier: 3.0,
    weapon: "Spear",
    writeup: "Uno",
  },
  {
    name: 'Izmir',
    url: 'https://gamewith.akamaized.net/article_tools/granbluefantasy/gacha/3116.jpg',
    element: 'Water',
    tier: 3.0,
    weapon: "Sword",
    writeup: "Izmir",
  },
  {
    name: 'WIzmir',
    url: 'https://gamewith.akamaized.net/article_tools/granbluefantasy/gacha/3116.jpg',
    element: 'Water',
    tier: 3.0,
    weapon: "Sword",
    writeup: "WIzmir",
  },
  {
    name: 'FIzmir',
    url: 'https://gamewith.akamaized.net/article_tools/granbluefantasy/gacha/3116.jpg',
    element: 'Fire',
    tier: 3.0,
    weapon: "Sword",
    writeup: "FIzmir",
  },
];

const updateSetTierlistState = (result) => (prevState) => {
  const { sourceKey, results } = prevState;
  console.log(results);
  console.log(result);
  return {
    results: { ...results, [sourceKey]: { result } },
    isLoading: false
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: false,
        results: [],  
        error: null,

        popup: false,
        popupResult: null,
        
        sort: 'ELEMENTS',
        sortKey: 'ELEMENTS',
        filters: [],
        filterKeys: [],
        source: 'GBFGAIJINS', //selected in ui, becomes sourceKey when submitted
        sourceKey: 'GBFGAIJINS' //what the tierlist shows
      };
      this.onTierlistViewSubmit = this.onTierlistViewSubmit.bind(this);
      this.fetchTierlistResults = this.fetchTierlistResults.bind(this)
      this.onPopupDismiss = this.onPopupDismiss.bind(this);
      this.setTierlistResults = this.setTierlistResults.bind(this);
  }

  //
  componentDidMount() { //setstate which depends on state should maybe be refactored but ...except... only goes once right so no
        const { source } = this.state;
        this.setState({sourceKey: source});
        this.fetchTierlistResults(source);  //source currently doesn't matter
    }

  onTierlistViewSubmit(event) {
    const {source} = this.state;
    if (!this.state.results[source]){
      this.setState({sourceKey:source});
      this.fetchTierlistResults(source);
    }
    else{}//do nothing 
  }

  fetchTierlistResults(tierlist) {
    this.setState({ isLoading: true });
    console.log('fetch');
    fetch(path)
    .then(response => response.json())
    .then(result => this.setTierlistResults(result))
    .catch(e => this.setState({error: e}));
  }

  setTierlistResults(result) {
    console.log('result');
    console.log(result);
    this.setState(updateSetTierlistState(result)); //relies on previous state to know sourceKey, so
  }
  onPopupDismiss(event) {}

  //


  render() {
    const {
        sort, filters, source,
        results,
        filterKeys,
        sourceKey,
        popup,
        popupResult,
        error,
        isLoading,
      } = this.state;
      console.log('error' + error);

    const list = (results && results[sourceKey] && results[sourceKey].result) || [];
    console.log(results);
    //console.log(list.result);

    return (
      <div className="page">

        <div className="interactions">
          <Search 
              //sort = {sort}
              filters = {filters}
              source = {source}
              onSubmit={this.onSearchSubmit}
            >
              Search
          </Search>
        </div>

        {error
            ? <div className="interactions">
              <p>Something went wrong.</p>
              </div>
            : <Table 
                 //sort = {sortKey}         ////{error.toString()}
                 filters = {filterKeys}
                 list = {list}
            /> }

        {popup &&

          <Popup 
            sourceKey = {sourceKey}
            list = {popupResult}
            onDismiss={this.onPopupDismiss}
          /> }

      </div>
    );
  }
}

const Loading = () => <div>Loading ...</div>

const Search = ({ sort, filters, source }) => { return(null)} //todo

const Table = ({ filters, list }) => { 
        //const filteredList = (list) => filters.reduce( (acc, curr) => {return acc.filter(FILTERS[curr])}, list ); //starting with list, for each filter, remove items from the list
        
        const columnsobj = {'fire': [], 'water': [], 'earth': [], 'wind': [], 'light': [], 'dark': []}
        //const rowobj = do later, isn't necessary right now.
        const groupList = (list) => {
        	let grouped2 = {};
        	let grouped1 = groupBy(list, chara => chara.element);				      //grouping
			let colgrouped1 = {...columnsobj, ...grouped1};
			Object.keys(colgrouped1).map(function(objectKey, index) {//
			    var charaArr = colgrouped1[objectKey];
			    grouped2[objectKey] = groupBy(charaArr, chara => chara.tier);	       //grouping
			});
        	return grouped2;
        }

		//console.log("fl:"+ console.log(JSON.stringify(finishedList)));
        const columntypes = ELEMENTS;				           					       //grouping
        const column  = {width: (100/columntypes.length)+'%', float: 'left', textAlign: 'center'};
        
        const finishedList = groupList(list);
        //console.log('finshkeys '+ Object.keys(finishedList));
        const sortedKeys = Object.keys(finishedList); //Object.keys(finishedList).sort(function(a,b){return ELEMENTS.indexOf(a)-ELEMENTS.indexOf(b)})//wasn't immediately necessary  //grouping
        console.log("sortedKeys" + sortedKeys);
        return (
            <div className="table">

               <div className="table-header">
               		{columntypes.map(col =>
                        <div style={column}>
                          	{col}{/*put an image here later*/}
                        </div>)}
                </div>

                <div>
                {sortedKeys.map(ele =>
                	<span style={column}>
		                <ElementColumn
    							charactergroups={(finishedList)[ele]}
    							>
    					</ElementColumn>
					</span>
				)}
				</div>

            </div>
        );
      
}

const ElementColumn = ({ charactergroups }) => {
  console.log(charactergroups);
	return(
		<div style = {{width: '100%'}}>
			{Object.keys(charactergroups).map(tier =>		//row: tier
					<CharactersCellTable
						characters={charactergroups[tier]} 
					>
					</CharactersCellTable>
			)}
		</div>
	);
}

const CharactersCellTable = ({ characters }) => { 
    const base = '' //'https://gbf.wiki/';
	var pairs = [];
	for(var i = 0; i < characters.length; i += 2){
	    pairs.push(characters.slice(i, i + 2));
	}
	return(
		<table style={{width: "100%"}}>
       		{pairs.map(pair =>
                <tr>
                	{pair.map(character =>
	                    <th><img src={base+character.imgurl} alt={character.name} style={{width: "100%", display: "block"}}></img></th>
                    )}
                </tr>)
       		}
		</table>
	)
}

class Rating extends Component {	//Rating drop-down. Should go in pop-up.
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

/*const Popup = ({ sourceKey, props }) => {
  if(sourceKey == 'GBFGAIJINS'){ return( <GaijinsPopup props={props} /> } //there's a more elegant way to do this, but this is fine for now
}
const GaijinsPopup =  ({ props }) => {
}*/

const Popup = ({ sourceKey, props }) => {
  if(sourceKey == 'GBFGAIJINS'){ //there's a more elegant way to do this, but this is fine for now
    return( 
      {}//popup here
    )
   } 
}


export default App;
