import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

          // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
          response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */

const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + '/api/sessions/current', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}

//API PAGES

//get pages
const getPages = async () => {
  const response = await fetch(SERVER_URL + '/api/pages', {
    credentials: 'include',
  });

  if(response.ok)  {
      const pageJson = await response.json();
      return pageJson.map(page => {
          const clientPage = {
              id: page.pageId,
              title: page.title,
              author: page.name,
              user: page.user,
              creationdate: page.creationdate,
              pubdate: page.pubdate
          }
          if(page.creationdate) {
            clientPage.creationdate = dayjs(page.creationdate);
          }
          if(page.pubdate) {
            clientPage.pubdate = dayjs(page.pubdate);
          }
          return clientPage;
      });
  } else {
      throw new Error('Internal server error');
  }
}

//get pages
const getOrderedPages = async () => {
  const response = await fetch(SERVER_URL + '/api/pages/ordered', {
    credentials: 'include',
  });

  if(response.ok)  {
      const pageJson = await response.json();
      return pageJson.map(page => {
          const clientPage = {
              id: page.pageId,
              title: page.title,
              author: page.name,
              user: page.user,
              creationdate: page.creationdate,
              pubdate: page.pubdate
          }
          if(page.creationdate) {
            clientPage.creationdate = dayjs(page.creationdate);
          }
          if(page.pubdate) {
            clientPage.pubdate = dayjs(page.pubdate);
          }
          return clientPage;
      });
  } else {
      throw new Error('Internal server error');
  }
}

//get page
const getPage = async (id) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + id, {
    credentials: 'include',
  });

  if(response.ok)  {
      const pageJson = await response.json();
      if(pageJson.length === 0) {
        const empty = {    
          error: 'Page Not Found'
        }
        return empty;
      }
      return pageJson.map(page => { 
          const clientPage = {    
            idblock: page.idblock,
            type: page.type,
            content: page.content,
            position: page.position,
            title: page.title,
            author: page.author,
            creationdate: page.creationdate,
            pubdate: page.pubdate,
          }
          if(page.creationdate) {
            clientPage.creationdate = dayjs(page.creationdate);
          }
          if(page.pubdate) {
            clientPage.pubdate = dayjs(page.pubdate);
          }
          return clientPage;
      });
  } else {
      //throw new Error('Internal server error');
      const empty = {    
        error: 'Page Not Found'
      }
      return empty;
  }
}

//get page
const getPageToEdit = async (id) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + id + '/ToEdit', {
    credentials: 'include',
  });

  if(response.ok)  {
      const pageJson = await response.json();
      if(pageJson.length === 0) {
        const empty = {    
          error: 'User is not authorized or the page doesnt exist'
        }
        return empty;
      }
      return pageJson.map(page => { 
          const clientPage = {    
            title: page.title,
            author: page.author,
            creationdate: page.creationdate,
            pubdate: page.pubdate,
          }
          if(page.creationdate) {
            clientPage.creationdate = dayjs(page.creationdate);
          }
          if(page.pubdate) {
            clientPage.pubdate = dayjs(page.pubdate);
          }
          return clientPage;
      });
  } else {
      //throw new Error('Internal server error');
      const empty = {    
        error: 'User is not authorized or the page doesnt exist'
      }
      return empty;
  }
}

const deletePage = async (id) => {
  const response = await fetch(SERVER_URL + `/api/pages/${id}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include'
  });

  if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
  } else {
      return null;
  }
};

//get title webApp
const getTitle = async () => {
  const response = await fetch(SERVER_URL + '/api/titleWebApp', {
    credentials: 'include',
  });

  if(response.ok)  {
      const pageJson = await response.json();
      const returnTitle = pageJson[0].title;
      return returnTitle;
      /*return pageJson.map(page => { 
          const clientPage = page.title;
          return clientPage;
      });*/
  } else {
      throw new Error('Internal server error');
  }
}

const changeTitleWebApp = async (newTitle, oldTitle) => {
  const response = await fetch(SERVER_URL + `/api/titleWebApp`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ newTitle: newTitle, oldTitle: oldTitle }),
      credentials: 'include'
  });

  if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
  } else {
      return null;
  }
};

const addPage = async (page) => {
  const response = await fetch(SERVER_URL + '/api/pages/add', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title: page.title, user: page.user, creationdate: page.creationdate.format('YYYY-MM-DD'), pubdate: page.pubdate ? page.pubdate.format('YYYY-MM-DD') : null, blocks: page.blocks })
  });

  if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
  } else {
      return null;
  }
};

//get the list of blocks of a given page
const getBlocks = async (pageId) => {
  const response = await fetch(SERVER_URL + `/api/blocks/${pageId}`, {
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
  });

  if(response.ok)  {
      const blockJson = await response.json();
      return blockJson.map(block => {
          const clientBlock = {
              idblock: block.idblock,
              type: block.type,
              content: block.content,
              pageId: block.pageId,
              position: block.position,
              id: block.position
          }
          return clientBlock;
      });
  } else {
      throw new Error('Internal server error');
  }
}

//GET users
const getUsersList = async () => {
  const response = await fetch(SERVER_URL + '/api/users', {
    credentials: 'include',
  });

  if(response.ok)  {
      const userJson = await response.json();
      return userJson.map(user => {
          const clientUser = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
          }
          return clientUser;
      });
  } else {
      throw new Error('Internal server error');
  }
}

//PUT edit page
const editPage = async (page, pageId) => {
  const response = await fetch(SERVER_URL + `/api/pages/${pageId}/edit`, {
      method: 'PUT',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title: page.title, user: page.user, creationdate: page.creationdate.format('YYYY-MM-DD'), pubdate: page.pubdate ? page.pubdate.format('YYYY-MM-DD') : null, blocks: page.blocks })
  });

  if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
  } else {
      return null;
  }
};  

const API = { logIn, getUserInfo, logOut, getPages, getPageToEdit, getOrderedPages, getPage, deletePage, getTitle, changeTitleWebApp, addPage, getBlocks, getUsersList, editPage };
export default API;