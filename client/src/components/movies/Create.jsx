import React from 'react'
import { useSignOut,useAuthUser } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'
import Axios from 'axios';
// import LogoutIcon from '../../Images/logout-icon.svg';
// import DragDropIcon from '../../Images/drag-icon.svg';

const Create = () => {

	const auth = useAuthUser();
	const signOut = useSignOut();
  	const navigate = useNavigate();
	const [movieImage,setMovieImage] = React.useState("");
	const [movieTitle,setMovieTitle] = React.useState("");
	const [movieYear,setMovieYear] = React.useState("");
	const [visibleTitleDanger, setVisibleTitleDanger] = React.useState("");
	const [visibleYearDanger, setVisibleYearDanger] = React.useState("");
	const [visibleThumbDanger, setVisibleThumbDanger] = React.useState("");
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
  			setVisibleTitleDanger('Title cannot be left blank.');
  			return false;
  		}

  		if(!movieData.get("publish_year")){
  			setVisibleYearDanger('Year cannot be left blank.');
  			return false;
  		}

  		if(!movieData.get("thumbnail")){
  			setVisibleThumbDanger('Movie image cannot be left blank');
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
					<h1 className='heading'>Create a new movie</h1>
					<div className="movie-form">
						<div className='drag-drop-wrapper'>
							<div className='drag-drop-content'> 
								<img src="assets/images/drag-icon.svg" alt='Image' />
								<p className='drag-drop-text'>Drop an image here</p>
								{previewThumb !="" && (
									<img className="preview" src={previewThumb} alt='Image' />
								)}
							</div>
							<input type="file" id="movie-image" onChange={handleFileChange}/>
							<p className='error-field' style={{color:'red'}}>{visibleThumbDanger}</p>
						</div>
						<div className='create-movie-content'>
							<div className='create-movie-inputs'>
								<div className='input-wrapper'>
									<input type="text" id="movie-title" className='input-field' value={movieTitle} onChange={handleTitleChange} placeholder='Title'/>
									<p className='error-field' style={{color:'red'}}>{visibleTitleDanger}</p>
								</div>
								<div className='input-wrapper'>
									<input type="number" className='input-field year-field' placeholder="Publishing year" min="1900" max="2099" step="1" value={movieYear} onChange={handleYearChange} />
									<p className='error-field' style={{color:'red'}}>{visibleYearDanger}</p>
								</div>								
							</div>
							<div className='btns-wrappers'>
								<div className='btns-wrapper'>
									<button onClick={()=>navigate("/movies")} className="cancel-btn">Cancel</button>
									<button onClick={handleSubmit} className="submit-btn">Submit</button>
								</div>
								<p className='error-field' style={{color:'red'}}>{visibleDanger}</p>
								<p className='success-field' style={{color:'green'}}>{visibleSuccess}</p>
							</div>
						</div>
					</div>
				</div>	
			</div>
	    </>
  	)

}

export default Create