const express = require("express");
const cors = require("cors"); 
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

//setting rate-limit globally
app.use(express.json({limit: '180mb'}));

//parsing body in a request
app.use(bodyparser.json());

//enabling cors
app.use(cors()); 

var dir = path.join(__dirname, 'public');

//setting directory path
app.use(express.static(dir));

//setting attachment upload directory
app.use(
  fileUpload({
    useTempFiles: true,
    safeFileNames: true,
    preserveExtension: true,
    tempFileDir: `${__dirname}/public/thumbnail/temp`
  })
);

//enabling the trust proxy setting
app.set('trust proxy', true);

//creating db connection
const con = require('./connection.js');

//setting db connection
const PORT = process.env.INBOX_ACCEL_PORT || 3001;

/**
 * * serving login request
 * @var   {text} email
 * @var   {text} password
 * @var   {text} get_user
 *
 * @return {json}
 */
app.post('/login',(req,res) => {
	var email = req.body.hasOwnProperty('email') ? (req.body.email).trim() : '';
	var password = req.body.hasOwnProperty('password') ? (req.body.password).trim() : '';

	if(email && password){

		var get_user = "SELECT * FROM users WHERE email = ?";

		con.query(get_user,[email], async (err,result)=>{
			if(result.length > 0){
				var pass = await varifyPass(password, result[0].password);
				if(pass){
					res.json({status:true,msg:'logged in successfully',id:result[0].id});
				}else{
					res.json({status:false,msg:"Invalid password."});
				}
			}else{
				res.json({status:false,msg:"User doesn't exist."});
			}
		});

	}else{
		res.json({status:false,msg:"email and password are required."});
	}

});


/**
 * * serving registration request
 * @var   {text} email
 * @var   {text} password
 * @var   {text} get_user
 * @var   {text} register
 * @var   {text} hashed_password
 *
 */
app.post('/signup',(req,res) => {
	var email = req.body.hasOwnProperty('email') ? (req.body.email).trim() : '';
	var password = req.body.hasOwnProperty('password') ? (req.body.password).trim() : '';

	if(email && password){

		var get_user = "SELECT email FROM users WHERE email = ?";

		con.query(get_user,[email], async (err,result)=>{
			if(result.length > 0){
				res.json({status:false,msg:'User already exist.'});
			}else{
				var register = "INSERT INTO users (email, password) VALUES ( ?, ?)";
				var hashed_password = await makeHashPass(password);
				con.query(register,[email,hashed_password],(err1,result1) => {
					res.json({status:true,msg:'User register successfully'});
				});

			}
		});
	}else{
		res.json({status:false,msg:"email and password are required."});
	}

});


/**
 * * encrypting password
 * 
 * @var   {text} encryption salt
 * @var   {text} userPassword
 * 
 * @param {text} passInput
 *
 * @return {text} encrypted passInput
 */
const makeHashPass = (passInput) => {
	var salt = process.env.ENCRYPTION_SALT;
	var userPassword = passInput;
	
	return new Promise((resolve,reject)=>{
		bcrypt.hash(userPassword, salt, (err, hash) => {
		    if (err) {
		        reject(err);
		    }
		    resolve(hash)
		});
	});
}


/**
 * * verifying password
 * 
 * @var   {text} encryption salt
 * 
 * @param  {text} userInputPassword
 * @param  {text} storedHashedPassword
 *
 * @return {boolean}
 */
const varifyPass = (userInputPassword,storedHashedPassword) => {
	return new Promise((resolve,reject) => {
		bcrypt.compare(userInputPassword, storedHashedPassword, (err, result) => {
		    if (err) {
		        // Handle error
		        // reject(`Error comparing passwords: ${err}`);
		        resolve(false);
		    }

			if (result) {
			    // Passwords match, authentication successful
			    resolve(true);
			} else {
			    // Passwords don't match, authentication failed
			    resolve(false);
			}
		});
	});
}

/**
 * * serving create movie request
 * 
 * @var   {file} uploadFile
 * @var   {int} user_id
 * @var   {text} title
 * @var   {int} publish_year
 * @var   {text} insertMovie
 * 
 *
 * @return {json}
 */
app.post('/movie/create',(req,res) => {
	var uploadFile = req.files?.thumbnail;
	var user_id = req.body.hasOwnProperty('user_id') ? req.body.user_id : '';
	var title = req.body.hasOwnProperty('title') ? (req.body.title)?.trim() : '';
	var publish_year = req.body.hasOwnProperty('publish_year') ? (req.body.publish_year)?.trim() : '';

	if(uploadFile && user_id && title && publish_year){

		var insertMovie = "INSERT INTO movies (user_id,title,publish_year,featured_image) VALUES (?,?,?,?)";

		var name = uploadFile.name;
	    var md5 = uploadFile.md5;
	    var saveAs = `${md5}_${Date.now()}_${name}`; //creating file name

	    //moving file to upload directory
	    uploadFile.mv(`${__dirname}/public/thumbnail/${saveAs}`, function(err) {
	      	
	      	//throw error
	      	if (err) return res.status(500).send(err);
	      	
	      	//inserting movie in the database
	      	con.query(insertMovie,[user_id,title,publish_year,'/thumbnail/'+saveAs],function (err, result) {
		        if (err) throw res.json({ status: false,msg: err });
		        res.json({ status: true,msg: 'Movie inserted successfully.' });
	      	});
	    });

	}else{
		res.json({ status: false,msg: "Either of 'thumbnail','user_id','title','publish_year' is missing."});
	}
});

