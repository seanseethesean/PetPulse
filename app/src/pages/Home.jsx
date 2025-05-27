import "../assets/Home.css"
import Navbar from "../components/Navbar"

const Home = () => {

  //  you can delete this code if you don't need it -sean
  //   const handleClick = () => {
  //     console.log("Hello");
  //   }

  //   return (
  //     <div className="home" style = {{marginLeft: '100px'}}>
  //       <h2> Homepage </h2>
  //       <button onClick = {handleClick}> Click here </button>
  //     </div>
  //   );
  // }

  return (
    <div className="home container">
      <div className="home-text">
        <div> <Navbar></Navbar></div>
        <h1>Welcome back, Whisky!</h1>
        <h2>Revolutionizing pet care for you</h2>
        <p>Here, we are determined to help you stay organized, connected, and confident 
          in giving your pets the love and attention they deserve</p>
        <button className='startBtn'>Get Started!</button>
      </div>
    </div>
  )
}

export default Home
