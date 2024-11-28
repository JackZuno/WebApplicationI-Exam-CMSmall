import { useState, useEffect } from 'react';

import { Form, Button, Container, Alert } from 'react-bootstrap';

import { useNavigate, useParams } from 'react-router-dom';

import dayjs from 'dayjs';

import API from '../API'; 

function FormPage(props) {
  const navigate = useNavigate();
  const params = useParams();
  
  const addingNewPage = props.adding;
  const editablePage = props.page;

  let dateCreation;
  let datePublication;

  if(editablePage) {
    dateCreation = dayjs(editablePage.creationdate.$d);
    if(editablePage.pubdate && editablePage.pubdate.$d) {
      datePublication = dayjs(editablePage.pubdate.$d).format('YYYY-MM-DD');
    } else {
      datePublication = '';
    }
  }

  const [ pageId, setPageIdd ] = useState( params.id ? params.id : -1);
  const [ title, setTitle ] = useState(editablePage ? editablePage.title : ' ');
  const [ author, setAuthor ] = useState(editablePage ? editablePage.author : props.user.name);
  const [ creationdate, setCreationDate ] = useState(editablePage ? dateCreation.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
  const [ pubdate, setDate ] = useState((editablePage) ? datePublication : dayjs().format('YYYY-MM-DD'));

  //alert if there are not at least 1 header and 1 paragraph or blocks
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')

  //type of block selected
  const [ type, setType ] = useState('header');

  //array of block that are added to the page
  const [blocks, setBlocks] = useState([]);

  //user list option
  const [userList, setUserList] = useState([]);

  if(!addingNewPage) {
    useEffect(()=> {
      const blocksToEditUsers = async () => {
        const blocksToEdit = await API.getBlocks(pageId);
        setBlocks(blocksToEdit);

        if(props.user && props.user.role === "Admin") {
          const users = await API.getUsersList();
          setUserList(users);
        }
      }

      blocksToEditUsers()
    }, []);
  }

  const renderBlockContent = (block) => {
    switch (block.type) {
      case 'header':
        return (
          <Form.Control
            type="text"
            placeholder="Header Block"
            value={block.content}
            onChange={(event) => handleContentChange(event, block.id)}
            required={true}
            minLength={2}
          />
        );
      case 'paragraph':
        return (
          <Form.Control
            as="textarea"
            placeholder="Paragraph Block"
            value={block.content}
            onChange={(event) => handleContentChange(event, block.id)}
            required={true}
            minLength={2}
          />
        );
      case 'image':
        return (
          <>
            <Form.Control
              as="select"
              value={block.content}
              onChange={(event) => handleContentChange(event, block.id)}
              required={true}
              minLength={2}
            >
              <option>Open this select menu</option>
              <option value="/veniceBeach.png">Venice Beach</option>
              <option value="/tonyCairoli.png">Tony Cairoli</option>
              <option value="/winnerLeMans.png">Winner Le Mans</option>
              <option value="/feelsStrongMan.png">Pepo</option>
              <option value="/sequoiaNationalPark.png">Sequoia Nationl Park</option>
              <option value="/sequoiaNationalPark2.png">Sequoia Nationl Park 2</option>
              <option value="/sequoiaNationalPark3.png">Sequoia Nationl Park 3</option>
              <option value="/waveNazare.png">Worlds Biggest Wave</option>
            </Form.Control>
            <img className='form-image mt-2' src={block.content} width={120}/>
          </>
        );
      default:
        return null;
    }
  };

  const renderBlocks = () => {
    return blocks.map((block, index) => (
      <div key={block.id}>
        <Form.Group controlId={`block-${block.id}`}>
          <Form.Label>Block type: {block.type}</Form.Label>
        </Form.Group>

        <Form.Group controlId={`content-${block.id}`}>
          {renderBlockContent(block)}
        </Form.Group>

        <div>
          {index > 0 && (
            <Button className='form-button' variant="secondary" onClick={() => handleMoveUp(index)}>
              Move Up
            </Button>
          )}

          {index < blocks.length - 1 && (
            <Button className='form-button' variant="secondary" onClick={() => handleMoveDown(index)}>
              Move Down
            </Button>
          )}

          <Button className='form-button' variant="danger" onClick={() => handleRemove(index)}>
            Remove
          </Button>
        </div>

        <hr />
      </div>
    ));
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedBlocks = [...blocks];
      [updatedBlocks[index], updatedBlocks[index - 1]] = [
        updatedBlocks[index - 1],
        updatedBlocks[index],
      ];
      setBlocks(updatedBlocks);
    }
  };

  const handleMoveDown = (index) => {
    if (index < blocks.length - 1) {
      const updatedBlocks = [...blocks];
      [updatedBlocks[index], updatedBlocks[index + 1]] = [
        updatedBlocks[index + 1],
        updatedBlocks[index],
      ];
      setBlocks(updatedBlocks);
    }
  };

  const handleRemove = (index) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(updatedBlocks);
  };

  const handleAddBlock = () => {
    const newBlock = {
      id: dayjs(),
      type: type,
      content: '',
      position: -1
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleContentChange = (event, blockId) => {
    const updatedBlocks = blocks.map((block) => {
      if (block.id === blockId) {
        return { ...block, content: event.target.value };
      }
      return block;
    });
    setBlocks(updatedBlocks);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    // Perform save logic here
    const hasHeader = blocks.some((block) => block.type === 'header');
    const hasParagraphOrImage = blocks.some((block) => block.type === 'paragraph' || block.type === 'image'); 

    const allFieldsNotEmpty = blocks.every((block) => block.content.trim() !== '');

    if(!title.trim() || !author.trim()) {  
      setShowAlert(true);
      setErrorMessage("Title (and author) can't be empty.")
    } else if(title.length < 2) {
      setShowAlert(true);
      setErrorMessage("The length of the title should be at least equal to 2.")
    } else if(!allFieldsNotEmpty) {
      setShowAlert(true);
      setErrorMessage("Please, fill in the block fields.")
    } else if(!hasHeader || !hasParagraphOrImage){
      setShowAlert(true);
      setErrorMessage("You must have at least one header and one paragraph or image blocks.")
    } else {
      //call API
      //add
      if(addingNewPage) {
        const pageToAdd = { "title": title, "user": props.user.id, "creationdate": dayjs(creationdate), "blocks": blocks };
        if(pubdate) {
          pageToAdd.pubdate = dayjs(pubdate);
          if(pageToAdd.pubdate < pageToAdd.creationdate) {
            pageToAdd.pubdate = pageToAdd.creationdate;
          }
        } else {
          pageToAdd.pubdate = null;
        }
        
        await API.addPage(pageToAdd);

      } else {
        //edit
        if(props.user.role === "Admin") {
          //admin only
          const selectedUser = userList.find(u => u.name === author);
          let userId = selectedUser.id;

          const pageToEdit = { "title": title, "user": userId, "creationdate": dayjs(creationdate), "blocks": blocks };
          if(pubdate) {
            pageToEdit.pubdate = dayjs(pubdate);
            if(pageToEdit.pubdate < pageToEdit.creationdate) {
              pageToEdit.pubdate = pageToEdit.creationdate;
            }
          } else {
            pageToEdit.pubdate = null;
          }
          
          await API.editPage(pageToEdit, pageId);
        } else {
          //user
          const pageToEdit = { "title": title, "user": props.user.id, "creationdate": dayjs(creationdate), "blocks": blocks };
          if(pubdate) {
            pageToEdit.pubdate = dayjs(pubdate);
            if(pageToEdit.pubdate < pageToEdit.creationdate) {
              pageToEdit.pubdate = pageToEdit.creationdate;
            }
          } else {
            pageToEdit.pubdate = null;
          }
          
          await API.editPage(pageToEdit, pageId);
        }
      }
      
      navigate('/')
    }
  };

  const handleCancel = () => {
    // Perform cancel logic here
    navigate('/')
  };

  return (
    <Container>
      {
        addingNewPage ? <h1>Create Page</h1> : <h1>Edit Page</h1>
      }
      <Alert
        dismissible
        show={showAlert}
        onClose={() => setShowAlert(false)}
        variant="danger" className="mt-3"
      >
        {errorMessage}
      </Alert>
      <Form onSubmit={handleSave}>
        <Form.Group className='mb-3'  controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" 
            value={title}
            onChange={(event) => setTitle(event.target.value)} 
            required={true}
            minLength={2}
          />
        </Form.Group>
        {
          (props.user && props.user.role === "Admin") ? 
            <Form.Group className='mb-3'>
              <Form.Label>Author</Form.Label>
              {
                addingNewPage ? 
                <Form.Control type="text" minLength={2} disabled={true} required={true} value={author} ></Form.Control> :
                <Form.Control
                  className='mb-2'
                  as="select"
                  value={author}
                  onChange={e => {setAuthor(e.target.value)}}
                  required={true}
                >
                  {
                    userList.map((user, index) => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))
                  }
                </Form.Control>
              }
            </Form.Group> : 
            <Form.Group className='mb-3'>
              <Form.Label>Author</Form.Label>
              <Form.Control type="text" minLength={2} disabled={true} required={true} value={author} ></Form.Control>
            </Form.Group>
        }
        <Form.Group className='mb-3'>
          <Form.Label>Creation Date</Form.Label>
          <Form.Control type="date" minLength={2} disabled={true} required={true} value={creationdate}></Form.Control>
        </Form.Group>
        <Form.Group className='mb-3'>
          <Form.Label>Publication Date</Form.Label>
          <Form.Control type="date" minLength={2} required={true} value={pubdate} onChange={(event) => {event.target.value ? setDate(dayjs(event.target.value).format('YYYY-MM-DD')) : setDate("")}}></Form.Control>
        </Form.Group>

        <hr />    {/* Line */}
        <Form.Label>Select a block type to insert</Form.Label>
        <Form.Control
          className='mb-2'
          as="select"
          value={type}
          onChange={e => {setType(e.target.value)}}
          required={true}
        >
          <option value="header">Header</option>
          <option value="paragraph">Paragraph</option>
          <option value="image">Image</option>
        </Form.Control>
        <Button className='form-button' variant="primary" onClick={() => handleAddBlock()}>Add Block</Button>

        <hr />    {/* Line */}

        {renderBlocks()}
      </Form>
      {/*<hr />     Line */}

      {/*<Form onSubmit={handleSave}>{renderBlocks()}</Form>*/}

      <div >
        <Button type='submit' variant="success" className='form-button' onClick={handleSave}>Save</Button>
        <Button variant="danger" className='form-button' onClick={handleCancel}>Cancel</Button>
      </div>

    </Container>
  )
}

export default FormPage;