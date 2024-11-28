import { Table, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function PageList(props) {
    const navigate = useNavigate()
    const printAllButton = () => {
        if(props.setAll) {
            return (
                <Button type='submit' variant="success" className='button-all' onClick={() => goToAllRrGoHome(true)}>Back Office</Button>
            )
        } else {
            return (
                <Button type='submit' variant="success" className='button-all' onClick={() => goToAllRrGoHome(false)} >Front Office</Button>
            )
        }
    }

    const goToAdd = () => {
        navigate('/pages/add');
    }
    
    const goToAllRrGoHome = (all) => {
        if(all) {
            navigate('/pages/all');
        } else {
            navigate('/');
        }
        
    }

    return (
        <>
        
            <Row>
                <Col></Col>
                <Col xs={10}>
                    <p className='av-paiges lead'>We now have {props.pages.length} pages available.</p>
                    <Table id="table-pages" striped>
                        <thead className='table-pages-types'>
                            <tr>
                                <th>#</th>
                                <th>Title { props.setAdd ? <Link to={'/pages/add'} className='order-icon'><Icon icon="zondicons:add-outline"  width={20}/></Link> : <></>}</th>
                                <th>Author</th>
                                <th>Creation Date</th>
                                <th>Publication Date { props.getOrderedPages ? <Button className='order-icon' onClick={props.getOrderedPages}><Icon icon="fluent-mdl2:date-time-mirrored" width={20}/></Button> : <></>}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {
                                    props.pages.map((p) => <PageRow setAdd={props.setAdd} deletePage={props.deletePage} user={props.user} page={p} key={p.id}/>)
                                }
                        </tbody>
                    </Table>
                    {
                        props.user ? printAllButton() : <></>
                    }
                                  
                </Col>
                <Col></Col>
            </Row>
            
        </>
    );
}

function PageRow(props) {
    return (
        <>
        <tr>
                <td>
                    {props.page.id}
                </td>

                <td>
                    {props.page.title}
                </td>

                <td>
                    {props.page.author}
                </td>

                <td>
                    {props.page.creationdate.format('YYYY-MMMM-DD')}
                </td>

                <td>
                    { props.page.pubdate ? props.page.pubdate.format('YYYY-MMMM-DD') : '' }
                </td>

                <td>
                    <Link to={`/pages/${props.page.id}`} state={props.page}><i className='action-icon'><Icon icon="octicon:link-16"  width={30}/></i></Link>
                    {   
                        (props.user && props.setAdd && (props.user.id == props.page.user || props.user.role === "Admin")) ? 
                        <Link to={`/pages/${props.page.id}/edit`} state={props.page} className='action-icon'><Icon icon="material-symbols:edit-outline" width={30}/></Link> 
                        : 
                        <></>
                    }
                    {   
                        (props.user && props.setAdd && (props.user.id == props.page.user || props.user.role === "Admin")) ? 
                        <Button onClick={() => props.deletePage(props.page.id)} className='action-icon'><Icon icon="material-symbols:delete-outline" width={30}/></Button>
                        : 
                        <></>
                    }
                </td>
            </tr>
        </>
    );
}