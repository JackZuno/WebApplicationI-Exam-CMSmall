'use strict';

/* Data Access Object (DAO) module for accessing Q&A */
const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('exam.db', (err) => {
  if (err) throw err;
});

// PAGES

// get all the pages
exports.listPages = (user) => {
  let query;
  const currentDate = dayjs().format('YYYY-MM-DD');
  let loggedIn = true;
  if(user) {
    //logged-in
    query = 'SELECT * FROM pages, users WHERE users.id = pages.user';
  } else {
    //logged-out => only published pages
    loggedIn = false;
    query = 'SELECT * FROM pages, users WHERE users.id = pages.user AND pubdate is not null AND pubdate <= ?';
  }

  const sql = query;

  if(loggedIn) {
    //return all pages, user is logged-in
    return new Promise((resolve, reject) => {
    
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        }
        const pages = rows.map((p) => {
          const page = { "pageId": p.pageId, "title": p.title, "name": p.name, "user": p.user, "creationdate": p.creationdate, "pubdate": p.pubdate }
          return page;
        });
        resolve(pages);
      });
    });
  }

  return new Promise((resolve, reject) => {    
    db.all(sql, [currentDate], (err, rows) => {
      if (err) {
        reject(err);
      }
      const pages = rows.map((p) => {
        const page = { "pageId": p.pageId, "title": p.title, "name": p.name, "user": p.user, "creationdate": p.creationdate, "pubdate": p.pubdate }
        return page;
      });
      resolve(pages);
    });
  });
}

// get all the pages
exports.listPagesOrderd = () => {
  const currentDate = dayjs().format('YYYY-MM-DD');
  const sql = 'SELECT * FROM pages, users WHERE users.id = pages.user AND pubdate is not null AND pubdate <= ? ORDER BY pubdate';;

  return new Promise((resolve, reject) => {    
    db.all(sql, [currentDate], (err, rows) => {
      if (err) {
        reject(err);
      }
      const pages = rows.map((p) => {
        const page = { "pageId": p.pageId, "title": p.title, "name": p.name, "user": p.user, "creationdate": p.creationdate, "pubdate": p.pubdate }
        return page;
      });
      resolve(pages);
    });
  });
}

// get a page given its id     const page = { "idblock": p.idblock, "type": p.type, "content": p.content }
exports.getPage = (id) => {
  const sql = 'SELECT * FROM pages, blocks, users WHERE users.id = pages.user AND pages.pageId = ? AND pages.pageId = blocks.pageId ORDER BY blocks.position';

  return new Promise((resolve, reject) => {    
    db.all(sql, [id], (err, rows) => {
      if (err) {
        console.log("Err: ", err)
        reject(err);
      }

      if(rows.length === 0) {
        resolve({error: "Page not found" })
      } else {
        const pages = rows.map((p) => {
          const page = { "idblock": p.idblock, "type": p.type, "content": p.content, "position": p.position, "title": p.title, "author": p.name, "creationdate": p.creationdate, "pubdate": p.pubdate }
          return page;
        });
        resolve(pages);
      }
    });
  });
};

// get a page given its id (only for edit => user is the owner or an admin)     const page = { "idblock": p.idblock, "type": p.type, "content": p.content }
exports.getPageToEdit = (id, user) => {
  let query;
  if(user.role === "Admin") {
    query = 'SELECT * FROM pages, users WHERE users.id = pages.user AND pages.pageId = ?'
  } else {
    query = 'SELECT * FROM pages, users WHERE users.id = pages.user AND pages.pageId = ? AND users.id = ?'
  }
  const sql = query;
  if(user.role === "Admin") {
    return new Promise((resolve, reject) => {   
      db.all(sql, [id], (err, rows) => {
        if (err) {
          console.log("Err: ", err)
          reject(err);
        }

        if(rows.length === 0) {
          resolve({error: "Page not found" })
        } else {
            const pages = rows.map((p) => {
            const page = { "title": p.title, "author": p.name, "creationdate": p.creationdate, "pubdate": p.pubdate }
            return page;
          });
          resolve(pages);
        }
      });
    });
  } else {
    return new Promise((resolve, reject) => {   
      db.all(sql, [id, user.id], (err, rows) => {
        if (err) {
          console.log("Err: ", err)
          reject(err);
        }

        if(rows.length === 0) {
          resolve({error: "Page not found" })
        } else {
            const pages = rows.map((p) => {
            const page = { "title": p.title, "author": p.name, "creationdate": p.creationdate, "pubdate": p.pubdate }
            return page;
          });
          resolve(pages);
        }
      });
    });
  }
  
};

