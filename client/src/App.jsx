import 'bootstrap/dist/css/bootstrap.min.css';

import { useState, useEffect } from 'react'
import { Container, Toast } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import NavHeader from './components/NavbarComponents.jsx';
import NotFound from './components/NotFoundComponent';

import { MainLayout, MainLayoutNotLogged, DefaultLayout, LoadingLayout, MainLayoutLoggedIn, EditLayout } from './components/PageLayout';
import SinglePage from './components/SinglePage.jsx';
import { LoginForm } from './components/AuthComponent.jsx';
import FormPage from './components/FormPage.jsx';

import MessageContext from './messageCtx';
import API from './API.js';

import './App.css'

function App() {
  //true => loggedIn; false => loggedOut
  const [ loggedIn, setLoggedIn] = useState(false);

  // This state is used for displaying a LoadingLayout while we are waiting an answer from the server.
  const [ loading, setLoading ] = useState(false);

  // This state contains the user's info.
  const [ user, setUser ] = useState(null);

  const [ message, setMessage ] = useState('');

  //title of the webApplication
  const [ titleWebApp, setTitleWebApp ] = useState();

  //list of pages on the home screen
  const [ pages, setPages ] = useState([]);

  // If an error occurs, the error message will be shown in a toast.
  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); // WARN: a more complex application requires a queue of messages. In this example only last error is shown.
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); 
        setLoading(false);
      } catch (err) {
        handleErrors(err); // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false); 
        setLoading(false);
      }
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.

  useEffect(()=> {
    // get title of the webapp
    const getTitle = async () => {
      const title = await API.getTitle();
      document.title = title;
      setTitleWebApp(title)
    }
    getTitle();
  }, []);

  /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
  */
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
  */ 
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  return (
    <>
      <BrowserRouter>

        <MessageContext.Provider value={{ handleErrors }}>

          <Container fluid className='App'>
            <NavHeader titleWebApp={titleWebApp} logout={handleLogout} loggedIn={loggedIn} user={user}/>
            
            <Routes>

              <Route path="/" element={ loading ? <LoadingLayout titleWebApp={titleWebApp}/> : <DefaultLayout/> } > {/*  */}
                <Route index element={ loggedIn  ? <MainLayout setTitleWebApp={(titleWebApp) => setTitleWebApp(titleWebApp)} titleWebApp={titleWebApp} pages={pages} setPages={setPages} user={user}/> : <MainLayoutNotLogged setTitleWebApp={(titleWebApp) => setTitleWebApp(titleWebApp)} titleWebApp={titleWebApp} pages={pages} setPages={setPages} user={user}/> } />
                <Route path='/pages/all' element={ loggedIn  ? <MainLayoutLoggedIn setTitleWebApp={(titleWebApp) => setTitleWebApp(titleWebApp)} titleWebApp={titleWebApp} pages={pages} setPages={setPages} user={user}/> : <LoginForm login={handleLogin} /> } />
                <Route path='/pages/:id' element={  <SinglePage user={user}/> } />
                <Route path='/pages/add' element={ loggedIn ? <FormPage adding={true} user={user}/> : <NotFound /> } />
                <Route path='/pages/:id/edit' element={ loggedIn ? <EditLayout user={user}/> : <NotFound /> } />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path='/login' element={!loggedIn ? <LoginForm login={handleLogin} /> : <Navigate replace to='/' />} />
              
            </Routes>

            <Toast show={message !== ''} onClose={() => setMessage('')} delay={4000} autohide bg="danger">   {/**/}
                <Toast.Body>{message}</Toast.Body>
            </Toast>

          </Container>

        </MessageContext.Provider>

      </BrowserRouter>
    </>
  )
}

export default App
