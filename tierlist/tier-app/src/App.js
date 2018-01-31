import React, { Component } from 'react';
import './App.css';
var groupBy = require('lodash.groupby');

const path = 'http://localhost:4200/api/v1/select';

const ELEMENTS = ['fire', 'water', 'earth', 'wind', 'light', 'dark']; //need to match actual keys characters have!
//const GAIJINSTIERS = ['QoL', 'SS', 'S', 'A1', 'A2', 'B', 'C'];
//const WEAPONS = []

/*const SOURCES = {
  GBFGAIJINS: 'url',
  GAMEWITH : 'url',
};*/

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: false,
        result: null,  
        error: null,

        popup: false,
        popupResult: null,
        
        sorts: [], 
        filters: [],
        source: 'GBFGAIJINS',

      };
      this.fetchTierlistResults = this.fetchTierlistResults.bind(this)
      //this.onPopupDismiss = this.onPopupDismiss.bind(this);
  }

  componentDidMount() { //setstate which depends on state should maybe be refactored but ...except... only goes once right so no
        const { source } = this.state;
        this.setState({sourceKey: source});
        this.fetchTierlistResults; 
    }

  fetchTierlistResults() {
    this.setState({ isLoading: true });
    console.log('fetch');
    fetch(path)
    .then(response => response.json())
    .then(result => this.setState({result: result}))
    .catch(e => this.setState({error: e}));
  }

  //onPopupDismiss(event) {}

  render() {
    const {
        sorts, filters, source,
        result,
        popup, popupResult,
        error,
        isLoading,
      } = this.state;
      //console.log('error' + error);

    const list = (result) || [];
    console.log(list);
    if (list.length == 0 && error!=true){this.setState({error: true});}
    //console.log(result);

    return (
      <div className="page">

        <div className="interactions">
          <SortsFilters
              sorts = {sorts}
              filters = {filters}
              source = {source}
            >
          </SortsFilters>
        </div>

        {error
            ? <div className="interactions">
              <p>Something went wrong.</p>
              </div>
            : <Table 
                 //sorts = {sorts}
                 filters = {filters}
                 list = {list}
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

const SortsFilters = ({ sorts, filters, source }) => {
 return (null)
}

const Table = ({ filters, list }) => { 
        //const filteredList = (list) => filters.reduce( (acc, curr) => {return acc.filter(FILTERS[curr])}, list ); //starting with list, for each filter, remove items from the list
        
        const columntypes = ELEMENTS;

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

		//console.log("fl:"+ console.log(JSON.stringify(finishedList)));		           					       //grouping
        const column  = {width: (100/columntypes.length)+'%', float: 'left', textAlign: 'center'};
        
        const finishedList = groupList(list);
        //console.log('finshkeys '+ Object.keys(finishedList));
        const sortedKeys = Object.keys(finishedList); //is sorted so long as columnsobj is sorted
        //console.log("sortedKeys" + sortedKeys);
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

const ElementColumn = ({ charactergroups }) => { //Not necessarily Element, but historically Element
  //console.log(charactergroups);
	return(
		<div style = {{width: '100%'}}>
			{Object.keys(charactergroups).map(row =>
					<CharactersCellTable
						characters={charactergroups[row]} 
					>
					</CharactersCellTable>
			)}
		</div>
	);
}

const CharactersCellTable = ({ characters }) => { 
    const base = ''//'https://gbf.wiki/'; //commented out to not strain wiki server for no reason
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