/**
 * * serving update movie request
 * 
 * @var   {file} uploadFile
 * @var   {int} user_id
 * @var   {int} movie_id
 * @var   {text} title
 * @var   {int} publish_year
 * @var   {text} upadteMovie
 * 
 *
 * @return {json}
 */
app.post('/movie/update',(req,res) => {
	var uploadFile = req.files?.thumbnail;
	var user_id = req.body.hasOwnProperty('user_id') ? req.body.user_id : '';
	var movie_id = req.body.hasOwnProperty('movie_id') ? req.body.movie_id : '';
	var title = req.body.hasOwnProperty('title') ? (req.body.title)?.trim() : '';
	var publish_year = req.body.hasOwnProperty('publish_year') ? (req.body.publish_year)?.trim() : '';

	if(user_id && title && publish_year && publish_year && movie_id){

		if(uploadFile){

			var upadteMovie = "UPDATE movies SET title=?, publish_year=?,featured_image=? WHERE user_id=? AND id = ?";

			var name = uploadFile.name;
		    var md5 = uploadFile.md5;
		    var saveAs = `${md5}_${Date.now()}_${name}`; //creating file name

		    //moving file to upload directory
		    uploadFile.mv(`${__dirname}/public/thumbnail/${saveAs}`, function(err) {

		      	//throw error
		      	if (err) return res.status(500).send(err);
		      	
		      	//updating movie
		      	con.query(upadteMovie,[title,publish_year,'/thumbnail/'+saveAs,user_id,movie_id],function (err, result) {
			        if (err) throw res.json({ status: false,msg: err });
			        res.json({ status: true,msg: 'Movie updated successfully.' });
		      	});
		    });

		}else{

			var upadteMovie = "UPDATE movies SET title=?, publish_year=? WHERE user_id=? AND id = ?";

			//updating movie
			con.query(upadteMovie,[title,publish_year,user_id,movie_id],function (err, result) {
		        if (err) throw res.json({ status: false,msg: err });
		        res.json({ status: true,msg: 'Movie updated successfully.' });
	      	});
		}

	}else{
		res.json({ status: false,msg: "Either of 'user_id','title','publish_year','movie_id' is missing." });
	}
});


/**
 * * serving get movie request
 * 
 * @var   {int} movie_id
 * @var   {text} getMovie
 *
 * @return {json}
 */
app.post('/movies/get',(req,res) => {
	var movie_id = req.body.hasOwnProperty('id') ? req.body.id : '';

	if(movie_id){

		var getMovie = "SELECT * FROM movies WHERE id = ?";

		//getting a movie from database
	  	con.query(getMovie,[movie_id],function (err, result) {
	        if (err) throw res.json({ status: false,msg: err, data: []});
	        res.json({ status: true,msg: 'Movie found.',data: result});
	  	});
  	}else{
  		res.json({ status: false,msg: "id is required." });
  	}
});


/**
 * * serving get all movies request
 * 
 * @var   {int} user_id
 * @var   {int} limit
 * @var   {int} offset
 * @var   {text} getMovie
 * 
 *
 * @return {json}
 */
app.post('/movies/getall',(req,res) => {
	var user_id = req.body.hasOwnProperty('user_id') ? req.body.user_id : '';
	var limit = req.body.hasOwnProperty('limit') ? req.body.limit : 10;
	var offset = req.body.hasOwnProperty('offset') ? req.body.offset : 0;
	var getMovie = "SELECT * , (SELECT count(*) FROM movies WHERE user_id = ? ) as total_movies FROM movies WHERE user_id = ? LIMIT ? OFFSET ?";
	
	console.log(user_id);
	console.log(limit);
	console.log(offset);

	if(!isNaN(user_id)){

		if(isNaN(limit) || isNaN(offset)){
			res.json({ status: false,msg: "limit and offset must be integer." });
		}else{

			// getting all movies from database
		  	con.query(getMovie,[user_id,user_id,limit,offset],function (err, result) {
		        if (err) throw res.json({ status: false,msg: err, data: []});
		        if(result.length > 0){
		        	res.json({ status: true,msg: 'Movie fetched successfully.',data: result, total_movies: result[0].total_movies});
		        }else{
		        	res.json({ status: true,msg: 'Movie fetched successfully.',data: result, total_movies: 0});
		        }
		  	});
		}


	}else{
		res.json({ status: false,msg: "user_id is required." });
	}
});

/**
 * * serving delete a movie request
 * 
 * @var   {int} user_id
 * @var   {int} movie_id
 * @var   {text} deleteMovie
 * 
 *
 * @return {json}
 */
app.post('/movies/delete',(req,res) => {
	var user_id = req.body.hasOwnProperty('user_id') ? req.body.user_id : '';
	var movie_id = req.body.hasOwnProperty('user_id') ? req.body.movie_id : '';
	var deleteMovie = "DELETE FROM movies WHERE user_id = ? AND id = ?";

	if(user_id && movie_id){

		//deteting movie from database
	  	con.query(deleteMovie,[user_id,movie_id],function (err, result) {
	        if (err) throw res.json({ status: false,msg: err, data: []});
	        res.json({ status: true,msg: 'Movie deleted successfully.',data: null});
	  	});
	}else{
		res.json({ status: false,msg: "user_id and movie_id are required." });
	}
});

/**
 * * Cheking is server is listening
 * 
 * @param   {int} PORT
 * @param   {function}
 * 
 *
 * @return {json}
 */
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});