exports.deletePage = (id, user) => {
  const userId = user.id;
  const userRole = user.role;

  let query;

  if(userRole === "Admin") {
    query = 'DELETE FROM pages WHERE pages.pageId = ?'
  } else {
    query = 'DELETE FROM pages WHERE pages.pageId = ? AND pages.user = ?'
  }
  const sql = query;

  return new Promise((resolve, reject) => {
    db.run('PRAGMA foreign_keys = ON', function(err) {
      if (err) {
        reject(err);
      } else {
        if (userRole === "Admin") {
          db.run(sql, [id], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.changes);
            }
          });
        } else {
          db.run(sql, [id, userId], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.changes);
            }
          });
        }
      }
    });
  })
  .catch((err) => {
    throw err;
  });
}


exports.getTitle  = () => {
  const sql = 'SELECT * FROM webapp';

  return new Promise((resolve, reject) => {    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const pages = rows.map((p) => {
        const page = { "id": p.id, "title": p.title }
        return page;
      });
      resolve(pages);
    });
  });
}

exports.changeTitleWebApp = (titles, userRole) => {
  return new Promise ((resolve, reject) => {
    if(userRole === "Admin") {
      const sql = 'UPDATE webapp SET title=?WHERE title=?';
      db.run(sql, [titles.newTitle, titles.oldTitle ], function(err) {
        if(err) {
          console.log(err);
          reject(err);
        }
        else {
          resolve(this.changes);
        }
      });
    }
  });
};

// add a new page
exports.addPage = (page, blocks) => {
  if (page.pubdate == ""){
    page.pubdate = null;
  }

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO pages(title, user, creationdate, pubdate) VALUES (?, ?, DATE(?), DATE(?))';
    const sqlBlocks = 'INSERT INTO blocks(type, content, pageid, position) VALUES (?, ?, ?, ?)';
    db.run(sql, [page.title, page.user, page.creationdate, page.pubdate], function(err) {
      if(err) {
        console.log("ERROR: " + err);
        reject(err);
      } else {
        const pageId = this.lastID;
        let position = 1;
        blocks.forEach(b => {
          const block = { type: b.type, content: b.content, pageId: pageId, position: position };
          position = position + 1;
          db.run(sqlBlocks, [ block.type, block.content, block.pageId, block.position ], function(err) {
            if(err) {
              console.log("Error blocks: ", err);
              reject(err);
            } else {
              resolve(this.lastID);
            }
          })
        });
        resolve(this.lastID);
      }
    });
  });
};

exports.getBlocks = (pageId) => {
  const sql = 'SELECT * FROM blocks, pages WHERE pages.pageId = ? AND pages.pageId = blocks.pageId ORDER BY position';

  return new Promise((resolve, reject) => {    
    db.all(sql, [pageId], (err, rows) => {
      if (err) {
        reject(err);
      }
      const blocks = rows.map((b) => {
        const block = { "idblock": b.idblock, "type": b.type, "content": b.content, "pageId": b.pageId, "position": b.position, "key": b.position }
        return block;
      });
      resolve(blocks);
    });
  });
}

exports.getUsersList = () => {
  const sql = 'SELECT * FROM users';

  return new Promise((resolve, reject) => {    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const users = rows.map((u) => {
        const user = { "id": u.id, "email": u.email, "name": u.name, "role": u.role }
        return user;
      });
      resolve(users);
    });
  });
}

exports.editPage = (page, blocks, pageId) => {
  const deleteSql = 'DELETE FROM blocks WHERE pageId IN (SELECT pageId FROM pages WHERE pageId = ?)';
  const insertSql = 'INSERT INTO blocks(type, content, pageid, position) VALUES (?, ?, ?, ?)';
  const updateSql = 'UPDATE pages SET title=?, user=?, pubdate=? WHERE pageId=?';

  try {
    // Delete existing blocks with matching pageId
    db.run(deleteSql, [pageId]);

    // Insert new blocks
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const position = i + 1;
      db.run(insertSql, [block.type, block.content, pageId, position]);
    }

    db.run(updateSql, [page.title, page.user, page.pubdate, pageId]);

    console.log('Page successfully edited');

    return true;
  } catch (error) {
    console.log('Error editing page:', error);

    throw error;
  }
};

/*exports.editPage = async (page, blocks, pageId) => {
  const deleteSql = 'DELETE FROM blocks WHERE pageId IN (SELECT pageId FROM pages WHERE pageId = ?)';
  const insertSql = 'INSERT INTO blocks(type, content, pageid, position) VALUES (?, ?, ?, ?)';
  const updateSql = 'UPDATE pages SET title=?, user=?, pubdate=? WHERE pageId=?';

  console.log("Page: ", page);
  console.log("Blocks: ", blocks);
  console.log("PageId: ", pageId);

  try {
    await db.run('BEGIN TRANSACTION');

    // Delete existing blocks with matching pageId
    await db.run(deleteSql, [pageId]);

    // Insert new blocks
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const position = i + 1;
      await db.run(insertSql, [block.type, block.content, pageId, position]);
    }

    await db.run(updateSql, [page.title, page.user, page.pubdate, pageId]);

    await db.run('COMMIT');

    console.log('Page successfully edited');

    return true;
  } catch (error) {
    await db.run('ROLLBACK');

    console.log('Error editing page:', error);

    throw error;
  }
};*/