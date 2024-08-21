import React from 'react'
import { useSignOut,useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'
import Axios from 'axios';

const Create = () => {

	const auth = useAuthUser();
	const signOut = useSignOut();
  	const navigate = useNavigate();
	const [movieImage,setMovieImage] = React.useState("");
	const [movieTitle,setMovieTitle] = React.useState("");
	const [movieYear,setMovieYear] = React.useState("");
	const [visibleDanger, setVisibleDanger] = React.useState("");
	const [visibleSuccess, setVisibleSuccess] = React.useState("");
	const [movieData,setMovieData] = React.useState(new FormData());

	/**
	 * * creating form data on page load
	 *
	 * @const   {formData}   movieData
	 * 
	 * @const   {int}   loggedin user_id
	 *
	 */
	React.useEffect(() => {
	    var form = movieData;
	    form.append('user_id', auth().id);
	    setMovieData(form);
  	},[]);
	

	/**
	 * * handling movie thumbnail change
	 *
	 */
  	const handleFileChange = (e) => {
	    if(e.target.files.length > 0){
	      	appendToForm('thumbnail',e.target.files[0],e.target.files[0].name);
	    }
  	}

  	/**
	 * * handling movie title change
	 *
	 */
  	const handleTitleChange = (e) => {
  		appendToForm('title',e.target.value);
  		setMovieTitle(e.target.value);
  	}

  	/**
	 * * handling movie year change
	 *
	 */
  	const handleYearChange = (e) => {
  		appendToForm('publish_year',e.target.value);
  		setMovieYear(e.target.value);
  	}

  	/**
	 * * appeding user inputs to the form
	 *
	 */
  	const appendToForm = (key,value) => {
  		var form = movieData;
  		form.delete(key);
  		form.append(key,value);
  		setMovieData(form);
  	}

  	/**
	 * * creating movie record
	 *
	 * @const   {formData}   movieData
	 * 
	 * @const   {text/html}   visibleDanger
	 * @const   {text/html}   setVisibleSuccess
	 * 
	 */
  	const handleSubmit = () => {

  		if(!movieData.get("title")){
  			setVisibleDanger('Title cannot be left blank.');
  			return false;
  		}

  		if(!movieData.get("publish_year")){
  			setVisibleDanger('Year cannot be left blank.');
  			return false;
  		}

  		if(!movieData.get("thumbnail")){
  			setVisibleDanger('Movie image cannot be left blank');
  			return false;
  		}

	    Axios.post(process.env.REACT_APP_API_DOMAIN+"/movie/create",movieData)
      	.then(function(response){ 
	      if(response.data.status){
	      	setVisibleSuccess(response.data.msg);
	      	setVisibleDanger('');
	      	setTimeout(function(){
	      		navigate("/movies");
	      	},1000)
	      }else{
	      	setVisibleDanger(response.data.msg);
	      }
	    });
  	}

  	/**
   	 * * loggin out
   	 *
   	 */
  	const LogOut = () => {
  		signOut();
      	navigate("/login");
  	}

	return (
	    <>
	    	<button onClick={()=>LogOut()}>Log Out</button>
	    	<h1 style={{textAlign:'center'}}>Create a movie</h1>
	    	<form className="movie-form">
	      		<input type="file" id="movie-image" onChange={handleFileChange}/>
	      		<input type="text" id="movie-title" value={movieTitle} onChange={handleTitleChange}/>
	      		<input type="number" placeholder="Year" min="1900" max="2099" step="1" value={movieYear} onChange={handleYearChange} />
	    	</form>
	    	<button onClick={handleSubmit} className="mb-3 btn">Create</button>
	    	<p style={{color:'red'}}>{visibleDanger}</p>
	    	<p style={{color:'green'}}>{visibleSuccess}</p>
	    </>
  	)

}

export default Create