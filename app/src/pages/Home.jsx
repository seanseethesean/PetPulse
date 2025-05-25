import '../assets/Home.css'

const Home = () => {
  
    const handleClick = () => {
      console.log("Hello");
    }
  
    return ( 
      <div className="home" style = {{marginLeft: '100px'}}>
        <h2> Homepage </h2>
        <button onClick = {handleClick}> Click here </button>
      </div>
    );
  }
   
  export default Home;
