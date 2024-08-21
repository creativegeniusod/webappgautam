import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { useSignIn } from 'react-auth-kit'

const Login = () => {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [errorMsg,setErrorMsg] = useState('');
  const [successMsg,setSuccessMsg] = useState('');
  
  const signIn = useSignIn();
  const navigate = useNavigate();


  /**
   * * login to app
   * @const   {text/html} errorMsg
   * @const   {text/html} successMsg
   * @const   {text}  email
   * @const   {text}  password
   *
   */
  const login = () => {

    if(email == ""){
      setErrorMsg('Email cannot be left blank');
      return false
    }

    if(password == ""){
      setErrorMsg('Password cannot be left blank');
      return false
    }

    fetch(`${process.env.REACT_APP_API_DOMAIN}/login`,{
        method: "POST",
        body :JSON.stringify({
          email:email,
          password:password
        }),
        headers: {
          "Content-Type": "application/json"
        }
    })
    .then((response)=> {
      return response.json()
    }).then((loginRsp)=>{
      if(loginRsp.status){
        setSuccessMsg(loginRsp.msg)
        setErrorMsg('')

        signIn({
              token: rand(),
              expiresIn:3600,
              tokenType: "Bearer",
              authState: {email: email,id: loginRsp.id}
          });

        navigate('/movies');

      }else{
        setErrorMsg(loginRsp.msg)
        setSuccessMsg('')
      }

    })
  }

  /**
   * * generating a random string
   *
   */
  const rand = () => {
      return Math.random().toString(36).substr(2); 
  }

  return (
    <>
    <div className='screen-section'>
      <div className="container">
        <div className="screen">
          <div className="screen__content">
            <form className="login">
              <h1 className='form-title'>Sign in</h1>
              <div className="login__field">
                <i className="login__icon"></i>
                <input onChange={(e)=>setEmail(e.target.value)} type="text" className="login__input" placeholder="Email" value={email}/>
              </div>
              <div className="login__field">
                <i className="login__icon"></i>
                <input onChange={(e)=>setPassword(e.target.value)} type="password" className="login__input" placeholder="Password" value={password}/>
              </div>
              <div class="login__field checkbox__field">
              <input type="checkbox" id="Rememberme" className="login__checkbox" />
              <label for="Rememberme">Remember me</label>
            </div>
            </form>
            <button className="button login__submit" onClick={()=>login()}>
              <span className="button__text">Login</span>
              <i className="button__icon"></i>
            </button>
            <p className="error" style={{color:"red"}}>{errorMsg}</p>
            <p className="success" style={{color:"green"}}>{successMsg}</p>
            {/* <div className="social_login">
              <button onClick={() => navigate("/signup")}><h3>Sign Up</h3></button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Login