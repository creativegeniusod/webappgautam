import React from 'react'
import { useSignOut,useAuthUser } from 'react-auth-kit'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Axios from 'axios';
// import LogoutIcon from '../../Images/logout-icon.svg';
// import DragDropIcon from '../../Images/drag-icon.svg';

const Edit = () => {

	const auth = useAuthUser();
	const signOut = useSignOut();
  	const navigate = useNavigate();
  	const location = useLocation();
	const { movie_id } = location.state ? location.state : "null";
	const [movieImage,setMovieImage] = React.useState("");
	const [movieTitle,setMovieTitle] = React.useState("");
	const [movieYear,setMovieYear] = React.useState("");
	const [visibleTitleDanger, setVisibleTitleDanger] = React.useState("");
	const [visibleYearDanger, setVisibleYearDanger] = React.useState("");
	const [visibleDanger, setVisibleDanger] = React.useState("");
	const [visibleSuccess, setVisibleSuccess] = React.useState("");
	const [movieData,setMovieData] = React.useState(new FormData());
	const [previewThumb,setPreviewThumb] = React.useState("");

	/**
	 * * creating form data on page load
	 *
	 * @const   {formData}   movieData
	 * 
	 * @const   {int}   loggedin user_id
	 * @const   {int}   current movie_id
	 *
	 */
	React.useEffect(() => {
	    var form = movieData;
	    form.append('user_id', auth().id);
	    form.append('movie_id', movie_id);
	    setMovieData(form);
	    getMovie(movie_id);
  	},[]);


	/**
	 * * getting to be edited movie record
	 *
	 * @const   {int}   movie_id
	 * 
	 * @const   {text/html}   visibleDanger
	 * @const   {text/html}   setVisibleSuccess
	 * 
	 */
  	const getMovie = (movie_id) => {
	    fetch(`${process.env.REACT_APP_API_DOMAIN}/movies/get`,{
	        method:'post',
	        body:JSON.stringify({
	          id: movie_id,
	        }),
	        headers:{
	          "Content-type" : "application/json"
	        }
	    }).then((response) => response.json()
	    ).then((rsp) => {
	        if(rsp.status){
	          	setMovieTitle(rsp.data[0].title);
	          	appendToForm('title',rsp.data[0].title);
				setMovieYear(rsp.data[0].publish_year);
				setMovieImage(rsp.data[0].featured_image);
				appendToForm('publish_year',rsp.data[0].publish_year);
	        }
	    });
  	}
	
	/**
	 * * handling movie thumbnail change
	 *
	 */
  	const handleFileChange = async (e) => {
	    if(e.target.files.length > 0){
	      	appendToForm('thumbnail',e.target.files[0],e.target.files[0].name);
	      	var imgPreview = await getImageBase64(e.target.files[0]);
	      	setPreviewThumb(imgPreview);
	    }else{
	    	setPreviewThumb("");
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
	 * * updating movie record
	 *
	 * @const   {formData}   movieData
	 * 
	 * @const   {text/html}   visibleDanger
	 * @const   {text/html}   setVisibleSuccess
	 * 
	 */
  	const handleSubmit = () => {

  		if(!movieData.get("title")){
  			setVisibleTitleDanger('Title cannot be left blank.');
  			return false;
  		}

  		if(!movieData.get("publish_year")){
  			setVisibleYearDanger('Year cannot be left blank.');
  			return false;
  		}

	    Axios.post(process.env.REACT_APP_API_DOMAIN+"/movie/update",movieData)
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

  	const getImageBase64 = (file) => {

  		return new Promise((resolve,reject)=>{

		    const fileReader = new FileReader();
		    fileReader.readAsDataURL(file)
		    fileReader.onload = () => {
		      resolve(fileReader.result);
		    }
		    fileReader.onerror = (error) => {
		      reject(error);
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
			<div className='screen-section create-movie'>	
				<div className='container'>
					<button className='logout-btn' onClick={()=>LogOut()}>Log Out <img src="assets/images/logout-icon.svg" alt="Log Out" /></button>
					{/* <h1 className='heading'>Edit {movieTitle}</h1> */}
					<h1 className='heading'>Edit</h1>
					<div className="movie-form">
							<div className='drag-drop-wrapper'>
								<div className='drag-drop-content'> 
									<img src="assets/images/drag-icon.svg" alt='Image' />
									<p className='drag-drop-text'>Drop an image here</p>
									{previewThumb !="" && (
										<img className="preview" src={previewThumb} alt='Image' />
									)}

									{previewThumb =="" && movieImage != "" && (
										<img className="preview" src={process.env.REACT_APP_API_DOMAIN+movieImage} alt='Image' />
									)}
								</div>
								<input type="file" id="movie-image" onChange={handleFileChange}/>
							</div>
						<div className='create-movie-content'>
							<div className='create-movie-inputs'>
								<input type="text" className='input-field' placeholder="Title" id="movie-title" value={movieTitle} onChange={handleTitleChange}/>
								<p style={{color:'red'}}>{visibleTitleDanger}</p>
								<input type="number" className='input-field year-field' placeholder="Year" min="1900" max="2099" step="1" value={movieYear} onChange={handleYearChange} />
								<p style={{color:'red'}}>{visibleYearDanger}</p>
							</div>
							<div className='btns-wrappers'>
								<div className='btns-wrapper'>
									<button onClick={()=>navigate("/movies")} className="cancel-btn">Cancel</button>
									<button onClick={handleSubmit} className="submit-btn">Update</button>
								</div>
								<p style={{color:'red'}}>{visibleDanger}</p>
								</div>
								<p style={{color:'green'}}>{visibleSuccess}</p>
						</div>
					</div>
				</div>	
			</div>
	    </>
  	)

}

export default Edit