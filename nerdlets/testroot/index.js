import React from 'react';
import { EntityTitleTableRowCell, CardSection, CardSectionHeader,CardSectionBody,Popover, PopoverBody, PopoverTrigger, Link, TableHeaderCell,TableRowCell, Table,TableRow,TableHeader ,AccountPicker, NerdGraphQuery,Grid, GridItem, Card, CardBody, CardHeader,Tooltip, EntityByGuidQuery, EntitiesByNameQuery, EntitiesByDomainTypeQuery, EntityCountQuery, Spinner,Button,Icon, Stack, StackItem, HeadingText, BlockText, NerdletStateContext, Dropdown  } from 'nr1'

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class TestNerdlet extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { accountId: null,
      accountChange:false,
      appArrayCopy:[],
      newCarray:[],
      filterarray:[],
      agentCursor:'empty',
      appArray:[],
      newApparray:[],
      cursorApp:'empty',
      filterCursor: 'empty',
      tag:'',
      values:'',
      flip:false,
      alertSeverity:'',
      name:'',
      hostCount:0,
      instanceCount:0,
    reporting:false,
  url:'',
split: false };

    this.onChangeAccount = this.onChangeAccount.bind(this);
  }


  componentDidMount() {
    var id=0
        this.getNrql(id);
        this.getAPM(id);
      }


  getAPM = (id) =>{
    console.log("INSIDE NRQL FROM GRAPHQL:"+id)
  if(this.state.cursorApp=="empty"){
    var dataString =  `{  actor {    entitySearch(queryBuilder: {type: APPLICATION, reporting: true, tags: {key: "accountId", value:"`+id+`"}}) {    results {       entities {        name    guid alertSeverity reporting  }   nextCursor   }    }  }}`
   console.log("APM Query: "+dataString)
    NerdGraphQuery.query({ query: dataString })
    
  .then(result => {
  var temp=result.data.actor.entitySearch.results.entities
  console.log("APPLIST FROM GRAPHQL:"+JSON.stringify(temp))
  
  for(var k in temp){
   
    this.state.appArray.push(temp[k]);
        console.log("Array Data after PUSH:"+this.state.appArray)
  }
  var cur=result.data.actor.entitySearch.results.nextCursor;
  this.setState({cursorApp:cur})
  if(cur){
    console.log("Next Curson LIst:"+this.state.appArray.length+cur)
    this.getAPM(id)
  }
  } 
  )
  .catch(error => {console.log("ERROR NRQL FROM GRAPHQL:"+error)
  console.log ("Error"+error)}  
  );
  }
  else{
    
    var dataString =  `{  actor {    entitySearch(queryBuilder: {type: APPLICATION, reporting: true, tags: {key: "accountId", value:"`+id+`"}}) {    results(cursor: "`+this.state.cursorApp+ `") {       entities {        name    guid alertSeverity reporting }        nextCursor   }    }  }}`
  
   console.log("APM Query: "+dataString)
   NerdGraphQuery.query({ query: dataString })
    
  .then(result => {
    var temp=result.data.actor.entitySearch.results.entities
    console.log("APPLIST FROM GRAPHQL:"+JSON.stringify(temp))
    
    for(var k in temp){
      
        this.state.appArray.push(temp[k]);
          console.log("Array Data after PUSH:"+this.state.appArray)
  
    }
    var cur=result.data.actor.entitySearch.results.nextCursor;
    this.setState({cursorApp:cur})
    if(cur){
      console.log("Next Curson LIst else:"+this.state.appArray.length+cur)
    this.getAPM(id)
    }
    else{
      this.state.appArrayCopy=this.state.appArray
      this.setState({serviceDone:true})
    }
  
  }
  
  )
  .catch(error => {console.log("ERROR NRQL FROM GRAPHQL:"+error)
  console.log ("Error"+error)}
    
  );
  }
  }


  onChangeAccount(_, value) {
    //alert(`Selected account: ${value}`);
    this.state.newCarray=[];
    this.state.flip=false;
    this.state.split=false;
    this.state.filterarray=[];
    this.state.appArray=[];
    this.state.newApparray=[];
    this.state.tag='';
    this.state.values='';
    this.state.agentCursor='empty';
    this.state.filterCursor='empty';
    this.state.cursorApp='empty';
    this.setState({ accountId: value});
    console.log(this.state.accountId)
    
    this.getAPM(value)
    this.getNrql(value)
  }
  

  handleSubmit=(e)=> {
   
    if(e.key === 'Enter' ) {
     e.preventDefault();
    this.setState({flip:true, split:false})
   
    if(this.state.values.toLowerCase()!= this.state.tag.toLowerCase()){
      console.log("New Target Value"+e.target.value);
      {(this.state.tag!='' && this.state.tag!=' ' && this.state.tag.length>2 )?( this.filterNrql(), this.setState({values: this.state.tag})):(null)}
   }
     } 
   } 


   handleChange(e) {
    this.setState({values:'',tag:e.target.value,newApparray:[], flip:false, split:false, filterarray:[], agentCursor:'empty', filterCursor: 'empty'})    
  }


  filterNrql = () =>{
    for (var i in this.state.newCarray){
      if(this.state.newCarray[i].details.name.toLowerCase().includes(this.state.tag.toLowerCase()) || this.state.newCarray[i].details.host.toLowerCase().includes(this.state.tag.toLowerCase())){
        this.state.filterarray.push(this.state.newCarray[i])
      }
    }
  }


  getNrql = (value) =>{
   
    console.log("Enter the Query"+value+this.state.agentCursor)
    if(this.state.agentCursor=="empty"){
      console.log("Query Entered")
      const gql = '{  actor {  account(id:'+value+') {     agentEnvironment {       modules(filter: {contains: \"log4j\"}) {          results {            applicationGuids           details {             host  name          }         loadedModules {              name           version          }       }      nextCursor        }     }  }  }}' ;
    console.log("Query: "+gql)
    const accounts =  NerdGraphQuery.query({ query: gql })
    accounts.then(results => {
        console.log('Nerdgraph Response:', results);
        if(results.data.actor.account!=null){
          this.setState({accountChange:true})
        }
        for(var i in results.data.actor.account.agentEnvironment.modules.results){
          this.state.newCarray.push(results.data.actor.account.agentEnvironment.modules.results[i])
        }
        
        console.log("ARRAY INSIDE: "+JSON.stringify(this.state.newCarray[0]))
        var cur=results.data.actor.account.agentEnvironment.modules.nextCursor;
        this.setState({agentCursor:cur})
        if(cur){
          console.log("Next Cursor LIst:"+results.data.actor.account.agentEnvironment.modules.results.length+cur)
          this.getNrql(value)
        }
        else{
          this.setState({accountChange:false})
        }
        
    }).catch((error) => { console.log('Nerdgraph Error:', error); })

    }
    else{
      console.log("Query Entered 1"+this.state.agentCursor)
      const gql = '{  actor {  account(id:'+value+') {     agentEnvironment {       modules(filter: {contains: \"log4j\"}, cursor: "'+this.state.agentCursor+ '") {          results {            applicationGuids           details {             host  name          }         loadedModules {              name           version          }       }      nextCursor        }     }  }  }}' ;
      console.log("Query: "+gql)
      const accounts =  NerdGraphQuery.query({ query: gql })
      accounts.then(results => {
          console.log('Nerdgraph Response:', results);
          if(results.data.actor.account!=null){
            this.setState({accountChange:true})
          }
          for(var i in results.data.actor.account.agentEnvironment.modules.results){
            this.state.newCarray.push(results.data.actor.account.agentEnvironment.modules.results[i])
          }
          console.log("ARRAY INSIDE1: "+JSON.stringify(this.state.newCarray))
          var cur=results.data.actor.account.agentEnvironment.modules.nextCursor;
          this.setState({agentCursor:cur})
          if(cur){
            console.log("Next Cursor LIst:"+results.data.actor.account.agentEnvironment.modules.results.length+cur)
            this.getNrql(value)
          }
          else{
            console.log("Final Data:"+this.state.newCarray.length)
            this.setState({accountChange:false})
          }
          
      }).catch((error) => { console.log('Nerdgraph Error:', error); })
    }
  }
  

  getNrqlApp = (value) =>{
   
    
      console.log("Query Entered")
      
      const gql='{ actor { entity(guid: "'+value+'") {  name reporting  permalink ... on ApmApplicationEntity { applicationInstances { modules(filter: {contains: "log4j"}) {   name  version  } details { host  name  language  }  }  apmSummary {  hostCount instanceCount } applicationId }  alertSeverity } }  } ' 
  
    console.log("Query: "+gql)
    const accounts =  NerdGraphQuery.query({ query: gql })
    accounts.then(results => {
        console.log('Nerdgraph Response Second:', results);
        this.state.url=results.data.actor.entity.permalink;
        this.state.name=results.data.actor.entity.name;
        this.state.reporting=results.data.actor.entity.reporting;
        this.state.alertSeverity=results.data.actor.entity.alertSeverity;
        this.state.hostCount=results.data.actor.entity.apmSummary.hostCount;
        this.state.instanceCount=results.data.actor.entity.apmSummary.instanceCount;
        for(var i in results.data.actor.entity.applicationInstances){
          if(results.data.actor.entity.applicationInstances[i].modules.length!=0){
            this.state.newApparray.push(results.data.actor.entity.applicationInstances[i])
          }
          
        }
        this.forceUpdate();
        console.log("ARRAY INSIDE: "+this.state.newApparray.length)
      
        
    }).catch((error) => { console.log('Nerdgraph Error:', error); })

  }


  buttonChange=(label)=>{
   this.setState({tag:label['name']})
   this.state.flip=true;
   this.state.split=true
   
   // var labelVal=label
    console.log("VALUE changed in Button"+this.state.tag)
    this.state.newApparray=[]
   // this.setState({newCarray:[],newInfraArray: [], newNRQLarray:[] });
   //this.state.newCarray=[];
   this.getNrqlApp(label['guid']) 
  }
 
 
  getAppRow = () =>{
    console.log("Inside Module")
    const items = [
      {
        url: this.state.url,
        name: this.state.name,
       
        alertSeverity: this.state.alertSeverity,
        reporting: this.state.reporting,
        hostCount:this.state.hostCount,
        instanceCount:this.state.instanceCount
      },
    ];
    const module= this.state.newApparray
   return  <Table items={items} multivalue>
     
    <TableHeader>
      <TableHeaderCell><b>Application</b></TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </TableHeader>

    {({ item }) => (
      <TableRow>
      <TableRowCell additionalValue={`Host Count: ${item.hostCount},  Instance Count: ${item.instanceCount} `}>
     
        <EntityTitleTableRowCell value={item} />
      </TableRowCell>
      <TableRowCell>
      <Link to={item.url}>Go to the dashboard</Link>
    </TableRowCell>
    </TableRow>
    )}
    
  </Table>
  }

  getlogHeader=()=>{
   var head= ['module', 'version']
   return head.map((key, index)=>{
    return <th key={key}>{key.toUpperCase()}</th>
    })
  }

  getlogRow= (modules) =>{
    return modules.map((row, index)=>{
                                 
      return <tr key={index}><td>{row.name}</td>
      <td>{row.version}</td></tr>

})
   
  }


  getModuleRow = () =>{
    console.log("Inside Module"+JSON.stringify(this.state.newApparray))
   
    const module= this.state.newApparray
   return  <Table items={module} multivalue>
     
    <TableHeader>
      <TableHeaderCell><b> Log4J Application Instances</b></TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    
      <TableHeaderCell></TableHeaderCell>
     
     
      
    </TableHeader>

    {({ item }) => (
     
      <TableRow>
      <TableRowCell >
    
      {item.details.host}
    </TableRowCell>

    <TableRowCell additionalValue={`Language: ${item.details.language}`}>
     <b>Instance Name: </b>
      {item.details.name}
    </TableRowCell>
  
    <TableRowCell >
    <Popover>
      <PopoverTrigger>
       <Button sizeType={Button.SIZE_TYPE.SMALL} type={Button.TYPE.PRIMARY} >Log4J</Button>
      </PopoverTrigger>
      <PopoverBody>
      <Card style={{ width: '250px' }}>
          <CardBody>
            {this.getlogHeader()}
         { this.getlogRow(item.modules)}
          </CardBody>
        </Card>
        
      </PopoverBody>
    </Popover>
   
    </TableRowCell>
    </TableRow>
   
    )}
    
  </Table>
  }


  getFARowsDataC = ()=>{
    var items=[]
    console.log("Inside table body APM"+this.state.appArrayCopy.length)
      for(var i in this.state.appArrayCopy ){
        if(this.state.appArrayCopy[i]['name'].toLowerCase().includes(this.state.tag.toLowerCase())){
          items.push(this.state.appArrayCopy[i])
        }
      }
      
            // var keys =['label'];
            return (
              <Table items={items}>
                <TableHeader>
                  <TableHeaderCell></TableHeaderCell>
                </TableHeader>
          
                {({ item }) => (
                 
                  <TableRow>
                    <EntityTitleTableRowCell onClick={()=>{ this.buttonChange(item); console.log("Button changed: "+item)}} value={item} />
                  </TableRow>
                   
                )}
              </Table>
            );
            
             }
             
             
  getAHeaderC = () =>{
    console.log("Inside table header")
    var keys = ['Application Instance Name','hostname','Log4j Modules'];
    return keys.map((key, index)=>{
    return <th key={key}>{key.toUpperCase()}</th>
    })
    }
    
    
   getARowsDataC = ()=>{
     
        var items = this.state.newCarray;
              
               return items.map((row, index)=>{
                 return row.loadedModules.map((item,ind)=>{
                  return <tr key={index}>
                    <td>{row.details.name}</td>
                    <td>{row.details.host}</td>
                      <td>{item.name}</td></tr>
                 })
  
               })
               }
               getRowsDataC = ()=>{
     
                var items = this.state.filterarray;
                      
                       return items.map((row, index)=>{
                         return row.loadedModules.map((item,ind)=>{
                          return <tr key={index}>
                            <td>{row.details.name}</td>
                            <td>{row.details.host}</td>
                              <td>{item.name}</td></tr>
                         })
          
                       })
                       }
                       
                       
  render() {
    console.log("Render again:"+this.state.newApparray.length)
    return (<Grid  >
      <GridItem columnSpan={10} style={{'backgroundColor':'white'}} className="chart app">
      <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <AccountPicker
      disabled={this.state.accountChange}
        value={this.state.accountId}
        onChange={this.onChangeAccount}
      />
     
      <br/><br/>
      <Stack fullWidth >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     
      <StackItem grow={true}>
                
  <input value={this.state.tag} className="react-tagsinput" autoFocus={true} placeholder='Filter by Application name or hostname'  onKeyPress={(e) => { this.handleSubmit(e) }}  onChange={(e)=>{this.handleChange(e)}}/>  
  
      </StackItem>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <StackItem>
      {this.state.accountChange?(<Spinner type={Spinner.TYPE.DOT}/>):(null)}
      </StackItem>
      </Stack>
      </GridItem>
      <GridItem 
        columnSpan={3} style={{'backgroundColor':"lightgray"}}>
     
      <Card collapsible spacingType={[Card.SPACING_TYPE.MEDIUM]}  style={{'backgroundColor':"white"}}>
        <CardHeader
          title='APM'
          subtitle='APM - Services'
        
        />
        <CardBody>

{this.getFARowsDataC()}

</CardBody>
      </Card>
   
     
      </GridItem>
      <GridItem columnSpan={8} style={{'backgroundColor':"lightgray"}} >
      <Stack fullWidth >
      <StackItem grow={true}>
       
           <Card collapsible spacingType={[Card.SPACING_TYPE.MEDIUM]}  style={{'backgroundColor':'#f3f3ee'}}>
           <CardHeader
             title='LOG4J Modules'
            
           />
           <CardBody>
           
           {this.state.newCarray.length!=0 && this.state.flip==false?( <table style={{'backgroundColor':'grey'}}>
          <thead>
          <tr>{this.getAHeaderC()}</tr>
          </thead>
          <tbody>
          {this.getARowsDataC()}
          </tbody>
        </table>):
        this.state.filterarray.length!=0 && this.state.flip==true && this.state.split==false?(<table>
          <thead>
          <tr>{this.getAHeaderC()}</tr>
          </thead>
          <tbody>
          {this.getRowsDataC()}
          </tbody>
        </table>):
        this.state.newApparray.length!=0 && this.state.flip==true && this.state.split==true?(<div>
          <CardSection collapsible>
          
          <CardSectionHeader title="Application Details"></CardSectionHeader>
            <CardSectionBody> {this.getAppRow()}</CardSectionBody>
          </CardSection>
          <CardSection collapsible>
          <CardSectionHeader title="Instance Details"></CardSectionHeader>
            <CardSectionBody>  {this.getModuleRow()}</CardSectionBody>
          
         
          </CardSection>
          </div>):(<div style={{textAlign:"center"}}>No Data Found<br/><br/><br/><Spinner/></div>)}
         
        </CardBody>
             </Card>
            
       
      </StackItem>
  </Stack>
  </GridItem>
  </Grid>
     
    );
  }
}
