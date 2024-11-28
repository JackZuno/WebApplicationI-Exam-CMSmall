import React, { useState, useContext } from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { Icon } from '@iconify/react';

import PageList from './PageList'
import FormPage from './FormPage';

import MessageContext from '../messageCtx';

import API from '../API.js';

function DefaultLayout(props) {
  
  return (
    <Row className="vh-100">
      <Col className="below-nav">
        <Outlet/>
      </Col>
    </Row>
  );
}

function MainLayout(props) {
  const [show, setShow] = useState(false);

  const [newTitle, setNewTitle] = useState(props.titleWebApp);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(()=> {
    // get all the questions from API
    const getPages = async () => {
      const pagesDb = await API.getOrderedPages();
      props.setPages(pagesDb);
    }
    getPages();
  }, []);

  const deletePage = async (pageId) => {
    await API.deletePage(pageId);
    //await API.getPages();
    const pagesDb = await API.getPages();
    props.setPages(pagesDb);

  };

  const handleInputChange = async () => {
    setShow(false);
    await API.changeTitleWebApp(newTitle, props.titleWebApp)
    document.title = newTitle;
    props.setTitleWebApp(newTitle);
  };
  
  return (
    <>
      <h1 className='title-webApp'>Welcome to {props.titleWebApp}!
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Change WebApp Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>Write here the new title<br/>
            <input type="text" value={newTitle} onChange={(event) => {setNewTitle(event.target.value); }} placeholder="Enter new title" />
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleInputChange}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </h1>
      <PageList setAll={true} deletePage={deletePage} user={props.user} setTitleWebApp={props.setTitleWebApp} pages={props.pages} />
    </>
  )
}

function MainLayoutNotLogged(props) {

  useEffect(()=> {
    // get all the questions from API
    const getPages = async () => {
      const pagesDb = await API.getOrderedPages();
      props.setPages(pagesDb);
    }
    getPages();
  }, []);
  
  return (
    <>
      <h1 className='title-webApp'>Welcome to {props.titleWebApp}!</h1>
      <PageList setTitleWebApp={props.setTitleWebApp} pages={props.pages} />
    </>
  )
}

function MainLayoutLoggedIn(props) {
  const [ ordered, setOrdered ] = useState(false);
  const [show, setShow] = useState(false);

  const [newTitle, setNewTitle] = useState(props.titleWebApp);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(()=> {
    // get all the questions from API
    const getPages = async () => {
      const pagesDb = await API.getPages();
      props.setPages(pagesDb);
    }
    getPages();
  }, []);

  const getOrderedPages = async () => {
    if(ordered) {
      //await API.getPages();
      const pagesDb = await API.getPages();
      props.setPages(pagesDb);
      setOrdered(false);
    } else {
      //await API.getPages();
      const pagesDb = await API.getOrderedPages();
      props.setPages(pagesDb);
      setOrdered(true)
    }
  };

  const deletePage = async (pageId) => {
    await API.deletePage(pageId);
    //await API.getPages();
    const pagesDb = await API.getPages();
    props.setPages(pagesDb);

  };

  const handleInputChange = async () => {
    setShow(false);
    await API.changeTitleWebApp(newTitle, props.titleWebApp)
    document.title = newTitle;
    props.setTitleWebApp(newTitle);
  };
  
  return (
    <>
      <h1 className='title-webApp'>Welcome to {props.titleWebApp}!
        {
          (props.user && props.user.role === 'Admin') ?
              <Button className='change-title' onClick={() => handleShow()}><Icon icon="uil:setting" width={24}/></Button>
                  :
              <></>
        }
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Change WebApp Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>Write here the new title<br/>
            <input type="text" value={newTitle} onChange={(event) => {setNewTitle(event.target.value); }} placeholder="Enter new title" />
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleInputChange}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </h1>
      <PageList setAdd={true} setAll={false} deletePage={deletePage} getOrderedPages={getOrderedPages} user={props.user} setTitleWebApp={props.setTitleWebApp} pages={props.pages} />
    </>
  )
}

function EditLayout(props) {
  const {handleErrors} = useContext(MessageContext);
  const params = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);

  useEffect(() =>  {
    //used to check if the pageId inserted in the URL it's associated to a page
    const getPage = async () => {
      const pageDb = await API.getPageToEdit(params.id);
      if(pageDb.error) {
        handleErrors(pageDb)
        navigate('/*')
      } else {
        setPage(pageDb[0])
      }
    }

    getPage()
  }, []);

  return (
    page ? <FormPage adding={false} user={props.user} page={page} /> : <></>
  );

}

/**
 * This layout shuld be rendered while we are waiting a response from the server.
 */
function LoadingLayout(props) {
  return (
    <Row className="vh-100">
      <Col className="below-nav">
      </Col>
      <Col className="below-nav">
        <h1>{props.titleWebApp} ...</h1>
      </Col>
      <Col className="below-nav">
      </Col>
    </Row>
  )
}

export { DefaultLayout, MainLayout, LoadingLayout, MainLayoutNotLogged, MainLayoutLoggedIn, EditLayout }; 