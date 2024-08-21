import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Login = () => {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [errorMsg,setErrorMsg] = useState('');
  const [successMsg,setSuccessMsg] = useState('');

  const navigate = useNavigate();

  /**
   * * registering to app
   * @const   {text/html} errorMsg
   * @const   {text/html} successMsg
   * @const   {text}  email
   * @const   {text}  password
   *
   */
  const signup = () => {
    fetch(`${process.env.REACT_APP_API_DOMAIN}/signup`,{
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
      }else{
        setErrorMsg(loginRsp.msg)
        setSuccessMsg('')
      }

    })
  }

  return (
    <>
      <div className="container">
        <div className="screen">
          <div className="screen__content">
            <form className="login">
              <div className="login__field">
                <i className="login__icon"></i>
                <input onChange={(e)=>setEmail(e.target.value)} type="text" className="signupStyle" placeholder="User name / Email" />
              </div>
              <div className="signupStyle">
                <i className="signupStyle"></i>
                <input onChange={(e)=>setPassword(e.target.value)} type="password" className="signupStyle" placeholder="Password" />
              </div>
            </form>
            <button className="button" onClick={()=>signup()}>
              <span className="button__text">Signup Now</span>
              <i className="button__icon"></i>
            </button>       
            <p className="error" style={{color:"red"}}>{errorMsg}</p>
            <p className="success" style={{color:"green"}}>{successMsg}</p>
            <div className="social_login">
              <button onClick={() => navigate("/login")}><h3>Login</h3></button>
            </div>
          </div>   
        </div>
      </div>
    </>
  )
}

export default Login