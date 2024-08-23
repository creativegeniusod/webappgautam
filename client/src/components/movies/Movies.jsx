import React from 'react'
import { useSignOut,useAuthUser } from 'react-auth-kit';
import { Link, useNavigate} from 'react-router-dom';
// import LogoutIcon from '../../../public/assets/images/logout-icon.svg';
// import PlusIcon from '../../../public/assets/images/plus-icon.svg';



const Movies = () => {
  const [movies,setMovies] = React.useState([]);
  const [totalMovie,setTotalMovie] = React.useState(0);
  const [totalPages,setTotalPages] = React.useState(0);
  const [offset,setOffset] = React.useState(0);
  const auth = useAuthUser();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const limit = 8;


  /**
   * * triggered once on page loaded
   *
   * @const   {int}   page offset
   *
   *
   */
  React.useEffect(()=>{
      getMovies(offset);
  },[])


  /**
   * * fetching movies
   *
   * @const   {int}   loggedin user_id
   * @const   {int}   page offset
   * @const   {int}   page limit
   *
   *
   */
  const getMovies = (offset) => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/movies/getall`,{
        method:'post',
        body:JSON.stringify({
          user_id: auth().id,
          limit: limit,
          offset: offset,
        }),
        headers:{
          "Content-type" : "application/json"
        }
    }).then((response) => response.json()
    ).then((rsp) => {
        if(rsp.status){
          setMovies(rsp.data);
          setTotalMovie(rsp.total_movies);
        }
    });
  }

  /**
   * * deleting movies
   *
   * @const   {int}   loggedin user_id
   * @const   {int}   movie_id
   *
   *
   */
  const deleteMovie = (id) => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/movies/delete`,{
        method:'post',
        body:JSON.stringify({
          user_id: auth().id,
          movie_id: id,
        }),
        headers:{
          "Content-type" : "application/json"
        }
    }).then((response) => response.json()
    ).then((rsp) => {
        if(rsp.status){
          getMovies(offset);
        }
    });
  }

  /**
   * * creating pagination component for movie list
   *
   */
  const CreatePagination = () =>{
    var pages = totalMovie/limit;
    
    setTotalPages(pages);

    var pageArr=[];
    var currOffset = 0;
    for(var i = 0; i<pages; i++){
      if(i == 0){
        pageArr.push(parseInt(currOffset));
      }else{
        currOffset = parseInt(currOffset)+parseInt(limit)
        pageArr.push(currOffset);
      }
    }



    return (
      <>
        <nav aria-label="Page navigation">
          <ul className="pagination">          
            <div className='prev-btn' onClick={() => prevPage()}>Prev</div>          
            {pageArr.map((pageOffset,idx)=>(
                <li 
                key={idx} 
                className={pageOffset == offset ? 'page-item active' : 'page-item'}>
                  <a 
                    className="page-link" 
                    data-offset={pageOffset} 
                    href="#" 
                    onClick={setPage}>
                    {++idx}
                  </a>
                </li>
            ))}
            <div className='next-btn' onClick={() => nextPage()}>Next</div>
          </ul>
        </nav>
      </>
    )
  }

  const prevPage = (e) => {
    var curOffset = offset;
    
    if(curOffset > 0){
      --curOffset
      setOffset(curOffset);
      getMovies(curOffset);
    }

  }

  const nextPage = (e) => {

    if(offset < (parseInt(totalPages) - 1)){
      var curOffset = offset;
      ++curOffset
      setOffset(curOffset);
      getMovies(curOffset);
    }
  }

  /**
   * * setting current selected page
   * @const   {int}  page offset
   *
   */
  const setPage = (e) => {
    var offset = parseInt(e.target.getAttribute('data-offset'));
    setOffset(offset);
    getMovies(offset);
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
        <div className='screen-section empty-movie-screen'>
          <div className='container'>
              <button className='logout-btn' onClick={()=>LogOut()}>Log Out <img src="assets/images/logout-icon.svg" alt="Log Out" /></button>
              <div>
                <h2 className='heading movies-heading'>My movies <img src="assets/images/plus-icon.svg" alt='image' onClick={()=>navigate("/movie-create")}/></h2>
                {!totalMovie && (
                <div className='empty-movie'>
                    <div className='empty-movie-content'>
                        <h2 className='heading' style={{textAlign:'center'}}>Your movie list is empty</h2>
                        <button onClick={()=>navigate("/movie-create")} className='add-movie-btn'>Add a new movie</button>
                    </div>
                </div>
                )}
                <div className="movie-card-row">
                  {movies.map((movie,idx)=>(
                    <div key={idx} className="col">
                      <div className='movie-card'>
                        <div className='img-wrapper'>
                          <img src={process.env.REACT_APP_API_DOMAIN+movie.featured_image} />
                        </div>
                        <h4 className='card-title'>{movie.title}</h4>
                        <p className='card-publish-year'>{movie.publish_year}</p>
                        <div className='edit-delete-btn'>
                          <Link to="/movie-edit" state={{ movie_id: movie.id }}>
                            <button className="edit-btn" >
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.00006 22.0001C0.738063 22.0001 0.483063 21.8971 0.293063 21.7071C0.0390628 21.4531 -0.0589372 21.0831 0.0350628 20.7371L1.53506 15.2371C1.58106 15.0691 1.67006 14.9161 1.79306 14.7931L15.2931 1.29309C16.7851 -0.19991 19.2151 -0.19991 20.7071 1.29309C22.2001 2.78609 22.2001 5.21409 20.7071 6.70709L7.20706 20.2071C7.08406 20.3301 6.93106 20.4191 6.76306 20.4651L1.26306 21.9651C1.17606 21.9881 1.08806 22.0001 1.00006 22.0001ZM3.39506 16.0201L2.42506 19.5761L5.98006 18.6061L19.2931 5.29309C20.0061 4.58009 20.0061 3.42009 19.2931 2.70709C18.5801 1.99409 17.4201 1.99409 16.7071 2.70709L3.39506 16.0201ZM6.50006 19.5001H6.51006H6.50006Z" fill="#1D1D32"/>
                              </svg>
                            </button>
                          </Link>
                          <button className="delete-btn" onClick={() => deleteMovie(movie.id)}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M15 16L17.5 18.5M20 21L17.5 18.5M17.5 18.5L20 16M17.5 18.5L15 21" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                          </button>
                        </div> 
                      </div>                     
                    </div>
                  ))}
                </div>
                <div className="row mt-5">
                  { totalMovie > 0 && (<CreatePagination />)}
                </div>
              </div>
          </div>
        </div>           
    </>
  )
}

export default Movies