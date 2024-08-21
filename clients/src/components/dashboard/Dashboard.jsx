/*global chrome*/
import React from 'react'
import { useSignOut } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'


const Dashboard = () => {

  const signOut = useSignOut();
  const navigate = useNavigate();

  const LogOut = () => {
      signOut();
      navigate("/login");
  }

  return (
    <>
      <p>Welcome Home</p>
      <button onClick={()=>LogOut()}>Log Out</button>
    </>
  )
}

export default Dashboard