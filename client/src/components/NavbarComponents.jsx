import Container from 'react-bootstrap/Container';
import { Navbar, Nav, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { LogoutButton, LoginButton } from './AuthComponent';
import { Link } from 'react-router-dom';

function NavHeader(props) {

  return (
    <Navbar className='navbar-name' expand="lg"> 
      <Container fluid>

        <Link to={`/`}  className="brand-icon">
          <Navbar.Brand className="brand-icon">
            <Icon icon="game-icons:papers" />
             {props.titleWebApp}
          </Navbar.Brand>
        </Link>

        <Nav className="ml-md-auto">
            <Navbar.Text className="welcome mx-2">
                {props.user && props.user.name && `Welcome, ${props.user.name}!`}  {/*ADD $ to the props.user.name*/}
            </Navbar.Text>

            <Form className="mx-2">
                {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
            </Form>
        </Nav>

      </Container>
    </Navbar>
  );
}

export default NavHeader;