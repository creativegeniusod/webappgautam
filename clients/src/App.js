import React, { Component,Suspense } from 'react'
import { AuthProvider } from 'react-auth-kit';
import { RequireAuth } from 'react-auth-kit'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const Login = React.lazy(() => import('./components/auth/login/Login'));
const Signup = React.lazy(() => import('./components/auth/signup/Signup'));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const Movies = React.lazy(() => import('./components/movies/Movies'));
const Create = React.lazy(() => import('./components/movies/Create'));
const Edit = React.lazy(() => import('./components/movies/Edit'));

class App extends Component {
  render() {
    return (
      <>
      <BrowserRouter>
        <Suspense>
          <AuthProvider authType = {'cookie'}
                    authName={'_auth'}
                    cookieDomain={window.location.hostname}
                    cookieSecure={window.location.protocol === "https:"}>
            <Routes>
              <Route exact path="/login" name="Login Page" element={<Login />} />
              <Route exact path="/signup" name="Register Page" element={<Signup />} />
              <Route exact path="/movies" name="Movies" element={<RequireAuth loginPath="/login"><Movies /></RequireAuth>} />
              <Route exact path="/movie-create" name="Movies Create" element={<RequireAuth loginPath="/login"><Create /></RequireAuth>} />
              <Route exact path="/movie-edit" name="Movies Edit" element={<RequireAuth loginPath="/login"><Edit /></RequireAuth>} />
              <Route path="*" name="Home" element={<RequireAuth loginPath="/login"><Dashboard /></RequireAuth>} />
            </Routes>
          </AuthProvider>
        </Suspense>
      </BrowserRouter>
      </>
    )
  }
}

export default App